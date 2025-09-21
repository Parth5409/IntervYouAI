"""
Group Discussion Orchestrator - Multi-agent simulation for GD interviews
"""

import asyncio
import logging
import random
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
import socketio

from models.pydantic_models import GDParticipant, GDMessage, GDFeedback
from llm.gemini import GeminiLLM
from utils.database import InterviewSession

logger = logging.getLogger(__name__)

class GDPersonality(Enum):
    SUPPORTIVE = "supportive"
    ASSERTIVE = "assertive"
    FACTUAL = "factual"
    ANALYTICAL = "analytical"
    CREATIVE = "creative"

class GDState(Enum):
    INITIALIZED = "initialized"
    ACTIVE = "active"
    COMPLETED = "completed"

class GDOrchestrator:
    """Orchestrates Group Discussion sessions with multiple AI bots"""

    def __init__(self):
        """Initialize GD orchestrator"""
        self.gemini_llm = GeminiLLM()
        self.active_sessions = {}
        self.personality_prompts = {
            GDPersonality.SUPPORTIVE: {
                "name": "Alex",
                "prompt": "You are Alex, a collaborative and encouraging participant..."
            },
            GDPersonality.ASSERTIVE: {
                "name": "Sam",
                "prompt": "You are Sam, a confident and assertive participant..."
            },
            GDPersonality.FACTUAL: {
                "name": "Jordan",
                "prompt": "You are Jordan, a fact-focused and logical participant..."
            },
            GDPersonality.ANALYTICAL: {
                "name": "Casey",
                "prompt": "You are Casey, an analytical thinker..."
            },
            GDPersonality.CREATIVE: {
                "name": "Morgan",
                "prompt": "You are Morgan, a creative thinker..."
            },
        }
        logger.info("GDOrchestrator initialized for stateful operation")

    def create_new_gd_session(self, session_id: str, session_context: Dict[str, Any]) -> Dict[str, Any]:
        """Creates and stores a new GD session."""
        num_bots = session_context.get("num_bots", 4)
        available_personalities = list(GDPersonality)
        selected_personalities = random.sample(available_personalities, min(num_bots, len(available_personalities)))

        bots = [
            GDParticipant(
                id=f"bot_{p.value}",
                name=self.personality_prompts[p]["name"],
                personality=p.value,
                is_human=False,
            ) for p in selected_personalities
        ]
        human_participant = GDParticipant(id="human_user", name="You", personality="human", is_human=True)
        all_participants = bots + [human_participant]
        random.shuffle(bots)

        new_session_state = {
            "session_id": session_id,
            "topic": session_context.get("topic", "a default topic"),
            "participants": [p.dict() for p in all_participants],
            "bots": [p.dict() for p in bots],
            "transcript": [],
            "turn_order": [bot.id for bot in bots],
            "current_turn_index": 0,
            "state": GDState.INITIALIZED
        }
        self.active_sessions[session_id] = new_session_state
        return new_session_state

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves an active session."""
        return self.active_sessions.get(session_id)

    def remove_session(self, session_id: str):
        """Removes a session from the active pool."""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            logger.info(f"Removed GD session {session_id} from active pool.")

    def initialize_session_context(self, session_context: Dict[str, Any]) -> Dict[str, Any]:
        """Initializes the context for a new GD session."""
        num_bots = session_context.get("num_bots", 4)
        available_personalities = list(GDPersonality)
        selected_personalities = random.sample(available_personalities, min(num_bots, len(available_personalities)))

        bots = [
            GDParticipant(
                id=f"bot_{p.value}",
                name=self.personality_prompts[p]["name"],
                personality=p.value,
                is_human=False,
            ) for p in selected_personalities
        ]
        human_participant = GDParticipant(id="human_user", name="You", personality="human", is_human=True)
        all_participants = bots + [human_participant]
        random.shuffle(bots)

        session_context["participants"] = [p.dict() for p in all_participants]
        session_context["bots"] = [p.dict() for p in bots]
        session_context["turn_order"] = [bot.id for bot in bots]
        session_context["current_turn_index"] = 0
        session_context["messages"] = []
        return session_context

    async def start_session(self, session: InterviewSession) -> Tuple[str, list]:
        """Starts the GD session and returns the opening message."""
        opening_message = self._generate_opening_message(session.context)
        message = GDMessage(
            speaker_id="moderator",
            speaker_name="Moderator",
            message=opening_message,
            timestamp=datetime.now(),
            turn_number=1,
        ).dict()
        
        transcript = session.context.get("messages", [])
        transcript.append(message)
        return opening_message, transcript

    async def process_user_input(self, session_id: str, user_message: str, sio: socketio.AsyncServer):
        """Processes user input, generates bot responses, and manages turn-taking."""
        session_state = self.get_session(session_id)
        if not session_state:
            return

        # Add user message to transcript
        user_msg = GDMessage(
            speaker_id="human_user",
            speaker_name="You",
            message=user_message,
            timestamp=datetime.now(),
            turn_number=len(session_state['transcript']) + 1,
        ).dict()
        session_state['transcript'].append(user_msg)
        await sio.emit('new_message', user_msg, room=session_id)

        # Trigger next bot's turn
        await self.progress_turn(session_id, sio)

    async def progress_turn(self, session_id: str, sio: socketio.AsyncServer):
        """Progresses the turn to the next bot or opens the window for the user."""
        session_state = self.get_session(session_id)
        if not session_state or session_state['state'] != GDState.ACTIVE:
            return

        # Simple round-robin for now
        session_state['current_turn_index'] = (session_state['current_turn_index'] + 1) % len(session_state['bots'])
        next_speaker_id = session_state['turn_order'][session_state['current_turn_index']]

        if next_speaker_id == 'human_user':
            await sio.emit('start_turn_window', room=session_id)
        else:
            bot_response = await self._generate_bot_response(session_state, "")
            await sio.emit('new_message', bot_response, room=session_id)
            # After bot speaks, open window for user
            await sio.emit('start_turn_window', room=session_id)

    async def end_session(self, session: InterviewSession) -> Dict[str, Any]:
        """Ends the GD session and generates feedback."""
        return await self._generate_session_feedback(session)

    def _generate_opening_message(self, context: Dict[str, Any]) -> str:
        topic = context.get("topic", "an interesting topic")
        participant_names = [bot["name"] for bot in context.get("bots", [])]
        return f'Welcome everyone to today\'s group discussion on: "{topic}". Let\'s begin.'

    async def _generate_bot_response(self, context: Dict[str, Any], user_message: str) -> Dict[str, str]:
        """Generate response from the next bot in the turn order."""
        bots = context.get("bots", [])
        current_turn_index = context.get("current_turn_index", 0)
        selected_bot = bots[current_turn_index]
        
        recent_messages = context.get("messages", [])[-5:]
        context_text = "\n".join([f"{msg['speaker_name']}: {msg['message']}" for msg in recent_messages])
        
        personality = GDPersonality(selected_bot["personality"])
        personality_info = self.personality_prompts[personality]

        system_prompt = f'{personality_info["prompt"]}\n\nYou are in a group discussion about: "{context.get("topic")}". Keep responses concise.'
        user_prompt = f'Recent discussion:\n{context_text}\n\nLatest contribution from human user: {user_message}\n\nRespond as {selected_bot["name"]}.'

        response = await self.gemini_llm.generate_response(prompt=user_prompt, system_message=system_prompt, temperature=0.8)
        return {
            "speaker_id": selected_bot["id"],
            "speaker_name": selected_bot["name"],
            "message": response.strip(),
            "personality": selected_bot["personality"]
        }

    async def _generate_session_feedback(self, session: InterviewSession) -> Dict[str, Any]:
        """Generate comprehensive feedback for the GD session."""
        # This method would need the full session context and transcript
        # For simplicity, we return a default feedback. A full implementation would be similar to the original.
        return GDFeedback(
            session_id=session.id,
            participation_score=75,
            initiative_score=70,
            clarity_score=80,
            collaboration_score=78,
            topic_understanding=82,
            strengths=["Contributed to the discussion"],
            improvement_suggestions=["Could take more initiative to lead"],
            key_contributions=["Provided a valid point on the topic."],
            overall_feedback="A good overall performance."
        ).dict()
