"""
File handling utilities for resumes and documents
"""

import os
import logging
import tempfile
import shutil
from typing import Optional, Tuple, List
from pathlib import Path
from fastapi import UploadFile
import aiofiles
from datetime import datetime

logger = logging.getLogger(__name__)

# Allowed file types and max size
ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.csv'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

async def save_uploaded_file(
    file: UploadFile, 
    user_id: str, 
    file_type: str = "resume"
) -> Tuple[str, str]:
    """
    Save uploaded file to disk
    
    Args:
        file: FastAPI UploadFile object
        user_id: User identifier
        file_type: Type of file (resume, profile_image, etc.)
        
    Returns:
        Tuple of (file_path, filename)
    """
    try:
        # Validate file
        if not file.filename:
            raise ValueError("No filename provided")
        
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"File type {file_ext} not allowed")
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Seek back to start
        
        if file_size > MAX_FILE_SIZE:
            raise ValueError(f"File size {file_size} exceeds maximum {MAX_FILE_SIZE}")
        
        # Generate unique filename
        timestamp = int(datetime.now().timestamp())
        filename = f"{user_id}_{file_type}_{timestamp}{file_ext}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        logger.info(f"Saved file {filename} for user {user_id}")
        return str(file_path), filename
        
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise

def get_file_url(filename: str) -> str:
    """Generate URL for uploaded file"""
    return f"/uploads/{filename}"

def delete_file(file_path: str) -> bool:
    """Delete file from disk"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Deleted file {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file {file_path}: {e}")
        return False

def validate_file_type(filename: str, allowed_types: List[str]) -> bool:
    """Validate file type"""
    file_ext = Path(filename).suffix.lower()
    return file_ext in allowed_types
