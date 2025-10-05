# backend/stt/stt_service.py
import os
import logging
import asyncio
from datetime import datetime
import aiofiles
from faster_whisper import WhisperModel

import torch

logger = logging.getLogger(__name__)

TEMP_AUDIO_DIR = "temp_audio_stt"
os.makedirs(TEMP_AUDIO_DIR, exist_ok=True)

class STTService:
    """A wrapper for the Faster-Whisper STT model."""
    def __init__(self):
        """Loads the Whisper model into memory."""
        try:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            compute_type = "float16" if torch.cuda.is_available() else "int8"
            
            logger.info(f"Loading Faster-Whisper STT model on device: {device} with compute type: {compute_type}")
            
            self.model = WhisperModel("distil-large-v3", device=device, compute_type=compute_type)
            logger.info("Faster-Whisper with Distil-Large-v3 loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            self.model = None

    async def transcribe_audio(self, audio_blob: bytes, session_id: str) -> str:
        """Saves audio blob to a temporary file and transcribes it."""
        if not self.model:
            return ""

        temp_file_path = os.path.join(TEMP_AUDIO_DIR, f"{session_id}_{datetime.now().timestamp()}.webm")
        try:
            async with aiofiles.open(temp_file_path, 'wb') as f:
                await f.write(audio_blob)
            
            segments, info = await asyncio.to_thread(self.model.transcribe, temp_file_path, beam_size=5)
            transcript = " ".join([segment.text for segment in segments]).strip()
            logger.info(f"Transcription for {session_id} successful.")
            return transcript
        except Exception as e:
            logger.error(f"Error during transcription for {session_id}: {e}")
            return ""
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

# Create a single, globally accessible instance of the service
stt_service = STTService()
