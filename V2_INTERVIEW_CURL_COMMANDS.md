# Interview API V2 - cURL Commands

**Base URL:** `http://localhost:3000/interview/v2`  
**Last Updated:** February 1, 2026

---

## 1. Start Interview with Text (JSON)

```bash
curl -X POST http://localhost:3000/interview/v2/start \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "session_id": "sess_1706745600123",
    "role": "Backend Developer",
    "company": "TechCorp",
    "cv_text": "John Doe\n5 years experience in Node.js, Python, and MongoDB...",
    "jd_text": "We are looking for a Backend Developer with strong experience in Node.js..."
  }'
```

---

## 2. Start Interview with File Uploads (RECOMMENDED)

```bash
curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_123" \
  -F "session_id=sess_1706745600123" \
  -F "role=Senior Software Engineer" \
  -F "company=TechCorp" \
  -F "cv_file=@/path/to/resume.pdf" \
  -F "jd_file=@/path/to/job_description.pdf"
```

### With MongoDB IDs

```bash
curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_123" \
  -F "session_id=sess_1706745600123" \
  -F "role=Frontend Developer" \
  -F "company=StartupCo" \
  -F "cv_id=60d5ec49f1b2c8b1f8c4e5a1" \
  -F "jd_id=60d5ec49f1b2c8b1f8c4e5a2"
```

### Mixed Approach (File + MongoDB ID)

```bash
curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_123" \
  -F "session_id=sess_1706745600123" \
  -F "role=DevOps Engineer" \
  -F "company=CloudCo" \
  -F "cv_file=@/path/to/resume.pdf" \
  -F "jd_id=60d5ec49f1b2c8b1f8c4e5a2"
```

### With Direct Text

```bash
curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_123" \
  -F "session_id=sess_1706745600123" \
  -F "role=Data Scientist" \
  -F "company=AI Company" \
  -F "cv_text=John Doe - 5 years of experience in machine learning..." \
  -F "jd_text=Looking for a Data Scientist with ML expertise..."
```

---

## 3. Submit Answer with Audio File

```bash
curl -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=sess_1706745600123" \
  -F "audio_file=@/path/to/answer.wav"
```

### With Video File

```bash
curl -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=sess_1706745600123" \
  -F "video_file=@/path/to/answer.webm"
```

### With Both Audio and Video

```bash
curl -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=sess_1706745600123" \
  -F "audio_file=@/path/to/answer.wav" \
  -F "video_file=@/path/to/answer.webm"
```

---

## 4. Stream Next Question (Server-Sent Events)

```bash
curl -N http://localhost:3000/interview/v2/stream/sess_1706745600123
```

**Note:** The `-N` flag disables buffering for real-time streaming.

**Response Format:**
```
data: {"chunk": "Hello! I'm "}

data: {"chunk": "excited to "}

data: {"chunk": "speak with you..."}

data: {"done": true}
```

---

## 5. Get Session State

```bash
curl -X GET http://localhost:3000/interview/v2/state/sess_1706745600123
```

---

## 6. Get Performance Metrics

```bash
curl -X GET http://localhost:3000/interview/v2/performance/sess_1706745600123
```

---

## 7. Complete Interview and Get Evaluation

```bash
curl -X POST http://localhost:3000/interview/v2/complete/sess_1706745600123 \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 8. Get Global Metrics (Admin)

```bash
curl -X GET http://localhost:3000/interview/v2/metrics/global
```

---

## 9. Reset Metrics (Admin)

```bash
curl -X POST http://localhost:3000/interview/v2/metrics/reset
```

---

## Complete Interview Flow Example

### Step 1: Start Interview with Files

```bash
curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_123" \
  -F "session_id=sess_$(date +%s)" \
  -F "role=Full Stack Developer" \
  -F "company=Tech Innovations Inc" \
  -F "cv_file=@./resume.pdf" \
  -F "jd_file=@./job_description.pdf"
```

**Expected Response:**
```json
{
  "session_id": "sess_1706745600123",
  "status": "active",
  "question": "Hello! I'm excited to speak with you about the Full Stack Developer role...",
  "question_number": 1
}
```

---

### Step 2: Submit Answer with Audio

```bash
curl -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=sess_1706745600123" \
  -F "audio_file=@./answer1.wav"
```

**Expected Response (Active):**
```json
{
  "session_id": "sess_1706745600123",
  "status": "active",
  "question": "That's great. Can you tell me about a challenging project you worked on?",
  "question_number": 2,
  "evaluation": {
    "clarity": 8,
    "relevance": 9,
    "depth": 7,
    "feedback": "Clear and relevant answer with good technical details"
  }
}
```

**Expected Response (Completed):**
```json
{
  "session_id": "sess_1706745600123",
  "status": "completed",
  "message": "Interview completed",
  "total_questions": 5
}
```

---

### Step 3: Complete Interview and Get Results

```bash
curl -X POST http://localhost:3000/interview/v2/complete/sess_1706745600123 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "session_id": "sess_1706745600123",
  "status": "completed",
  "total_questions": 5,
  "evaluation": {
    "overall_score": 7.83,
    "recommendation": "hire",
    "clarity": 8.2,
    "relevance": 8.4,
    "depth": 6.9
  },
  "conversation": [
    {
      "question": "Tell me about your experience...",
      "answer": "I have 5 years of experience...",
      "evaluation": {
        "clarity": 8,
        "relevance": 9,
        "depth": 7,
        "feedback": "Good answer"
      }
    }
  ],
  "performance_metrics": {
    "avg_response_time": 2.45,
    "total_response_times": [4.56, 2.12, 2.34, 1.98, 1.23]
  }
}
```

---

## Testing Tips

### 1. Save Session ID from Response

```bash
# Start interview and save session_id
SESSION_ID=$(curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_123" \
  -F "session_id=sess_$(date +%s)" \
  -F "role=Backend Developer" \
  -F "company=TechCorp" \
  -F "cv_file=@./resume.pdf" \
  -F "jd_file=@./jd.pdf" \
  -s | jq -r '.session_id')

echo "Session ID: $SESSION_ID"
```

### 2. Use Session ID in Subsequent Requests

```bash
# Submit answer
curl -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=$SESSION_ID" \
  -F "audio_file=@./answer.wav"

# Get session state
curl -X GET http://localhost:3000/interview/v2/state/$SESSION_ID

# Get performance metrics
curl -X GET http://localhost:3000/interview/v2/performance/$SESSION_ID
```

### 3. Pretty Print JSON Response

```bash
curl -X GET http://localhost:3000/interview/v2/state/sess_1706745600123 | jq '.'
```

### 4. Save Response to File

```bash
curl -X POST http://localhost:3000/interview/v2/complete/sess_1706745600123 \
  -H "Content-Type: application/json" \
  -d '{}' \
  -o interview_results.json

cat interview_results.json | jq '.'
```

### 5. Check HTTP Status Code

```bash
curl -X POST http://localhost:3000/interview/v2/start \
  -H "Content-Type: application/json" \
  -d '{...}' \
  -w "\nHTTP Status: %{http_code}\n"
```

### 6. Include Headers in Output

```bash
curl -i -X GET http://localhost:3000/interview/v2/state/sess_1706745600123
```

### 7. Verbose Output for Debugging

```bash
curl -v -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=sess_1706745600123" \
  -F "audio_file=@./answer.wav"
```

---

## File Upload Examples

### Upload PDF Resume and JD

```bash
curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_123" \
  -F "session_id=sess_$(date +%s)" \
  -F "role=Software Engineer" \
  -F "company=Google" \
  -F "cv_file=@./documents/john_doe_resume.pdf" \
  -F "jd_file=@./documents/google_swe_jd.pdf"
```

### Upload DOCX Resume and TXT JD

```bash
curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_456" \
  -F "session_id=sess_$(date +%s)" \
  -F "role=Product Manager" \
  -F "company=Microsoft" \
  -F "cv_file=@./documents/jane_smith_cv.docx" \
  -F "jd_file=@./documents/ms_pm_description.txt"
```

### Upload WAV Audio Answer

```bash
curl -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=sess_1706745600123" \
  -F "audio_file=@./recordings/answer_q1.wav"
```

### Upload WebM Audio Answer

```bash
curl -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=sess_1706745600123" \
  -F "audio_file=@./recordings/answer_q2.webm"
```

### Upload Video Answer

```bash
curl -X POST http://localhost:3000/interview/v2/answer \
  -F "session_id=sess_1706745600123" \
  -F "video_file=@./recordings/video_answer_q3.webm"
```

---

## Error Handling Examples

### Missing Required Field

```bash
curl -X POST http://localhost:3000/interview/v2/start \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "session_id": "sess_123"
  }'
```

**Response:**
```json
{
  "detail": "role is required"
}
```

### Session Not Found

```bash
curl -X GET http://localhost:3000/interview/v2/state/invalid_session_id
```

**Response:**
```json
{
  "detail": "Session not found"
}
```

### Invalid File Format

```bash
curl -X POST http://localhost:3000/interview/v2/start-with-ids \
  -F "user_id=user_123" \
  -F "session_id=sess_123" \
  -F "role=Developer" \
  -F "company=ABC" \
  -F "cv_file=@./image.jpg" \
  -F "jd_file=@./document.pdf"
```

**Response:**
```json
{
  "detail": "Invalid file format. Only PDF, DOCX, and TXT are supported"
}
```

---

## Quick Reference

| Endpoint | Method | cURL Command |
|----------|--------|--------------|
| Start Interview (JSON) | POST | `curl -X POST http://localhost:3000/interview/v2/start -H "Content-Type: application/json" -d '{...}'` |
| Start Interview (Files) | POST | `curl -X POST http://localhost:3000/interview/v2/start-with-ids -F "cv_file=@resume.pdf" -F "jd_file=@jd.pdf" ...` |
| Submit Answer | POST | `curl -X POST http://localhost:3000/interview/v2/answer -F "session_id=..." -F "audio_file=@answer.wav"` |
| Stream Question | GET | `curl -N http://localhost:3000/interview/v2/stream/{session_id}` |
| Get Session State | GET | `curl http://localhost:3000/interview/v2/state/{session_id}` |
| Get Performance | GET | `curl http://localhost:3000/interview/v2/performance/{session_id}` |
| Complete Interview | POST | `curl -X POST http://localhost:3000/interview/v2/complete/{session_id} -d '{}'` |
| Global Metrics | GET | `curl http://localhost:3000/interview/v2/metrics/global` |
| Reset Metrics | POST | `curl -X POST http://localhost:3000/interview/v2/metrics/reset` |

---

## Supported File Formats

### Resume/JD Files (start-with-ids)
- **PDF** (.pdf) - Recommended
- **DOCX** (.docx) - Microsoft Word
- **TXT** (.txt) - Plain text
- **Max Size:** 10MB per file

### Audio Files (answer)
- **WAV** (.wav)
- **WebM** (.webm)
- **MP3** (.mp3)
- **Max Size:** 20MB

### Video Files (answer)
- **WebM** (.webm)
- **MP4** (.mp4)
- **Max Size:** 20MB

---

**Version:** 2.0.0  
**Status:** ✅ Production Ready
