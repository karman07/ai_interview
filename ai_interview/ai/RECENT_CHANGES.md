# Recent Changes

## File Storage Updates
- **PDF files now saved on server** instead of database
- Files stored in `uploads/resumes/` and `uploads/jobs/` directories
- **Auto-add .pdf extension** for files without extensions
- Database stores only file paths and extracted text content

## New Endpoint: Match Score
- **POST /match-score** - Get AI match score between applicant and job description
- Accepts applicant ID and JD (PDF or text)
- Returns match score, missing keywords, and suggestions

### Usage
```bash
curl -X POST "http://localhost:8000/match-score" \
  -F "applicant_id=user_123" \
  -F "jd_file=@job.pdf"
```

### Response
```json
{
  "applicant_id": "user_123",
  "match_score": 85.5,
  "missing_keywords": ["Docker", "AWS"],
  "suggestions": ["Add cloud experience"]
}
```

## Database Changes
- Added `get_resume_by_user_id()` method
- Resume/job records now store `file_path` instead of `filename`
- Improved file handling for all upload endpoints