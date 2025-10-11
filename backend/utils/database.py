"""
Database utilities and connection management (Async Version)
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession


from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, JSON, ForeignKey, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, joinedload
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# The DATABASE_URL now uses the 'postgresql+asyncpg' scheme
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:root@localhost/interview_db")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()

class User(Base):
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
    resume_vs_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    sessions = relationship("InterviewSession", back_populates="user")

class InterviewSession(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    session_type = Column(String, nullable=False)
    status = Column(String, default="created")
    difficulty = Column(String, default="Medium")
    context = Column(JSON, nullable=True)
    transcript = Column(JSON, nullable=True)
    feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    question_count = Column(Integer, default=0)
    user = relationship("User", back_populates="sessions")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

@asynccontextmanager
async def db_session_context() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database initialized successfully")

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def get_session_by_id(db: AsyncSession, session_id: str) -> Optional[InterviewSession]:
    result = await db.execute(
        select(InterviewSession).options(joinedload(InterviewSession.user)).where(InterviewSession.id == session_id)
    )
    return result.scalars().first()
