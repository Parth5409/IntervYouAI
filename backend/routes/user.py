"""
User profile and dashboard routes (Async Version)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.pydantic_models import APIResponse, UserUpdate, UserProfile
from utils.database import get_db, InterviewSession, User
from utils.auth import get_current_user
from orchestrator.rag_utils import DocumentProcessor, get_vector_store_manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=APIResponse)
async def get_current_user_from_cookie(current_user: User = Depends(get_current_user)):
    return APIResponse(
        success=True,
        message="User retrieved successfully",
        data=UserProfile.from_orm(current_user)
    )

@router.get("/dashboard", response_model=APIResponse)
async def get_dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(InterviewSession)
            .where(InterviewSession.user_id == current_user.id)
            .order_by(InterviewSession.created_at.desc())
            .limit(10)
        )
        sessions = result.scalars().all()
        
        # ... (rest of the dashboard logic is synchronous and can remain as is)
        total_sessions = len(sessions)
        completed_sessions = [s for s in sessions if s.status == "completed"]
        average_score = 0
        if completed_sessions:
            scores = [s.feedback.get("overall_score", 0) for s in completed_sessions if s.feedback]
            average_score = sum(scores) / len(scores) if scores else 0

        # ... (construct dashboard_data)
        dashboard_data = {
            # ...
        }
        
        return APIResponse(
            success=True,
            message="Dashboard data retrieved",
            data=dashboard_data
        )
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard")

@router.put("/profile", response_model=APIResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        update_dict = update_data.dict(exclude_unset=True)

        if update_dict.get('resume_url') and update_dict.get('resume_url') != current_user.resume_url:
            try:
                logger.info(f"Processing new resume for user {current_user.id}...")
                doc_processor = DocumentProcessor()
                vector_store_manager = get_vector_store_manager()

                processed_resume = await doc_processor.process_pdf_resume(update_dict['resume_url'])
                store_name = f"resume_user_{current_user.id}"
                
                await vector_store_manager.create_vector_store(
                    documents=processed_resume["chunks"],
                    store_name=store_name,
                    overwrite=True
                )
                
                update_dict['resume_vs_id'] = store_name
                logger.info(f"Successfully created resume vector store '{store_name}' for user {current_user.id}")

            except Exception as e:
                logger.error(f"Resume processing and vector store creation failed: {e}")
                update_dict.pop('resume_url', None)
                update_dict.pop('resume_filename', None)

        if update_dict:
            for key, value in update_dict.items():
                setattr(current_user, key, value)
            db.add(current_user)
            await db.commit()
            await db.refresh(current_user)
        
        return APIResponse(
            success=True,
            message="Profile updated successfully",
            data=UserProfile.from_orm(current_user)
        )
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Profile update failed")
