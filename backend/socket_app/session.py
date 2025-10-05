"""
Socket.IO event handlers for real-time interview sessions.
"""
import socketio
import logging
from datetime import datetime
import os
import whisper
import aiofiles
import asyncio
import base64

from tts import tts_service
from orchestrator.gd_orchestrator import GDOrchestrator
from orchestrator.interview import InterviewOrchestrator
from stt.stt_service import stt_service
from utils.database import db_session_context, get_session_by_id, User
from sqlalchemy.orm.attributes import flag_modified
from models.pydantic_models import InterviewSessionResponse
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

# Initialize Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")

# Initialize orchestrators
gd_orchestrator = GDOrchestrator()
interview_orchestrator = InterviewOrchestrator()


# --- Generic Connection Events ---
@sio.event
async def connect(sid, environ):
    logger.info(f'Socket.IO connection established: {sid}')

@sio.event
async def disconnect(sid):
    # TODO: Add cleanup logic for sessions if a user disconnects abruptly
    logger.info(f'Socket.IO connection disconnected: {sid}')

# --- 1-on-1 Interview Events ---
@sio.event
async def start_interview(sid, data):
    session_id = data.get('session_id')
    user_id = data.get('user_id')
    if not session_id or not user_id:
        return await sio.emit('error', {'message': 'Missing session_id or user_id'}, to=sid)

    async with db_session_context() as db:
        session_db = await get_session_by_id(db, session_id)
        if not session_db or str(session_db.user_id) != user_id:
            return await sio.emit('error', {'message': 'Invalid session'}, to=sid)
        
        if session_db.status != "created":
            return await sio.emit('error', {'message': 'Session has already been started'}, to=sid)

        try:
            initial_message, initial_audio = await interview_orchestrator.create_new_session(session_db, sid)
            session_db.status = "active"
            session_db.started_at = datetime.now()
            await db.commit()
            
            sio.enter_room(sid, session_id)

            audio_b64 = None
            if initial_audio:
                audio_b64 = base64.b64encode(initial_audio).decode('utf-8')

            await sio.emit('session_started', {'text': initial_message, 'audio': audio_b64}, to=sid)
        except Exception as e:
            logger.error(f"Error starting interview session {session_id} via socket: {e}")
            await sio.emit('error', {'message': f'Could not start session: {e}'}, to=sid)

@sio.event
async def audio_chunk(sid, data):
    session_id = data.get('session_id')
    audio_blob = data.get('audio_blob')

    if not session_id or not audio_blob:
        return await sio.emit('error', {'message': 'Missing session_id or audio_blob'}, to=sid)

    transcribed_text = await stt_service.transcribe_audio(audio_blob, session_id)
    if not transcribed_text:
        # Don't emit an error for empty audio, just ignore it.
        logger.warning(f"Transcription for {session_id} resulted in empty text.")
        # We still need to let the frontend know the AI isn't speaking.
        await sio.emit('new_ai_message', {'message': ''}, to=sid) # Sending empty message
        return

    await sio.emit('user_message_processed', {'transcript': transcribed_text}, to=sid)

    try:
        ai_response, ai_audio = await interview_orchestrator.handle_user_response(session_id, transcribed_text)
        audio_b64 = None
        if ai_audio:
            audio_b64 = base64.b64encode(ai_audio).decode('utf-8')
        await sio.emit('new_ai_message', {'text': ai_response, 'audio': audio_b64}, to=sid)
    except Exception as e:
        logger.error(f"Error handling user response for {session_id}: {e}")
        await sio.emit('error', {'message': 'Error processing your response.'}, to=sid)

@sio.event
async def end_interview(sid, data):
    session_id = data.get('session_id')
    transcript = data.get('transcript')
    if not session_id:
        return await sio.emit('error', {'message': 'Missing session_id'}, to=sid)

    async with db_session_context() as db:
        try:
            session_db = await get_session_by_id(db, session_id)
            if not session_db:
                return await sio.emit('error', {'message': 'Session not found'}, to=sid)

            feedback = await interview_orchestrator.end_session(session_id, transcript)
            
            session_db.status = 'completed'
            session_db.ended_at = datetime.now()
            session_db.feedback = feedback
            session_db.transcript = transcript
            flag_modified(session_db, "feedback")
            flag_modified(session_db, "transcript")
            await db.commit()
            await db.refresh(session_db)

            session_data = InterviewSessionResponse.from_orm(session_db).model_dump(mode='json')
            await sio.emit('interview_ended', {'sessionData': session_data}, to=sid)
        except Exception as e:
            logger.error(f"Error ending interview {session_id}: {e}")
            await sio.emit('error', {'message': 'Failed to end interview and generate feedback.'}, to=sid)

# --- Group Discussion Events ---
@sio.event
async def gd_audio_chunk(sid, data):
    session_id = data.get('session_id')
    audio_blob = data.get('audio_blob')

    if not session_id or not audio_blob:
        return await sio.emit('error', {'message': 'Missing session_id or audio_blob for GD'}, to=sid)

    transcribed_text = await stt_service.transcribe_audio(audio_blob, session_id)
    if not transcribed_text:
        logger.warning(f"GD transcription for {session_id} resulted in empty text.")
        return

    await sio.emit('user_message_processed', {'transcript': transcribed_text}, to=sid)

    # Handle the logic in the orchestrator
    if session_id in gd_orchestrator.active_sessions:
        await gd_orchestrator.handle_user_message(session_id, transcribed_text, sio)

@sio.event
async def start_discussion(sid, data):
    session_id = data.get('session_id')
    user_id = data.get('user_id')
    if not session_id or not user_id:
        await sio.emit('error', {'message': 'Missing session_id or user_id'}, to=sid)
        return
    
    async with db_session_context() as db:
        session_db = await get_session_by_id(db, session_id)
        if not session_db or str(session_db.user_id) != user_id:
            await sio.emit('error', {'message': 'Invalid session'}, to=sid)
            return

    session_state = gd_orchestrator.create_new_gd_session(session_id, session_db.context, sid)
    await sio.enter_room(sid, session_id)

    await sio.emit('session_started', {
        'topic': session_state['topic'],
        'participants': session_state['participants']
    }, to=sid)

    opening_message = gd_orchestrator.get_opening_message(session_state)

    await sio.emit('new_message', {
        'speaker_id': 'moderator',
        'speaker_name': 'Moderator',
        'message': opening_message,
        'timestamp': datetime.now().isoformat(),
        'audio': None  # Moderator message is text-only
    }, to=sid)

    await sio.emit('speaker_change', {'speaker_id': 'human_user'}, room=session_id)
    await sio.emit('start_turn_window', room=session_id)


@sio.event
async def pass_turn(sid, data):
    session_id = data.get('session_id')
    if not session_id:
        return
    await gd_orchestrator.progress_bot_turn(session_id, sio)

@sio.event
async def pass_turn(sid, data):
    session_id = data.get('session_id')
    if not session_id:
        return
    await gd_orchestrator.progress_bot_turn(session_id, sio)


@sio.event
async def end_discussion(sid, data):
    session_id = data.get('session_id')
    session_state = gd_orchestrator.get_session(session_id)

    if not session_state:
        await sio.emit('error', {'message': 'Session not found'}, to=sid)
        return

    async with db_session_context() as db:
        session_db = await get_session_by_id(db, session_id)
        if session_db:
            feedback = await gd_orchestrator.end_session(session_db)
            session_db.status = 'completed'
            session_db.feedback = feedback
            session_db.transcript = session_state.get('transcript', [])
            flag_modified(session_db, "feedback")
            flag_modified(session_db, "transcript")
            await db.commit()
            await sio.emit('discussion_ended', {'feedback': feedback, 'session_id': session_id}, to=sid)

    gd_orchestrator.remove_session(session_id)


