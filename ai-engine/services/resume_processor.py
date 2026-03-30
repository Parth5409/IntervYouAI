import os
import logging
import httpx
import tempfile
from pathlib import Path
import shutil
from orchestrator.rag_utils import get_vector_store_manager, DocumentProcessor

logger = logging.getLogger(__name__)

async def process_resume_from_url(student_id: str, resume_url: str):
    """
    Downloads a resume from a URL, extracts text, creates a vector store, 
    and saves it for the student.
    """
    logger.info(f"Processing resume for student {student_id} from {resume_url}")
    
    try:
        doc_processor = DocumentProcessor()
        vector_store_manager = get_vector_store_manager()

        # 1. Process Resume (Extract Text and Create Chunks)
        # We reuse the existing logic in DocumentProcessor
        processed_data = await doc_processor.process_pdf_resume(resume_url)
        chunks = processed_data["chunks"]
        
        if not chunks:
            logger.warning(f"No text extracted from resume for student {student_id}")
            return
            
        # 2. Create and Save Vector Store
        # Standardized name: resume_user_<student_id>
        store_name = f"resume_user_{student_id}"
        
        await vector_store_manager.create_vector_store(
            documents=chunks,
            store_name=store_name,
            overwrite=True
        )
        
        logger.info(f"Successfully processed and stored resume for student {student_id}")
        
    except Exception as e:
        logger.error(f"Error processing resume for student {student_id}: {e}")
