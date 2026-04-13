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
        self.model = None
        # Get configuration from environment variables
        self.device = os.getenv("STT_DEVICE", "cuda" if torch.cuda.is_available() else "cpu")
        self.model_size = os.getenv("STT_MODEL_SIZE", "distil-large-v3")
        
        # Use int8_float16 for CUDA to save VRAM, or int8 for CPU
        self.compute_type = os.getenv("STT_COMPUTE_TYPE", "int8_float16" if self.device == "cuda" else "int8")
        
        logger.info(f"Initial attempt: Loading Faster-Whisper STT model ({self.model_size}) on device: {self.device} with compute type: {self.compute_type}")
        
        try:
            self.model = WhisperModel(self.model_size, device=self.device, compute_type=self.compute_type)
            logger.info(f"Faster-Whisper with {self.model_size} loaded successfully on {self.device}.")
        except Exception as e:
            if self.device == "cuda":
                logger.error(f"Failed to load Whisper model on CUDA (possibly OOM): {e}. Falling back to CPU.")
                try:
                    self.device = "cpu"
                    self.compute_type = "int8"
                    self.model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
                    logger.info(f"Faster-Whisper with {self.model_size} loaded successfully on CPU as fallback.")
                except Exception as cpu_e:
                    logger.error(f"Critical failure: Failed to load Whisper model on CPU fallback: {cpu_e}")
            else:
                logger.error(f"Failed to load Whisper model: {e}")

    async def transcribe_audio(self, audio_blob: bytes, session_id: str) -> str:
        """Saves audio blob to a temporary file and transcribes it."""
        if not self.model:
            logger.warning(f"STT Model not initialized, skipping transcription for {session_id}")
            return ""

        temp_file_path = os.path.join(TEMP_AUDIO_DIR, f"{session_id}_{datetime.now().timestamp()}.webm")
        try:
            async with aiofiles.open(temp_file_path, 'wb') as f:
                await f.write(audio_blob)
            
            # Using beam_size=1 or 2 can also reduce memory usage if needed
            segments, info = await asyncio.to_thread(self.model.transcribe, temp_file_path, beam_size=2)
            transcript = " ".join([segment.text for segment in segments]).strip()
            
            if not transcript:
                logger.warning(f"Transcription for {session_id} resulted in empty text.")
            else:
                logger.info(f"Transcription for {session_id} successful ({len(transcript)} chars).")
            
            return transcript
        except Exception as e:
            logger.error(f"Error during transcription for {session_id}: {e}")
            # Optional: if it's a CUDA OOM error during runtime, we could try to re-init on CPU here,
            # but that's complex for a single request.
            return ""
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

# Create a single, globally accessible instance of the service
stt_service = STTService()
