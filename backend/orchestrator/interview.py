"""
InterviewOrchestrator - Main class for handling different types of interviews
"""

import asyncio
from enum import Enum
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

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

    def _build_chat_history(self, transcript: List[Dict[str, str]]) -> List[BaseMessage]:
        """Builds a LangChain chat history from a transcript, ignoring initial greetings."""
        messages: List[BaseMessage] = []
        for message_data in transcript:
            if message_data.get('message_type') == 'greeting':
                continue
            
            role = message_data.get('role')
            content = message_data.get('content', '')
            
            if role == 'user':
                messages.append(HumanMessage(content=content))
            elif role == 'assistant':
                messages.append(AIMessage(content=content))
        return messages

    async def _get_rag_context(self, session: InterviewSession, query: str) -> Dict[str, Any]:
        """Retrieves context from resume and company vector stores."""
        context = {}
        try:
            if session.user and session.user.resume_vs_id:
                resume_results = await self.vector_store_manager.similarity_search(
                    store_name=session.user.resume_vs_id,
                    query=query,
                    k=2
                )
                context['resume_context'] = [doc.page_content for doc in resume_results]

            if session.context.get("company_vs_id"):
                company_results = await self.vector_store_manager.similarity_search(
                    store_name=session.context["company_vs_id"],
                    query=query,
                    k=3
                )
                context['company_context'] = [doc.page_content for doc in company_results]
        
        except Exception as e:
            logger.error(f"Error retrieving RAG context for session {session.id}: {e}")
        
        return context

    async def start_session(self, session: InterviewSession) -> tuple[str, list, dict]:
        """
        Starts an interview session, generates the initial message, and initializes context.
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

            # Initialize question count in the session context
            session.context['question_count'] = 0

            logger.info(f"Started session {session.id} via API.")
            return initial_message, transcript, session.context

        except Exception as e:
            logger.error(f"Error starting session {session.id}: {e}")
            raise

    async def process_user_message(self, session: InterviewSession, user_message: str) -> tuple[str, list, dict]:
        """
        Process user message, generate AI response, and return updated transcript and context.
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
            updated_context = response_data["context"]

            transcript.append({
                "role": "assistant",
                "content": ai_response_content,
                "timestamp": datetime.now().isoformat(),
                "message_type": response_data.get("message_type", "question"),
            })
            
            logger.info(f"Processed message for session {session.id}")
            return ai_response_content, transcript, updated_context

        except Exception as e:
            logger.error(f"Error processing message for session {session.id}: {e}")
            raise

    async def end_session(self, session: InterviewSession) -> Dict[str, Any]:
        """
        End an interview session and generate feedback.
        """
        try:
            feedback = await self._generate_session_feedback(session)
            logger.info(f"Ended session {session.id} and generated feedback.")
            return feedback

        except Exception as e:
            logger.error(f"Error ending session {session.id}: {e}")
            raise

    async def _generate_initial_message(self, session: InterviewSession) -> str:
        """Generate initial greeting message based on session type and RAG context."""
        try:
            rag_context = await self._get_rag_context(session, "Introduction and background")
            
            return await self.gemini_llm.generate_initial_greeting(
                session_type=session.session_type,
                session_context=session.context,
                rag_context=rag_context
            )
        except Exception as e:
            logger.error(f"Error generating initial message for session {session.id}: {e}")
            company = session.context.get("company_name", "this company")
            role = session.context.get("job_role", "the position")
            return f"Hello! Welcome to your interview for {role} at {company}. Are you ready to begin?"

    async def _process_regular_message(self, session: InterviewSession, user_message: str, transcript: list) -> Dict[str, Any]:
        """Process message for regular interview types using RAG and chat history."""
        try:
            current_context = session.context
            question_count = current_context.get('question_count', 0)
            
            should_end = (
                question_count >= current_context.get("max_questions", 8)
                or "thank you" in user_message.lower()
                or "that's all" in user_message.lower()
            )

            if should_end:
                response = self._generate_closing_message(session)
                message_type = "closing"
            elif question_count == 0:
                response = "Great. To start, can you please tell me a little bit about yourself?"
                message_type = "question"
                current_context['question_count'] = question_count + 1
            else:
                chat_history = self._build_chat_history(transcript)
                rag_context = await self._get_rag_context(session, user_message)
                
                response = await self.gemini_llm.generate_interview_question(
                    session_type=session.session_type,
                    session_context=current_context,
                    chat_history=chat_history,
                    rag_context=rag_context,
                    last_user_message=user_message
                )
                message_type = "question"
                current_context['question_count'] = question_count + 1

            return {"message": response, "message_type": message_type, "should_end": should_end, "context": current_context}

        except Exception as e:
            logger.error(f"Error processing regular message for session {session.id}: {e}")
            return {"message": "Thank you for your response. Let me think of the next question...", "message_type": "response", "should_end": False, "context": session.context}

    def _generate_closing_message(self, session: InterviewSession) -> str:
        """Generate appropriate closing message"""
        session_type = session.session_type
        if session_type == SessionType.TECHNICAL.value:
            return "Thank you for the technical discussion! This concludes the interview. We'll now move to the feedback phase."
        elif session_type == SessionType.HR.value:
            return "Thank you for sharing your experiences! This concludes our HR interview session."
        else:
            return "Thank you for the interview! I'll now prepare your feedback."

    async def _generate_session_feedback(self, session: InterviewSession) -> Dict[str, Any]:
        """Generate comprehensive feedback for completed session"""
        try:
            chat_history = self._build_chat_history(session.transcript)
            feedback_data = await self.gemini_llm.generate_feedback(
                session_type=session.session_type,
                chat_history=chat_history,
                session_context=session.context
            )
            feedback_data['session_id'] = session.id
            return InterviewFeedback(**feedback_data).dict()
        except Exception as e:
            logger.error(f"Error generating session feedback for {session.id}: {e}")
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
