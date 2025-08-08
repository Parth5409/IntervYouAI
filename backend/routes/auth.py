"""
Authentication routes
"""

import logging
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session

from models.pydantic_models import UserRegistration, UserLogin, Token, APIResponse
from utils.database import get_db, get_user_by_email, create_user
from utils.auth import hash_password, verify_password, create_access_token

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=APIResponse)
async def register_user(user_data: UserRegistration, response: Response, db: Session = Depends(get_db)):
    """Register new user"""
    try:
        # Check if user already exists
        if get_user_by_email(db, user_data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create user
        user_dict = {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "password_hash": hashed_password,
            "career_goal": user_data.career_goal
        }
        
        user = create_user(db, user_dict)
        
        # Create token
        token_data = {"user_id": user.id, "email": user.email}
        access_token = create_access_token(token_data)

        # Set HttpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=True # Set to True in production
        )
        
        return APIResponse(
            success=True,
            message="User registered successfully",
            data={
                "user": {
                    "id": user.id,
                    "fullName": user.full_name,
                    "email": user.email
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=APIResponse)
async def login_user(user_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Login user"""
    try:
        # Get user
        user = get_user_by_email(db, user_data.email)
        if not user or not verify_password(user_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create token
        token_data = {"user_id": user.id, "email": user.email}
        access_token = create_access_token(token_data)

        # Set HttpOnly cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            secure=True # Set to True in production
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
