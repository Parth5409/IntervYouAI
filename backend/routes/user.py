"""
User profile and dashboard routes
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from models.pydantic_models import APIResponse, UserUpdate, UserProfile
from utils.database import get_db, get_user_by_id, update_user, get_user_sessions
from utils.auth import get_current_user
from utils.cloudinary import upload_file
from orchestrator.rag_utils import DocumentProcessor

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.get("/me", response_model=APIResponse)
async def get_current_user_from_cookie(
    current_user = Depends(get_current_user)
):
    """Get current user from cookie"""
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
    """Get user dashboard data"""
    try:
        sessions = get_user_sessions(db, current_user.id, limit=10)
        
        # Calculate stats
        total_sessions = len(sessions)
        completed_sessions = [s for s in sessions if s.status == "completed"]
        average_score = 0
        if completed_sessions:
            scores = [s.feedback.get("overall_score", 0) for s in completed_sessions if s.feedback]
            average_score = sum(scores) / len(scores) if scores else 0
        
        # Format interview history
        interview_history = []
        for session in sessions:
            history_item = {
                "id": session.id,
                "type": session.session_type,
                "role": session.context.get("job_role", "General") if session.context else "General",
                "company": session.context.get("company_name", "Practice") if session.context else "Practice",
                "date": session.created_at.isoformat(),
                "duration": f"{session.duration_minutes} min",
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
                    "practiceTime": f"{sum(s.duration_minutes for s in sessions)}min",
                    "currentStreak": 1  # Placeholder
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
    full_name: Optional[str] = Form(None),
    career_goal: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        update_data = {}
        
        if full_name is not None:
            update_data["full_name"] = full_name
        if career_goal is not None:
            update_data["career_goal"] = career_goal
        if phone is not None:
            update_data["phone"] = phone
        
        # Handle file uploads
        if profile_image:
            upload_result = await upload_file(profile_image.file, "profile_images")
            update_data["profile_image_url"] = upload_result["secure_url"]
        
        if resume:
            upload_result = await upload_file(resume.file, "resumes")
            update_data["resume_url"] = upload_result["secure_url"]
            update_data["resume_filename"] = resume.filename
            
            # Process resume for RAG
            try:
                doc_processor = DocumentProcessor()
                resume_data = await doc_processor.process_pdf_resume(upload_result["secure_url"])
                logger.info(f"Processed resume for user {current_user.id}")
            except Exception as e:
                logger.warning(f"Resume processing failed: {e}")
        
        # Update user
        if update_data:
            updated_user = update_user(db, current_user.id, update_data)
            
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
