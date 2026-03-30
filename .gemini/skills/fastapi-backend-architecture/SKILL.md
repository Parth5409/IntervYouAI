---
name: fastapi-backend-architecture
description: Official architecture guide for the Interview Platform FastAPI backend.
version: 1.0.0
author: Senior Solutions Architect
---

# FastAPI Backend Architecture

## Project Structure
The backend follows a modular structure separating concerns into routes, models, utilities, and orchestration logic.

```text
backend/
├── main.py                 # App entry point, lifespan, CORS, Socket.IO mount
├── routes/                 # API Endpoints (Auth, User, Data, Session)
├── models/
│   └── pydantic_models.py  # Pydantic schemas for Request/Response
├── utils/
│   ├── database.py         # SQLAlchemy Async Engine, Base, DB Models
│   ├── auth.py             # JWT & Password Hashing
│   └── cloudinary.py       # Media upload wrapper
├── llm/                    # LangChain & Gemini integration
└── orchestrator/           # Business logic for Interview Sessions
```

## Dependency Injection
We use `sqlalchemy.ext.asyncio` for database interactions.
**Rule:** ALWAYS use the `get_db` generator from `utils.database` for DB sessions.

### Pattern
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from utils.database import get_db

router = APIRouter()

@router.get("/example")
async def example_endpoint(db: AsyncSession = Depends(get_db)):
    # ... use db ...
```

## Creating New Endpoints
1.  **Define Router:** Create or update a file in `routes/`.
2.  **Define Models:** Add request/response schemas to `models/pydantic_models.py`.
3.  **Use APIResponse:** Wrap successful responses in `APIResponse` (optional but recommended for consistency).
4.  **Register Router:** Add `app.include_router(...)` in `main.py`.

## Database Interaction
We use **SQLAlchemy 2.0** style queries with `select`.

**Imports:**
```python
from sqlalchemy import select
from utils.database import User, InterviewSession  # Import specific models
```

**Query Pattern:**
```python
result = await db.execute(select(User).where(User.email == email))
user = result.scalars().first()
```

## Error Handling
Use `fastapi.HTTPException` for control flow errors.
Wrap DB operations in `try/except` blocks to handle exceptions and rollback sessions if necessary.

```python
try:
    # ... operation ...
    await db.commit()
except Exception as e:
    await db.rollback()
    logger.error(f"Error: {e}")
    raise HTTPException(status_code=500, detail="Internal Server Error")
```
