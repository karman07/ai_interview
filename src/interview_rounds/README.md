# Interview Rounds Module

## Overview

The Interview Rounds module provides a complete REST API for managing AI-powered interview sessions. It acts as a gateway between the NestJS backend and the external AI Interview API service, handling authentication, request routing, and response formatting.

## Architecture

```
Client → NestJS Controller → AI Interview API Service → External AI API (http://34.27.237.113:8000)
```

- **Controller**: `ai-interview.controller.ts` - REST endpoints with JWT authentication
- **Service**: `ai-interview-api.service.ts` - HTTP client for external AI API
- **Module**: `interview.module.ts` - Module configuration and dependencies

## API Endpoints

### Interview Management

#### 1. Start Interview Session
```http
POST /ai-interview/start
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "user_id": "user-123",
  "session_id": "session-123",
  "role_title": "Backend Engineer",
  "company_name": "Acme",
  "industry": "Software",
  "jd": "Design microservices in Python",
  "cv": "Experienced Python backend engineer",
  "round_type": "full"
}
```

**Response:**
```json
{
  "session_id": "session-123",
  "user_id": "user-123",
  "first_question": "What inspired you to pursue a career in software development?",
  "state": {
    "stage": "intro",
    "session_config": {
      "user_id": "user-123",
      "session_id": "session-123",
      "role_title": "Backend Engineer",
      "company_name": "Acme",
      "industry": "Software",
      "jd": "Design microservices in Python",
      "cv": "Experienced Python backend engineer",
      "round_type": "full"
    },
    "history": [
      {
        "question": "What inspired you to pursue a career in software development?",
        "answer": null,
        "evaluation": null,
        "stage": "intro",
        "is_followup": false
      }
    ],
    "should_follow_up": false,
    "completed": false
  }
}
```

#### 2. Submit Answer
```http
POST /ai-interview/answer
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "user_id": "user-123",
  "session_id": "session-123",
  "answer": "My concise answer to the question"
}
```

**Response (During Interview):**
```json
{
  "evaluation": {
    "clarity": 8,
    "confidence": 9,
    "technical_depth": 0,
    "summary": "Candidate provided a clear and confident answer"
  },
  "next_question": "How would you implement circuit breaking in microservices?",
  "state": {
    "stage": "technical",
    "session_config": { ... },
    "history": [
      {
        "question": "What inspired you to pursue a career in software development?",
        "answer": "My concise answer to the question",
        "evaluation": {
          "clarity": 8,
          "confidence": 9,
          "technical_depth": 0,
          "summary": "Candidate provided a clear and confident answer"
        },
        "stage": "intro",
        "is_followup": false
      },
      {
        "question": "How would you implement circuit breaking in microservices?",
        "answer": null,
        "evaluation": null,
        "stage": "technical",
        "is_followup": false
      }
    ],
    "should_follow_up": false,
    "completed": false
  }
}
```

**Response (Interview Complete):**
```json
{
  "evaluation": {
    "clarity": 8,
    "confidence": 9,
    "technical_depth": 0,
    "summary": "Candidate provided a clear and confident answer, but failed to demonstrate technical relevance to the Backend Engineer role."
  },
  "next_question": null,
  "state": {
    "stage": "wrap-up",
    "session_config": {
      "user_id": "user-123",
      "session_id": "session-123",
      "role_title": "Backend Engineer",
      "company_name": "Acme",
      "industry": "Software",
      "jd": "Design microservices in Python",
      "cv": "Experienced Python backend engineer",
      "round_type": "full"
    },
    "history": [
      {
        "question": "What inspired you to pursue a career in software development, specifically backend engineering?",
        "answer": "My concise answer to the question",
        "evaluation": {
          "clarity": 8,
          "confidence": 9,
          "technical_depth": 0,
          "summary": "The candidate provided a clear and confident answer, but lacked technical relevance in this stage."
        },
        "stage": "intro",
        "is_followup": false
      },
      {
        "question": "Are there any final questions you'd like to ask me about the Backend Engineer role at Acme?",
        "answer": "My concise answer to the question",
        "evaluation": {
          "clarity": 8,
          "confidence": 9,
          "technical_depth": 0,
          "summary": "Candidate provided a clear and confident answer, but failed to demonstrate technical relevance to the Backend Engineer role."
        },
        "stage": "wrap-up",
        "is_followup": false
      }
    ],
    "should_follow_up": false,
    "completed": true
  }
}
```

> **Note:** When `next_question` is `null` and `state.completed` is `true`, the interview has ended. Frontend should redirect to the report page or display a completion message.

#### 3. Get Interview State
```http
GET /ai-interview/state/:userId/:sessionId
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "stage": "technical",
  "session_config": { ... },
  "history": [ ... ],
  "should_follow_up": false,
  "completed": false
}
```

#### 4. Get Interview Report
```http
GET /ai-interview/report/:userId/:sessionId
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "session_id": "session-123",
  "user_id": "user-123",
  "role": "Backend Engineer",
  "company": "Acme",
  "industry": "Software",
  "avg_scores": {
    "technical_depth": 7.5,
    "relevance": 8.0,
    "communication": 8.5,
    "behavioral": 7.0,
    "overall": "Hire"
  },
  "history": [ ... ]
}
```

#### 5. List User Sessions
```http
GET /ai-interview/sessions/:userId
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "session-123": {
    "stage": "technical",
    "session_config": { ... },
    "history": [ ... ],
    "should_follow_up": false,
    "completed": false
  }
}
```

#### 6. List All Sessions
```http
GET /ai-interview/sessions
Authorization: Bearer <jwt_token>
```

### Session Management

#### 7. Create Session
```http
POST /ai-interview/session/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "role": "Backend Engineer",
  "industry": "Software",
  "company": "Acme",
  "cv_file_id": "optional-cv-id",
  "jd_file_id": "optional-jd-id"
}
```

#### 8. Get Session Details
```http
GET /ai-interview/session/:sessionId
Authorization: Bearer <jwt_token>
```

#### 9. Get Next Question
```http
GET /ai-interview/session/:sessionId/next-question
Authorization: Bearer <jwt_token>
```

#### 10. Submit Session Answer
```http
POST /ai-interview/session/:sessionId/answer
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "question_id": "q-123",
  "text": "My answer",
  "audio_url": "optional-audio-url"
}
```

#### 11. Get Session Report
```http
GET /ai-interview/session/:sessionId/report
Authorization: Bearer <jwt_token>
```

#### 12. Delete Session
```http
DELETE /ai-interview/session/:sessionId
Authorization: Bearer <jwt_token>
```

## Configuration

### Environment Variables

```env
# AI Interview API Configuration
AI_INTERVIEW_API_BASE_URL=http://34.27.237.113:8000
AI_INTERVIEW_API_TIMEOUT=60000

# Endpoint Overrides (Optional)
AI_INTERVIEW_START_ENDPOINT=/start
AI_INTERVIEW_ANSWER_ENDPOINT=/answer
AI_INTERVIEW_STATE_ENDPOINT=/state
AI_INTERVIEW_REPORT_ENDPOINT=/report
AI_INTERVIEW_SESSIONS_ENDPOINT=/sessions

# JWT Configuration
JWT_ACCESS_SECRET=your-secret-key
```

## Module Structure

```
src/interview_rounds/
├── controllers/
│   └── ai-interview.controller.ts    # REST API endpoints
├── services/
│   ├── ai-interview-api.service.ts   # External API client
│   └── interview.service.ts          # Local interview logic
├── schemas/
│   └── interview.schema.ts           # MongoDB schema
├── dto/
│   └── message.dto.ts                # Data transfer objects
├── interview.module.ts               # Module configuration
└── README.md                         # This file
```

## Features

### ✅ Implemented
- JWT authentication on all endpoints
- Complete REST API for interview management
- External AI API integration with axios
- Request/Response logging
- Error handling and HTTP exceptions
- Configurable timeouts and base URLs
- User context extraction from JWT tokens

### ❌ Removed
- WebSocket gateways (TechnicalGateway, BehaviorGateway, ProblemSolvingGateway, HrGateway)
- LlmService
- InterviewRoundsController (old controller)
- Redis dependencies

## Usage Example

### Starting an Interview

```typescript
// 1. Authenticate and get JWT token
const token = await login(email, password);

// 2. Start interview session
const response = await fetch('http://localhost:3000/ai-interview/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user-123',
    session_id: 'session-' + Date.now(),
    role_title: 'Backend Engineer',
    company_name: 'Acme Corp',
    industry: 'Software',
    jd: 'Build scalable microservices',
    cv: 'Experienced backend developer',
    round_type: 'full'
  })
});

const { session_id, first_question, state } = await response.json();
console.log('First question:', first_question);

// 3. Submit answers in a loop
let currentQuestion = first_question;
let isComplete = false;

while (!isComplete) {
  const userAnswer = await getUserInput(); // Get answer from user
  
  const answerResponse = await fetch('http://localhost:3000/ai-interview/answer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: 'user-123',
      session_id: session_id,
      answer: userAnswer
    })
  });

  const { evaluation, next_question, state } = await answerResponse.json();
  
  // Display evaluation scores
  console.log('Evaluation:', evaluation);
  
  // Check if interview is complete
  if (next_question === null && state.completed === true) {
    console.log('Interview completed!');
    isComplete = true;
  } else {
    currentQuestion = next_question;
    console.log('Next question:', currentQuestion);
  }
}

// 4. Get final report
const reportResponse = await fetch(
  `http://localhost:3000/ai-interview/report/user-123/${session_id}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const report = await reportResponse.json();
console.log('Final Report:', report);
console.log('Overall Score:', report.avg_scores.overall);
```

### Frontend Integration Example (React)

```tsx
import { useState, useEffect } from 'react';

function InterviewSession() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [answer, setAnswer] = useState('');

  // Start interview
  const startInterview = async () => {
    const response = await fetch('/ai-interview/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: `session-${Date.now()}`,
        role_title: 'Backend Engineer',
        company_name: 'Acme',
        industry: 'Software',
        jd: jobDescription,
        cv: resume,
        round_type: 'full'
      })
    });

    const data = await response.json();
    setSessionId(data.session_id);
    setCurrentQuestion(data.first_question);
  };

  // Submit answer
  const submitAnswer = async () => {
    const response = await fetch('/ai-interview/answer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        answer: answer
      })
    });

    const data = await response.json();
    setEvaluation(data.evaluation);

    // Check if interview is complete
    if (data.next_question === null && data.state.completed === true) {
      setIsComplete(true);
      // Redirect to report
      window.location.href = `/interview/report/${userId}/${sessionId}`;
    } else {
      setCurrentQuestion(data.next_question);
      setAnswer('');
    }
  };

  return (
    <div>
      {!isComplete ? (
        <>
          <h2>{currentQuestion}</h2>
          <textarea 
            value={answer} 
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
          <button onClick={submitAnswer}>Submit Answer</button>
          
          {evaluation && (
            <div className="evaluation">
              <h3>Last Answer Evaluation:</h3>
              <p>Clarity: {evaluation.clarity}/10</p>
              <p>Confidence: {evaluation.confidence}/10</p>
              <p>Technical Depth: {evaluation.technical_depth}/10</p>
              <p>Summary: {evaluation.summary}</p>
            </div>
          )}
        </>
      ) : (
        <div>
          <h2>Interview Complete!</h2>
          <p>Redirecting to your report...</p>
        </div>
      )}
    </div>
  );
}
```

## Round Types

- `technical` - Technical questions only
- `behavioral` - Behavioral questions only
- `hr` - HR questions only
- `full` - Complete interview (all rounds)

## Interview Stages

The interview progresses through multiple stages:
1. **intro** - Introduction and warm-up questions
2. **technical** - Technical deep-dive questions
3. **behavioral** - Behavioral assessment questions
4. **hr** - HR and culture fit questions
5. **managerial** - Management and leadership questions (for senior roles)
6. **wrap-up** - Final closing questions
7. **closing** - Interview completion (alternative final stage)

### Detecting Interview Completion

The frontend should check for interview completion after each answer submission:

```typescript
const response = await submitAnswer(answer);

if (response.next_question === null && response.state.completed === true) {
  // Interview is complete
  // Redirect to report page or show completion message
  window.location.href = `/interview/report/${userId}/${sessionId}`;
} else if (response.next_question) {
  // Continue interview with next question
  displayQuestion(response.next_question);
} else {
  // Handle unexpected state
  console.error('Unexpected interview state');
}
```

### Interview Completion Indicators

| Field | Value When Complete | Description |
|-------|-------------------|-------------|
| `next_question` | `null` | No more questions to ask |
| `state.completed` | `true` | Interview has finished |
| `state.stage` | `"wrap-up"` or `"closing"` | Final stage reached |
| `state.should_follow_up` | `false` | No follow-up questions needed |

## Response Structures

### Evaluation Object
```typescript
{
  clarity: number;        // 0-10 score
  confidence: number;     // 0-10 score
  technical_depth: number; // 0-10 score
  summary: string;        // Evaluation summary
}
```

### History Item
```typescript
{
  question: string;
  answer: string | null;
  evaluation: Evaluation | null;
  stage: string;
  is_followup: boolean;
}
```

### Average Scores
```typescript
{
  technical_depth: number;
  relevance: number;
  communication: number;
  behavioral: number;
  overall: "Hire" | "No Hire" | "Strong Hire" | "Strong No Hire";
}
```

## Error Handling

All endpoints return standard HTTP status codes:
- `200` - Success
- `401` - Unauthorized (missing/invalid JWT)
- `500` - Internal server error (external API failure)

Error response format:
```json
{
  "statusCode": 500,
  "message": "Failed to start interview session",
  "error": "Internal Server Error"
}
```

## Dependencies

- `@nestjs/common` - NestJS core
- `@nestjs/config` - Configuration management
- `@nestjs/jwt` - JWT authentication
- `@nestjs/mongoose` - MongoDB integration
- `axios` - HTTP client for external API calls

## Testing

### Manual Testing with cURL

```bash
# Get JWT token first
TOKEN="your-jwt-token-here"

# Start interview
curl -X POST http://localhost:3000/ai-interview/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "session_id": "session-123",
    "role_title": "Backend Engineer",
    "company_name": "Acme",
    "industry": "Software",
    "jd": "Build microservices",
    "cv": "Experienced developer",
    "round_type": "full"
  }'

# Submit answer
curl -X POST http://localhost:3000/ai-interview/answer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "session_id": "session-123",
    "answer": "My answer here"
  }'

# Get state
curl -X GET http://localhost:3000/ai-interview/state/user-123/session-123 \
  -H "Authorization: Bearer $TOKEN"

# Get report
curl -X GET http://localhost:3000/ai-interview/report/user-123/session-123 \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### External API Not Responding
- Check `AI_INTERVIEW_API_BASE_URL` is correct
- Verify external API is running at `http://34.27.237.113:8000`
- Increase `AI_INTERVIEW_API_TIMEOUT` if needed

### JWT Authentication Failing
- Ensure `JWT_ACCESS_SECRET` matches auth module
- Check token is included in Authorization header
- Verify token hasn't expired

### Module Import Errors
- Ensure `InterviewRoundsModule` is imported in `app.module.ts`
- Check all dependencies are installed with `npm install`

## Future Enhancements

- [ ] Add request/response caching
- [ ] Implement retry logic for failed API calls
- [ ] Add response validation/transformation
- [ ] Store interview history in MongoDB
- [ ] Add analytics and metrics tracking
- [ ] Implement rate limiting
- [ ] Add WebSocket support for real-time updates
- [ ] Support for audio/video responses

## License

Private - Internal Use Only
