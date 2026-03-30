---
name: cloudinary-media-workflow
description: Standard procedure for handling media uploads via Cloudinary in the backend.
version: 1.0.0
---

# Cloudinary Media Workflow

## Overview
We utilize Cloudinary for hosting user assets (profile images, resumes). The integration is wrapped in a dedicated utility to ensure configuration consistency.

## Usage Rule
**STRICT:** Do NOT use the `cloudinary` SDK directly in route logic. You MUST use the `upload_file` function from `utils.cloudinary`.

## Implementation Pattern

### 1. Import Utility
```python
from utils.cloudinary import upload_file
```

### 2. Handle Upload in Route
Accept `UploadFile` in your FastAPI endpoint and pass the file object to the utility.

```python
from fastapi import UploadFile, File

@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...)):
    # upload_file returns the raw Cloudinary response dict
    result = upload_file(file.file, folder="profile_images")
    secure_url = result.get("secure_url")
    return {"url": secure_url}
```

## Database Storage
Image and document URLs are stored as simple `String` columns in the Postgres database.

**Location:** `backend/utils/database.py`

### User Table Schema
*   `profile_image_url`: Stores the avatar URL.
*   `resume_url`: Stores the resume document URL.

### Example Update
```python
user.profile_image_url = result.get("secure_url")
db.add(user)
await db.commit()
```
