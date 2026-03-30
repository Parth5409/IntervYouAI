"""
Analysis routes for JD processing and skill extraction
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Set

from llm.gemini import GeminiLLM  # Assuming this exists and works

logger = logging.getLogger(__name__)
router = APIRouter()

class JDExtractionRequest(BaseModel):
    job_description: str

class JDExtractionResponse(BaseModel):
    skills: Set[str]

@router.post("/extract-skills", response_model=JDExtractionResponse)
async def extract_skills(request: JDExtractionRequest):
    """
    Extracts key skills from a Job Description using LLM.
    """
    logger.info(f"Received skill extraction request for JD length: {len(request.job_description)}")
    try:
        # Initialize LLM
        llm = GeminiLLM()
        
        prompt = f"""
        Extract a list of technical and soft skills from the following Job Description.
        Return ONLY a comma-separated list of skills. No other text.
        
        Job Description:
        {request.job_description}
        """
        
        system_message = "You are an expert HR and Technical Recruiter. Your task is to extract skills from job descriptions."
        
        logger.info("Calling Gemini LLM for skill extraction...")
        response_text = await llm.generate_response(prompt, system_message=system_message, temperature=0.1)
        
        skills = {s.strip() for s in response_text.split(',') if s.strip()}
        logger.info(f"Successfully extracted {len(skills)} skills: {skills}")
        
        return JDExtractionResponse(skills=skills)
        
    except Exception as e:
        logger.exception("Error extracting skills")
        # Fallback or error
        raise HTTPException(status_code=500, detail="Failed to extract skills") from e
