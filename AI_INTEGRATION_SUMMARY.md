# AI Interview API Integration - Implementation Summary

## Environment Variables Added

The following environment variables have been added to `.env`:

```env
# AI Interview Coach API Configuration
AI_INTERVIEW_API_BASE_URL=http://34.27.237.113:8000
AI_INTERVIEW_API_TIMEOUT=60000

# CV Evaluation Endpoints
AI_CV_SCORE_ENDPOINT=/v1/cv/score
AI_CV_FIT_INDEX_ENDPOINT=/v1/cv/fit-index
AI_CV_IMPROVEMENT_ENDPOINT=/v1/cv/improvement
AI_CV_EVALUATE_UPLOAD_ENDPOINT=/upload/cv_evaluate
AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT=/upload/cv_improvement

# Interview Session Endpoints
AI_INTERVIEW_START_ENDPOINT=/start
AI_INTERVIEW_ANSWER_ENDPOINT=/answer
AI_INTERVIEW_STATE_ENDPOINT=/state
AI_INTERVIEW_REPORT_ENDPOINT=/report
AI_INTERVIEW_SESSIONS_ENDPOINT=/sessions
```

## New Services Created

### 1. `AiInterviewApiService` (Interview Rounds Module)
**Location:** `src/interview_rounds/services/ai-interview-api.service.ts`

**Methods:**
- `startInterview(payload)` - Start a new interview session
- `submitAnswer(payload)` - Submit an answer to the current question
- `getInterviewState(userId, sessionId)` - Get current interview state
- `getInterviewReport(userId, sessionId)` - Get final interview report
- `listUserSessions(userId)` - List all interview sessions for a user
- `createSession(payload)` - Create a session (mock endpoint)
- `getNextQuestion(sessionId)` - Get next question in session
- `submitSessionAnswer(sessionId, payload)` - Submit answer to session
- `getSessionReport(sessionId)` - Get session report
- `deleteSession(sessionId)` - Delete session

### 2. `AiCvApiService` (Resume Module)
**Location:** `src/resume/ai-cv-api.service.ts`

**Methods:**
- `scoreCv(cvText)` - Score CV quality
- `calculateFitIndex(cvText, jdText)` - Calculate CV fit index with job description
- `getImprovementSuggestions(cvText, jdText)` - Get CV improvement suggestions
- `uploadAndEvaluateCv(filePath, originalName, jdText?)` - Upload and evaluate CV file
- `uploadAndGetImprovements(filePath, originalName, jdText?, jdFilePath?, jdFileName?)` - Upload and get CV improvement suggestions
- `evaluateCvVsJd(cvText, jdText)` - Evaluate CV vs JD
- `uploadCvArtifact(filePath, originalName)` - Upload CV artifact
- `uploadJdArtifact(filePath, originalName)` - Upload JD artifact
- `getArtifactInfo(artifactId)` - Get artifact info
- `deleteArtifact(artifactId)` - Delete artifact

## Performance Improvements

### 1. Request Logging Middleware
**Location:** `src/common/middleware/logging.middleware.ts`
- Logs all HTTP requests with response times
- Highlights slow requests (>1s) with warnings
- Logs error responses

### 2. Timeout Interceptor
**Location:** `src/common/interceptors/timeout.interceptor.ts`
- Prevents API requests from hanging indefinitely
- Default timeout: 30 seconds
- Throws `RequestTimeoutException` on timeout

### 3. MongoDB Connection Optimizations
- `connectTimeoutMS`: 5 seconds
- `socketTimeoutMS`: 45 seconds
- `serverSelectionTimeoutMS`: 5 seconds
- `maxPoolSize`: 10 connections

### 4. Redis Connection Optimizations
- `connectTimeout`: 5 seconds
- `commandTimeout`: 5 seconds
- Exponential backoff reconnect strategy

## Module Updates

### Interview Rounds Module
- Added `AiInterviewApiService` provider
- Exported `AiInterviewApiService` for use in other modules
- Can now integrate AI interview sessions with your existing workflow

### Resume Module
- Refactored to use `AiCvApiService` instead of direct axios calls
- Cleaner separation of concerns
- Better error handling and logging
- All AI CV operations now go through the service layer

## Usage Examples

### Interview Rounds

```typescript
import { AiInterviewApiService } from './services/ai-interview-api.service';

// In your controller or service
constructor(private readonly aiInterviewApi: AiInterviewApiService) {}

// Start interview
async startInterview() {
  const result = await this.aiInterviewApi.startInterview({
    user_id: "user-123",
    session_id: "session-123",
    role_title: "Backend Engineer",
    company_name: "Acme",
    industry: "Software",
    jd: "Design microservices in Python",
    cv: "Experienced Python backend engineer",
    round_type: "technical"
  });
  return result;
}

// Submit answer
async submitAnswer() {
  const result = await this.aiInterviewApi.submitAnswer({
    user_id: "user-123",
    session_id: "session-123",
    answer: "My answer to the question"
  });
  return result;
}

// Get interview state
async getState() {
  const state = await this.aiInterviewApi.getInterviewState("user-123", "session-123");
  return state;
}

// Get final report
async getReport() {
  const report = await this.aiInterviewApi.getInterviewReport("user-123", "session-123");
  return report;
}
```

### Resume Module

The `ResumeService` already uses `AiCvApiService` internally. You can also inject it elsewhere:

```typescript
import { AiCvApiService } from './ai-cv-api.service';

constructor(private readonly aiCvApi: AiCvApiService) {}

// Score CV
async scoreResume(cvText: string) {
  const score = await this.aiCvApi.scoreCv(cvText);
  return score;
}

// Calculate fit index
async checkFit(cvText: string, jdText: string) {
  const fitIndex = await this.aiCvApi.calculateFitIndex(cvText, jdText);
  return fitIndex;
}
```

## Benefits

1. **Centralized API Configuration** - All AI API endpoints configured in .env
2. **Better Error Handling** - Consistent error handling across all AI API calls
3. **Logging & Monitoring** - Comprehensive logging for debugging and performance monitoring
4. **Type Safety** - TypeScript interfaces for all payloads and responses
5. **Timeout Protection** - Prevents hanging requests
6. **Request Tracking** - Logs all API requests with timing information
7. **Performance Optimization** - MongoDB and Redis connection tuning
8. **Separation of Concerns** - Clean service layer for AI API integration

## Next Steps

1. Test the AI API integration endpoints
2. Monitor logs for slow requests
3. Adjust timeout values if needed
4. Add additional endpoints as required
5. Consider caching frequently accessed data

## Troubleshooting

If you experience slow API responses:

1. Check the logs for slow requests (marked with WARN)
2. Verify MongoDB connection is stable
3. Verify Redis connection is stable
4. Check AI API endpoint availability
5. Monitor memory usage: `NODE_OPTIONS="--max-old-space-size=4096" npm start`
