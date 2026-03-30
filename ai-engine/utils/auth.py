"""
Authentication utilities for JWT handling (Stateless Version for AI Engine)
"""

import os
import base64
from jose import JWTError, jwt
import logging
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status, Request
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Use the same secret key as backend-core
RAW_SECRET = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET")
if not RAW_SECRET:
    raise RuntimeError("SECRET_KEY or JWT_SECRET environment variable is required")

try:
    # Match backend-core logic: attempt Base64 decode first
    SECRET_KEY = base64.b64decode(RAW_SECRET)
    # Verify if it was actually base64 or just random bytes that decoded
    # backend-core uses Decoders.BASE64.decode(jwtSecret)
    logger.info("JWT Secret initialized using Base64 decoding")
except Exception:
    SECRET_KEY = RAW_SECRET.encode()
    logger.warning("JWT Secret initialized using raw bytes (Base64 decode failed)")

ALGORITHM = "HS256"

class CurrentUser(BaseModel):
    id: str
    email: str
    role: Optional[str] = None

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(request: Request) -> CurrentUser:
    """
    Get current authenticated user from Authorization header.
    Validates JWT issued by backend-core.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = verify_token(token)
        user_id = payload.get("user_id")
        email = payload.get("sub")
        role = payload.get("role")
        
        if user_id is None or email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return CurrentUser(id=user_id, email=email, role=role)
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )