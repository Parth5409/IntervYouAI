"""
Data routes for companies, topics, etc.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from models.pydantic_models import APIResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# Predefined data (in production, these would come from database)
COMPANIES = [
    {"value": "google", "label": "Google"},
    {"value": "microsoft", "label": "Microsoft"},
    {"value": "amazon", "label": "Amazon"},
    {"value": "apple", "label": "Apple"},
    {"value": "meta", "label": "Meta"},
    {"value": "netflix", "label": "Netflix"},
    {"value": "uber", "label": "Uber"},
    {"value": "airbnb", "label": "Airbnb"},
    {"value": "spotify", "label": "Spotify"},
    {"value": "tesla", "label": "Tesla"}
]

GD_TOPICS = [
    {"value": "ai-job-displacement", "label": "AI and Job Displacement"},
    {"value": "remote-work-future", "label": "The Future of Remote Work"},
    {"value": "climate-change-tech", "label": "Technology's Role in Climate Change"},
    {"value": "social-media-impact", "label": "Social Media's Impact on Society"},
    {"value": "data-privacy-rights", "label": "Data Privacy and Digital Rights"},
    {"value": "automation-economy", "label": "Automation and the Economy"},
    {"value": "education-technology", "label": "Technology in Education"},
    {"value": "healthcare-digitization", "label": "Healthcare Digitization"},
    {"value": "sustainable-development", "label": "Sustainable Development Goals"},
    {"value": "cryptocurrency-future", "label": "Cryptocurrency and Financial Future"}
]

@router.get("/setup/companies")
async def get_companies():
    """Get list of companies for interview setup"""
    return APIResponse(
        success=True,
        message="Companies retrieved successfully",
        data=COMPANIES
    )

@router.get("/setup/topics")
async def get_gd_topics():
    """Get list of Group Discussion topics"""
    return APIResponse(
        success=True,
        message="GD topics retrieved successfully",
        data=GD_TOPICS
    )

@router.post("/interview/start")
async def start_interview_session(session_config: dict):
    """Start a new interview session"""
    try:
        # This will be handled by the InterviewOrchestrator
        # For now, return a mock session ID
        import uuid
        session_id = str(uuid.uuid4())
        
        return APIResponse(
            success=True,
            message="Session created successfully",
            data={"sessionId": session_id}
        )
        
    except Exception as e:
        logger.error(f"Error starting interview session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start interview session"
        )
