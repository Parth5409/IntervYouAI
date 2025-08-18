"""
Google Gemini LLM integration using LangChain
"""

import os
import logging
from typing import Optional, Dict, Any, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.callbacks.manager import CallbackManagerForLLMRun
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
        """
        Initialize Gemini LLM
        
        Args:
            model_name: Gemini model name
        """
        self.model_name = model_name
        self.api_key = os.getenv("GOOGLE_API_KEY")
        
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        # Initialize the LangChain Gemini client
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=self.api_key,
            temperature=0.7,
            max_tokens=2048,
            callbacks=[GeminiCallbackHandler()]
        )
        
        logger.info(f"Initialized Gemini LLM with model: {model_name}")
    
    async def generate_response(
        self, 
        prompt: str, 
        system_message: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Generate a response using Gemini
        
        Args:
            prompt: User prompt
            system_message: System context message
            temperature: Override default temperature
            max_tokens: Override default max tokens
            
        Returns:
            Generated response text
        """
        try:
            # Create message list
            messages = []
            
            if system_message:
                messages.append(SystemMessage(content=system_message))
            
            messages.append(HumanMessage(content=prompt))
            
            # Update temperature and max_tokens if provided
            if temperature is not None:
                self.llm.temperature = temperature
            if max_tokens is not None:
                self.llm.max_tokens = max_tokens
            
            # Generate response
            response = await self.llm.ainvoke(messages)
            return response.content
            
        except Exception as e:
            logger.error(f"Error generating Gemini response: {e}")
            raise
    
    def generate_interview_question(
        self, 
        session_type: str,
        context: Dict[str, Any],
        previous_qa: Optional[List[Dict]] = None
    ) -> str:
        """
        Generate context-aware interview questions
        
        Args:
            session_type: Type of interview (TECHNICAL, HR, etc.)
            context: Interview context (resume, company, role)
            previous_qa: Previous questions and answers
            
        Returns:
            Generated interview question
        """
        try:
            # Build system message based on session type
            system_messages = {
                "TECHNICAL": self._get_technical_system_message(),
                "HR": self._get_hr_system_message(),
                "SALARY": self._get_salary_system_message()
            }
            
            system_msg = system_messages.get(session_type, self._get_general_system_message())
            
            # Build context prompt
            prompt_parts = [
                f"Interview Type: {session_type}",
                f"Candidate Experience: {context.get('experience_level', 'mid')} level",
            ]
            
            if context.get('job_role'):
                prompt_parts.append(f"Job Role: {context['job_role']}")
            
            if context.get('company_name'):
                prompt_parts.append(f"Company: {context['company_name']}")
            
            if context.get('skills'):
                prompt_parts.append(f"Candidate Skills: {', '.join(context['skills'])}")
            
            if context.get('topics'):
                prompt_parts.append(f"Focus Topics: {', '.join(context['topics'])}")
            
            # Add previous Q&A context
            if previous_qa:
                qa_context = "\n".join([
                    f"Previous Q: {qa['question']}\nA: {qa['answer'][:200]}..."
                    for qa in previous_qa[-3:]  # Last 3 Q&As
                ])
                prompt_parts.append(f"Previous Discussion:\n{qa_context}")
            
            prompt = "\n".join(prompt_parts)
            prompt += "\n\nGenerate the next appropriate interview question:"
            
            # Generate using synchronous method for real-time use
            messages = [
                SystemMessage(content=system_msg),
                HumanMessage(content=prompt)
            ]
            
            response = self.llm.invoke(messages)
            return response.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating interview question: {e}")
            return "Can you tell me about your background and experience?"
    
    def generate_feedback(
        self, 
        session_type: str,
        transcript: List[Dict[str, str]],
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive interview feedback
        
        Args:
            session_type: Type of interview
            transcript: Complete conversation transcript
            context: Interview context
            
        Returns:
            Structured feedback dictionary
        """
        try:
            system_msg = f"""You are an expert interview evaluator. Analyze the following {session_type} interview 
            and provide detailed, constructive feedback. Focus on:
            
            1. Technical competency (for technical interviews)
            2. Communication skills
            3. Problem-solving approach
            4. Confidence and presentation
            5. Areas for improvement
            
            Provide scores (0-100) and specific recommendations."""
            
            # Build transcript for analysis
            transcript_text = "\n".join([
                f"{'Interviewer' if msg['role'] == 'assistant' else 'Candidate'}: {msg['content']}"
                for msg in transcript
            ])
            
            prompt = f"""
            Interview Context:
            - Type: {session_type}
            - Role: {context.get('job_role', 'General')}
            - Experience Level: {context.get('experience_level', 'mid')}
            
            Transcript:
            {transcript_text}
            
            Please provide feedback in the following JSON format:
            {{
                "overall_score": <0-100>,
                "technical_score": <0-100>,
                "communication_score": <0-100>,
                "confidence_score": <0-100>,
                "strengths": ["strength1", "strength2"],
                "improvement_areas": ["area1", "area2"],
                "detailed_feedback": "comprehensive feedback text",
                "recommendations": ["recommendation1", "recommendation2"]
            }}
            """
            
            messages = [
                SystemMessage(content=system_msg),
                HumanMessage(content=prompt)
            ]
            
            response = self.llm.invoke(messages)
            
            # Parse JSON response (in production, add better error handling)
            import json
            try:
                feedback = json.loads(response.content)
                return feedback
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "overall_score": 75,
                    "technical_score": 70,
                    "communication_score": 80,
                    "confidence_score": 75,
                    "strengths": ["Good communication", "Relevant experience"],
                    "improvement_areas": ["Technical depth", "Specific examples"],
                    "detailed_feedback": response.content,
                    "recommendations": ["Practice coding problems", "Prepare STAR format examples"]
                }
                
        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            return self._get_default_feedback()
    
    def _get_technical_system_message(self) -> str:
        """System message for technical interviews"""
        return """You are a senior technical interviewer at a top tech company. Your tone is professional, direct, and conversational. 
        - Ask only one, single-part question at a time.
        - Keep your questions concise and to the point.
        - Do NOT explain the reasoning or what you are assessing.
        - Wait for the user to respond before asking the next question.
        - Adapt your follow-up questions based on their answers."""
    
    def _get_hr_system_message(self) -> str:
        """System message for HR interviews"""
        return """You are a friendly but professional HR manager. Your goal is to understand the candidate's personality and experience.
        - Ask common behavioral questions.
        - Keep your questions open-ended and conversational.
        - Ask only one question at a time.
        - Do NOT use corporate jargon or explain the purpose of your questions."""
    
    def _get_salary_system_message(self) -> str:
        """System message for salary negotiations"""
        return """You are a hiring manager discussing compensation. Your tone is professional and collaborative.
        - Ask direct but polite questions about salary expectations and other compensation.
        - Respond to the candidate's points, but keep your own questions and statements concise.
        - Ask only one question at a time."""
    
    def _get_general_system_message(self) -> str:
        """Default system message"""
        return """You are a professional interviewer. Ask a single, relevant question based on the interview type and context. Be engaging and professional. Do not explain your questions."""
    
    def _get_default_feedback(self) -> Dict[str, Any]:
        """Default feedback structure"""
        return {
            "overall_score": 70,
            "technical_score": 65,
            "communication_score": 75,
            "confidence_score": 70,
            "strengths": ["Engaged in conversation", "Showed interest"],
            "improvement_areas": ["Provide more specific examples", "Technical depth"],
            "detailed_feedback": "The candidate showed good engagement but could improve on technical details and specific examples.",
            "recommendations": ["Practice technical concepts", "Prepare STAR format stories", "Research company background"]
        }