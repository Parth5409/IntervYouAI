"""
Authentication routes (Async Version)
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from models.pydantic_models import UserRegistration, UserLogin, APIResponse
from utils.database import get_db, get_user_by_email, User
from utils.auth import hash_password, verify_password, create_access_token

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=APIResponse)
async def register_user(user_data: UserRegistration, response: Response, db: AsyncSession = Depends(get_db)):
    """Register new user"""
    try:
        existing_user = await get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        new_user = User(
            email=user_data.email,
            full_name=user_data.full_name,
            password_hash=hash_password(user_data.password),
            career_goal=user_data.career_goal
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        token_data = {"user_id": new_user.id, "email": new_user.email}
        access_token = create_access_token(token_data)

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=True
        )
        
        return APIResponse(
            success=True,
            message="User registered successfully",
            data={
                "user": {
                    "id": new_user.id,
                    "fullName": new_user.full_name,
                    "email": new_user.email
                }
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=APIResponse)
async def login_user(user_data: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    """Login user"""
    try:
        user = await get_user_by_email(db, user_data.email)
        if not user or not verify_password(user_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        token_data = {"user_id": user.id, "email": user.email}
        access_token = create_access_token(token_data)

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=True
        )
        
        return APIResponse(
            success=True,
            message="Login successful",
            data={
                "user": {
                    "email": user.email,
                    "name": user.full_name
                }
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )
