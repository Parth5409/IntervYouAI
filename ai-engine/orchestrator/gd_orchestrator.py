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
import base64

from models.pydantic_models import GDParticipant, GDMessage, GDFeedback, GDSessionData
from llm.gemini import GeminiLLM
from utils.database import InterviewSession
from tts.tts_service import tts_service

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
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.personality_prompts = {
            GDPersonality.SUPPORTIVE: {
                "name": "Alex",
                "voice": "af_bella", # Female, American
                "prompt": "You are Alex, a collaborative and encouraging participant. You try to build on others' ideas and find consensus. You are polite and often agree with others before adding your own perspective."
            },
            GDPersonality.ASSERTIVE: {
                "name": "Sam",
                "voice": "am_michael", # Male, American
                "prompt": "You are Sam, a confident and assertive participant. You are direct, state your opinions clearly, and are not afraid to challenge others. You aim to drive the conversation forward."
            },
            GDPersonality.FACTUAL: {
                "name": "Jordan",
                "voice": "am_fenrir", # Male, American
                "prompt": "You are Jordan, a fact-focused and logical participant. You prefer to use data, evidence, and reason in your arguments. You often ask for clarification and question assumptions."
            },
            GDPersonality.ANALYTICAL: {
                "name": "Casey",
                "voice": "bf_isabella", # Female, British (if not working, use bf_emma)
                "prompt": "You are Casey, an analytical thinker. You like to break down problems, explore different angles, and consider the pros and cons of various solutions. You are structured in your thinking."
            },
            GDPersonality.CREATIVE: {
                "name": "Morgan",
                "voice": "af_nicole", # Female, American
                "prompt": "You are Morgan, a creative and out-of-the-box thinker. You enjoy proposing new, unconventional ideas and solutions, even if they seem a bit wild at first."
            },
        }
        logger.info("GDOrchestrator initialized for stateful, turn-based operation")

    def create_new_gd_session(self, session_id: str, session_context: Dict[str, Any], client_sid: str) -> Dict[str, Any]:
        """Creates and stores a new GD session."""
        num_bots = 5 # Hardcoded for prototype stage

        # Handle random topic selection if multiple topics are provided
        mission_config = session_context.get("configJson") or {}
        if isinstance(mission_config, str):
            try:
                import json
                mission_config = json.loads(mission_config)
            except Exception as e:
                logger.error(f"Error parsing configJson in GD session: {e}")
                mission_config = {}
        
        gd_config = mission_config.get("gd") or {}
        topics_list = gd_config.get("topics", [])
        
        logger.info(f"GD Session {session_id} configuration: {gd_config}")
        
        if topics_list and isinstance(topics_list, list) and len(topics_list) > 0:
            selected_topic = random.choice(topics_list)
            logger.info(f"Selected random topic for GD: {selected_topic}")
        else:
            # Fallback to session-level topic or a topic derived from JD
            selected_topic = session_context.get("topic")
            if not selected_topic and session_context.get("jd_text"):
                # Simple heuristic: use company name + job role if no topic
                company = session_context.get("company_name", "the company")
                role = session_context.get("job_role", "position")
                selected_topic = f"The recruitment process and expectations for {role} at {company}"
            
            if not selected_topic:
                selected_topic = "Challenges and opportunities in the current tech industry"

        company_name = session_context.get("company_name", "the company")
        candidate_name = session_context.get("candidate_name", "the candidate")

        available_personalities = list(GDPersonality)
        selected_personalities = random.sample(available_personalities, min(num_bots, len(available_personalities)))

        bots = []
        for p in selected_personalities:
            personality_info = self.personality_prompts[p]
            bot_participant = GDParticipant(
                id=f"bot_{p.value}",
                name=personality_info["name"],
                personality=p.value,
                is_human=False,
            ).dict()
            bot_participant['voice'] = personality_info['voice'] # Assign voice from mapping
            bots.append(bot_participant)

        human_participant = GDParticipant(id="human_user", name="You", personality="human", is_human=True).dict()
        all_participants = bots + [human_participant]
        
        turn_order = [bot['id'] for bot in bots]
        random.shuffle(turn_order)

        new_session_state = {
            "session_id": session_id,
            "client_sid": client_sid,
            "topic": selected_topic,
            "company_name": company_name,
            "candidate_name": candidate_name,
            "participants": all_participants,
            "transcript": [],
            "turn_order": turn_order,
            "current_turn_index": 0,
            "state": GDState.ACTIVE
        }
        self.active_sessions[session_id] = new_session_state
        logger.info(f"Created new GD session {session_id} for client {client_sid} with topic: {selected_topic}")
        return new_session_state

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves an active session."""
        return self.active_sessions.get(session_id)

    def remove_session(self, session_id: str):
        """Removes a session from the active pool."""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            logger.info(f"Removed GD session {session_id} from active pool.")

    def get_opening_message(self, context: Dict[str, Any]) -> str:
        """Generates the moderator's opening message."""
        topic = context.get("topic", "an interesting topic")
        return f'Welcome everyone. Today\'s group discussion topic is: "{topic}". Please begin when you are ready.'

    async def handle_user_message(self, session_id: str, user_message: str, sio: socketio.AsyncServer):
        """
        Handles a message from the user, adds it to the transcript,
        and kicks off the bot response sequence.
        """
        session_state = self.get_session(session_id)
        if not session_state or session_state['state'] != GDState.ACTIVE:
            return

        user_msg = GDMessage(
            speaker_id="human_user",
            speaker_name="You",
            message=user_message,
            timestamp=datetime.now().isoformat(),
            turn_number=len(session_state['transcript']) + 1,
        ).dict()
        session_state['transcript'].append(user_msg)

        random.shuffle(session_state['turn_order'])
        session_state['current_turn_index'] = 0
        logger.info(f"User spoke. New bot turn order for {session_id}: {session_state['turn_order']}")
        
        await self.progress_bot_turn(session_id, sio)

    async def progress_bot_turn(self, session_id: str, sio: socketio.AsyncServer):
        """
        Progresses the turn to the next bot. If all bots have spoken,
        it gives the turn back to the user for an open turn.
        """
        session_state = self.get_session(session_id)
        if not session_state or session_state['state'] != GDState.ACTIVE:
            return

        turn_index = session_state['current_turn_index']
        turn_order = session_state['turn_order']
        client_sid = session_state['client_sid']

        if turn_index >= len(turn_order):
            logger.info(f"All bots have spoken in session {session_id}. Returning turn to user.")
            session_state['current_turn_index'] = 0
            await sio.emit('speaker_change', {'speaker_id': 'human_user'}, to=client_sid)
            await sio.emit('start_turn_window', to=client_sid)
            return

        next_speaker_id = turn_order[turn_index]
        session_state['current_turn_index'] += 1

        await sio.emit('speaker_change', {'speaker_id': next_speaker_id}, to=client_sid)
        
        bot_response = await self._generate_bot_response(session_state, next_speaker_id)
        
        if bot_response:
            bot_response_message, bot_response_audio = bot_response
            session_state['transcript'].append(bot_response_message)

            logger.info(f"Emitting new_message for bot: {bot_response_message}")

            audio_b64 = None
            if bot_response_audio:
                audio_b64 = base64.b64encode(bot_response_audio).decode('utf-8')
            
            bot_response_message['audio'] = audio_b64

            await sio.emit('new_message', bot_response_message, to=client_sid)
        
        await sio.emit('start_interruption_window', to=client_sid)

    async def end_session(self, session: InterviewSession) -> Dict[str, Any]:
        """Ends the GD session and generates feedback."""
        return await self._generate_session_feedback(session)

    async def _generate_bot_response(self, context: Dict[str, Any], bot_id: str) -> Optional[tuple[Dict[str, Any], bytes | None]]:
        """Generate response from a specific bot, including audio."""
        bot = next((p for p in context['participants'] if p['id'] == bot_id), None)
        if not bot:
            return None

        recent_messages = context.get("transcript", [])[-6:]
        context_text = "\n".join([f"{msg['speaker_name']}: {msg['message']}" for msg in recent_messages])
        
        personality = GDPersonality(bot["personality"])
        personality_info = self.personality_prompts[personality]

        company_name = context.get("company_name", "the company")
        candidate_name = context.get("candidate_name", "the candidate")

        system_prompt = f'{personality_info["prompt"]}\n\nYou are in a group discussion about: "{context.get("topic")}". This discussion is part of a recruitment process for {company_name}. One of the participants is {candidate_name}. Your goal is to contribute meaningfully. Keep your responses concise (1-3 sentences) and relevant to the last few messages.'
        user_prompt = f'Here is the recent discussion:\n{context_text}\n\nIt is now your turn to speak. Respond as {bot["name"]}. Do not greet or announce yourself.'

        response_text = await self.gemini_llm.generate_response(
            prompt=user_prompt, 
            system_message=system_prompt, 
            temperature=0.85
        )
        
        response_audio = await tts_service.text_to_audio_with_voice(response_text, bot.get("voice", "af_bella"))

        message = GDMessage(
            speaker_id=bot["id"],
            speaker_name=bot["name"],
            message=response_text.strip(),
            timestamp=datetime.now().isoformat(),
            turn_number=len(context['transcript']) + 1
        ).dict()

        return message, response_audio

    async def _generate_session_feedback(self, session: InterviewSession) -> Dict[str, Any]:
        """Generate comprehensive feedback for the GD session."""
        session_state = self.get_session(str(session.id))
        if not session_state:
            logger.warning(f"No active session state found for {session.id} during feedback generation")
            return self.gemini_llm._get_default_gd_feedback()

        try:
            feedback_data = await self.gemini_llm.generate_gd_feedback(
                topic=session_state['topic'],
                chat_history=session_state['transcript'],
                session_context=session.context
            )
            
            # Ensure session_id is a string for Pydantic
            feedback_data['session_id'] = str(session.id)
            
            return GDFeedback(**feedback_data).dict()
        except Exception as e:
            logger.error(f"Error generating GD feedback for {session.id}: {e}")
            default_fb = self.gemini_llm._get_default_gd_feedback()
            default_fb['session_id'] = str(session.id)
            return default_fb

