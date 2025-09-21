"""
Interview flow routes (Async Version)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified
from datetime import datetime

from models.pydantic_models import UserMessage, APIResponse, EndSessionPayload
from utils.database import get_db, get_session_by_id, User
from utils.auth import get_current_user
from orchestrator.interview import InterviewOrchestrator

logger = logging.getLogger(__name__)
router = APIRouter()
orchestrator = InterviewOrchestrator()

@router.post("/{session_id}/start", response_model=APIResponse)
async def start_interview(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = await get_session_by_id(db, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.status != "created":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session has already started.")

    try:
        first_message, updated_transcript, updated_context = await orchestrator.start_session(session)
        
        session.status = "active"
        session.started_at = datetime.now()
        session.transcript = updated_transcript
        session.context = updated_context
        
        db.add(session)
        await db.commit()

        return APIResponse(success=True, message="Interview started.", data={"message": first_message})
    except Exception as e:
        logger.error(f"Error starting interview {session_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to start interview")

@router.post("/{session_id}/message", response_model=APIResponse)
async def post_message(
    session_id: str,
    user_message: UserMessage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = await get_session_by_id(db, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if session.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session is not active.")

    try:
        ai_response, updated_transcript, updated_context = await orchestrator.process_user_message(session, user_message.message)
        
        session.transcript = updated_transcript
        session.context = updated_context

        # Flag the JSON fields as modified to ensure they are saved
        flag_modified(session, "transcript")
        flag_modified(session, "context")

        db.add(session)
        await db.commit()

        return APIResponse(success=True, message="AI response.", data={"message": ai_response})
    except Exception as e:
        logger.error(f"Error processing message for session {session_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process message")

@router.post("/{session_id}/end", response_model=APIResponse)
async def end_interview(
    session_id: str,
    payload: EndSessionPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = await get_session_by_id(db, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    try:
        # Overwrite the transcript with the final version from the frontend
        session.transcript = payload.transcript

        feedback = await orchestrator.end_session(session)
        
        session.status = "completed"
        session.ended_at = datetime.now()
        session.feedback = feedback

        # Flag the transcript as modified to ensure it saves
        flag_modified(session, "transcript")
        flag_modified(session, "feedback")

        db.add(session)
        await db.commit()

        return APIResponse(success=True, message="Interview ended. Feedback generated.", data={"feedback": feedback})
    except Exception as e:
        logger.error(f"Error ending interview {session_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to end interview")
