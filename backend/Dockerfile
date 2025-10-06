# Use Python 3.12 slim image
FROM python:3.12.11-slim-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy full source code
COPY . .

# Preload heavy models (Faster-Whisper, Kokoro)
RUN python preload_models.py || echo "Model preload skipped"

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI app
CMD ["uvicorn", "main:application", "--host", "0.0.0.0", "--port", "8000"]
