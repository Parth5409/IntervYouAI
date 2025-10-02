"""
Socket.IO event handlers for real-time interview sessions.
"""
import socketio
import logging
from datetime import datetime

from orchestrator.gd_orchestrator import GDOrchestrator
from utils.database import db_session_context, get_session_by_id, User
from sqlalchemy.orm.attributes import flag_modified

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
    # Here you might want to clean up any sessions associated with the sid
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
        if not session_db or str(session_db.user_id) != user_id:
            await sio.emit('error', {'message': 'Invalid session'}, to=sid)
            return

    session_state = gd_orchestrator.create_new_gd_session(session_id, session_db.context, sid)
    sio.enter_room(sid, session_id)

    await sio.emit('session_started', {
        'topic': session_state['topic'],
        'participants': session_state['participants']
    }, to=sid)

    opening_message = gd_orchestrator.get_opening_message(session_state)
    await sio.emit('new_message', {
        'speaker_id': 'moderator',
        'speaker_name': 'Moderator',
        'message': opening_message,
        'timestamp': datetime.now().isoformat()
    }, to=sid)

    await sio.emit('speaker_change', {'speaker_id': 'human_user'}, room=session_id)
    await sio.emit('start_turn_window', room=session_id)

@sio.event
async def user_message(sid, data):
    session_id = data.get('session_id')
    message_text = data.get('message')
    if not message_text or not session_id:
        return
    await gd_orchestrator.handle_user_message(session_id, message_text, sio)

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


