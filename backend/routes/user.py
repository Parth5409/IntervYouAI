'''
User profile and dashboard routes
'''

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models.pydantic_models import APIResponse, UserUpdate, UserProfile
from utils.database import get_db, update_user, get_user_sessions
from utils.auth import get_current_user
from orchestrator.rag_utils import DocumentProcessor

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=APIResponse)
async def get_current_user_from_cookie(
    current_user = Depends(get_current_user)
):
    '''Get current user from cookie'''
    return APIResponse(
        success=True,
        message="User retrieved successfully",
        data=UserProfile.from_orm(current_user)
    )

@router.get("/dashboard")
async def get_dashboard(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    '''Get user dashboard data'''
    try:
        sessions = get_user_sessions(db, current_user.id, limit=10)
        
        total_sessions = len(sessions)
        completed_sessions = [s for s in sessions if s.status == "completed"]
        average_score = 0
        if completed_sessions:
            scores = [s.feedback.get("overall_score", 0) for s in completed_sessions if s.feedback]
            average_score = sum(scores) / len(scores) if scores else 0
        
        interview_history = []
        for session in sessions:
            history_item = {
                "id": session.id,
                "type": session.session_type,
                "role": session.context.get("job_role", "General") if session.context else "General",
                "company": session.context.get("company_name", "Practice") if session.context else "Practice",
                "date": session.created_at.isoformat(),
                "duration": f'{session.duration_minutes} min',
                "score": session.feedback.get("overall_score", 0) if session.feedback else 0,
                "feedback": session.feedback.get("detailed_feedback", "No feedback available") if session.feedback else "No feedback available"
            }
            interview_history.append(history_item)
        
        dashboard_data = {
            "user": {
                "id": current_user.id,
                "name": current_user.full_name,
                "email": current_user.email,
                "careerGoal": current_user.career_goal,
                "phone": current_user.phone,
                "profileImage": current_user.profile_image_url if current_user.profile_image_url else None,
                "resume": {
                    "name": current_user.resume_filename,
                    "url": current_user.resume_url,
                    "uploadDate": current_user.updated_at.isoformat()
                } if current_user.resume_url else None,
                "stats": {
                    "totalSessions": total_sessions,
                    "averageScore": round(average_score, 1),
                    "practiceTime": f'{sum(s.duration_minutes for s in sessions)}min',
                    "currentStreak": 1
                }
            },
            "interviewHistory": interview_history
        }
        
        return APIResponse(
            success=True,
            message="Dashboard data retrieved",
            data=dashboard_data
        )
        
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load dashboard"
        )

@router.put("/profile")
async def update_profile(
    update_data: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    '''Update user profile'''
    try:
        update_dict = update_data.dict(exclude_unset=True)

        if update_dict.get('resume_url') and update_dict.get('resume_url') != current_user.resume_url:
            try:
                doc_processor = DocumentProcessor()
                await doc_processor.process_pdf_resume(update_dict['resume_url'])
                logger.info(f"Processed new resume for user {current_user.id}")
            except Exception as e:
                logger.warning(f"Resume processing for RAG failed: {e}")

        if update_dict:
            updated_user = update_user(db, current_user.id, update_dict)
            return APIResponse(
                success=True,
                message="Profile updated successfully",
                data=UserProfile.from_orm(updated_user)
            )
        else:
            return APIResponse(
                success=True,
                message="No changes made",
                data=UserProfile.from_orm(current_user)
            )
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )
