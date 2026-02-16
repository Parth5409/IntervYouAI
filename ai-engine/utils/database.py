"""
Database utilities and connection management (Async Version)
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Optional, AsyncGenerator
from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, JSON, ForeignKey, select
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, joinedload
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

# Point to the shared 'intervyouai' database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:root@localhost/intervyouai")
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
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    role = Column(String, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    # Relationships
    sessions = relationship("InterviewSession", back_populates="student")

class PlacementDrive(Base):
    __tablename__ = "placement_drives"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    min_cgpa = Column(Integer, nullable=True) # Mapped as Decimal in Java, Integer/Float here? Java: BigDecimal.
    tpo_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    drive_id = Column(UUID(as_uuid=True), ForeignKey('placement_drives.id'), nullable=False)
    session_type = Column(String, nullable=True)
    status = Column(String, default="created")
    difficulty = Column(String, nullable=True)
    duration_minutes = Column(Integer, default=0)
    overall_score = Column(Integer, default=0)
    context = Column(JSON, nullable=True)
    transcript = Column(JSON, nullable=True)
    feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student = relationship("User", back_populates="sessions")
    drive = relationship("PlacementDrive")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

@asynccontextmanager
async def db_session_context() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    # We DO NOT want ai-engine to create tables anymore, backend-core handles migrations.
    # But for development/verification, ensuring they exist is okay. 
    # Ideally, we should skip Base.metadata.create_all if tables exist.
    # For now, we assume backend-core has run.
    pass

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    # user_id string needs to be converted to UUID if passed as string? 
    # SQLAlchemy might handle it if column is UUID.
    try:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()
    except Exception:
        return None

async def get_session_by_id(db: AsyncSession, session_id: str) -> Optional[InterviewSession]:
    try:
        if isinstance(session_id, str):
            session_id = uuid.UUID(session_id)
        result = await db.execute(
            select(InterviewSession)
            .options(joinedload(InterviewSession.student))
            .where(InterviewSession.id == session_id)
        )
        return result.scalars().first()
    except Exception:
        return None
