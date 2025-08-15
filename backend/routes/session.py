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
from utils.database import get_db, create_interview_session, get_user_sessions, get_session_by_id
from utils.auth import get_current_user
from orchestrator.rag_utils import DocumentProcessor, get_vector_store_manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=APIResponse)
async def create_session(
    session_data: InterviewSessionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new interview or GD session"""
    try:
        context = {
            "company_name": session_data.company_name,
            "job_role": session_data.job_role,
            "experience_level": session_data.experience_level,
            "topics": session_data.topics or [],
            "duration_minutes": session_data.duration_minutes
        }

        if current_user.resume_url:
            try:
                doc_processor = DocumentProcessor()
                processed_resume = await doc_processor.process_pdf_resume(current_user.resume_url)
                context["resume_info"] = processed_resume["resume_info"]
                logger.info(f"Successfully processed resume for user {current_user.id}.")
            except Exception as e:
                logger.warning(f"Could not process resume for user {current_user.id}: {e}")
                context["resume_info"] = {"error": "Resume processing failed."}

        db_session_data = {
            "user_id": current_user.id,
            "session_type": session_data.session_type.value,
            "context": context
        }

        session = create_interview_session(db, db_session_data)

        if session.session_type == "TECHNICAL" and session.context.get("company_name"):
            company_name = session.context["company_name"]
            try:
                doc_processor = DocumentProcessor()
                csv_path = f'uploads/company_csv/{company_name}.csv'
                processed_csv = await doc_processor.process_company_csv(csv_path)
                
                session.context["topics"] = processed_csv["topics"]
                
                vector_store_manager = get_vector_store_manager()
                store_name = f"company_{company_name}_{session.id}"
                await vector_store_manager.create_vector_store(
                    documents=processed_csv["chunks"],
                    store_name=store_name
                )
                session.context["vector_store_name"] = store_name
                db.commit()
                db.refresh(session)

            except FileNotFoundError:
                logger.warning(f"No CSV found for company: {company_name}")
            except Exception as e:
                logger.error(f"Error processing company CSV for {company_name}: {e}")

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

@router.get("/{session_id}", response_model=APIResponse)
def get_session_details(
    session_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get details for a specific session"""
    try:
        session = get_session_by_id(db, session_id)
        if not session or session.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
        
        return APIResponse(
            success=True,
            message="Session details retrieved",
            data=InterviewSessionResponse.from_orm(session)
        )
    except Exception as e:
        logger.error(f"Error getting session details: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve session details"
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