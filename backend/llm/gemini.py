import os
import logging
import json
from typing import Optional, Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain.callbacks.base import BaseCallbackHandler

logger = logging.getLogger(__name__)

class GeminiCallbackHandler(BaseCallbackHandler):
    """Custom callback handler for Gemini API calls"""
    def on_llm_start(self, serialized: Dict[str, Any], prompts: List[str], **kwargs) -> None:
        logger.info(f"Gemini LLM started with {len(prompts)} prompts")
    def on_llm_end(self, response, **kwargs) -> None:
        logger.info("Gemini LLM completed successfully")
    def on_llm_error(self, error: Exception, **kwargs) -> None:
        logger.error(f"Gemini LLM error: {error}")

class GeminiLLM:
    """Wrapper for Google Gemini LLM using LangChain"""
    
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        self.model_name = model_name
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=self.api_key,
            temperature=0.7,
            max_tokens=2048,
            callbacks=[GeminiCallbackHandler()],
            convert_system_message_to_human=True
        )
        logger.info(f"Initialized Gemini LLM with model: {model_name}")

    async def generate_initial_greeting(self, session_type: str, session_context: Dict[str, Any], rag_context: Dict[str, Any]) -> str:
        """Generates a personalized initial greeting that also asks the user to introduce themselves."""
        try:
            system_msg = self._get_system_message(session_type, "greeting", session_context)
            
            prompt_template = f"""Based on the following context, generate a warm and professional opening message for the interview. 
            Acknowledge the candidate's background from their resume, but keep it brief.
            End the message by asking the candidate to introduce themselves.

            **Example:** "Hi [Candidate Name], thanks for joining. I see you have experience with [General Skill]. To start, can you please tell me a little bit about yourself?"

            **Interview Context:**
            - Company: {session_context.get('company_name', 'the company')}
            - Role: {session_context.get('job_role', 'the position')}
            - Difficulty: {session_context.get('difficulty', 'Medium')}

            **Candidate Resume Context:**
            {rag_context.get('resume_context', ['No resume information available.'])}
            """
            
            messages = [SystemMessage(content=system_msg), HumanMessage(content=prompt_template)]
            response = await self.llm.ainvoke(messages)
            return response.content.strip()

        except Exception as e:
            logger.error(f"Error generating initial greeting: {e}")
            return f"Hello! Welcome to your {session_type.lower()} interview. To start, can you please tell me a little bit about yourself?"

    async def generate_interview_question(self, session_type: str, session_context: Dict[str, Any], chat_history: List[BaseMessage], rag_context: Dict[str, Any], last_user_message: str) -> str:
        """Generates the next interview question based on history and RAG context."""
        try:
            system_msg = self._get_system_message(session_type, "questioning", session_context)

            rag_str = ""
            if rag_context.get('resume_context'):
                rag_str += "\n\n--- Relevant Resume Snippets ---" + "\n".join(rag_context['resume_context'])
            if rag_context.get('company_context'):
                rag_str += "\n\n--- Relevant Company & Role Knowledge ---" + "\n".join(rag_context['company_context'])

            prompt = f"""The user's previous answer was: '{last_user_message}'.

            Here is the context for the interview. Use it and the user's introduction to formulate your next question.
            {rag_str}

            Your task is to act as the interviewer and ask the *next* single question. 
            Do not greet, do not provide feedback on the previous answer, just ask the next logical question based on the context and conversation history.
            """

            messages = [SystemMessage(content=system_msg), *chat_history, HumanMessage(content=prompt)]
            response = await self.llm.ainvoke(messages)
            return response.content.strip()

        except Exception as e:
            logger.error(f"Error generating interview question: {e}")
            return "Thank you. Can you tell me more about your background and experience?"

    async def generate_feedback(self, session_type: str, chat_history: List[BaseMessage], session_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generates comprehensive interview feedback from the chat history."""
        try:
            system_msg = self._get_system_message(session_type, "feedback", session_context)

            transcript_text = "\n".join([f"Interviewer: {msg.content}" if isinstance(msg, AIMessage) else f"Candidate: {msg.content}" for msg in chat_history])

            prompt = f"""
            **Interview Context:**
            - Type: {session_type}
            - Role: {session_context.get('job_role', 'General')}
            - Difficulty: {session_context.get('difficulty', 'Medium')}
            
            **Full Transcript:**
            {transcript_text}
            
            Please provide feedback in a valid JSON format.
            {{ 
                "overall_score": <int, 0-100>,
                "technical_score": <int, 0-100, or null if not applicable>,
                "communication_score": <int, 0-100>,
                "confidence_score": <int, 0-100>,
                "strengths": ["<string>"] ,
                "improvement_areas": ["<string>"] ,
                "detailed_feedback": "<string>",
                "recommendations": ["<string>"]
            }}
            """
            
            messages = [SystemMessage(content=system_msg), HumanMessage(content=prompt)]
            response = await self.llm.ainvoke(messages)
            
            try:
                clean_response = response.content.strip().replace("```json", "").replace("```", "")
                return json.loads(clean_response)
            except json.JSONDecodeError as je:
                logger.error(f"Failed to parse JSON feedback: {je}\nRaw response: {response.content}")
                return self._get_default_feedback(detail=f"Could not parse AI response: {response.content}")

        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            return self._get_default_feedback(detail=str(e))

    def _get_system_message(self, session_type: str, stage: str, context: Dict[str, Any]) -> str:
        """Generates the appropriate system message based on the interview type, stage, and difficulty."""
        difficulty = context.get('difficulty', 'Medium')
        
        base_messages = {
            "TECHNICAL": {
                "greeting": "You are a helpful AI assistant starting a technical interview.",
                "questioning": f"You are a senior technical interviewer. Your tone is professional and direct. The interview difficulty is set to '{difficulty}'. Adjust your questions accordingly. Ask only one, concise, single-part question at a time. Do not offer feedback. Be aware that the user\'s response is coming from a speech-to-text service and may contain transcription errors (e.g., \'bcrypt\' might be transcribed as \'decrypt\'). If a technical term seems slightly off, infer the correct term based on the context of the question. Adapt your follow-up questions based on their answers and the provided context.",
                "feedback": "You are an expert interview evaluator. Analyze the technical interview and provide detailed, constructive feedback in JSON format."
            },
            "HR": {
                "greeting": "You are a friendly AI assistant starting an HR interview.",
                "questioning": "You are a friendly but professional HR manager. Ask common behavioral questions. Keep your questions open-ended and conversational. Ask only one question at a time.",
                "feedback": "You are an expert HR evaluator. Analyze the behavioral interview and provide detailed, constructive feedback in JSON format."
            }
        }
        return base_messages.get(session_type, {}).get(stage, "You are a professional interviewer.")

    def _get_default_feedback(self, detail: str = "An unexpected error occurred.") -> Dict[str, Any]:
        """Default feedback structure in case of an error."""
        return {
            "overall_score": 0,
            "technical_score": 0,
            "communication_score": 0,
            "confidence_score": 0,
            "strengths": [],
            "improvement_areas": ["Feedback generation failed"],
            "detailed_feedback": f"Could not generate feedback due to an error: {detail}",
            "recommendations": ["Please try the interview again."]
        }
