import sys

def preload_faster_whisper():
    try:
        from faster_whisper import WhisperModel
        print("Loading Faster-Whisper model 'distil-large-v3'...")
        WhisperModel('distil-large-v3')
        print("Faster-Whisper loaded successfully.")
    except Exception as e:
        print("Failed to preload Faster-Whisper:", e, file=sys.stderr)

def preload_kokoro_tts():
    try:
        from kokoro import Kokoro
        print("Loading Kokoro TTS model 'Kokoro-82M'...")
        Kokoro('Kokoro-82M')
        print("Kokoro TTS loaded successfully.")
    except Exception as e:
        print("Kokoro preload skipped:", e, file=sys.stderr)

if __name__ == "__main__":
    preload_faster_whisper()
    preload_kokoro_tts()
