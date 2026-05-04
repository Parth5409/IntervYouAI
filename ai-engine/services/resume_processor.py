import os
import logging
import httpx
import json
from pathlib import Path
from orchestrator.rag_utils import get_vector_store_manager, DocumentProcessor
from llm.gemini import GeminiLLM

logger = logging.getLogger(__name__)

CORE_API_URL = os.getenv("CORE_API_URL", "http://localhost:8080")

async def process_resume_from_url(student_id: str, resume_url: str):
    """
    Downloads a resume from a URL, extracts text, creates a vector store, 
    and saves it for the student.
    """
    logger.info(f"Processing resume for student {student_id} from {resume_url}")
    
    try:
        doc_processor = DocumentProcessor()
        vector_store_manager = get_vector_store_manager()
        gemini = GeminiLLM()

        # 1. Process Resume (Extract Text and Create Chunks)
        processed_data = await doc_processor.process_pdf_resume(resume_url)
        chunks = processed_data["chunks"]
        original_text = processed_data.get("original_text", "")
        
        if not chunks:
            logger.warning(f"No text extracted from resume for student {student_id}")
            return
            
        # 2. Create and Save Vector Store
        store_name = f"resume_user_{student_id}"
        await vector_store_manager.create_vector_store(
            documents=chunks,
            store_name=store_name,
            overwrite=True
        )
        
        # 3. Extract Skills and Update Backend
        if original_text:
            logger.info(f"Extracting skills for student {student_id}")
            skills = await gemini.extract_skills(original_text)
            
            if skills:
                logger.info(f"Pushing {len(skills)} skills to backend for student {student_id}")
                async with httpx.AsyncClient() as client:
                    try:
                        # Call the new Java endpoint
                        response = await client.put(
                            f"{CORE_API_URL}/api/core/v1/students/{student_id}/skills",
                            json=skills,
                            timeout=10.0
                        )
                        if response.status_code == 200:
                            logger.info(f"Successfully updated skills for student {student_id}")
                        else:
                            logger.error(f"Failed to update skills for student {student_id}: {response.status_code} - {response.text}")
                    except Exception as http_err:
                        logger.error(f"HTTP error pushing skills to backend: {http_err}")
            else:
                logger.warning(f"No skills extracted for student {student_id}")
        
        logger.info(f"Successfully processed and stored resume for student {student_id}")
        
    except Exception as e:
        logger.error(f"Error processing resume for student {student_id}: {e}")
