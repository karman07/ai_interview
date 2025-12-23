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
**Description**: Find top matching jobs for given resume (default: 10 results)

**Request**:
- `resume_file` (optional): PDF file
- `resume_text` (optional): Text string
- `limit` (optional): Number of results (1-50, default: 10)

**Response** (Success):
```json
{
  "matches": [
    {
      "job_id": "job_1_1703123456",
      "job_title": "Senior Software Engineer",
      "match_score": 95,
      "missing_keywords": ["React", "Node.js"],
      "suggestions": ["Add frontend framework experience"],
      "job_content": "Full job description text..."
    },
    {
      "job_id": "job_2_1703123457",
      "job_title": "Full Stack Developer",
      "match_score": 88,
      "missing_keywords": ["Docker", "AWS"],
      "suggestions": ["Include cloud platform knowledge"],
      "job_content": "Full job description text..."
    }
  ],
  "total": 15,
  "showing": 10,
  "error": null
}
```

**Response** (No jobs available):
```json
{
  "matches": [],
  "total": 0,
  "showing": 0,
  "error": "No jobs available"
}
```

---

### 7. POST /best-resume-for-job
**Description**: Find top matching resumes for given job description (default: 10 results)

**Request**:
- `job_file` (optional): PDF file
- `job_text` (optional): Text string
- `limit` (optional): Number of results (1-50, default: 10)

**Response** (Success):
```json
{
  "matches": [
    {
      "resume_id": "resume_1_1703123456",
      "resume_filename": "john_doe_resume.pdf",
      "match_score": 92,
      "missing_keywords": ["Kubernetes", "CI/CD"],
      "suggestions": ["Add container orchestration experience"],
      "resume_content": "Full resume text..."
    },
    {
      "resume_id": "resume_2_1703123457",
      "resume_filename": "jane_smith_resume.pdf",
      "match_score": 85,
      "missing_keywords": ["GraphQL", "MongoDB"],
      "suggestions": ["Include database experience"],
      "resume_content": "Full resume text..."
    }
  ],
  "total": 8,
  "showing": 8,
  "error": null
}
```

**Response** (No resumes available):
```json
{
  "matches": [],
  "total": 0,
  "showing": 0,
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

**400 Bad Request** (Empty content):
```json
{
  "detail": "Resume content is empty"
}
```

**400 Bad Request** (Invalid limit):
```json
{
  "detail": "Limit must be between 1 and 50"
}
```

**500 Internal Server Error**:
```json
{
  "detail": "Failed to process request: Error message"
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

# Find top 10 jobs for resume (default)
curl -X POST "http://localhost:8000/best-job-for-resume" \
  -F "resume_text=Python developer with ML experience..."

# Find top 5 jobs for resume (custom limit)
curl -X POST "http://localhost:8000/best-job-for-resume" \
  -F "resume_text=Python developer with ML experience..." \
  -F "limit=5"

# Find top 10 resumes for job (default)
curl -X POST "http://localhost:8000/best-resume-for-job" \
  -F "job_text=Full Stack Developer position..."

# Find top 3 resumes for job (custom limit)
curl -X POST "http://localhost:8000/best-resume-for-job" \
  -F "job_text=Full Stack Developer position..." \
  -F "limit=3"
```

## Interactive Documentation
Visit `http://localhost:8000/docs` for Swagger UI documentation.