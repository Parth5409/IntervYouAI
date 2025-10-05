# backend/tts/tts_service.py
import io
import asyncio
import logging
import torch
import numpy as np
from scipy.io.wavfile import write as write_wav


logger = logging.getLogger(__name__)


class TTSService:
    """A wrapper for Kokoro-82M TTS model."""
    def __init__(self):
        """Loads the Kokoro-82M model into memory."""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"TTS Service using device: {self.device}")
        try:
            from kokoro import KPipeline
            
            logger.info("Loading Kokoro-82M TTS model...")
            # Initialize Kokoro pipeline
            # 'a' for American English, 'b' for British English
            self.pipeline = KPipeline(repo_id='hexgrad/Kokoro-82M',lang_code='a')
            
            # Set voice - you can change this to any of the 48+ available voices
            # Popular choices: 'af_bella', 'af_sarah', 'am_adam', 'am_michael'
            self.voice = 'af_bella'  # Professional female voice for interviewer
            
            # Sample rate for Kokoro (always 24000 Hz)
            self.sample_rate = 24000
            
            logger.info(f"Kokoro-82M loaded successfully with voice: {self.voice}")
            self.model = True  # Flag to indicate successful initialization

        except Exception as e:
            logger.error(f"Failed to load Kokoro-82M model or dependencies: {e}")
            logger.error("Please install kokoro: pip install kokoro")
            logger.error("Also install espeak-ng system package")
            self.model = None  # Ensure model is None if setup fails


    async def text_to_audio(self, text: str) -> bytes | None:
        """Converts text to WAV audio bytes in memory using Kokoro-82M."""
        if not self.model or not text.strip():
            return None
        
        try:
            # The model inference is synchronous, so we run it in a thread
            audio_waveform = await asyncio.to_thread(
                self._generate_speech, text
            )

            # Convert the waveform to WAV bytes in memory
            wav_buffer = io.BytesIO()
            # Kokoro outputs at 24kHz sampling rate
            write_wav(wav_buffer, self.sample_rate, audio_waveform)
            wav_buffer.seek(0)
            return wav_buffer.read()

        except Exception as e:
            logger.error(f"Error generating audio from text: {e}")
            return None


    def _generate_speech(self, text: str):
        """Synchronous helper function for speech generation using Kokoro-82M."""
        # Generate audio using Kokoro pipeline
        # The pipeline returns a generator that yields (graphemes, phonemes, audio) tuples
        generator = self.pipeline(
            text, 
            voice=self.voice,
            speed=1.0,  # Adjust speed if needed (0.5 to 2.0)
            split_pattern=r'\n+'  # Split on newlines for better pacing
        )
        
        # Collect all audio chunks from the generator
        audio_chunks = []
        for graphemes, phonemes, audio in generator:
            audio_chunks.append(audio)
        
        # Concatenate all audio chunks into single array
        if not audio_chunks:
            raise ValueError("No audio generated from text")
        
        # Kokoro returns audio as numpy float32 arrays
        full_audio = np.concatenate(audio_chunks)
        
        # Convert to int16 format for WAV file (if needed)
        if full_audio.dtype == np.float32 or full_audio.dtype == np.float64:
            # Kokoro outputs float in range [-1, 1], convert to int16
            full_audio = (full_audio * 32767).astype(np.int16)
        
        return full_audio


# Create a single, globally accessible instance of the service
tts_service = TTSService()
