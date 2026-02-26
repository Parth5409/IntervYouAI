"""
Interview Session routes (Async Version)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.pydantic_models import (InterviewSessionCreate, 
                                  MissionSessionCreate,
                                  TechnicalInterviewCreate, 
                                  HRInterviewCreate, 
                                  SalaryNegotiationCreate, 
                                  GroupDiscussionCreate,
                                  InterviewSessionResponse, 
                                  APIResponse, SessionType)
from utils.database import get_db, InterviewSession, User, get_session_by_id, get_user_by_id
from utils.auth import get_current_user
from orchestrator.rag_utils import DocumentProcessor, get_vector_store_manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/mission", response_model=APIResponse)
async def create_mission_session(
    mission_request: MissionSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        from utils.database import get_user_by_id
        user_record = await get_user_by_id(db, current_user.id)
        
        context = mission_request.dict()
        if user_record and hasattr(user_record, 'resume_url') and user_record.resume_url:
            context["resume_info"] = {"status": "linked", "url": user_record.resume_url}
        
        new_session = InterviewSession(
            student_id=current_user.id,
            session_type=mission_request.round_type,
            difficulty=mission_request.difficulty.value,
            context=context
        )
        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)

        return APIResponse(
            success=True,
            message=f"Mission session ({mission_request.round_type}) created successfully",
            data=InterviewSessionResponse.from_orm(new_session)
        )
    except Exception as e:
        logger.error(f"Mission session creation error: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Mission session creation failed: {str(e)}")

@router.post("/", response_model=APIResponse)
async def create_session(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    raw_data = await request.json()
    session_type = raw_data.get('session_type')

    model_map = {
        SessionType.TECHNICAL: TechnicalInterviewCreate,
        SessionType.HR: HRInterviewCreate,
        SessionType.SALARY: SalaryNegotiationCreate,
        SessionType.GD: GroupDiscussionCreate,
    }

    model = model_map.get(session_type)
    if not model:
        raise HTTPException(status_code=400, detail=f"Invalid session type: {session_type}")

    try:
        session_data = model(**raw_data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        # Fetch full user details from DB to get resume info
        db_user = await get_session_by_id(db, current_user.id) # Wait, get_session_by_id is for InterviewSession
        # I need get_user_by_id
        from utils.database import get_user_by_id
        user_record = await get_user_by_id(db, current_user.id)
        
        context = session_data.dict()

        if user_record and hasattr(user_record, 'resume_url') and user_record.resume_url:
            # Check if vector store exists (placeholder logic)
            context["resume_info"] = {"status": "linked", "url": user_record.resume_url}
        
        new_session = InterviewSession(
            student_id=current_user.id,
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
        .where(InterviewSession.student_id == current_user.id)
        .order_by(InterviewSession.created_at.desc()).limit(20)
    )
    sessions = result.scalars().all()
    return APIResponse(success=True, message="Session history retrieved", data=[InterviewSessionResponse.from_orm(s) for s in sessions])
