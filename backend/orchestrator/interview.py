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
from tts.tts_service import tts_service

logger = logging.getLogger(__name__)


class InterviewState(Enum):
    """Interview session states"""
    CREATED = "created"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


class InterviewOrchestrator:
    """Main orchestrator for handling different types of interviews via Socket.IO"""

    def __init__(self):
        """Initialize the interview orchestrator"""
        self.gemini_llm = GeminiLLM()
        self.vector_store_manager = get_vector_store_manager()
        self.document_processor = DocumentProcessor()
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        logger.info("InterviewOrchestrator initialized for stateful Socket.IO operation")

    def _build_chat_history(self, transcript: List[Dict[str, str]]) -> List[BaseMessage]:
        """Builds a LangChain chat history from a transcript."""
        messages: List[BaseMessage] = []
        for message_data in transcript:
            # Accommodate frontend's transcript format ('type', 'text')
            # and backend's format ('role', 'content')
            content = message_data.get('text') or message_data.get('content', '')
            
            # Check for frontend 'type' first, then backend 'role'
            msg_type = message_data.get('type') or message_data.get('role')

            if msg_type == 'user':
                messages.append(HumanMessage(content=content))
            elif msg_type == 'ai' or msg_type == 'assistant':
                messages.append(AIMessage(content=content))
        return messages

    async def _get_rag_context(self, db_session: InterviewSession, query: str) -> Dict[str, Any]:
        """Retrieves context from resume and company vector stores."""
        context = {}
        try:
            if db_session.user and db_session.user.resume_vs_id:
                resume_results = await self.vector_store_manager.similarity_search(
                    store_name=db_session.user.resume_vs_id,
                    query=query,
                    k=2
                )
                context['resume_context'] = [doc.page_content for doc in resume_results]

            if db_session.context.get("company_vs_id"):
                company_results = await self.vector_store_manager.similarity_search(
                    store_name=db_session.context["company_vs_id"],
                    query=query,
                    k=3
                )
                context['company_context'] = [doc.page_content for doc in company_results]
        
        except Exception as e:
            logger.error(f"Error retrieving RAG context for session {db_session.id}: {e}")
        
        return context

    async def create_new_session(self, db_session: InterviewSession, client_sid: str) -> tuple[str, bytes | None]:
        """
        Starts an interview session, generates the initial message, and initializes state.
        """
        try:
            initial_message = await self._generate_initial_message(db_session)
            initial_audio = await tts_service.text_to_audio(initial_message)
            
            transcript = [{
                "role": "assistant",
                "content": initial_message,
                "timestamp": datetime.now().isoformat(),
                "message_type": "greeting",
            }]

            self.active_sessions[db_session.id] = {
                "session_id": db_session.id,
                "client_sid": client_sid,
                "db_session": db_session,
                "transcript": transcript,
                "question_count": 1, # The greeting is the first question
                "state": InterviewState.ACTIVE
            }

            logger.info(f"Created new interview session {db_session.id} for client {client_sid}")
            return initial_message, initial_audio

        except Exception as e:
            logger.error(f"Error starting session {db_session.id}: {e}")
            raise

    async def handle_user_response(self, session_id: str, user_message: str) -> tuple[str, bytes | None]:
        """ 
        Process user message, generate AI response, and return it along with audio.
        """
        session_state = self.active_sessions.get(session_id)
        if not session_state:
            raise ValueError("Session not found or is not active")

        try:
            session_state["transcript"].append({
                "role": "user", 
                "content": user_message, 
                "timestamp": datetime.now().isoformat()
            })

            response_data = await self._process_regular_message(session_state, user_message)
            ai_response_content = response_data["message"]
            ai_response_audio = await tts_service.text_to_audio(ai_response_content)

            session_state["transcript"].append({
                "role": "assistant",
                "content": ai_response_content,
                "timestamp": datetime.now().isoformat(),
                "message_type": response_data.get("message_type", "question"),
            })
            
            logger.info(f"Processed message for session {session_id}")
            return ai_response_content, ai_response_audio

        except Exception as e:
            logger.error(f"Error processing message for session {session_id}: {e}")
            raise

    async def end_session(self, session_id: str, final_transcript: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        End an interview session and generate feedback.
        """
        session_state = self.active_sessions.get(session_id)
        if not session_state:
            raise ValueError("Session not found")

        try:
            db_session = session_state['db_session']
            chat_history = self._build_chat_history(final_transcript)
            feedback = await self._generate_session_feedback(db_session, chat_history)
            
            logger.info(f"Ended session {session_id} and generated feedback.")
            return feedback
        except Exception as e:
            logger.error(f"Error ending session {session_id}: {e}")
            raise
        finally:
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
                logger.info(f"Cleaned up active session {session_id}")

    async def _generate_initial_message(self, db_session: InterviewSession) -> str:
        """Generate initial greeting message that includes the first question."""
        try:
            rag_context = await self._get_rag_context(db_session, "Introduction and background")
            
            return await self.gemini_llm.generate_initial_greeting(
                session_type=db_session.session_type,
                session_context=db_session.context,
                rag_context=rag_context
            )
        except Exception as e:
            logger.error(f"Error generating initial message for session {db_session.id}: {e}")
            return "Hello! Welcome to the interview. To start, can you please tell me a little bit about yourself?"

    async def _process_regular_message(self, session_state: dict, user_message: str) -> Dict[str, Any]:
        """Process message for regular interview types using RAG and chat history."""
        try:
            db_session = session_state['db_session']
            question_count = session_state.get('question_count', 0)
            max_questions = db_session.context.get("max_questions", 8)

            user_message_lower = user_message.lower()
            is_short_message = len(user_message.split()) < 6
            wants_to_end = "thank you" in user_message_lower or "that's all" in user_message_lower

            should_end = (question_count >= max_questions) or (is_short_message and wants_to_end)

            if should_end:
                response = self._generate_closing_message(db_session)
                message_type = "closing"
            else:
                chat_history = self._build_chat_history(session_state['transcript'])
                rag_context = await self._get_rag_context(db_session, user_message)
                
                response = await self.gemini_llm.generate_interview_question(
                    session_type=db_session.session_type,
                    session_context=db_session.context,
                    chat_history=chat_history,
                    rag_context=rag_context,
                    last_user_message=user_message
                )
                message_type = "question"
                session_state['question_count'] = question_count + 1

            return {"message": response, "message_type": message_type, "should_end": should_end}

        except Exception as e:
            logger.error(f"Error processing regular message for session {session_state['session_id']}: {e}")
            return {"message": "Thank you for your response. Let me think of the next question...", "message_type": "response", "should_end": False}

    def _generate_closing_message(self, session: InterviewSession) -> str:
        """Generate appropriate closing message"""
        session_type = session.session_type
        if session_type == SessionType.TECHNICAL.value:
            return "Thank you for the technical discussion! This concludes the interview. We'll now move to the feedback phase."
        elif session_type == SessionType.HR.value:
            return "Thank you for sharing your experiences! This concludes our HR interview session."
        elif session_type == SessionType.SALARY.value:
            return "Thank you for the discussion regarding the compensation package. This concludes our negotiation. We'll now prepare the final feedback."
        else:
            return "Thank you for the interview! I'll now prepare your feedback."

    async def _generate_session_feedback(self, session: InterviewSession, chat_history: List[BaseMessage]) -> Dict[str, Any]:
        """Generate comprehensive feedback for completed session"""
        try:
            feedback_data = await self.gemini_llm.generate_feedback(
                session_type=session.session_type,
                chat_history=chat_history,
                session_context=session.context
            )
            feedback_data['session_id'] = session.id

            # Safeguard against null scores from LLM
            feedback_data['overall_score'] = feedback_data.get('overall_score') or 0
            feedback_data['communication_score'] = feedback_data.get('communication_score') or 0
            feedback_data['confidence_score'] = feedback_data.get('confidence_score') or 0

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
