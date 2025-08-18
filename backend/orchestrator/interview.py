"""
InterviewOrchestrator - Main class for handling different types of interviews
"""

import asyncio
from enum import Enum
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

from langchain.memory import ConversationSummaryBufferMemory
from langchain.schema import HumanMessage, AIMessage, BaseMessage

from llm.gemini import GeminiLLM
from orchestrator.rag_utils import get_vector_store_manager, DocumentProcessor
from models.pydantic_models import SessionType, InterviewFeedback
from utils.database import InterviewSession

logger = logging.getLogger(__name__)


class InterviewState(Enum):
    """Interview session states"""
    CREATED = "created"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


class InterviewOrchestrator:
    """Main orchestrator for handling different types of interviews via REST API"""

    def __init__(self):
        """Initialize the interview orchestrator"""
        self.gemini_llm = GeminiLLM()
        self.vector_store_manager = get_vector_store_manager()
        self.document_processor = DocumentProcessor()
        logger.info("InterviewOrchestrator initialized for stateless operation")

    def _reconstruct_memory_from_transcript(self, transcript: List[Dict[str, str]]) -> ConversationSummaryBufferMemory:
        """Reconstructs a LangChain memory object from a transcript."""
        memory = ConversationSummaryBufferMemory(
            llm=self.gemini_llm.llm,
            memory_key="chat_history",
            return_messages=True,
            max_token_limit=2000,
        )
        messages: List[BaseMessage] = []
        for message_data in transcript:
            if message_data.get('role') == 'user':
                messages.append(HumanMessage(content=message_data['content']))
            elif message_data.get('role') == 'assistant':
                messages.append(AIMessage(content=message_data['content']))
        
        memory.chat_memory.messages = messages
        return memory

    async def start_session(self, session: InterviewSession) -> tuple[str, list]:
        """
        Starts an interview session, generates the initial message.
        
        Args:
            session: The SQLAlchemy InterviewSession object from the database.

        Returns:
            A tuple containing the initial AI message and the updated transcript.
        """
        try:
            initial_message = await self._generate_initial_message(session)
            
            transcript = session.transcript or []
            transcript.append({
                "role": "assistant",
                "content": initial_message,
                "timestamp": datetime.now().isoformat(),
                "message_type": "greeting",
            })

            logger.info(f"Started session {session.id} via API.")
            return initial_message, transcript

        except Exception as e:
            logger.error(f"Error starting session {session.id}: {e}")
            raise

    async def process_user_message(self, session: InterviewSession, user_message: str) -> tuple[str, list]:
        """
        Process user message, generate AI response, and return updated transcript.

        Args:
            session: The SQLAlchemy InterviewSession object.
            user_message: The user's message text.

        Returns:
            A tuple containing the AI's response and the full updated transcript.
        """
        try:
            transcript = session.transcript or []
            transcript.append({
                "role": "user", 
                "content": user_message, 
                "timestamp": datetime.now().isoformat()
            })

            response_data = await self._process_regular_message(session, user_message, transcript)
            ai_response_content = response_data["message"]

            transcript.append({
                "role": "assistant",
                "content": ai_response_content,
                "timestamp": datetime.now().isoformat(),
                "message_type": response_data.get("message_type", "response"),
            })
            
            logger.info(f"Processed message for session {session.id}")
            return ai_response_content, transcript

        except Exception as e:
            logger.error(f"Error processing message for session {session.id}: {e}")
            raise

    async def end_session(self, session: InterviewSession) -> Dict[str, Any]:
        """
        End an interview session and generate feedback.

        Args:
            session: The SQLAlchemy InterviewSession object.

        Returns:
            A dictionary containing the feedback.
        """
        try:
            feedback = await self._generate_session_feedback(session)
            logger.info(f"Ended session {session.id} and generated feedback.")
            return feedback

        except Exception as e:
            logger.error(f"Error ending session {session.id}: {e}")
            raise

    async def _generate_initial_message(self, session: InterviewSession) -> str:
        """Generate initial greeting message based on session type"""
        try:
            session_type = session.session_type
            context = session.context

            if session_type == SessionType.TECHNICAL.value:
                return self._generate_technical_greeting(context)
            elif session_type == SessionType.HR.value:
                return self._generate_hr_greeting(context)
            elif session_type == SessionType.SALARY.value:
                return self._generate_salary_greeting(context)
            else:
                return "Hello! I'm excited to conduct this interview with you today. Let's begin!"

        except Exception as e:
            logger.error(f"Error generating initial message: {e}")
            return "Hello! Let's start the interview."

    def _generate_technical_greeting(self, context: Dict[str, Any]) -> str:
        """Generate technical interview greeting"""
        company = context.get("company_name", "this company")
        role = context.get("job_role", "the position")
        return f"""Hello! Welcome to your technical interview for {role} at {company}. I'm here to assess your technical skills and problem-solving abilities. Are you ready to begin?"""

    def _generate_hr_greeting(self, context: Dict[str, Any]) -> str:
        """Generate HR interview greeting"""
        company = context.get("company_name", "our company")
        role = context.get("job_role", "this position")
        return f"""Hello! Welcome to your HR interview for {role} at {company}. I'm here to learn more about you, your career goals, and how you might fit with our team culture. Shall we get started?"""

    def _generate_salary_greeting(self, context: Dict[str, Any]) -> str:
        """Generate salary negotiation greeting"""
        role = context.get("job_role", "this position")
        return f"""Hello! I'm here to discuss compensation and benefits for {role}. This is an important conversation, so please feel free to share your thoughts openly. Ready to discuss?"""

    async def _process_regular_message(self, session: InterviewSession, user_message: str, transcript: list) -> Dict[str, Any]:
        """Process message for regular interview types (Technical, HR, Salary)"""
        try:
            question_count = sum(1 for msg in transcript if msg.get('role') == 'assistant')

            # If this is the first question, handle the user's response to "Are you ready?"
            if question_count == 1 and ( "yes" in user_message.lower() or "ready" in user_message.lower() or "start" in user_message.lower() ):
                response = "Great! To start, can you please tell me a little bit about yourself and your background?"
                message_type = "question"
                should_end = False
                return {"message": response, "message_type": message_type, "should_end": should_end}

            previous_qa = []
            for i in range(len(transcript) - 2, -1, -2):
                if i >= 0 and i + 1 < len(transcript):
                    qa_pair = {
                        "question": transcript[i]["content"],
                        "answer": transcript[i + 1]["content"],
                    }
                    previous_qa.append(qa_pair)
                    if len(previous_qa) >= 3:
                        break

            should_end = (
                question_count >= 8 
                or "thank you" in user_message.lower()
                or "that's all" in user_message.lower()
            )

            if should_end:
                response = self._generate_closing_message(session)
                message_type = "closing"
            else:
                response = self.gemini_llm.generate_interview_question(
                    session.session_type, session.context, previous_qa
                )
                message_type = "question"

            return {"message": response, "message_type": message_type, "should_end": should_end}

        except Exception as e:
            logger.error(f"Error processing regular message: {e}")
            return {"message": "Thank you for your response. Let me think of the next question...", "message_type": "response", "should_end": False}

    def _generate_closing_message(self, session: InterviewSession) -> str:
        """Generate appropriate closing message"""
        session_type = session.session_type
        if session_type == SessionType.TECHNICAL.value:
            return "Thank you for the technical discussion! We'll now move to the feedback phase."
        elif session_type == SessionType.HR.value:
            return "Thank you for sharing your experiences! This concludes our HR interview session."
        elif session_type == SessionType.SALARY.value:
            return "Thank you for the open discussion. Our salary negotiation session is now complete."
        else:
            return "Thank you for the interview! I'll now prepare your feedback."

    async def _generate_session_feedback(self, session: InterviewSession) -> Dict[str, Any]:
        """Generate comprehensive feedback for completed session"""
        try:
            feedback_data = self.gemini_llm.generate_feedback(
                session.session_type, session.transcript, session.context
            )
            feedback_data['session_id'] = session.id  # Add session_id to the feedback data
            return InterviewFeedback(**feedback_data).dict()
        except Exception as e:
            logger.error(f"Error generating regular feedback: {e}")
            return InterviewFeedback(
                session_id=session.id,
                overall_score=70,
                communication_score=75,
                confidence_score=70,
                strengths=["Engaged in conversation"],
                improvement_areas=["Provide more examples"],
                detailed_feedback="Good overall performance with room for improvement.",
                recommendations=["Practice more examples", "Research common questions"],
            ).dict()
