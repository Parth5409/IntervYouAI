import asyncio
import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional
import socketio
import uuid

from orchestrator.interview import InterviewOrchestrator
from orchestrator.gd_orchestrator import GDOrchestrator
from models.pydantic_models import SessionType, UserMessage, APIResponse
from utils.auth import verify_socket_token
from utils.database import get_db, update_session, get_session_by_id, create_interview_session as db_create_session

logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

interview_orchestrator = InterviewOrchestrator()
gd_orchestrator = GDOrchestrator()

active_connections: Dict[str, Dict[str, Any]] = {}

def create_socket_app():
    return sio

@sio.event
async def connect(sid, environ, auth):
    try:
        logger.info(f"Client connecting: {sid}")
        user_id = None
        if auth and "token" in auth:
            try:
                user_data = verify_socket_token(auth["token"])
                user_id = user_data.get("user_id")
                logger.info(f"Authenticated user {user_id} connected: {sid}")
            except Exception as e:
                logger.warning(f"Authentication failed for {sid}: {e}")
                return False
        
        active_connections[sid] = {
            "user_id": user_id,
            "connected_at": datetime.now(),
            "session_id": None
        }
        
        await sio.emit("connection_established", {
            "status": "connected",
            "message": "Connected to Interview Platform",
            "authenticated": user_id is not None
        }, room=sid)
        
        return True
        
    except Exception as e:
        logger.error(f"Error in connect handler: {e}")
        return False

@sio.event
async def disconnect(sid):
    try:
        logger.info(f"Client disconnecting: {sid}")
        if sid in active_connections:
            connection_info = active_connections[sid]
            if connection_info.get("session_id"):
                try:
                    session_id = connection_info["session_id"]
                    if gd_orchestrator.get_session_status(session_id):
                        result = await gd_orchestrator.end_session(session_id)
                        gd_orchestrator.cleanup_session(session_id)
                    else:
                        result = await interview_orchestrator.end_session(session_id)
                    logger.info(f"Auto-ended session {session_id} on disconnect")
                except Exception as e:
                    logger.error(f"Error ending session on disconnect: {e}")
            del active_connections[sid]
        logger.info(f"Client disconnected: {sid}")
    except Exception as e:
        logger.error(f"Error in disconnect handler: {e}")

@sio.event
async def start_interview(sid, data):
    try:
        logger.info(f"Starting interview for {sid}: {data}")
        if sid not in active_connections:
            await sio.emit("error", {"message": "Not connected"}, room=sid)
            return
        
        connection_info = active_connections[sid]
        session_id = data.get("session_id")
        if not session_id:
            await sio.emit("error", {"message": "No session ID provided"}, room=sid)
            return

        db = next(get_db())
        session = get_session_by_id(db, session_id)
        if not session or session.user_id != connection_info['user_id']:
            await sio.emit("error", {"message": "Session not found or not authorized"}, room=sid)
            return

        connection_info["session_id"] = session_id

        if session.session_type == SessionType.TECHNICAL.value:
            result = await interview_orchestrator.start_session(session_id, session.context)
            message_type = "greeting"
        elif session.session_type == SessionType.GD.value:
            result = await gd_orchestrator.start_session(session_id)
            message_type = "gd_greeting"
        else:
            result = await interview_orchestrator.start_session(session_id, session.context)
            message_type = "greeting"

        await sio.emit("ai_speech", {
            "message": result["message"],
            "session_id": session_id,
            "message_type": message_type
        }, room=sid)
        
        await sio.emit("session_started", {
            "session_id": session_id,
            "status": "active",
            "message": "Interview session started"
        }, room=sid)
        
        logger.info(f"Started session {session_id}")
        
    except Exception as e:
        logger.error(f"Error starting interview: {e}")
        await sio.emit("error", {
            "message": "Failed to start interview",
            "error": str(e)
        }, room=sid)

@sio.event
async def send_message(sid, data):
    try:
        logger.info(f"Received message from {sid}: {data}")
        if sid not in active_connections:
            await sio.emit("error", {"message": "Not connected"}, room=sid)
            return
        
        connection_info = active_connections[sid]
        session_id = data.get("session_id")
        user_message = data.get("message", "").strip()
        
        if not session_id:
            await sio.emit("error", {"message": "No active session"}, room=sid)
            return
        
        if not user_message:
            await sio.emit("error", {"message": "Empty message"}, room=sid)
            return

        db = next(get_db())
        session = get_session_by_id(db, session_id)

        if session.session_type == SessionType.GD.value:
            response_data = await gd_orchestrator.process_user_input(
                session_id=session_id,
                user_message=user_message
            )
            bot_response = response_data["bot_response"]
            await sio.emit("ai_speech", {
                "message": bot_response["message"],
                "session_id": session_id,
                "message_type": "gd_response",
                "speaker": bot_response["speaker_name"]
            }, room=sid)
            if not response_data["should_end"] and response_data.get("next_speaker"):
                await sio.emit("gd_turn_update", {
                    "next_speaker": response_data["next_speaker"],
                    "turn_number": response_data["turn_number"]
                }, room=sid)
        else:
            response_data = await interview_orchestrator.process_user_message(
                session_id=session_id,
                user_message=user_message
            )
            await sio.emit("ai_speech", {
                "message": response_data["message"],
                "session_id": session_id,
                "message_type": response_data.get("message_type", "response")
            }, room=sid)
        
        if response_data.get("should_end"):
            await asyncio.sleep(2)
            await end_interview_session(sid, {"session_id": session_id})
        
        logger.debug(f"Processed message for session {session_id}")
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        await sio.emit("error", {
            "message": "Failed to process message",
            "error": str(e)
        }, room=sid)

@sio.event
async def end_interview_session(sid, data):
    try:
        logger.info(f"Ending interview session for {sid}: {data}")
        if sid not in active_connections:
            await sio.emit("error", {"message": "Not connected"}, room=sid)
            return
        
        connection_info = active_connections[sid]
        session_id = data.get("session_id")
        
        if not session_id:
            await sio.emit("error", {"message": "No active session"}, room=sid)
            return

        db = next(get_db())
        session = get_session_by_id(db, session_id)
        
        if session.session_type == SessionType.GD.value:
            result = await gd_orchestrator.end_session(session_id)
            gd_orchestrator.cleanup_session(session_id)
        else:
            result = await interview_orchestrator.end_session(session_id)
        
        update_session(db, session_id, {
            "status": "completed",
            "ended_at": datetime.now(),
            "feedback": result["feedback"],
            "duration_minutes": result["duration_minutes"],
            "question_count": result.get("question_count", 0)
        })

        connection_info["session_id"] = None
        
        await sio.emit("session_ended", {
            "session_id": session_id,
            "duration_minutes": result["duration_minutes"],
            "question_count": result.get("question_count", 0),
            "feedback": result["feedback"],
            "feedbackId": session_id,
            "message": "Interview session completed successfully"
        }, room=sid)
        
        logger.info(f"Ended session {session_id}")
        
    except Exception as e:
        logger.error(f"Error ending interview session: {e}")
        await sio.emit("error", {
            "message": "Failed to end interview session",
            "error": str(e)
        }, room=sid)