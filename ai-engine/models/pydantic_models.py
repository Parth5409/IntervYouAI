"""
Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Literal, Union
from uuid import UUID
from pydantic import BaseModel, Field
from enum import Enum

# Interview Session Models
class SessionType(str, Enum):
    TECHNICAL = "TECHNICAL"
    HR = "HR"
    GD = "GD"
    SALARY = "SALARY"
    HR_SALARY = "HR_SALARY"

class DifficultyLevel(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"
    
    # Adding Uppercase variants for frontend compatibility
    EASY_UPPER = "EASY"
    MEDIUM_UPPER = "MEDIUM"
    HARD_UPPER = "HARD"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            for member in cls:
                if member.value.upper() == value.upper():
                    return member
        return None

class InterviewSessionCreate(BaseModel):
    session_type: Optional[SessionType] = None
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    max_questions: int = Field(default=5, ge=3, le=15)

class MissionSessionCreate(InterviewSessionCreate):
    drive_id: str
    company_name: str
    job_role: str
    jd_text: str
    min_lpa: Optional[float] = None
    max_lpa: Optional[float] = None
    round_type: str # TECHNICAL, HR_SALARY, GD
    negotiation_style: Optional[str] = "collaborative"
    configJson: Optional[Union[str, Dict[str, Any]]] = None

class TechnicalInterviewCreate(InterviewSessionCreate):
    company_name: str
    job_role: str
    topics: Optional[List[str]] = None

class HRInterviewCreate(InterviewSessionCreate):
    company_name: Optional[str] = None
    job_role: str
    experience_level: Literal["entry", "mid", "expert"] = "mid"
    industry: Optional[str] = None

class SalaryNegotiationCreate(InterviewSessionCreate):
    company_name: Optional[str] = None
    job_role: str
    experience_level: Literal["entry", "mid", "expert"] = "mid"
    industry: Optional[str] = None
    negotiation_style: Optional[str] = None
    salary_range: Optional[str] = None

class GroupDiscussionCreate(InterviewSessionCreate):
    topic: str
    group_size: Optional[str] = None
    duration_minutes: int

class InterviewSessionResponse(BaseModel):
    id: Union[str, UUID]
    drive_id: Optional[Union[str, UUID]] = None
    session_type: SessionType
    status: Literal["created", "active", "completed", "failed"]
    created_at: datetime
    duration_minutes: int
    difficulty: DifficultyLevel
    context: Dict[str, Any]
    feedback: Optional[Dict[str, Any]] = None
    transcript: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True

# Message Models
class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime
    session_id: str

class UserMessage(BaseModel):
    message: str

class AIResponse(BaseModel):
    message: str
    session_id: str
    message_type: Literal["question", "response", "feedback"] = "response"
    metadata: Optional[Dict[str, Any]] = None

# Group Discussion Models
class GDParticipant(BaseModel):
    id: str
    name: str
    personality: Literal["supportive", "assertive", "factual", "analytical", "creative", "human"]
    is_human: bool = False

class GDSession(BaseModel):
    topic: str
    participants: List[GDParticipant]
    duration_minutes: int = 20
    current_speaker: Optional[str] = None
    turn_order: List[str] = []

class GDMessage(BaseModel):
    speaker_id: str
    speaker_name: str
    message: str
    timestamp: str
    turn_number: int

# Feedback Models
class InterviewFeedback(BaseModel):
    session_id: str
    overall_score: int = Field(..., ge=0, le=100)
    technical_score: Optional[int] = Field(None, ge=0, le=100)
    communication_score: int = Field(..., ge=0, le=100)
    confidence_score: int = Field(..., ge=0, le=100)
    strengths: List[str]
    improvement_areas: List[str]
    detailed_feedback: str
    recommendations: List[str]

class EndSessionPayload(BaseModel):
    transcript: List[Dict[str, Any]]

class GDSessionData(BaseModel):
    topic: str
    duration_minutes: int = 20

class GDFeedback(BaseModel):
    session_id: str
    participation_score: int = Field(..., ge=0, le=100)
    initiative_score: int = Field(..., ge=0, le=100)
    clarity_score: int = Field(..., ge=0, le=100)
    collaboration_score: int = Field(..., ge=0, le=100)
    topic_understanding: int = Field(..., ge=0, le=100)
    strengths: List[str]
    improvement_suggestions: List[str]
    key_contributions: List[str]
    overall_feedback: str

# Resume and Document Models
class ResumeUpload(BaseModel):
    filename: str
    file_size: int
    upload_status: Literal["processing", "completed", "failed"]
    extracted_skills: Optional[List[str]] = None
    experience_years: Optional[int] = None
    job_titles: Optional[List[str]] = None

class DocumentChunk(BaseModel):
    content: str
    metadata: Dict[str, Any]
    chunk_index: int

# Company Data Models
class CompanyQuestion(BaseModel):
    id: str
    company: str
    topic: str
    difficulty: Literal["easy", "medium", "hard"]
    question: str
    category: Literal["technical", "behavioral", "system_design"]

class CompanyData(BaseModel):
    name: str
    total_questions: int
    topics: List[str]
    difficulty_distribution: Dict[str, int]

# WebSocket Models
class SocketMessage(BaseModel):
    event: str
    data: Dict[str, Any]
    session_id: Optional[str] = None
    user_id: Optional[str] = None

class ConnectionInfo(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    connection_time: datetime

# API Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error_code: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

# Settings Models
class AppSettings(BaseModel):
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_file_types: List[str] = ["pdf", "doc", "docx", "csv"]
    max_session_duration: int = 120  # minutes
    ollama_base_url: str = "http://localhost:11434"
    vector_store_path: str = "./vector_stores"
    session_timeout: int = 3600  # seconds

    class Config:
        env_prefix = "APP_"