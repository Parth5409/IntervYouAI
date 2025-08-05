"""
WebSocket session handlers for real-time interview communication
"""

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

logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

# Global orchestrators
interview_orchestrator = InterviewOrchestrator()
gd_orchestrator = GDOrchestrator()

# Active connections tracking
active_connections: Dict[str, Dict[str, Any]] = {}

def create_socket_app():
    """Create and configure Socket.IO app"""
    return sio

@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    try:
        logger.info(f"Client connecting: {sid}")
        
        # Verify authentication if provided
        user_id = None
        if auth and "token" in auth:
            try:
                user_data = verify_socket_token(auth["token"])
                user_id = user_data.get("user_id")
                logger.info(f"Authenticated user {user_id} connected: {sid}")
            except Exception as e:
                logger.warning(f"Authentication failed for {sid}: {e}")
                return False
        
        # Store connection info
        active_connections[sid] = {
            "user_id": user_id,
            "connected_at": datetime.now(),
            "session_id": None
        }
        
        # Send welcome message
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
    """Handle client disconnection"""
    try:
        logger.info(f"Client disconnecting: {sid}")
        
        if sid in active_connections:
            connection_info = active_connections[sid]
            
            # End active session if any
            if connection_info.get("session_id"):
                try:
                    session_id = connection_info["session_id"]
                    
                    # Check if it's a GD session
                    if gd_orchestrator.get_session_status(session_id):
                        result = await gd_orchestrator.end_session(session_id)
                        gd_orchestrator.cleanup_session(session_id)
                    else:
                        result = await interview_orchestrator.end_session(session_id)
                    
                    logger.info(f"Auto-ended session {session_id} on disconnect")
                except Exception as e:
                    logger.error(f"Error ending session on disconnect: {e}")
            
            # Remove connection
            del active_connections[sid]
            
        logger.info(f"Client disconnected: {sid}")
        
    except Exception as e:
        logger.error(f"Error in disconnect handler: {e}")

@sio.event
async def create_interview_session(sid, data):
    """Create a new interview session"""
    try:
        logger.info(f"Creating interview session for {sid}: {data}")
        
        # Validate connection
        if sid not in active_connections:
            await sio.emit("error", {"message": "Not connected"}, room=sid)
            return
        
        connection_info = active_connections[sid]
        
        if not connection_info.get("user_id"):
            await sio.emit("error", {"message": "Authentication required"}, room=sid)
            return
        
        # Validate request data
        required_fields = ["session_type"]
        if not all(field in data for field in required_fields):
            await sio.emit("error", {
                "message": "Missing required fields",
                "required": required_fields
            }, room=sid)
            return
        
        # Parse session type
        try:
            session_type = SessionType(data["session_type"])
        except ValueError:
            await sio.emit("error", {
                "message": "Invalid session type",
                "valid_types": [t.value for t in SessionType]
            }, room=sid)
            return
        
        # Build context
        context = {
            "company_name": data.get("company_name"),
            "job_role": data.get("job_role"),
            "experience_level": data.get("experience_level", "mid"),
            "topics": data.get("topics", []),
            "duration_minutes": data.get("duration_minutes", 30)
        }
        
        # Create session in the database
        db = next(get_db())
        db_session_data = {
            "user_id": connection_info["user_id"],
            "session_type": session_type.value,
            "context": context
        }
        db_session = db_create_session(db, db_session_data)
        session_id = db_session.id

        # Create session in the orchestrator
        if session_type == SessionType.GD:
            await gd_orchestrator.initialize_session(
                session_id=session_id,
                topic=data.get("topic", "The impact of AI on future job markets"),
                user_id=connection_info["user_id"],
                duration_minutes=context["duration_minutes"],
                num_bots=4
            )
        else:
            await interview_orchestrator.create_session(
                user_id=connection_info["user_id"],
                session_type=session_type,
                context=context,
                session_id=session_id
            )
        
        # Update connection info
        connection_info["session_id"] = session_id
        
        # Send response
        await sio.emit("session_created", {
            "session_id": session_id,
            "session_type": session_type.value,
            "status": "created",
            "message": "Interview session created successfully"
        }, room=sid)
        
        logger.info(f"Created {session_type.value} session {session_id} for user {connection_info['user_id']}")
        
    except Exception as e:
        logger.error(f"Error creating interview session: {e}")
        await sio.emit("error", {
            "message": "Failed to create interview session",
            "error": str(e)
        }, room=sid)

@sio.event
async def start_interview(sid, data):
    """Start an interview session"""
    try:
        logger.info(f"Starting interview for {sid}: {data}")
        
        # Validate connection and session
        if sid not in active_connections:
            await sio.emit("error", {"message": "Not connected"}, room=sid)
            return
        
        connection_info = active_connections[sid]
        session_id = data.get("session_id") or connection_info.get("session_id")
        
        if not session_id:
            await sio.emit("error", {"message": "No session ID provided"}, room=sid)
            return
        
        # Check if it's a GD session
        if gd_orchestrator.get_session_status(session_id):
            # Start GD session
            result = await gd_orchestrator.start_session(session_id)
            message_type = "gd_greeting"
        else:
            # Start regular interview session
            result = await interview_orchestrator.start_session(session_id)
            message_type = "greeting"
        
        # Send initial AI message
        await sio.emit("ai_speech", {
            "message": result["message"],
            "session_id": session_id,
            "message_type": message_type
        }, room=sid)
        
        # Send session started confirmation
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
    """Handle user message in interview"""
    try:
        logger.info(f"Received message from {sid}: {data}")
        
        # Validate connection and session
        if sid not in active_connections:
            await sio.emit("error", {"message": "Not connected"}, room=sid)
            return
        
        connection_info = active_connections[sid]
        session_id = data.get("session_id") or connection_info.get("session_id")
        user_message = data.get("message", "").strip()
        
        if not session_id:
            await sio.emit("error", {"message": "No active session"}, room=sid)
            return
        
        if not user_message:
            await sio.emit("error", {"message": "Empty message"}, room=sid)
            return
        
        # Check if it's a GD session
        if gd_orchestrator.get_session_status(session_id):
            # Process GD message
            response_data = await gd_orchestrator.process_user_input(
                session_id=session_id,
                user_message=user_message
            )
            
            bot_response = response_data["bot_response"]
            
            # Send bot response
            await sio.emit("ai_speech", {
                "message": bot_response["message"],
                "session_id": session_id,
                "message_type": "gd_response",
                "speaker": bot_response["speaker_name"]
            }, room=sid)
            
            # Send turn update
            if not response_data["should_end"] and response_data.get("next_speaker"):
                await sio.emit("gd_turn_update", {
                    "next_speaker": response_data["next_speaker"],
                    "turn_number": response_data["turn_number"]
                }, room=sid)
            
        else:
            # Process regular interview message
            response_data = await interview_orchestrator.process_user_message(
                session_id=session_id,
                user_message=user_message
            )
            
            # Send AI response
            await sio.emit("ai_speech", {
                "message": response_data["message"],
                "session_id": session_id,
                "message_type": response_data.get("message_type", "response")
            }, room=sid)
        
        # Check if session should end
        if response_data.get("should_end"):
            # Small delay before ending
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
    """End an interview session"""
    try:
        logger.info(f"Ending interview session for {sid}: {data}")
        
        # Validate connection and session
        if sid not in active_connections:
            await sio.emit("error", {"message": "Not connected"}, room=sid)
            return
        
        connection_info = active_connections[sid]
        session_id = data.get("session_id") or connection_info.get("session_id")
        
        if not session_id:
            await sio.emit("error", {"message": "No active session"}, room=sid)
            return
        
        # Check if it's a GD session
        if gd_orchestrator.get_session_status(session_id):
            # End GD session
            result = await gd_orchestrator.end_session(session_id)
            gd_orchestrator.cleanup_session(session_id)
        else:
            # End regular interview session
            result = await interview_orchestrator.end_session(session_id)
        
        # Update session in DB
        db = next(get_db())
        update_session(db, session_id, {
            "status": "completed",
            "ended_at": datetime.now(),
            "feedback": result["feedback"],
            "duration_minutes": result["duration_minutes"],
            "question_count": result.get("question_count", 0)
        })

        # Clear session from connection
        connection_info["session_id"] = None
        
        # Send session ended with feedback
        await sio.emit("session_ended", {
            "session_id": session_id,
            "duration_minutes": result["duration_minutes"],
            "question_count": result.get("question_count", 0),
            "feedback": result["feedback"],
            "feedbackId": session_id,  # For frontend compatibility
            "message": "Interview session completed successfully"
        }, room=sid)
        
        logger.info(f"Ended session {session_id}")
        
    except Exception as e:
        logger.error(f"Error ending interview session: {e}")
        await sio.emit("error", {
            "message": "Failed to end interview session",
            "error": str(e)
        }, room=sid)

@sio.event
async def user_interruption(sid, data):
    """Handle user interruption in GD sessions"""
    try:
        if sid not in active_connections:
            return
        
        connection_info = active_connections[sid]
        session_id = data.get("session_id") or connection_info.get("session_id")
        
        if not session_id:
            return
        
        # Only relevant for GD sessions
        if gd_orchestrator.get_session_status(session_id):
            # Signal that user wants to speak
            await sio.emit("gd_turn_update", {
                "next_speaker": "user",
                "interrupted": True
            }, room=sid)
        
    except Exception as e:
        logger.error(f"Error handling user interruption: {e}")

@sio.event
async def ping(sid, data):
    """Handle ping for connection testing"""
    await sio.emit("pong", {"timestamp": datetime.now().isoformat()}, room=sid)

# Background cleanup task
async def cleanup_task():
    """Background task to clean up expired sessions"""
    while True:
        try:
            await asyncio.sleep(3600)  # Run every hour
            
            # Clean up expired interview sessions
            cleaned_sessions = interview_orchestrator.cleanup_expired_sessions(max_age_hours=24)
            if cleaned_sessions > 0:
                logger.info(f"Cleaned up {cleaned_sessions} expired sessions")
            
            # Clean up stale connections
            current_time = datetime.now()
            stale_connections = []
            
            for sid, conn_info in active_connections.items():
                connection_age = current_time - conn_info["connected_at"]
                if connection_age.total_seconds() > (6 * 3600):  # 6 hours
                    stale_connections.append(sid)
            
            for sid in stale_connections:
                logger.info(f"Cleaning up stale connection: {sid}")
                if sid in active_connections:
                    del active_connections[sid]
            
        except Exception as e:
            logger.error(f"Error in cleanup task: {e}")

# Start cleanup task on first connection
cleanup_task_started = False

async def ensure_cleanup_task():
    """Ensure cleanup task is started"""
    global cleanup_task_started
    if not cleanup_task_started:
        asyncio.create_task(cleanup_task())
        cleanup_task_started = True

