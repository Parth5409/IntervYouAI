"""
Group Discussion flow routes (Async Version)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from models.pydantic_models import UserMessage, APIResponse
from utils.database import get_db, get_session_by_id, User
from utils.auth import get_current_user
from orchestrator.gd_orchestrator import GDOrchestrator

logger = logging.getLogger(__name__)
router = APIRouter()
gd_orchestrator = GDOrchestrator()

@router.post("/{session_id}/start", response_model=APIResponse)
async def start_gd_session(session_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = await get_session_by_id(db, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    try:
        if not session.context.get("participants"):
            session.context = gd_orchestrator.initialize_session_context(session.context)
        
        opening_message, updated_transcript = await gd_orchestrator.start_session(session)
        
        session.context["messages"] = updated_transcript
        session.status = "active"
        session.started_at = datetime.now()
        
        db.add(session)
        await db.commit()

        return APIResponse(
            success=True, 
            message="GD Session started.",
            data={
                "participants": session.context["participants"],
                "opening_message": opening_message
            }
        )
    except Exception as e:
        logger.error(f"Error starting GD session {session_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to start GD session")

@router.post("/{session_id}/message", response_model=APIResponse)
async def post_gd_message(session_id: str, user_message: UserMessage, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = await get_session_by_id(db, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    try:
        bot_responses, updated_transcript = await gd_orchestrator.process_user_input(session, user_message.message)
        
        session.context["messages"] = updated_transcript
        db.add(session)
        await db.commit()

        return APIResponse(success=True, message="Message processed.", data={"bot_responses": bot_responses})
    except Exception as e:
        logger.error(f"Error processing GD message for session {session_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process GD message")

@router.post("/{session_id}/end", response_model=APIResponse)
async def end_gd_session(session_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = await get_session_by_id(db, session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    try:
        feedback = await gd_orchestrator.end_session(session)
        
        session.status = "completed"
        session.ended_at = datetime.now()
        session.feedback = feedback

        db.add(session)
        await db.commit()
        return APIResponse(success=True, message="GD Session ended.", data={"feedback": feedback})
    except Exception as e:
        logger.error(f"Error ending GD session {session_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to end GD session")
