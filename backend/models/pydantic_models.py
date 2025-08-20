"""
Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum

# Auth Models
class UserRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)
    phone: Optional[str] = None
    career_goal: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# User Models
class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    career_goal: Optional[str] = None
    profile_image_url: Optional[str] = None
    resume_url: Optional[str] = None
    resume_filename: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    career_goal: Optional[str] = None
    profile_image_url: Optional[str] = None
    resume_url: Optional[str] = None
    resume_filename: Optional[str] = None

# Interview Session Models
class SessionType(str, Enum):
    TECHNICAL = "TECHNICAL"
    HR = "HR"
    GD = "GD"
    SALARY = "SALARY"

class DifficultyLevel(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class InterviewSessionCreate(BaseModel):
    session_type: SessionType
    company_name: Optional[str] = None
    job_role: Optional[str] = None
    experience_level: Literal["junior", "mid", "senior"] = "mid"
    topics: Optional[List[str]] = None
    duration_minutes: int = Field(default=30, ge=10, le=120)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM

class InterviewSessionResponse(BaseModel):
    id: str
    session_type: SessionType
    status: Literal["created", "active", "completed", "failed"]
    created_at: datetime
    duration_minutes: int
    difficulty: DifficultyLevel

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
    personality: Literal["supportive", "assertive", "factual", "analytical", "creative"]
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
    timestamp: datetime
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