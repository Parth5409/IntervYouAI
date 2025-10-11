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
    && pip install --no-cache-dir -r requirements.txt \
    && python -m spacy download en_core_web_sm

# Create a non-root user (UID 1000, GID 1000)
RUN groupadd -r appgroup -g 1000 && \
    useradd -r -g appgroup -u 1000 -d /home/appuser -s /sbin/nologin -c "Docker image user" appuser

# Copy full source code
COPY . .

# Create cache directories and set ownership
RUN mkdir -p /app/.cache/huggingface /app/.cache/kokoro && \
    chown -R appuser:appgroup /app

# Set environment variables for cache directories
ENV HF_HOME=/app/.cache/huggingface
ENV HF_DATASETS_CACHE=/app/.cache/huggingface
ENV HUGGINGFACE_HUB_CACHE=/app/.cache/huggingface
ENV HOME=/app

# Switch to the non-root user
USER appuser

# Preload heavy models to be included in the image
RUN python preload_models.py

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI app with Gunicorn
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "main:application", "--host", "0.0.0.0", "--port", "8000"]
