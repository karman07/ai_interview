# AI Resume-Job Matcher API Documentation

## Base URL
```
http://localhost:8000
```

## Routes

### 1. GET /
**Description**: Health check endpoint

**Response**:
```json
{
  "message": "AI Resume-Job Matcher API",
  "version": "1.0.0"
}
```

---

### 2. POST /generate-job
**Description**: Generate job description from resume

**Request**:
- `resume_file` (optional): PDF file
- `resume_text` (optional): Text string

**Response**:
```json
{
  "job_description": "Software Engineer position requiring..."
}
```

---

### 3. POST /generate-resume
**Description**: Generate resume from job description

**Request**:
- `job_file` (optional): PDF file
- `job_text` (optional): Text string

**Response**:
```json
{
  "resume": "Professional resume tailored for the position..."
}
```

---

### 4. POST /upload-resume
**Description**: Upload and store resume in database

**Request**:
- `resume_file` (optional): PDF file
- `resume_text` (optional): Text string

**Response**:
```json
{
  "id": "resume_1_1703123456",
  "message": "Resume uploaded successfully"
}
```

---

### 5. POST /upload-job
**Description**: Upload and store job description in database

**Request**:
- `job_file` (optional): PDF file
- `job_text` (optional): Text string
- `job_title` (optional): Job title string

**Response**:
```json
{
  "id": "job_1_1703123456",
  "message": "Job description uploaded successfully"
}
```

---

### 6. POST /best-job-for-resume
**Description**: Find best matching job for given resume

**Request**:
- `resume_file` (optional): PDF file
- `resume_text` (optional): Text string

**Response** (Success):
```json
{
  "job_id": "job_1_1703123456",
  "job_title": "Software Engineer",
  "match_score": 92,
  "missing_keywords": ["React", "Node.js"],
  "suggestions": [
    "Add frontend framework experience",
    "Include backend development skills"
  ],
  "job_content": "Full job description text...",
  "error": null
}
```

**Response** (No jobs available):
```json
{
  "job_id": null,
  "job_title": null,
  "match_score": null,
  "missing_keywords": null,
  "suggestions": null,
  "job_content": null,
  "error": "No jobs available"
}
```

---

### 7. POST /best-resume-for-job
**Description**: Find best matching resume for given job description

**Request**:
- `job_file` (optional): PDF file
- `job_text` (optional): Text string

**Response** (Success):
```json
{
  "resume_id": "resume_1_1703123456",
  "resume_filename": "john_doe_resume.pdf",
  "match_score": 88,
  "missing_keywords": ["Kubernetes", "CI/CD"],
  "suggestions": [
    "Add container orchestration experience",
    "Include DevOps pipeline knowledge"
  ],
  "resume_content": "Full resume text...",
  "error": null
}
```

**Response** (No resumes available):
```json
{
  "resume_id": null,
  "resume_filename": null,
  "match_score": null,
  "missing_keywords": null,
  "suggestions": null,
  "resume_content": null,
  "error": "No resumes available"
}
```

---

## Error Responses

**400 Bad Request**:
```json
{
  "detail": "Resume file or text required"
}
```

**500 Internal Server Error**:
```json
{
  "detail": "Generation failed: Error message"
}
```

---

## Usage Examples

```bash
# Upload resume
curl -X POST "http://localhost:8000/upload-resume" \
  -F "resume_text=Software Engineer with 5 years experience..."

# Upload job
curl -X POST "http://localhost:8000/upload-job" \
  -F "job_text=Looking for Senior Developer..." \
  -F "job_title=Senior Software Engineer"

# Find best job for resume
curl -X POST "http://localhost:8000/best-job-for-resume" \
  -F "resume_text=Python developer with ML experience..."

# Find best resume for job
curl -X POST "http://localhost:8000/best-resume-for-job" \
  -F "job_text=Full Stack Developer position..."

# Generate job from resume
curl -X POST "http://localhost:8000/generate-job" \
  -F "resume_text=Your resume content..."

# Generate resume from job
curl -X POST "http://localhost:8000/generate-resume" \
  -F "job_text=Job description content..."
```

## Interactive Documentation
Visit `http://localhost:8000/docs` for Swagger UI documentation.