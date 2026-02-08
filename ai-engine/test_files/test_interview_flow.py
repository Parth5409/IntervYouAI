import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from orchestrator.interview import InterviewOrchestrator, InterviewState
from models.pydantic_models import SessionType

@pytest.fixture
def mock_interview_orchestrator():
    with (
        patch("orchestrator.interview.GeminiLLM") as mock_llm_cls, 
        patch("orchestrator.interview.get_vector_store_manager") as mock_vsm_cls, 
        patch("orchestrator.interview.DocumentProcessor"), 
        patch("orchestrator.interview.tts_service")
    ):
        
        orchestrator = InterviewOrchestrator()
        orchestrator.gemini_llm = AsyncMock()
        orchestrator.vector_store_manager = AsyncMock()
        return orchestrator

@pytest.mark.asyncio
async def test_create_new_session(mock_interview_orchestrator):
    db_session = MagicMock()
    db_session.id = "test-session-123"
    db_session.session_type = "TECHNICAL"
    db_session.context = {"jd_text": "Must know Python"}
    db_session.user.full_name = "Test User"
    
    mock_interview_orchestrator.gemini_llm.generate_initial_greeting.return_value = "Hello Test User"
    
    msg, audio = await mock_interview_orchestrator.create_new_session(db_session, "client-sid-1")
    
    assert msg == "Hello Test User"
    assert "test-session-123" in mock_interview_orchestrator.active_sessions
    assert mock_interview_orchestrator.active_sessions["test-session-123"]["state"] == InterviewState.ACTIVE

@pytest.mark.asyncio
async def test_handle_user_response(mock_interview_orchestrator):
    session_id = "test-session-123"
    
    # Setup active session state
    mock_interview_orchestrator.active_sessions[session_id] = {
        "session_id": session_id,
        "db_session": MagicMock(),
        "transcript": [],
        "question_count": 1,
        "state": InterviewState.ACTIVE
    }
    mock_interview_orchestrator.active_sessions[session_id]["db_session"].context = {}
    mock_interview_orchestrator.active_sessions[session_id]["db_session"].session_type = "TECHNICAL"

    mock_interview_orchestrator.gemini_llm.generate_interview_question.return_value = "Next Question?"
    
    response_text, _ = await mock_interview_orchestrator.handle_user_response(session_id, "My answer")
    
    assert response_text == "Next Question?"
    assert len(mock_interview_orchestrator.active_sessions[session_id]["transcript"]) == 2 # User + AI

@pytest.mark.asyncio
async def test_end_session(mock_interview_orchestrator):
    session_id = "test-session-123"
    
    # Mock DB Session
    mock_db_session = MagicMock()
    mock_db_session.id = session_id  # Ensure this is a string
    mock_db_session.session_type = "TECHNICAL"
    mock_db_session.context = {}

    mock_interview_orchestrator.active_sessions[session_id] = {
        "session_id": session_id,
        "db_session": mock_db_session,
        "transcript": []
    }
    
    mock_interview_orchestrator.gemini_llm.generate_feedback.return_value = {
        "overall_score": 90, 
        "communication_score": 80, 
        "confidence_score": 85,
        "technical_score": 95,
        "strengths": ["Clear communication", "Good technical knowledge"],
        "improvement_areas": ["Could be more concise"],
        "detailed_feedback": "Great interview overall.",
        "recommendations": ["Practice summarizing answers"]
    }
    
    feedback = await mock_interview_orchestrator.end_session(session_id, [])
    
    assert feedback["overall_score"] == 90
    assert session_id not in mock_interview_orchestrator.active_sessions