# Enhanced AI Interview System - Complete Documentation

## Overview
The Enhanced AI Interview System provides comprehensive analytics tracking, question-by-question scoring, audio analysis, and detailed progress monitoring for interview sessions.

## Key Features

### 🎯 Core Functionality
- **Comprehensive Analytics**: Track every question, answer, and score
- **Audio Analysis**: Speech clarity, pace, confidence, filler words detection
- **User-Specific Data**: Only show job descriptions uploaded by the user
- **Real-time Scoring**: Individual question scores and overall session metrics
- **Progress Tracking**: Monthly progress, streaks, and improvement trends

### 📊 Data Models

#### Enhanced Interview Session
```typescript
{
  userId: ObjectId,
  sessionId: string,
  roundType: 'technical' | 'behavioral' | 'hr' | 'problem-solving' | 'full',
  status: 'active' | 'completed' | 'abandoned' | 'paused',
  jobContext: {
    roleTitle: string,
    companyName: string,
    industry: string,
    resumeId?: ObjectId,
    jobDescriptionId?: ObjectId
  },
  questions: ObjectId[], // References to InterviewQuestion
  scores: {
    overall: number,
    communication: number,
    technical: number,
    behavioral: number,
    problemSolving: number,
    leadership: number,
    clarity: number,
    confidence: number
  },
  metrics: {
    totalQuestions: number,
    answeredQuestions: number,
    averageResponseTime: number,
    totalDuration: number,
    pauseCount: number,
    fillerWordsTotal: number,
    averageSpeechClarity: number,
    averageConfidenceLevel: number
  },
  strengths: string[],
  areasForImprovement: string[],
  recommendations: string[]
}
```

#### Interview Question
```typescript
{
  sessionId: ObjectId,
  userId: ObjectId,
  questionText: string,
  questionType: string,
  competency: string,
  difficulty: string,
  answerText: string,
  audioFilePath: string,
  audioUrl: string,
  audioAnalysis: {
    transcription: string,
    speechClarity: number,
    paceScore: number,
    confidenceLevel: number,
    duration: number,
    pauseCount: number,
    fillerWords: number
  },
  scores: {
    overall: number,
    communication: number,
    technical: number,
    behavioral: number,
    problemSolving: number,
    clarity: number,
    confidence: number
  },
  feedback: string,
  strengths: string[],
  improvements: string[],
  responseTime: number,
  questionAskedAt: Date,
  answerSubmittedAt: Date,
  aiResponse: any // Raw AI response for debugging
}
```

## API Endpoints

### 🚀 Start Interview Session
**POST** `/enhanced-interview/start`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "session_id": "unique-session-id",
  "role_title": "Software Engineer",
  "company_name": "Tech Corp",
  "industry": "Technology",
  "round_type": "technical",
  "jd_id": "optional-job-description-id",
  "resume_id": "optional-resume-id"
}
```

**Response:**
```json
{
  "session_id": "unique-session-id",
  "user_id": "user-id",
  "first_question": "Tell me about yourself",
  "state": {
    "current_question": "Tell me about yourself",
    "questions_asked": 1,
    "total_questions": 10,
    "status": "active"
  },
  "session": {
    "id": "mongodb-session-id",
    "sessionId": "unique-session-id",
    "status": "active",
    "jobContext": {
      "roleTitle": "Software Engineer",
      "companyName": "Tech Corp",
      "industry": "Technology"
    }
  },
  "resume": {
    "id": "resume-id",
    "filename": "resume.pdf"
  },
  "jobDescription": {
    "id": "jd-id",
    "filename": "job-description.txt"
  }
}
```

### 🎤 Submit Answer
**POST** `/enhanced-interview/answer`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `session_id`: string (required)
- `audio_file`: file (required - audio file)
- `text_answer`: string (optional - fallback text)

**Response:**
```json
{
  "evaluation": {
    "overall_score": 8.5,
    "communication_score": 9.0,
    "technical_score": 8.0,
    "behavioral_score": 8.5,
    "clarity_score": 9.0,
    "confidence_score": 8.0
  },
  "transcription": "I am a software engineer with 5 years of experience...",
  "audio_analysis": {
    "speech_clarity": 8.5,
    "pace_score": 7.5,
    "confidence_level": 8.0,
    "duration": 45,
    "pause_count": 3,
    "filler_words": 2
  },
  "feedback": "Great answer! You demonstrated strong technical knowledge...",
  "strengths": ["Clear communication", "Technical expertise"],
  "improvements": ["Could provide more specific examples"],
  "next_question": "Describe a challenging project you worked on",
  "continue_interview": true,
  "analytics": {
    "scores": {
      "overall": 8.5,
      "communication": 9.0,
      "technical": 8.0
    },
    "audioAnalysis": {
      "speechClarity": 8.5,
      "confidenceLevel": 8.0
    },
    "responseTime": 45,
    "feedback": "Great answer!",
    "strengths": ["Clear communication"],
    "improvements": ["More examples needed"]
  }
}
```

### 📊 Get Session Details
**GET** `/enhanced-interview/session/:sessionId`

**Response:**
```json
{
  "userId": "user-id",
  "sessionId": "unique-session-id",
  "roundType": "technical",
  "status": "completed",
  "jobContext": {
    "roleTitle": "Software Engineer",
    "companyName": "Tech Corp",
    "industry": "Technology"
  },
  "questions": [
    {
      "questionText": "Tell me about yourself",
      "answerText": "I am a software engineer...",
      "scores": {
        "overall": 8.5,
        "communication": 9.0
      },
      "audioAnalysis": {
        "speechClarity": 8.5,
        "confidenceLevel": 8.0
      },
      "responseTime": 45,
      "feedback": "Great answer!"
    }
  ],
  "scores": {
    "overall": 8.2,
    "communication": 8.8,
    "technical": 7.9
  },
  "metrics": {
    "totalQuestions": 10,
    "answeredQuestions": 10,
    "averageResponseTime": 42,
    "totalDuration": 1800
  }
}
```

### 📈 Get Analytics Dashboard
**GET** `/enhanced-interview/analytics`

**Response:**
```json
{
  "analytics": {
    "technical": {
      "totalSessions": 5,
      "completedSessions": 4,
      "averageScore": 7.8,
      "bestScore": 9.2,
      "improvementTrend": 0.5
    },
    "behavioral": {
      "totalSessions": 3,
      "completedSessions": 3,
      "averageScore": 8.1,
      "bestScore": 8.9
    },
    "overall": {
      "totalInterviews": 8,
      "completedInterviews": 7,
      "overallAverageScore": 7.9,
      "bestOverallScore": 9.2,
      "totalTimeSpent": 14400,
      "currentStreak": 3
    },
    "monthlyProgress": [
      {
        "month": "2024-01",
        "sessionsCount": 3,
        "averageScore": 7.5,
        "timeSpent": 5400
      }
    ]
  },
  "recentSessions": [
    {
      "sessionId": "recent-session-1",
      "roundType": "technical",
      "scores": { "overall": 8.5 },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "summary": {
    "totalInterviews": 8,
    "completedInterviews": 7,
    "averageScore": 7.9,
    "bestScore": 9.2,
    "totalTimeSpent": 14400,
    "currentStreak": 3
  }
}
```

### 📋 Get User Job Descriptions
**GET** `/enhanced-interview/job-descriptions`

**Response:**
```json
{
  "jobDescriptions": [
    {
      "id": "jd-id-1",
      "filename": "software-engineer-jd.txt"
    },
    {
      "id": "jd-id-2", 
      "filename": "senior-developer-role.pdf"
    }
  ]
}
```

### 📄 Get User Resumes
**GET** `/enhanced-interview/resumes`

**Response:**
```json
{
  "resumes": [
    {
      "id": "resume-id-1",
      "filename": "john-doe-resume.pdf",
      "score": 8.5,
      "createdAt": "2024-01-10T10:00:00Z"
    },
    {
      "id": "resume-id-2",
      "filename": "updated-resume.pdf", 
      "score": 9.2,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 📊 Get User Sessions
**GET** `/enhanced-interview/sessions?page=1&limit=10`

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "session-1",
      "roundType": "technical",
      "status": "completed",
      "scores": { "overall": 8.5 },
      "jobContext": {
        "roleTitle": "Software Engineer",
        "companyName": "Tech Corp"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

### 📋 Get Interview Report
**GET** `/enhanced-interview/report/:sessionId`

**Response:**
```json
{
  "session": {
    "sessionId": "unique-session-id",
    "scores": { "overall": 8.2 },
    "questions": [...],
    "strengths": ["Clear communication", "Technical expertise"],
    "areasForImprovement": ["More specific examples needed"],
    "recommendations": ["Practice behavioral questions"]
  },
  "aiReport": {
    "overall_score": 8.2,
    "detailed_feedback": "Comprehensive AI analysis...",
    "competency_breakdown": {
      "communication": 8.8,
      "technical": 7.9,
      "problem_solving": 8.1
    }
  },
  "analytics": {
    "totalQuestions": 10,
    "averageScore": 8.2,
    "strengths": ["Clear communication"],
    "improvements": ["More examples needed"],
    "recommendations": ["Practice behavioral questions"]
  }
}
```

## Security Features

### 🔒 Data Privacy
- **User Isolation**: Users can only access their own data
- **JD Filtering**: Only job descriptions uploaded by the user are shown
- **Resume Access**: Only user's own resumes are accessible
- **Session Security**: Sessions are tied to authenticated users

### 🛡️ Authentication
- JWT-based authentication required for all endpoints
- User ID extracted from JWT token
- All data operations filtered by authenticated user

## Analytics Features

### 📊 Comprehensive Tracking
- **Question-Level Analytics**: Individual question scores and feedback
- **Audio Analysis**: Speech patterns, clarity, confidence metrics
- **Progress Tracking**: Monthly progress, improvement trends
- **Performance Metrics**: Response times, completion rates, streaks

### 🎯 Scoring System
- **Multi-Dimensional Scoring**: Overall, communication, technical, behavioral
- **Audio-Enhanced Scoring**: Speech clarity, pace, confidence integration
- **Competency Mapping**: Skills-based evaluation and tracking
- **Trend Analysis**: Performance improvement over time

## Environment Configuration

```env
# AI Interview Coach API Configuration
AI_INTERVIEW_API_BASE_URL=http://localhost:8080
AI_INTERVIEW_API_TIMEOUT=60000

# CV Evaluation Endpoints
AI_CV_SCORE_ENDPOINT=/v1/v1/cv/score
AI_CV_FIT_INDEX_ENDPOINT=/v1/v1/cv/fit-index
AI_CV_IMPROVEMENT_ENDPOINT=/v1/v1/cv/improvement
AI_CV_EVALUATE_UPLOAD_ENDPOINT=/upload/upload/cv_evaluate
AI_CV_IMPROVEMENT_UPLOAD_ENDPOINT=/upload/upload/cv_improvement

# Interview Session Endpoints
AI_INTERVIEW_START_ENDPOINT=/api/interview/start
AI_INTERVIEW_ANSWER_ENDPOINT=/api/interview/answer
AI_INTERVIEW_STATE_ENDPOINT=/api/interview/state
AI_INTERVIEW_REPORT_ENDPOINT=/api/interview/report
AI_INTERVIEW_SESSIONS_ENDPOINT=/api/interview/sessions
```

## Database Collections

### 📚 Collections Created
1. **enhancedinterviewsessions** - Main session data
2. **interviewquestions** - Individual questions and answers
3. **userinterviewanalytics** - User progress and statistics
4. **jobdescriptions** - User-uploaded job descriptions (filtered by user)
5. **resumes** - User resumes with scores

### 🔄 Data Flow
1. **Session Start** → Create session record → Start AI interview
2. **Question Asked** → Record question → Track timing
3. **Answer Submitted** → Process audio → Score answer → Update analytics
4. **Session Complete** → Generate report → Update user statistics

## Error Handling

### ⚠️ Common Errors
- **401 Unauthorized**: Invalid or missing JWT token
- **404 Not Found**: Session or resource not found for user
- **400 Bad Request**: Invalid request data or missing required fields
- **500 Internal Server Error**: AI service unavailable or processing error

### 🔧 Graceful Degradation
- AI service unavailable → Continue with basic functionality
- Audio processing fails → Fall back to text analysis
- Missing data → Use defaults and continue operation

## Performance Considerations

### ⚡ Optimizations
- **Pagination**: All list endpoints support pagination
- **Indexing**: Database indexes on userId, sessionId, createdAt
- **Caching**: User analytics cached and updated incrementally
- **File Management**: Audio files stored locally with cleanup

### 📈 Scalability
- **Horizontal Scaling**: Stateless design supports multiple instances
- **Database Sharding**: User-based data partitioning ready
- **CDN Integration**: Audio files can be served from CDN
- **Background Processing**: Analytics updates can be queued

This enhanced system provides comprehensive interview analytics while maintaining security and performance standards.