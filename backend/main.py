"""
FastAPI main application entry point for Interview Platform
Production-ready backend with LangChain integration
"""

import os
import logging

# IMPORTANT: Set this environment variable BEFORE any other imports
# This is a workaround for a common issue with multiple OpenMP libraries clashing
os.environ['KMP_DUPLICATE_LIB_OK']='True'

from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables at the very beginning
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from socket_app.session import sio
import socketio

from routes import auth, user, data, session, interview, stt
from utils.database import init_db
from llm.embeddings import initialize_embeddings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
    
    # Verify environment variables
    required_env = ['GOOGLE_API_KEY', 'SECRET_KEY']
    missing_env = [var for var in required_env if not os.getenv(var)]
    if missing_env:
        logger.warning(f"Missing environment variables: {missing_env}")
    
    logger.info("Application startup complete")
    yield
    logger.info("Shutting down Interview Platform API...")

# Create FastAPI app
app = FastAPI(
    title="Interview Platform API",
    description="AI-powered interview platform with LangChain integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:4028").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/user", tags=["User"])  
app.include_router(data.router, prefix="/api", tags=["Data"])
app.include_router(session.router, prefix="/api/session", tags=["Session"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(stt.router, prefix="/api/stt", tags=["Speech-to-Text"])

# Create the combined ASGI app
application = socketio.ASGIApp(sio, other_asgi_app=app)

# Static files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Interview Platform API is running",
        "version": "1.0.0", 
        "status": "healthy"
    }

@app.get("/health")
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

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:application",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENVIRONMENT") == "development" else False,
        log_level="info"
    )
