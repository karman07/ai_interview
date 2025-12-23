# AI Resume-Job Matcher API Documentation (MongoDB)

## Base URL
```
http://localhost:8000
```

## Database
- **MongoDB**: job_finder database
- **Collections**: resumes, jobs
- **Constraint**: One resume per user_id

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
**Description**: Upload and store resume (one per user)

**Request**:
- `user_id` (required): User identifier string
- `resume_file` (optional): PDF file
- `resume_text` (optional): Text string

**Response**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "message": "Resume uploaded successfully"
}
```

**Note**: If user already has a resume, it will be updated.

---

### 5. POST /upload-job
**Description**: Upload and store job description

**Request**:
- `job_file` (optional): PDF file
- `job_text` (optional): Text string
- `job_title` (optional): Job title string

**Response**:
```json
{
  "id": "507f1f77bcf86cd799439012",
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
      "job_id": "507f1f77bcf86cd799439012",
      "job_title": "Senior Software Engineer",
      "match_score": 95,
      "missing_keywords": ["React", "Node.js"],
      "suggestions": ["Add frontend framework experience"],
      "job_content": "Full job description text..."
    }
  ],
  "total": 15,
  "showing": 10,
  "error": null
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
      "resume_id": "507f1f77bcf86cd799439011",
      "resume_filename": "john_doe_resume.pdf",
      "match_score": 92,
      "missing_keywords": ["Kubernetes", "CI/CD"],
      "suggestions": ["Add container orchestration experience"],
      "resume_content": "Full resume text..."
    }
  ],
  "total": 8,
  "showing": 8,
  "error": null
}
```

---

## Error Responses

**400 Bad Request**:
```json
{
  "detail": "User ID is required"
}
```

**400 Bad Request** (Empty content):
```json
{
  "detail": "Resume content is empty"
}
```

**500 Internal Server Error**:
```json
{
  "detail": "Failed to upload resume: Connection error"
}
```

---

## Usage Examples

```bash
# Upload resume (required user_id)
curl -X POST "http://localhost:8000/upload-resume" \
  -F "user_id=user123" \
  -F "resume_text=Software Engineer with 5 years experience..."

# Update existing resume (same user_id)
curl -X POST "http://localhost:8000/upload-resume" \
  -F "user_id=user123" \
  -F "resume_text=Updated resume content..."

# Upload job
curl -X POST "http://localhost:8000/upload-job" \
  -F "job_text=Looking for Senior Developer..." \
  -F "job_title=Senior Software Engineer"

# Find top 5 jobs for resume
curl -X POST "http://localhost:8000/best-job-for-resume" \
  -F "resume_text=Python developer..." \
  -F "limit=5"
```

## Database Schema

### Resumes Collection
```json
{
  "_id": "ObjectId",
  "user_id": "string (unique)",
  "content": "string",
  "filename": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Jobs Collection
```json
{
  "_id": "ObjectId",
  "content": "string",
  "title": "string",
  "created_at": "datetime"
}
```