import os
import logging
import json
from typing import Optional, Dict, Any, List

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.callbacks import BaseCallbackHandler

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
    
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        self.model_name = model_name
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        self.llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=self.api_key,
            temperature=0.7,
            max_tokens=4096,
            callbacks=[GeminiCallbackHandler()],
            convert_system_message_to_human=True
        )
        logger.info(f"Initialized Gemini LLM with model: {model_name}")

    async def generate_initial_greeting(self, session_type: str, session_context: Dict[str, Any], rag_context: Dict[str, Any]) -> str:
        """Generates a personalized initial greeting that also asks the user to introduce themselves."""
        try:
            system_msg = self._get_system_message(session_type, "greeting", session_context)
            
            candidate_name = session_context.get('candidate_name', 'Candidate')
            
            prompt_template = f"""Based on the following context, generate a warm and professional opening message for the interview. 
            Acknowledge the candidate's background from their resume, but keep it brief.
            End the message by asking the candidate to introduce themselves.

            **Context:**
            - Candidate Name: {candidate_name}
            - Company: {session_context.get('company_name', 'the company')}
            - Role: {session_context.get('job_role', 'the position')}
            - Difficulty: {session_context.get('difficulty', 'Medium')}

            **Job Description (JD) Context:**
            {rag_context.get('jd_context', 'No specific JD context provided.')}

            **Candidate Resume Context:**
            {rag_context.get('resume_context', ['No resume information available.'])}
            
            **Instructions:**
            - Start with "Hi {candidate_name}, ..." or similar.
            - Mention the company and role.
            - Briefly reference a key skill or experience from the resume if available.
            - Ask them to introduce themselves.
            """
            
            messages = [SystemMessage(content=system_msg), HumanMessage(content=prompt_template)]
            response = await self.llm.ainvoke(messages)
            return response.content.strip()

        except Exception as e:
            logger.error(f"Error generating initial greeting: {e}")
            return f"Hello! Welcome to your {session_type.lower()} interview. To start, can you please tell me a little bit about yourself?"

    async def generate_interview_question(self, session_type: str, session_context: Dict[str, Any], chat_history: List[BaseMessage], rag_context: Dict[str, Any], last_user_message: str, stage: str = "questioning") -> str:
        """Generates the next interview question based on history and RAG context."""
        try:
            system_msg = self._get_system_message(session_type, stage, session_context)

            rag_str = ""
            if rag_context.get('jd_context'):
                rag_str += "\n\n--- Job Description (JD) ---\n" + rag_context['jd_context']
            if rag_context.get('resume_context'):
                rag_str += "\n\n--- Relevant Resume Snippets ---\n" + "\n".join(rag_context['resume_context'])
            if rag_context.get('company_context'):
                rag_str += "\n\n--- Relevant Company & Role Knowledge ---\n" + "\n".join(rag_context['company_context'])

            prompt = f"""The user's previous answer was: '{last_user_message}'.

            Here is the context for the interview. Use the Job Description and Resume to formulate your next question.
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

    async def generate_feedback(self, session_type: str, chat_history: List[BaseMessage], session_context: Dict[str, Any], rag_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generates comprehensive interview feedback from the chat history and context."""
        try:
            system_msg = self._get_system_message(session_type, "feedback", session_context)

            transcript_text = "\n".join([f"assistant: {msg.content}" if isinstance(msg, AIMessage) else f"user: {msg.content}" for msg in chat_history])

            jd_text = rag_context.get('jd_context', 'No JD provided')
            resume_text = "\n".join(rag_context.get('resume_context', ['No resume info']))
            
            candidate_name = session_context.get('candidate_name', 'the candidate')
            company_name = session_context.get('company_name', 'the company')

            prompt = f"""
            **Interview Context:**
            - Candidate Name: {candidate_name}
            - Company: {company_name}
            - Type: {session_type}
            - Role: {session_context.get('job_role', 'General')}
            - Difficulty: {session_context.get('difficulty', 'Medium')}
            
            **Job Description (JD):**
            {jd_text}

            **Candidate Background (Resume):**
            {resume_text}

            **Full Transcript:**
            {transcript_text}
            
            Please provide feedback for {candidate_name} in a valid JSON format. Evaluate their performance against the Job Description for {company_name}.
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
                content = response.content.strip()
                # Find the first '{' and last '}' to extract the JSON object
                start_idx = content.find('{')
                end_idx = content.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx+1]
                    feedback_dict = json.loads(json_str)
                    
                    # Ensure all required fields for InterviewFeedback exist
                    required_fields = {
                        "overall_score": 0,
                        "technical_score": None,
                        "communication_score": 0,
                        "confidence_score": 0,
                        "strengths": [],
                        "improvement_areas": [],
                        "detailed_feedback": f"Feedback generated for {candidate_name}.",
                        "recommendations": []
                    }
                    for field, default in required_fields.items():
                        if field not in feedback_dict:
                            feedback_dict[field] = default
                    
                    return feedback_dict
                else:
                    raise ValueError("No JSON object found in response")
            except Exception as je:
                logger.error(f"Failed to parse feedback: {je}\nRaw response: {response.content}")
                return self._get_default_feedback(detail="Failed to parse evaluator response.")

        except Exception as e:
            logger.error(f"Error generating feedback: {e}")
            return self._get_default_feedback(detail=str(e))

    async def generate_gd_feedback(self, topic: str, chat_history: List[Dict[str, Any]], session_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generates comprehensive GD feedback from the discussion transcript."""
        try:
            system_msg = self._get_system_message("GD", "feedback", session_context)

            transcript_text = "\n".join([f"{msg['speaker_name']}: {msg['message']}" for msg in chat_history])
            
            candidate_name = session_context.get('candidate_name', 'the candidate')
            company_name = session_context.get('company_name', 'the company')

            prompt = f"""
            **Group Discussion Context:**
            - Topic: {topic}
            - Company: {company_name}
            - Candidate Name: {candidate_name}
            
            **Full Transcript:**
            {transcript_text}
            
            Please provide feedback for the candidate named '{candidate_name}' in a valid JSON format. Evaluate their performance in the context of a recruitment process for {company_name}.
            {{ 
                "participation_score": <int, 0-100>,
                "initiative_score": <int, 0-100>,
                "clarity_score": <int, 0-100>,
                "collaboration_score": <int, 0-100>,
                "topic_understanding": <int, 0-100>,
                "strengths": ["<string>"],
                "improvement_suggestions": ["<string>"],
                "key_contributions": ["<string>"],
                "overall_feedback": "<string>"
            }}
            """
            
            messages = [SystemMessage(content=system_msg), HumanMessage(content=prompt)]
            response = await self.llm.ainvoke(messages)
            
            try:
                content = response.content.strip()
                start_idx = content.find('{')
                end_idx = content.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx+1]
                    return json.loads(json_str)
                else:
                    raise ValueError("No JSON object found in response")
            except Exception as je:
                logger.error(f"Failed to parse GD feedback: {je}\nRaw response: {response.content}")
                return self._get_default_gd_feedback()

        except Exception as e:
            logger.error(f"Error generating GD feedback: {e}")
            return self._get_default_gd_feedback()

    async def generate_response(self, prompt: str, system_message: str, temperature: float = 0.7) -> str:
        """Generates a generic response based on a prompt and system message."""
        try:
            # Create a temporary LLM instance with the desired temperature
            llm_with_temp = ChatGoogleGenerativeAI(
                model=self.model_name,
                google_api_key=self.api_key,
                temperature=temperature,
                max_tokens=2048,
                callbacks=[GeminiCallbackHandler()],
                convert_system_message_to_human=True
            )
            
            messages = [SystemMessage(content=system_message), HumanMessage(content=prompt)]
            response = await llm_with_temp.ainvoke(messages)
            return response.content.strip()
        except Exception as e:
            logger.error(f"Error generating generic response: {e}")
            return "I am unable to respond at the moment."

    async def extract_skills(self, text: str) -> List[str]:
        """Extracts a list of technical and soft skills from the provided text."""
        try:
            prompt = f"""
            Extract a clean, concise list of technical and professional skills from the following text. 
            Focus on programming languages, frameworks, tools, soft skills, and domain expertise.
            Return ONLY a JSON array of strings. No other text.

            Text:
            {text}
            """
            
            system_msg = "You are an expert recruitment assistant specializing in skill extraction from resumes and job descriptions."
            
            messages = [SystemMessage(content=system_msg), HumanMessage(content=prompt)]
            response = await self.llm.ainvoke(messages)
            
            content = response.content.strip()
            # Find the first '[' and last ']' to extract the JSON array
            start_idx = content.find('[')
            end_idx = content.rfind(']')
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx+1]
                skills = json.loads(json_str)
                if isinstance(skills, list):
                    return [str(s) for s in skills]
            
            return []
        except Exception as e:
            logger.error(f"Error extracting skills: {e}")
            return []

    def _get_system_message(self, session_type: str, stage: str, context: Dict[str, Any]) -> str:
        """Generates the appropriate system message based on the interview type, stage, and difficulty."""
        difficulty = context.get('difficulty', 'Medium')
        job_role = context.get('job_role', 'developer')
        company_name = context.get('company_name', 'the company')
        experience_level = context.get('experience_level', 'mid')
        industry = context.get('industry', 'the tech industry')

        negotiation_style = context.get('negotiation_style', 'collaborative')

        salary_range = context.get('salary_range', 'not specified')
        min_lpa = context.get('min_lpa', '10')
        max_lpa = context.get('max_lpa', '15')

        if session_type == "TECHNICAL":
            if stage == "greeting":
                return "You are a helpful AI assistant starting a technical interview."
            elif stage == "feedback":
                return "You are an expert interview evaluator. Analyze the technical interview and provide detailed, constructive feedback in JSON format."
            else: # questioning
                return f"""You are a senior technical interviewer at {company_name} conducting a screening for a {job_role} position.
                Your goal is to ask a balanced mix of questions to assess the candidate's suitability.
                The interview difficulty is set to '{difficulty}'. Adjust your questions accordingly.
                
                **Interview Structure:**
                1. Ask questions based on the candidate's resume, focusing on their projects and experience.
                2. Ask 1-2 questions from the provided 'Company & Role Knowledge' to see if they have prepared for the company.
                3. Ensure your questions are relevant to the {job_role} role.
                
                **Rules:**
                - Ask only one, concise, single-part question at a time.
                - Do not offer feedback or hints.
                - Use the conversation history to ask logical follow-up questions, but do not get stuck on one topic for too long.
                - Be aware that the user's response is coming from a speech-to-text service and may contain transcription errors (e.g., 'bcrypt' might be transcribed as 'decrypt'). If a technical term seems slightly off, infer the correct term based on the context.
                """
        
        elif session_type == "HR_SALARY":
            if stage == "greeting":
                return f"You are a friendly and professional HR Manager at {company_name}, starting a final selection interview for a {job_role} role. This session will cover behavioral fit and then transition to compensation discussion."
            elif stage == "behavioral":
                return f"""You are an HR Manager at {company_name}. Conduct a behavioral interview for {job_role}.
                Focus on STAR method questions, cultural fit, and motivation.
                The difficulty is '{difficulty}'. 
                Ask only one, concise, single-part question at a time."""
            elif stage == "negotiation":
                return f"""You are now the Hiring Manager at {company_name}. Transition the conversation to compensation.
                The approved salary range for this role is {min_lpa} LPA to {max_lpa} LPA.
                Congratulate the candidate on their performance so far.
                Your goal is to reach a mutually agreeable package within the {min_lpa}-{max_lpa} range.
                Adopt a {negotiation_style} negotiation style."""
            elif stage == "feedback":
                return "Analyze this combined HR and Salary negotiation session. Provide scores for behavioral fit and negotiation skills."

        elif session_type == "HR":
            if stage == "greeting":
                return f"You are a friendly and professional HR Manager at {company_name}, starting an interview for a {job_role} role."
            elif stage == "feedback":
                return "You are an expert HR evaluator. Analyze the interview for behavioral traits, communication skills, and culture fit. Provide detailed, constructive feedback in JSON format."
            else: # questioning
                return f"""You are an HR Manager at {company_name}, a company in the {industry}. You are conducting an interview for a {job_role} position at the {experience_level} level.
                The interview difficulty is '{difficulty}'.

                **Your Goal:** Assess the candidate's behavioral competencies, cultural fit, and motivation.

                **Interview Focus:**
                - Ask behavioral questions (using STAR method: Situation, Task, Action, Result).
                - Ask situational questions ("What would you do if...?").
                - Inquire about career goals, strengths, weaknesses, and reasons for interest in {company_name}.
                - Gauge their communication skills and professionalism.
                - Use the candidate's resume to ask about past experiences and projects from a behavioral perspective.

                **Rules:**
                - Ask only one, concise, single-part question at a time.
                - Maintain a friendly but professional tone.
                - Do not ask technical questions.
                - Use the conversation history to ask relevant follow-up questions.
                """

        elif session_type == "SALARY":
            if stage == "greeting":
                return f"You are a hiring manager at {company_name} beginning a salary negotiation for the {job_role} role. Start the conversation professionally, perhaps by congratulating the candidate on reaching this stage."
            elif stage == "feedback":
                return "You are an expert negotiation evaluator. Analyze the salary negotiation transcript. Evaluate the candidate's negotiation strategy, communication, and confidence. Provide detailed, constructive feedback in JSON format."
            else: # questioning
                return f"""You are a hiring manager at {company_name}, a company in the {industry}. You are in a salary negotiation with a candidate for the {job_role} position at the {experience_level} level.
                The negotiation difficulty is '{difficulty}'.
                The candidate has indicated a target salary range of {salary_range}.

                **Your Goal:** Reach a mutually agreeable compensation package while representing the company's interests.

                **Your Persona:** You should adopt a {negotiation_style} negotiation style.

                **Negotiation Strategy:**
                - If the candidate gives a high number, be prepared to counter with a well-reasoned offer based on market data (you can invent this data).
                - Discuss the total compensation package, not just the base salary. Mention benefits like healthcare, bonuses, stock options, and professional development opportunities (you can invent these details).
                - If the candidate is firm, explore non-monetary benefits or a performance-based bonus structure.
                - Maintain a professional and collaborative tone, aiming for a win-win outcome.

                **Rules:**
                - Respond naturally to the candidate's statements.
                - You can ask questions to understand their expectations better (e.g., "What are your salary expectations?", "How did you arrive at that number?").
                - Be prepared to justify the company's offer.
                """
        
        elif session_type == "GD":
            if stage == "feedback":
                return "You are an expert GD evaluator. Analyze the multi-party group discussion transcript. Evaluate the candidate's participation, initiative, clarity, collaboration, and understanding of the topic. Provide detailed, constructive feedback in JSON format."

        return "You are a professional interviewer."

    def _get_default_gd_feedback(self) -> Dict[str, Any]:
        """Default GD feedback structure in case of an error."""
        return {
            "participation_score": 0,
            "initiative_score": 0,
            "clarity_score": 0,
            "collaboration_score": 0,
            "topic_understanding": 0,
            "strengths": [],
            "improvement_suggestions": ["Feedback generation failed"],
            "key_contributions": [],
            "overall_feedback": "Could not generate feedback due to an error."
        }

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
