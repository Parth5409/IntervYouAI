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
        from kokoro import KPipeline
        print("Loading Kokoro TTS model 'Kokoro-82M' via KPipeline...")
        KPipeline(repo_id='hexgrad/Kokoro-82M', lang_code='a')
        print("Kokoro TTS via KPipeline loaded successfully.")
    except Exception as e:
        print("Kokoro preload skipped:", e, file=sys.stderr)

if __name__ == "__main__":
    preload_faster_whisper()
    preload_kokoro_tts()
