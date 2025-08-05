import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models.pydantic_models import (
    InterviewSessionCreate, 
    InterviewSessionResponse, 
    GDSessionData, 
    APIResponse
)
from utils.database import get_db, create_interview_session, get_user_sessions
from utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=APIResponse)
def create_session(
    session_data: InterviewSessionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new interview or GD session"""
    try:
        session_dict = session_data.dict()
        session_dict["user_id"] = current_user.id
        
        if session_data.session_type == "GD":
            gd_data = GDSessionData(**session_dict.pop('context', {}))
            session_dict["context"] = gd_data.dict()

        session = create_interview_session(db, session_dict)
        return APIResponse(
            success=True,
            message="Session created successfully",
            data=InterviewSessionResponse.from_orm(session)
        )
    except Exception as e:
        logger.error(f"Session creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Session creation failed"
        )

@router.get("/history", response_model=APIResponse)
def get_session_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get user's session history"""
    try:
        sessions = get_user_sessions(db, current_user.id)
        return APIResponse(
            success=True,
            message="Session history retrieved",
            data=[InterviewSessionResponse.from_orm(s) for s in sessions]
        )
    except Exception as e:
        logger.error(f"Session history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve session history"
        )