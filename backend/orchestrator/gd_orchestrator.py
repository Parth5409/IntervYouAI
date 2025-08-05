"""
Group Discussion Orchestrator - Multi-agent simulation for GD interviews
"""

import asyncio
import logging
import random
from datetime import datetime
from typing import Dict, List, Any, Optional
from enum import Enum

from models.pydantic_models import GDParticipant, GDMessage, GDFeedback
from llm.gemini import GeminiLLM

logger = logging.getLogger(__name__)


class GDPersonality(Enum):
    """Group Discussion personality types"""

    SUPPORTIVE = "supportive"
    ASSERTIVE = "assertive"
    FACTUAL = "factual"
    ANALYTICAL = "analytical"
    CREATIVE = "creative"


class GDState(Enum):
    """Group Discussion states"""

    INITIALIZED = "initialized"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class GDOrchestrator:
    """Orchestrates Group Discussion sessions with multiple AI bots"""

    def __init__(self):
        """Initialize GD orchestrator"""
        self.gemini_llm = GeminiLLM()
        self.active_sessions: Dict[str, Dict[str, Any]] = {}

        # Bot personality templates
        self.personality_prompts = {
            GDPersonality.SUPPORTIVE: {
                "name": "Alex",
                "description": "A supportive team player who encourages others and builds on their ideas",
                "prompt": "You are Alex, a collaborative and encouraging participant. You tend to agree with good points, help quieter members contribute, and find common ground. You're positive but not overly agreeable.",
            },
            GDPersonality.ASSERTIVE: {
                "name": "Sam",
                "description": "Confident and direct, presents strong opinions",
                "prompt": "You are Sam, a confident and assertive participant. You present your views strongly, challenge weak arguments constructively, and aren't afraid to take leadership when needed. You're direct but respectful.",
            },
            GDPersonality.FACTUAL: {
                "name": "Jordan",
                "description": "Focuses on data, facts, and evidence-based arguments",
                "prompt": "You are Jordan, a fact-focused and logical participant. You bring data and evidence to support arguments, question unsupported claims, and prefer concrete examples over abstract theories.",
            },
            GDPersonality.ANALYTICAL: {
                "name": "Casey",
                "description": "Breaks down complex topics systematically",
                "prompt": "You are Casey, an analytical thinker who breaks down complex issues into components. You look at different angles, consider pros and cons systematically, and help structure the discussion.",
            },
            GDPersonality.CREATIVE: {
                "name": "Morgan",
                "description": "Brings innovative ideas and creative solutions",
                "prompt": "You are Morgan, a creative thinker who brings fresh perspectives and innovative solutions. You think outside the box, make unexpected connections, and challenge conventional wisdom constructively.",
            },
        }

        logger.info("GDOrchestrator initialized")

    async def initialize_session(
        self,
        session_id: str,
        topic: str,
        user_id: str,
        duration_minutes: int = 20,
        num_bots: int = 4,
    ) -> Dict[str, Any]:
        """
        Initialize a new Group Discussion session

        Args:
            session_id: Unique session identifier
            topic: Discussion topic
            user_id: Human participant ID
            duration_minutes: Session duration
            num_bots: Number of AI bots (3-5 recommended)

        Returns:
            Session initialization data
        """
        try:
            # Select random bot personalities
            available_personalities = list(GDPersonality)
            selected_personalities = random.sample(
                available_personalities, min(num_bots, len(available_personalities))
            )

            # Create bot participants
            bots = []
            for personality in selected_personalities:
                bot_info = self.personality_prompts[personality]
                bot = GDParticipant(
                    id=f"bot_{personality.value}",
                    name=bot_info["name"],
                    personality=personality.value,
                    is_human=False,
                )
                bots.append(bot)

            # Create human participant
            human_participant = GDParticipant(
                id="human_user", name="You", personality="human", is_human=True
            )

            # Create turn order (randomized)
            all_participants = bots + [human_participant]
            random.shuffle(bots)  # Randomize bot order
            turn_order = [bot.id for bot in bots]

            # Initialize session data
            session_data = {
                "session_id": session_id,
                "user_id": user_id,
                "topic": topic,
                "state": GDState.INITIALIZED,
                "participants": all_participants,
                "bots": bots,
                "turn_order": turn_order,
                "current_turn_index": 0,
                "current_speaker": None,
                "messages": [],
                "start_time": None,
                "end_time": None,
                "duration_minutes": duration_minutes,
                "max_turns": 20,
                "user_participation_count": 0,
                "bot_responses": [],
                "turn_timeout": 30,  # seconds
                "is_bot_turn_active": False,
                "discussion_context": [],
            }

            # Store session
            self.active_sessions[session_id] = session_data

            logger.info(f"Initialized GD session {session_id} with topic: {topic}")

            return {
                "session_id": session_id,
                "topic": topic,
                "participants": [p.dict() for p in all_participants],
                "estimated_duration": duration_minutes,
                "status": "initialized",
            }

        except Exception as e:
            logger.error(f"Error initializing GD session: {e}")
            raise

    async def start_session(self, session_id: str) -> Dict[str, Any]:
        """Start the Group Discussion session"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")

            session = self.active_sessions[session_id]
            session["state"] = GDState.ACTIVE
            session["start_time"] = datetime.now()

            # Generate opening message
            opening_message = await self._generate_opening_message(session)

            # Add opening message to transcript
            opening_msg = GDMessage(
                speaker_id="moderator",
                speaker_name="Moderator",
                message=opening_message,
                timestamp=datetime.now(),
                turn_number=1,
            )

            session["messages"].append(opening_msg.dict())

            logger.info(f"Started GD session {session_id}")

            # In GDOrchestrator.start_session() return statement
            return {
                "session_id": session_id,
                "message": opening_message,
                "status": "active",
                "next_speaker": "human_user",
                "speaker_name": "User"  # Add speaker name for WebSocket
            }

        except Exception as e:
            logger.error(f"Error starting GD session: {e}")
            raise

    async def process_user_input(
        self, session_id: str, user_message: str
    ) -> Dict[str, Any]:
        """
        Process user input and generate bot response

        Args:
            session_id: Session identifier
            user_message: User's contribution to discussion

        Returns:
            Bot response and session update
        """
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")

            session = self.active_sessions[session_id]

            if session["state"] != GDState.ACTIVE:
                raise ValueError(f"Session {session_id} is not active")

            # Add user message
            user_msg = GDMessage(
                speaker_id="human_user",
                speaker_name="You",
                message=user_message,
                timestamp=datetime.now(),
                turn_number=len(session["messages"]) + 1,
            )

            session["messages"].append(user_msg.dict())
            session["user_participation_count"] += 1

            # Wait a moment (simulate thinking)
            await asyncio.sleep(1)

            # Generate bot response
            bot_response = await self._generate_bot_response(session, user_message)

            # Add bot message
            bot_msg = GDMessage(
                speaker_id=bot_response["speaker_id"],
                speaker_name=bot_response["speaker_name"],
                message=bot_response["message"],
                timestamp=datetime.now(),
                turn_number=len(session["messages"]) + 1,
            )

            session["messages"].append(bot_msg.dict())
            session["current_turn_index"] = (session["current_turn_index"] + 1) % len(
                session["bots"]
            )

            # Check if session should end
            should_end = await self._should_end_session(session)

            return {
                "bot_response": bot_response,
                "should_end": should_end,
                "next_speaker": (
                    self._get_next_speaker(session) if not should_end else None
                ),
                "turn_number": len(session["messages"]),
                "total_messages": len(session["messages"]),
            }

        except Exception as e:
            logger.error(f"Error processing user input: {e}")
            raise

    async def end_session(self, session_id: str) -> Dict[str, Any]:
        """End the Group Discussion session and generate feedback"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")

            session = self.active_sessions[session_id]
            session["state"] = GDState.COMPLETED
            session["end_time"] = datetime.now()

            # Calculate actual duration
            if session["start_time"]:
                duration = session["end_time"] - session["start_time"]
                session["actual_duration_minutes"] = duration.total_seconds() / 60

            # Generate comprehensive feedback
            feedback = await self._generate_session_feedback(session)
            session["feedback"] = feedback.dict()

            logger.info(f"Ended GD session {session_id}")

            return {
                "session_id": session_id,
                "feedback": feedback.dict(),
                "duration_minutes": session.get("actual_duration_minutes", 0),
                "total_messages": len(session["messages"]),
                "user_participation": session["user_participation_count"],
                "question_count": 0,  # Add this field to match WebSocket expectations
            }

        except Exception as e:
            logger.error(f"Error ending GD session: {e}")
            raise

    async def _generate_opening_message(self, session: Dict[str, Any]) -> str:
        """Generate opening message for the discussion"""
        topic = session["topic"]
        participant_names = [bot["name"] for bot in session["bots"]]

        return f"""Welcome everyone to today's group discussion on: "{topic}"

We have {', '.join(participant_names)} and yourself participating today. This is an opportunity to share your perspectives, listen to different viewpoints, and engage in meaningful dialogue.

Feel free to jump in at any time with your thoughts. Let's begin with opening thoughts on this topic. Who would like to start?"""

    async def _generate_bot_response(
        self, session: Dict[str, Any], user_message: str
    ) -> Dict[str, str]:
        """Generate response from next bot in turn order"""
        try:
            # Select next bot
            current_bot_index = session["current_turn_index"]
            selected_bot = session["bots"][current_bot_index]

            # Build conversation context
            recent_messages = session["messages"][-5:]  # Last 5 messages
            context_text = "\n".join(
                [f"{msg['speaker_name']}: {msg['message']}" for msg in recent_messages]
            )

            # Get personality prompt
            personality = GDPersonality(selected_bot.personality)
            personality_info = self.personality_prompts[personality]

            # Build prompt
            system_prompt = f"""{personality_info['prompt']}

You are participating in a group discussion about: "{session['topic']}"

Guidelines:
- Keep responses concise (2-3 sentences maximum)
- Build on previous points when relevant
- Stay true to your personality
- Be respectful but authentic to your character
- Don't repeat what others have already said well
"""

            user_prompt = f"""Recent discussion:
{context_text}

Latest contribution: {user_message}

Respond as {selected_bot.name} with your {personality.value} personality. Add value to the discussion."""

            # Generate response
            response = await self.gemini_llm.generate_response(
                prompt=user_prompt,
                system_message=system_prompt,
                temperature=0.8,  # Higher temperature for personality variation
            )

            return {
                "speaker_id": selected_bot.id,
                "speaker_name": selected_bot.name,  # Ensure this is included
                "message": response.strip(),
                "personality": selected_bot.personality
            }

        except Exception as e:
            logger.error(f"Error generating bot response: {e}")
            # Fallback response
            fallback_bot = session["bots"][0]
            return {
                "speaker_id": fallback_bot.id,
                "speaker_name": fallback_bot.name,
                "message": "That's an interesting perspective. I'd like to add that we should consider multiple angles on this topic.",
                "personality": fallback_bot.personality,
            }

    def _get_next_speaker(self, session: Dict[str, Any]) -> str:
        """Determine next speaker in the discussion"""
        # In GD, anyone can speak, but we can suggest the next bot
        next_bot_index = (session["current_turn_index"] + 1) % len(session["bots"])
        return session["bots"][next_bot_index].id

    async def _should_end_session(self, session: Dict[str, Any]) -> bool:
        """Determine if session should end"""
        # End conditions
        max_messages_reached = len(session["messages"]) >= session.get("max_turns", 20)

        # Time-based ending (if implemented)
        time_limit_reached = False
        if session.get("start_time"):
            elapsed_time = (datetime.now() - session["start_time"]).total_seconds() / 60
            time_limit_reached = elapsed_time >= session.get("duration_minutes", 20)

        # Natural conclusion detection (advanced)
        natural_conclusion = await self._detect_natural_conclusion(session)

        return max_messages_reached or time_limit_reached or natural_conclusion

    async def _detect_natural_conclusion(self, session: Dict[str, Any]) -> bool:
        """Detect if discussion has reached natural conclusion"""
        # Simple heuristic: if recent messages are getting repetitive or conclusive
        if len(session["messages"]) < 10:
            return False

        recent_messages = session["messages"][-3:]
        conclusive_phrases = [
            "in conclusion",
            "to summarize",
            "overall",
            "in summary",
            "final thoughts",
            "to wrap up",
            "all things considered",
        ]

        for msg in recent_messages:
            message_text = msg["message"].lower()
            if any(phrase in message_text for phrase in conclusive_phrases):
                return True

        return False

    async def _generate_session_feedback(self, session: Dict[str, Any]) -> GDFeedback:
        """Generate comprehensive feedback for the GD session"""
        try:
            # Extract user messages
            user_messages = [
                msg for msg in session["messages"] if msg["speaker_id"] == "human_user"
            ]

            total_messages = len(session["messages"])
            user_message_count = len(user_messages)
            participation_ratio = (
                (user_message_count / total_messages * 100) if total_messages > 0 else 0
            )

            # Analyze user contributions
            user_text = " ".join([msg["message"] for msg in user_messages])

            # Generate AI-powered feedback
            system_prompt = """You are an expert evaluator for group discussions. Analyze the participant's performance across multiple dimensions and provide constructive feedback."""

            feedback_prompt = f"""
Group Discussion Analysis:

Topic: {session["topic"]}
Total Messages: {total_messages}
User Messages: {user_message_count} 
Participation Rate: {participation_ratio:.1f}%

User's Contributions:
{user_text}

Full Discussion Context:
{chr(10).join([f"{msg['speaker_name']}: {msg['message']}" for msg in session["messages"][-10:]])}

Evaluate the user's performance and provide scores (0-100) for:
1. Participation Score - How actively they engaged
2. Initiative Score - How often they initiated new points
3. Clarity Score - How clear and well-structured their points were
4. Collaboration Score - How well they built on others' ideas
5. Topic Understanding - How well they understood and addressed the topic

Also provide:
- 2-3 key strengths
- 2-3 improvement suggestions  
- 2-3 key contributions they made
- Overall feedback paragraph

Format as JSON:
{{
    "participation_score": <score>,
    "initiative_score": <score>,
    "clarity_score": <score>,
    "collaboration_score": <score>,
    "topic_understanding": <score>,
    "strengths": ["strength1", "strength2"],
    "improvement_suggestions": ["suggestion1", "suggestion2"],
    "key_contributions": ["contribution1", "contribution2"],
    "overall_feedback": "detailed feedback paragraph"
}}
"""

            response = await self.gemini_llm.generate_response(
                prompt=feedback_prompt,
                system_message=system_prompt,
                temperature=0.3,  # Lower temperature for consistent evaluation
            )

            # Parse JSON response
            import json

            try:
                feedback_data = json.loads(response)
                feedback_data["session_id"] = session["session_id"]
                return GDFeedback(**feedback_data)
            except (json.JSONDecodeError, KeyError) as e:
                logger.warning(f"Failed to parse feedback JSON: {e}")
                return self._get_default_gd_feedback(session, participation_ratio)

        except Exception as e:
            logger.error(f"Error generating GD feedback: {e}")
            return self._get_default_gd_feedback(session, participation_ratio)

    def _get_default_gd_feedback(
        self, session: Dict[str, Any], participation_ratio: float
    ) -> GDFeedback:
        """Generate default feedback when AI generation fails"""
        base_score = min(max(int(participation_ratio * 1.5), 40), 85)

        return GDFeedback(
            session_id=session["session_id"],
            participation_score=base_score,
            initiative_score=base_score - 5,
            clarity_score=base_score + 5,
            collaboration_score=base_score,
            topic_understanding=base_score,
            strengths=[
                "Engaged actively in the discussion",
                "Shared relevant perspectives",
                "Maintained respectful dialogue",
            ],
            improvement_suggestions=[
                "Take more initiative in introducing new points",
                "Provide more specific examples to support arguments",
                "Build more explicitly on others' contributions",
            ],
            key_contributions=[
                "Participated in the discussion flow",
                "Added valuable perspectives to the topic",
                "Maintained professional communication",
            ],
            overall_feedback=f"You participated well in the group discussion with {session['user_participation_count']} contributions. Your engagement level was good, and you demonstrated understanding of the topic. Focus on taking more initiative and providing concrete examples to strengthen your future group discussion performance.",
        )

    def get_session_status(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get current session status"""
        if session_id not in self.active_sessions:
            return None

        session = self.active_sessions[session_id]
        return {
            "session_id": session_id,
            "state": session["state"].value,
            "topic": session["topic"],
            "participants": len(session["participants"]),
            "messages_count": len(session["messages"]),
            "user_participation": session["user_participation_count"],
            "current_speaker": session.get("current_speaker"),
        }

    def cleanup_session(self, session_id: str) -> bool:
        """Clean up completed session"""
        try:
            if session_id in self.active_sessions:
                del self.active_sessions[session_id]
                logger.info(f"Cleaned up GD session {session_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error cleaning up session {session_id}: {e}")
            return False
