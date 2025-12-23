from pydantic import BaseModel
from typing import List, Optional

class JobDescriptionResponse(BaseModel):
    job_description: str

class ResumeResponse(BaseModel):
    resume: str

class TextInput(BaseModel):
    text: str

class UploadResponse(BaseModel):
    id: str
    message: str
    extracted_text_preview: Optional[str] = None

class BestJobsResponse(BaseModel):
    matches: List[dict]
    total: int
    showing: int
    error: Optional[str] = None

class BestResumesResponse(BaseModel):
    matches: List[dict]
    total: int
    showing: int
    error: Optional[str] = None

class MatchScoreResponse(BaseModel):
    applicant_id: str
    match_score: float
    missing_keywords: List[str]
    suggestions: List[str]
    job_title: Optional[str] = None