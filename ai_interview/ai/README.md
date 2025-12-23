# AI Resume-Job Matcher API

FastAPI application for intelligent resume and job description matching using Google Gemini AI.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment:
```bash
# Add your Gemini API key to .env file
GEMINI_API_KEY=your_actual_gemini_api_key
```

3. Run the application:
```bash
python main.py
```

## API Endpoints

### POST /analyze
Analyze match between resume and job description.
- Accepts: PDF files or text input
- Returns: match score, missing keywords, suggestions, improved resume

### POST /generate-job
Generate job description from resume.
- Accepts: Resume PDF or text
- Returns: Tailored job description

### POST /generate-resume
Generate resume from job description.
- Accepts: Job description PDF or text
- Returns: Tailored resume

### POST /upload-resume
Upload and store a resume in the database.
- Accepts: Resume PDF or text
- Returns: Resume ID

### POST /upload-job
Upload and store a job description in the database.
- Accepts: Job description PDF or text
- Returns: Job ID

### POST /best-job-for-resume
Find the best matching job for a given resume.
- Accepts: Resume PDF or text
- Returns: Best matching job with score and suggestions

### POST /best-resume-for-job
Find the best matching resume for a given job description.
- Accepts: Job description PDF or text
- Returns: Best matching resume with score and suggestions

## Usage Examples

```bash
# Upload resume
curl -X POST "http://localhost:8000/upload-resume" \
  -F "resume_text=Your resume content here"

# Upload job description
curl -X POST "http://localhost:8000/upload-job" \
  -F "job_text=Job description here" \
  -F "job_title=Software Engineer"

# Find best job for resume
curl -X POST "http://localhost:8000/best-job-for-resume" \
  -F "resume_text=Your resume content"

# Find best resume for job
curl -X POST "http://localhost:8000/best-resume-for-job" \
  -F "job_text=Job description content"

# Analyze resume-job match
curl -X POST "http://localhost:8000/analyze" \
  -F "resume_text=Your resume content here" \
  -F "job_text=Job description here"
```

Access API docs at: http://localhost:8000/docs