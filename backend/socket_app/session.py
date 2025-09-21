"""
Socket.IO event handlers for real-time interview sessions.
"""
import socketio
import logging

from orchestrator.gd_orchestrator import GDOrchestrator
from utils.database import db_session_context, get_session_by_id

logger = logging.getLogger(__name__)

# Initialize Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")

# Initialize orchestrator
gd_orchestrator = GDOrchestrator()

@sio.event
async def connect(sid, environ):
    logger.info(f'Socket.IO connection established: {sid}')

@sio.event
async def disconnect(sid):
    logger.info(f'Socket.IO connection disconnected: {sid}')

@sio.event
async def start_discussion(sid, data):
    session_id = data.get('session_id')
    user_id = data.get('user_id')
    if not session_id or not user_id:
        await sio.emit('error', {'message': 'Missing session_id or user_id'}, to=sid)
        return 
    async with db_session_context() as db:
        session_db = await get_session_by_id(db, session_id)
        if not session_db or session_db.user_id != user_id:
            await sio.emit('error', {'message': 'Invalid session'}, to=sid)
            return

    session_state = gd_orchestrator.create_new_gd_session(session_id, session_db.context)
    sio.enter_room(sid, session_id)

    await sio.emit('session_started', {
        'topic': session_state['topic'],
        'participants': session_state['participants']
    }, to=sid)

    opening_message = gd_orchestrator._generate_opening_message(session_state)
    await sio.emit('new_message', {
        'speaker_id': 'moderator',
        'message': opening_message
    }, room=session_id)

@sio.event
async def user_message(sid, data):
    session_id = data.get('session_id')
    message_text = data.get('message')
    await gd_orchestrator.process_user_input(session_id, message_text, sio)

@sio.event
async def pass_turn(sid, data):
    session_id = data.get('session_id')
    await gd_orchestrator.progress_turn(session_id, sio)

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
            feedback = await gd_orchestrator._generate_session_feedback(session_db)
            session_db.status = 'completed'
            session_db.feedback = feedback
            await db.commit()
            await sio.emit('discussion_ended', {'feedback': feedback}, to=sid)

    gd_orchestrator.remove_session(session_id)

