"""
STT (Speech-to-Text) routes for transcription using openai-whisper
"""

import logging
import whisper
import aiofiles
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from models.pydantic_models import APIResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# Define a temporary directory to store audio files
TEMP_AUDIO_DIR = "temp_audio"
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)

# Load the Whisper model into memory. 
# Using "base" is a good balance for CPU execution.
# For higher accuracy with a GPU, you could use "medium" or "large".
whisper_model = whisper.load_model("medium")
logger.info("Whisper STT model loaded successfully.")

@router.post("/transcribe", response_model=APIResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Receives an audio file, saves it temporarily, transcribes it using the local Whisper model,
    and returns the transcript.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided.")

    temp_file_path = os.path.join(TEMP_AUDIO_DIR, file.filename)

    try:
        async with aiofiles.open(temp_file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        logger.info(f"Temporarily saved audio file to {temp_file_path}")

        # Transcribe using the loaded Whisper model
        result = whisper_model.transcribe(temp_file_path, fp16=False)
        transcript = result.get('text', '').strip()
        logger.info(f"Successfully transcribed audio. Transcript: {transcript[:100]}...")

        return APIResponse(
            success=True,
            message="Audio transcribed successfully.",
            data={"transcript": transcript}
        )

    except Exception as e:
        logger.error(f"Error during transcription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe audio: {str(e)}"
        )
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            logger.info(f"Removed temporary audio file: {temp_file_path}")
