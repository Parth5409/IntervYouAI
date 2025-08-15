"""
Database utilities and connection management
"""

import os
import logging
from typing import Optional
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, JSON
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:password@localhost/interview_db"
)

# Create database engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    resume_filename = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class InterviewSession(Base):
    """Interview session model"""
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    session_type = Column(String, nullable=False)  # TECHNICAL, HR, GD, SALARY
    status = Column(String, default="created")  # created, active, completed, failed
    context = Column(JSON, nullable=True)
    transcript = Column(JSON, nullable=True)
    feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    question_count = Column(Integer, default=0)

def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

async def init_db():
    """Initialize database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_data: dict) -> User:
    """Create new user"""
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user_id: str, update_data: dict) -> Optional[User]:
    """Update user"""
    user = get_user_by_id(db, user_id)
    if user:
        for key, value in update_data.items():
            setattr(user, key, value)
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
    return user

def create_interview_session(db: Session, session_data: dict) -> InterviewSession:
    """Create new interview session"""
    session = InterviewSession(**session_data)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_user_sessions(db: Session, user_id: str, limit: int = 10) -> list:
    """Get user's interview sessions"""
    return (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user_id)
        .order_by(InterviewSession.created_at.desc())
        .limit(limit)
        .all()
    )

def get_session_by_id(db: Session, session_id: str) -> Optional[InterviewSession]:
    """Get session by ID"""
    return db.query(InterviewSession).filter(InterviewSession.id == session_id).first()

def update_session(db: Session, session_id: str, update_data: dict) -> Optional[InterviewSession]:
    """Update interview session"""
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if session:
        for key, value in update_data.items():
            setattr(session, key, value)
        db.commit()
        db.refresh(session)
    return session