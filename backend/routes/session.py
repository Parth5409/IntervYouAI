"""
Interview Session routes (Async Version)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.pydantic_models import InterviewSessionCreate, InterviewSessionResponse, APIResponse
from utils.database import get_db, InterviewSession, User, get_session_by_id
from utils.auth import get_current_user
from orchestrator.rag_utils import DocumentProcessor, get_vector_store_manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=APIResponse)
async def create_session(
    session_data: InterviewSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        context = {
            "company_name": session_data.company_name,
            "job_role": session_data.job_role,
            "experience_level": session_data.experience_level,
            "topics": session_data.topics or [],
            "duration_minutes": session_data.duration_minutes,
            "difficulty": session_data.difficulty.value
        }

        if current_user.resume_url and current_user.resume_vs_id:
            context["resume_info"] = {"status": "processed", "vector_store_id": current_user.resume_vs_id}
        
        new_session = InterviewSession(
            user_id=current_user.id,
            session_type=session_data.session_type.value,
            difficulty=session_data.difficulty.value,
            context=context
        )
        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)

        if new_session.session_type == "TECHNICAL" and new_session.context.get("company_name"):
            company_name = new_session.context["company_name"]
            try:
                doc_processor = DocumentProcessor()
                csv_path = f'uploads/company_csv/{company_name}.csv'
                processed_csv = await doc_processor.process_company_csv(csv_path)
                
                new_session.context["topics"] = processed_csv["topics"]
                vector_store_manager = get_vector_store_manager()
                store_name = f"company_{company_name}_{new_session.id}"
                await vector_store_manager.create_vector_store(documents=processed_csv["chunks"], store_name=store_name)
                new_session.context["company_vs_id"] = store_name
                await db.commit()
                await db.refresh(new_session)
            except Exception as e:
                logger.error(f"Error processing company CSV for {company_name}: {e}")

        return APIResponse(
            success=True,
            message="Session created successfully",
            data=InterviewSessionResponse.from_orm(new_session)
        )
    except Exception as e:
        logger.error(f"Session creation error: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Session creation failed")

@router.get("/{session_id}", response_model=APIResponse)
async def get_session_details(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = await get_session_by_id(db, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return APIResponse(success=True, message="Session details retrieved", data=InterviewSessionResponse.from_orm(session))

@router.get("/history", response_model=APIResponse)
async def get_session_history(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc()).limit(20)
    )
    sessions = result.scalars().all()
    return APIResponse(success=True, message="Session history retrieved", data=[InterviewSessionResponse.from_orm(s) for s in sessions])
