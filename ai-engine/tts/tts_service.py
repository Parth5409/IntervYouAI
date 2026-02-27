# backend/tts/tts_service.py
import io
import os
import asyncio
import logging
import torch
import numpy as np
from scipy.io.wavfile import write as write_wav
from typing import List


logger = logging.getLogger(__name__)


class TTSService:
    """A wrapper for Kokoro-82M TTS model."""
    def __init__(self):
        """Loads the Kokoro-82M model into memory."""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"TTS Service using device: {self.device}")
        
        # Default voice
        self.voice = 'am_michael'  # Professional male voice for interviewer
        self.available_voices: List[str] = [
            'af_bella', 'af_nicole', 'am_fenrir', 'am_michael', 'bf_emma', 'bm_fable',
            'af_aoede', 'af_kore', 'af_sarah', 'am_puck', 'bf_isabella'
        ]
        
        try:
            from kokoro import KPipeline, KModel
            
            logger.info("Loading Kokoro-82M TTS model from local directory...")
            # Initialize Kokoro model from local files
            base_dir = os.path.dirname(os.path.dirname(__file__))
            self.model_dir = os.path.join(base_dir, "llm_models", "kokoro")
            
            config_path = os.path.join(self.model_dir, "config.json")
            model_path = os.path.join(self.model_dir, "kokoro-v1_0.pth")
            
            if not os.path.exists(config_path) or not os.path.exists(model_path):
                logger.error(f"Kokoro model files not found in {self.model_dir}")
                # Fallback to remote if local files are missing, but log a warning
                self.pipeline = KPipeline(repo_id='hexgrad/Kokoro-82M', lang_code='a')
            else:
                # Load KModel with explicit local paths
                model = KModel(repo_id='hexgrad/Kokoro-82M', config=config_path, model=model_path)
                model.to(self.device).eval()
                
                # Initialize pipeline with the pre-loaded model
                # We use the default repo_id but we'll manually load the voice to avoid HF calls
                self.pipeline = KPipeline(lang_code='a', model=model, repo_id='hexgrad/Kokoro-82M')
                
                # Pre-load the default voice
                self._ensure_voice_loaded(self.voice)
            
            # Sample rate for Kokoro (always 24000 Hz)
            self.sample_rate = 24000
            
            logger.info(f"Kokoro-82M loaded successfully with voice: {self.voice}")
            self.model = True  # Flag to indicate successful initialization

        except Exception as e:
            logger.error(f"Failed to load Kokoro-82M model or dependencies: {e}")
            logger.error("Please install kokoro: pip install kokoro")
            logger.error("Also install espeak-ng system package")
            self.model = None  # Ensure model is None if setup fails

    def _ensure_voice_loaded(self, voice: str):
        """Helper to load a voice from local files if not already in cache."""
        if not self.pipeline or voice in self.pipeline.voices:
            return
        
        voice_path = os.path.join(self.model_dir, "voices", f"{voice}.pt")
        if os.path.exists(voice_path):
            try:
                logger.info(f"Loading voice {voice} from {voice_path}")
                self.pipeline.voices[voice] = torch.load(voice_path, weights_only=True)
            except Exception as e:
                logger.error(f"Failed to load voice {voice} from {voice_path}: {e}")
        else:
            logger.warning(f"Voice file {voice_path} not found. Library may attempt to download it.")

    async def text_to_audio(self, text: str) -> bytes | None:
        """Converts text to WAV audio bytes in memory using Kokoro-82M."""
        if not self.model or not text.strip():
            return None
        
        try:
            # The model inference is synchronous, so we run it in a thread
            audio_waveform = await asyncio.to_thread(
                self._generate_speech, text, self.voice
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

    async def text_to_audio_with_voice(self, text: str, voice: str) -> bytes | None:
        """Converts text to WAV audio bytes in memory using a specific voice."""
        if not self.model or not text.strip():
            return None
        
        try:
            audio_waveform = await asyncio.to_thread(
                self._generate_speech, text, voice
            )
            wav_buffer = io.BytesIO()
            write_wav(wav_buffer, self.sample_rate, audio_waveform)
            wav_buffer.seek(0)
            return wav_buffer.read()

        except Exception as e:
            logger.error(f"Error generating audio with voice {voice}: {e}")
            return None


    def _generate_speech(self, text: str, voice: str):
        """Synchronous helper function for speech generation using Kokoro-82M."""
        # Ensure the requested voice is loaded locally
        self._ensure_voice_loaded(voice)
        
        # Generate audio using Kokoro pipeline
        # The pipeline returns a generator that yields (graphemes, phonemes, audio) tuples
        generator = self.pipeline(
            text, 
            voice=voice,
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
