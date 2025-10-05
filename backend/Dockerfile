# Use lightweight Python 3.12 base
FROM python:3.12.0-slim

# Install system dependencies (audio + ffmpeg required for STT/TTS)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency list first for better build caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Preload Faster-Whisper model
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('distil-large-v3')"

# Preload Kokoro TTS model (with a safe fallback)
RUN python -c "try: \
    from kokoro import Kokoro; \
    Kokoro('Kokoro-82M'); \
except Exception as e: \
    print('Kokoro preload skipped:', e)"

# Expose FastAPI app port
EXPOSE 8000

# Start FastAPI app using Uvicorn
CMD ["uvicorn", "main:application", "--host", "0.0.0.0", "--port", "8000"]
