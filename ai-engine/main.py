"""
FastAPI main application entry point for Interview Platform
Production-ready backend with LangChain integration
"""

import os
import logging
import time

# IMPORTANT: Set this environment variable BEFORE any other imports
# This is a workaround for a common issue with multiple OpenMP libraries clashing
os.environ['KMP_DUPLICATE_LIB_OK']='True'

from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables at the very beginning
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from socket_app.session import sio
import socketio

from routes import data, session, analysis
from utils.database import init_db
from llm.embeddings import initialize_embeddings
from tts.tts_service import tts_service
from services.kafka_consumer import KafkaConsumerService
from utils.kafka_producer import kafka_producer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

kafka_consumer = KafkaConsumerService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting Interview Platform API...")
    
    # Initialize database
    await init_db()
    
    # Initialize embeddings
    try:
        initialize_embeddings()
        logger.info("Embeddings initialized successfully")
    except Exception as e:
        logger.warning(f"Embeddings initialization failed: {e}")
    
    # Initialize Kafka
    try:
        await kafka_producer.start()
        await kafka_consumer.start()
    except Exception as e:
        logger.error(f"Failed to start Kafka services: {e}")

    # Verify environment variables
    required_env = ['GOOGLE_API_KEY', 'SECRET_KEY']
    missing_env = [var for var in required_env if not os.getenv(var)]
    if missing_env:
        logger.warning(f"Missing environment variables: {missing_env}")
    
    logger.info("Application startup complete")
    yield
    logger.info("Shutting down Interview Platform API...")
    await kafka_producer.stop()
    await kafka_consumer.stop()

# Create FastAPI app
fastapi_app = FastAPI(
    title="Interview Platform API",
    description="AI-powered interview platform with LangChain integration",
    version="1.0.0",
    lifespan=lifespan
)

@fastapi_app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    formatted_process_time = "{0:.2f}".format(process_time)
    logger.info(f"Request: {request.method} {request.url.path} - Status: {response.status_code} - Time: {formatted_process_time}ms")
    return response

# CORS middleware
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:4028").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
fastapi_app.include_router(data.router, prefix="/api/engine", tags=["Data"])
fastapi_app.include_router(session.router, prefix="/api/engine/session", tags=["Session"])
fastapi_app.include_router(analysis.router, prefix="/api/engine/analysis", tags=["Analysis"])

# Create the combined ASGI app
# This ensures uvicorn serves BOTH Socket.IO and FastAPI
# Mount Socket.IO under /api/engine prefix
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="/api/engine/socket.io")

# Static files
os.makedirs("uploads", exist_ok=True)
fastapi_app.mount("/api/engine/uploads", StaticFiles(directory="uploads"), name="uploads")

@fastapi_app.get("/api/engine/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Interview Platform API is running",
        "version": "1.0.0", 
        "status": "healthy"
    }

@fastapi_app.get("/api/engine/health")
async def health_check():
    """Detailed health check"""
    try:
        google_api_key = bool(os.getenv("GOOGLE_API_KEY"))
        ollama_url = bool(os.getenv("OLLAMA_BASE_URL"))
        
        return {
            "status": "healthy",
            "services": {
                "google_genai": google_api_key,
                "ollama": ollama_url,
                "database": True
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@fastapi_app.get("/api/engine/ping")
async def ping():
    return {"message": "pong"}

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENVIRONMENT") == "development" else False,
        log_level="info"
    )
