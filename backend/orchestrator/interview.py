"""
InterviewOrchestrator - Main class for handling different types of interviews
"""

import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from enum import Enum

from langchain.memory import ConversationBufferMemory, ConversationSummaryBufferMemory
from langchain.schema import HumanMessage, AIMessage

from llm.gemini import GeminiLLM
from orchestrator.rag_utils import get_vector_store_manager, DocumentProcessor
from models.pydantic_models import SessionType, InterviewFeedback

logger = logging.getLogger(__name__)


class InterviewState(Enum):
    """Interview session states"""

    CREATED = "created"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class InterviewOrchestrator:
    """Main orchestrator for handling different types of interviews"""

    def __init__(self):
        """Initialize the interview orchestrator"""
        self.gemini_llm = GeminiLLM()
        self.vector_store_manager = get_vector_store_manager()
        self.document_processor = DocumentProcessor()

        # Active sessions storage
        self.active_sessions: Dict[str, Dict[str, Any]] = {}

        logger.info("InterviewOrchestrator initialized")

    async def create_session(
        self, user_id: str, session_type: SessionType, context: Dict[str, Any]
    ) -> str:
        """
        Create a new interview session

        Args:
            user_id: User identifier
            session_type: Type of interview session
            context: Session context (company, role, etc.)

        Returns:
            Session ID
        """
        try:
            session_id = str(uuid.uuid4())
            memory = ConversationSummaryBufferMemory(
                llm=self.gemini_llm.llm,
                memory_key="chat_history",
                return_messages=True,
                max_token_limit=2000,
            )

            # Create session data
            session_data = {
                "session_id": session_id,
                "user_id": user_id,
                "session_type": session_type,
                "state": InterviewState.CREATED,
                "context": context,
                "memory": memory,
                "start_time": datetime.now(),
                "end_time": None,
                "question_count": 0,
                "transcript": [],
                "feedback": None,
            }

            # Load relevant context if available
            await self._load_session_context(session_data)

            self.active_sessions[session_id] = session_data

            logger.info(
                f"Created {session_type.value} session {session_id} for user {user_id}"
            )
            return session_id

        except Exception as e:
            logger.error(f"Error creating session: {e}")
            raise

    async def start_session(self, session_id: str) -> Dict[str, Any]:
        """
        Start an interview session

        Args:
            session_id: Session identifier

        Returns:
            Initial session response
        """
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")

            session = self.active_sessions[session_id]
            session["state"] = InterviewState.ACTIVE
            session["actual_start_time"] = datetime.now()

            # Generate initial message based on session type
            initial_message = await self._generate_initial_message(session)

            # Add to memory and transcript
            ai_message = AIMessage(content=initial_message)
            session["memory"].chat_memory.add_message(ai_message)
            session["transcript"].append(
                {
                    "role": "assistant",
                    "content": initial_message,
                    "timestamp": datetime.now(),
                    "message_type": "greeting",
                }
            )

            logger.info(f"Started session {session_id}")

            return {
                "session_id": session_id,
                "message": initial_message,
                "session_type": session["session_type"],
                "state": session["state"].value,
            }

        except Exception as e:
            logger.error(f"Error starting session {session_id}: {e}")
            raise

    async def process_user_message(
        self, session_id: str, user_message: str
    ) -> Dict[str, Any]:
        """
        Process user message and generate AI response

        Args:
            session_id: Session identifier
            user_message: User's message

        Returns:
            AI response data
        """
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")

            session = self.active_sessions[session_id]

            if session["state"] != InterviewState.ACTIVE:
                raise ValueError(f"Session {session_id} is not active")

            # Add user message to memory and transcript
            human_message = HumanMessage(content=user_message)
            session["memory"].chat_memory.add_message(human_message)
            session["transcript"].append(
                {"role": "user", "content": user_message, "timestamp": datetime.now()}
            )

            response_data = await self._process_regular_message(session, user_message)

            # Add AI response to memory and transcript
            ai_message = AIMessage(content=response_data["message"])
            session["memory"].chat_memory.add_message(ai_message)
            session["transcript"].append(
                {
                    "role": "assistant",
                    "content": response_data["message"],
                    "timestamp": datetime.now(),
                    "message_type": response_data.get("message_type", "response"),
                }
            )

            session["question_count"] += 1

            return response_data

        except Exception as e:
            logger.error(f"Error processing message for session {session_id}: {e}")
            raise

    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """
        End an interview session and generate feedback

        Args:
            session_id: Session identifier

        Returns:
            Session summary with feedback
        """
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")

            session = self.active_sessions[session_id]
            session["state"] = InterviewState.COMPLETED
            session["end_time"] = datetime.now()

            # Generate feedback
            feedback = await self._generate_session_feedback(session)
            session["feedback"] = feedback

            # Calculate session duration
            duration = session["end_time"] - session.get(
                "actual_start_time", session["start_time"]
            )

            logger.info(f"Ended session {session_id} after {duration}")

            return {
                "session_id": session_id,
                "duration_minutes": duration.total_seconds() / 60,
                "question_count": session["question_count"],
                "feedback": feedback,
            }

        except Exception as e:
            logger.error(f"Error ending session {session_id}: {e}")
            raise

    async def pause_session(self, session_id: str) -> bool:
        """
        Pause an active session

        Args:
            session_id: Session identifier

        Returns:
            True if successful
        """
        try:
            if session_id not in self.active_sessions:
                return False

            session = self.active_sessions[session_id]
            session["state"] = InterviewState.PAUSED
            session["pause_time"] = datetime.now()

            logger.info(f"Paused session {session_id}")
            return True

        except Exception as e:
            logger.error(f"Error pausing session {session_id}: {e}")
            return False

    async def resume_session(self, session_id: str) -> bool:
        """
        Resume a paused session

        Args:
            session_id: Session identifier

        Returns:
            True if successful
        """
        try:
            if session_id not in self.active_sessions:
                return False

            session = self.active_sessions[session_id]

            if session["state"] != InterviewState.PAUSED:
                return False

            session["state"] = InterviewState.ACTIVE

            # Add pause duration to total time (for accurate timing)
            if "pause_time" in session:
                pause_duration = datetime.now() - session["pause_time"]
                session.setdefault("total_pause_time", timedelta()).total_seconds()
                session["total_pause_time"] += pause_duration.total_seconds()
                del session["pause_time"]

            logger.info(f"Resumed session {session_id}")
            return True

        except Exception as e:
            logger.error(f"Error resuming session {session_id}: {e}")
            return False

    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session information

        Args:
            session_id: Session identifier

        Returns:
            Session information or None if not found
        """
        session = self.active_sessions.get(session_id)
        if not session:
            return None

        return {
            "session_id": session_id,
            "user_id": session["user_id"],
            "session_type": session["session_type"],
            "state": session["state"].value,
            "start_time": session["start_time"],
            "question_count": session["question_count"],
            "duration": self._calculate_session_duration(session),
        }

    async def _load_session_context(self, session_data: Dict[str, Any]) -> None:
        """Load relevant context for the session from vector stores"""
        try:
            context = session_data["context"]
            user_id = session_data["user_id"]

            # Try to load user's resume context
            try:
                resume_store_name = f"resume_{user_id}"
                resume_docs = await self.vector_store_manager.similarity_search(
                    resume_store_name,
                    f"skills experience {session_data['session_type'].value}",
                    k=3,
                )

                if resume_docs:
                    resume_context = "\n".join(
                        [doc.page_content for doc in resume_docs]
                    )
                    context["resume_context"] = resume_context

                    # Extract skills from resume context
                    skills = []
                    for doc in resume_docs:
                        if "skills" in doc.metadata:
                            skills.extend(doc.metadata["skills"])
                    context["skills"] = list(set(skills))

            except Exception as e:
                logger.warning(f"Could not load resume context: {e}")

            # Try to load company question context
            try:
                if context.get("company_name"):
                    company_query = f"{context['company_name']} {session_data['session_type'].value}"
                    company_docs = await self.vector_store_manager.similarity_search(
                        "company_questions", company_query, k=5
                    )

                    if company_docs:
                        topics = []
                        for doc in company_docs:
                            if "topics" in doc.metadata:
                                topics.extend(doc.metadata["topics"])
                        context["relevant_topics"] = list(set(topics))

            except Exception as e:
                logger.warning(f"Could not load company context: {e}")

        except Exception as e:
            logger.error(f"Error loading session context: {e}")

    async def _generate_initial_message(self, session: Dict[str, Any]) -> str:
        """Generate initial greeting message based on session type"""
        try:
            session_type = session["session_type"]
            context = session["context"]

            if session_type == SessionType.TECHNICAL:
                return await self._generate_technical_greeting(context)
            elif session_type == SessionType.HR:
                return await self._generate_hr_greeting(context)
            elif session_type == SessionType.SALARY:
                return await self._generate_salary_greeting(context)
            else:
                return "Hello! I'm excited to conduct this interview with you today. Let's begin!"

        except Exception as e:
            logger.error(f"Error generating initial message: {e}")
            return "Hello! Let's start the interview."

    async def _generate_technical_greeting(self, context: Dict[str, Any]) -> str:
        """Generate technical interview greeting"""
        company = context.get("company_name", "this company")
        role = context.get("job_role", "the position")

        greeting = f"""Hello! Welcome to your technical interview for {role} at {company}. 
        
I'm here to assess your technical skills and problem-solving abilities. We'll cover topics relevant to the role, including data structures, algorithms, and system design concepts.

Feel free to think out loud during problem-solving - I'm interested in your thought process as much as the final answer.

Are you ready to begin?"""

        return greeting

    async def _generate_hr_greeting(self, context: Dict[str, Any]) -> str:
        """Generate HR interview greeting"""
        company = context.get("company_name", "our company")
        role = context.get("job_role", "this position")

        greeting = f"""Hello! Welcome to your HR interview for {role} at {company}.

I'm here to learn more about you as a person, your career goals, and how you might fit with our team culture. We'll discuss your background, experiences, and what motivates you in your career.

This is a conversation, so please feel comfortable sharing your thoughts and asking questions about the role or company.

Shall we get started?"""

        return greeting

    async def _generate_salary_greeting(self, context: Dict[str, Any]) -> str:
        """Generate salary negotiation greeting"""
        role = context.get("job_role", "this position")

        greeting = f"""Hello! I'm here to discuss compensation and benefits for {role}.

This is an important conversation where we want to ensure both parties are aligned on expectations. We'll cover salary, benefits, growth opportunities, and any other aspects of the compensation package.

Please feel free to share your thoughts on market rates, your expectations, and what's most important to you in a compensation package.

Ready to discuss?"""

        return greeting

    async def _process_regular_message(
        self, session: Dict[str, Any], user_message: str
    ) -> Dict[str, Any]:
        """Process message for regular interview types (Technical, HR, Salary)"""
        try:
            # Build context for question generation
            previous_qa = []
            transcript = session["transcript"]

            # Get last few Q&A pairs
            for i in range(len(transcript) - 2, -1, -2):
                if i >= 0 and i + 1 < len(transcript):
                    qa_pair = {
                        "question": transcript[i]["content"],
                        "answer": transcript[i + 1]["content"],
                    }
                    previous_qa.append(qa_pair)
                    if len(previous_qa) >= 3:
                        break

            # Check if this should be the final question
            should_end = (
                session["question_count"] >= 8  # After 8 questions
                or "thank you" in user_message.lower()
                or "that's all" in user_message.lower()
            )

            if should_end:
                response = await self._generate_closing_message(session)
                message_type = "closing"
            else:
                # Generate next question
                response = self.gemini_llm.generate_interview_question(
                    session["session_type"].value, session["context"], previous_qa
                )
                message_type = "question"

            return {
                "message": response,
                "message_type": message_type,
                "should_end": should_end,
            }

        except Exception as e:
            logger.error(f"Error processing regular message: {e}")
            return {
                "message": "Thank you for your response. Let me think of the next question...",
                "message_type": "response",
                "should_end": False,
            }

    async def _generate_closing_message(self, session: Dict[str, Any]) -> str:
        """Generate appropriate closing message"""
        session_type = session["session_type"]

        if session_type == SessionType.TECHNICAL:
            return """Thank you for the technical discussion! You've demonstrated good problem-solving skills. 
            
We'll now move to the feedback phase where I'll analyze your responses and provide detailed insights on your performance.

The interview session is now complete."""

        elif session_type == SessionType.HR:
            return """Thank you for sharing your experiences and thoughts with me! It's been great learning about your background and career aspirations.
            
I'll now prepare comprehensive feedback on your interview performance, including communication skills and cultural fit assessment.

This concludes our HR interview session."""

        elif session_type == SessionType.SALARY:
            return """Thank you for the open discussion about compensation expectations. I hope we've covered all the important aspects of the package.
            
I'll provide feedback on your negotiation approach and suggestions for future salary discussions.

Our salary negotiation session is now complete."""

        else:
            return "Thank you for the interview! I'll now prepare your feedback."

    async def _generate_session_feedback(
        self, session: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate comprehensive feedback for completed session"""
        try:
            session_type = session["session_type"]
            return await self._generate_regular_feedback(session)

        except Exception as e:
            logger.error(f"Error generating session feedback: {e}")
            return {"error": "Failed to generate feedback"}

    async def _generate_regular_feedback(
        self, session: Dict[str, Any]
    ) -> InterviewFeedback:
        """Generate feedback for regular interview types"""
        try:
            feedback_data = self.gemini_llm.generate_feedback(
                session["session_type"].value, session["transcript"], session["context"]
            )

            return InterviewFeedback(**feedback_data)

        except Exception as e:
            logger.error(f"Error generating regular feedback: {e}")
            return InterviewFeedback(
                session_id=session["session_id"],
                overall_score=70,
                communication_score=75,
                confidence_score=70,
                strengths=["Engaged in conversation"],
                improvement_areas=["Provide more examples"],
                detailed_feedback="Good overall performance with room for improvement.",
                recommendations=["Practice more examples", "Research common questions"],
            )

    def _calculate_session_duration(self, session: Dict[str, Any]) -> float:
        """Calculate session duration in minutes"""
        start_time = session.get("actual_start_time", session["start_time"])
        end_time = session.get("end_time", datetime.now())

        duration = end_time - start_time

        # Subtract pause time if any
        total_pause = session.get("total_pause_time", 0)
        actual_duration = duration.total_seconds() - total_pause

        return max(0, actual_duration / 60)  # Return minutes

    def cleanup_expired_sessions(self, max_age_hours: int = 24) -> int:
        """Clean up expired sessions"""
        try:
            current_time = datetime.now()
            expired_sessions = []

            for session_id, session in self.active_sessions.items():
                session_age = current_time - session["start_time"]
                if session_age.total_seconds() > (max_age_hours * 3600):
                    expired_sessions.append(session_id)

            # Remove expired sessions
            for session_id in expired_sessions:
                del self.active_sessions[session_id]
                logger.info(f"Cleaned up expired session: {session_id}")

            return len(expired_sessions)

        except Exception as e:
            logger.error(f"Error cleaning up sessions: {e}")
            return 0
