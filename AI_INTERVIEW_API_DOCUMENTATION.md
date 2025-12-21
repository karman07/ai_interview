# AI Interview API Documentation

## Overview
Complete API documentation for the AI Interview Platform with resume upload and interview management capabilities.

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## 🚀 Interview APIs

### 1. Start Interview (Basic)
**POST** `/ai-interview/start`

```json
{
  "user_id": "string",
  "session_id": "string",
  "role_title": "Software Engineer",
  "company_name": "Tech Corp",
  "industry": "Technology",
  "jd": "Job description text...",
  "cv": "Resume content text...",
  "round_type": "full"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "string",
  "first_question": "Tell me about yourself...",
  "total_questions": 10
}
```

### 2. Start Interview with Resume Upload
**POST** `/ai-interview/start-with-resume`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `resume`: File (PDF/DOC/TXT)
- `user_id`: string
- `session_id`: string
- `role_title`: string
- `company_name`: string
- `industry`: string
- `jd`: string
- `round_type`: "technical" | "behavioral" | "hr" | "full"

**cURL Example:**
```bash
curl -X POST http://localhost:3000/ai-interview/start-with-resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@path/to/resume.pdf" \
  -F "user_id=user123" \
  -F "session_id=session456" \
  -F "role_title=Software Engineer" \
  -F "company_name=Tech Corp" \
  -F "industry=Technology" \
  -F "jd=Job description here..." \
  -F "round_type=full"
```

### 3. Start Interview with CV Text
**POST** `/ai-interview/start-with-cv-text`

```json
{
  "user_id": "string",
  "session_id": "string",
  "role_title": "Software Engineer",
  "company_name": "Tech Corp",
  "industry": "Technology",
  "jd": "Job description text...",
  "cv": "Resume content as text...",
  "round_type": "full"
}
```

### 4. Submit Answer
**POST** `/ai-interview/answer`

```json
{
  "user_id": "string",
  "session_id": "string",
  "answer": "My answer to the question..."
}
```

**Response:**
```json
{
  "success": true,
  "next_question": "What are your strengths?",
  "question_number": 2,
  "remaining_questions": 8
}
```

---

## 📊 Session Management

### 5. Get Interview State
**GET** `/ai-interview/state/:userId/:sessionId`

**Response:**
```json
{
  "user_id": "string",
  "session_id": "string",
  "current_question": "What motivates you?",
  "questions_asked": 3,
  "total_questions": 10,
  "status": "in_progress",
  "round_type": "full"
}
```

### 6. Get Interview Report
**GET** `/ai-interview/report/:userId/:sessionId`

**Response:**
```json
{
  "user_id": "string",
  "session_id": "string",
  "overall_score": 85,
  "feedback": {
    "technical_skills": "Strong programming knowledge",
    "communication": "Clear and articulate responses"
  },
  "strengths": ["Problem solving", "Technical expertise"],
  "weaknesses": ["Could improve leadership examples"],
  "recommendations": ["Practice behavioral questions"]
}
```

### 7. List User Sessions
**GET** `/ai-interview/sessions/:userId`

**Response:**
```json
[
  {
    "session_id": "session123",
    "role_title": "Software Engineer",
    "company_name": "Tech Corp",
    "status": "completed",
    "score": 85,
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### 8. List All Sessions
**GET** `/ai-interview/sessions`

---

## 🎯 Advanced Session APIs

### 9. Create Session
**POST** `/ai-interview/session/create`

```json
{
  "role": "Software Engineer",
  "industry": "Technology",
  "company": "Tech Corp",
  "cv_file_id": "optional_file_id",
  "jd_file_id": "optional_jd_file_id"
}
```

### 10. Get Session Details
**GET** `/ai-interview/session/:sessionId`

### 11. Get Next Question
**GET** `/ai-interview/session/:sessionId/next-question`

**Response:**
```json
{
  "question_id": "q123",
  "question": "Describe a challenging project you worked on",
  "question_type": "behavioral",
  "time_limit": 300
}
```

### 12. Submit Session Answer
**POST** `/ai-interview/session/:sessionId/answer`

```json
{
  "question_id": "q123",
  "text": "Answer text...",
  "audio_url": "optional_audio_url",
  "video_url": "optional_video_url",
  "response_duration": 120
}
```

### 13. Upload Media Response
**POST** `/ai-interview/session/:sessionId/upload-response`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: Audio/Video files (max 2)
- `question_id`: string
- `text`: string (optional)
- `response_duration`: number (optional)

**cURL Example:**
```bash
curl -X POST http://localhost:3000/ai-interview/session/session123/upload-response \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@audio_response.mp3" \
  -F "files=@video_response.mp4" \
  -F "question_id=q123" \
  -F "text=My spoken answer..." \
  -F "response_duration=180"
```

### 14. Get Session Report
**GET** `/ai-interview/session/:sessionId/report`

### 15. Delete Session
**DELETE** `/ai-interview/session/:sessionId`

---

## 🔐 Authentication APIs

### 16. Signup
**POST** `/auth/signup`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### 17. Login
**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 18. Google Login
**POST** `/auth/google`

```json
{
  "idToken": "google_id_token"
}
```

### 19. Logout
**GET** `/auth/logout`

### 20. Refresh Token
**POST** `/auth/refresh`

```json
{
  "userId": "user123",
  "email": "user@example.com"
}
```

---

## 📄 Resume Management

### 21. Upload Resume
**POST** `/resume/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: Resume file(s)
- `jd_text`: Job description text (optional)

### 22. Get Resume History
**GET** `/resume/history`

### 23. Improve Resume
**PATCH** `/resume/improve/:id`

---

## 🎯 Round Types

- `technical`: Technical questions only
- `behavioral`: Behavioral questions only  
- `hr`: HR-related questions only
- `full`: Complete interview (all types)

---

## 📝 Error Responses

All APIs return consistent error format:

```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2024-01-01T10:00:00.000Z",
  "path": "/api/endpoint",
  "method": "POST",
  "message": "Error description"
}
```

**Common Status Codes:**
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## 🚀 Complete Interview Flow

### Step 1: Authentication
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Step 2: Start Interview with Resume
```bash
# Start interview with resume upload
curl -X POST http://localhost:3000/ai-interview/start-with-resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@resume.pdf" \
  -F "user_id=user123" \
  -F "session_id=session456" \
  -F "role_title=Software Engineer" \
  -F "company_name=Tech Corp" \
  -F "industry=Technology" \
  -F "jd=Looking for a skilled software engineer..." \
  -F "round_type=full"
```

### Step 3: Answer Questions
```bash
# Submit answer
curl -X POST http://localhost:3000/ai-interview/answer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "session_id": "session456", 
    "answer": "I am a passionate software engineer with 5 years of experience..."
  }'
```

### Step 4: Get Final Report
```bash
# Get interview report
curl -X GET http://localhost:3000/ai-interview/report/user123/session456 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📱 File Upload Limits

- **Resume files**: PDF, DOC, DOCX, TXT (max 10MB)
- **Audio files**: MP3, WAV, M4A (max 50MB)
- **Video files**: MP4, MOV, AVI (max 100MB)

---

## 🔧 Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/ai_interview
JWT_SECRET=your_jwt_secret
AI_INTERVIEW_API_BASE_URL=http://34.27.237.113:8000
UPLOAD_DIR=uploads/resumes
PORT=3000
```

---

## ✅ Success Response Format

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```