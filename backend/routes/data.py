"""
Data routes for companies, topics, etc.
"""

import logging
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from models.pydantic_models import APIResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# Define the path to the company CSVs directory
COMPANY_CSV_PATH = Path(__file__).parent.parent / "uploads" / "company_csv"

GD_TOPICS = [
    {"value": "ai-job-displacement", "label": "AI and Job Displacement"},
    {"value": "remote-work-future", "label": "The Future of Remote Work"},
    {"value": "climate-change-tech", "label": "Technology's Role in Climate Change"},
    {"value": "social-media-impact", "label": "Social Media's Impact on Society"},
    {"value": "data-privacy-rights", "label": "Data Privacy and Digital Rights"},
]

@router.get("/setup/companies")
async def get_companies():
    """Get list of available companies from the CSV directory"""
    if not COMPANY_CSV_PATH.exists() or not COMPANY_CSV_PATH.is_dir():
        logger.warning(f"Company CSV directory not found at: {COMPANY_CSV_PATH}")
        return APIResponse(
            success=True,
            message="No companies available",
            data=[]
        )
    
    companies = []
    for f in COMPANY_CSV_PATH.iterdir():
        if f.is_file() and f.suffix.lower() == '.csv':
            company_name = f.stem.replace('_', ' ').title()
            companies.append({"value": f.stem, "label": company_name})
            
    return APIResponse(
        success=True,
        message="Companies retrieved successfully",
        data=companies
    )

@router.get("/setup/topics")
async def get_gd_topics():
    """Get list of Group Discussion topics"""
    return APIResponse(
        success=True,
        message="GD topics retrieved successfully",
        data=GD_TOPICS
    )

