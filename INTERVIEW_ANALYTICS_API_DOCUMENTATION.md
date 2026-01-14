# AI Interview Platform - Complete API Documentation

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Interview Session APIs](#interview-session-apis)
4. [Enhanced Interview APIs](#enhanced-interview-apis)
5. [Interview Analytics APIs](#interview-analytics-apis)
6. [Resume Management APIs](#resume-management-apis)
7. [Job Management APIs](#job-management-apis)
8. [DSA Questions APIs](#dsa-questions-apis)
9. [Data Schemas](#data-schemas)
10. [Response Examples](#response-examples)

---

## Authentication APIs

### Base URL: `/auth`

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "employee" // or "employer"
}
```

**Response:**
```json
{
  "user": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "createdAt": "2023-12-01T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### POST `/auth/google`
Login with Google OAuth token.

**Request Body:**
```json
{
  "idToken": "google_oauth_token_here"
}
```

#### POST `/auth/logout`
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

---

## User Management APIs

### Base URL: `/users`

#### GET `/users/profile`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "employee",
  "company": "Tech Corp",
  "industry": "Technology",
  "profileImageUrl": "http://localhost:3000/uploads/profile-images/1234567890.jpg",
  "resumeUrl": "http://localhost:3000/uploads/resumes/resume.pdf",
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-01T10:00:00.000Z"
}
```

#### PATCH `/users/profile`
Update user profile with optional profile image upload.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `name`: string (optional)
- `company`: string (optional)
- `industry`: string (optional)
- `profileImage`: file (optional, max 5MB)

---

## Interview Session APIs

### Base URL: `/ai-interview` (Legacy) & `/interview` (New)

#### POST `/ai-interview/start`
Start a new interview session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "session_id": "session_12345",
  "role_title": "Software Engineer",
  "company_name": "Tech Corp",
  "industry": "Technology",
  "cv": "resume_id_or_path",
  "jd": "job_description_content",
  "round_type": "technical" // technical, behavioral, hr, full
}
```

**Response:**
```json
{
  "session_id": "session_12345",
  "first_question": "Tell me about your experience with React.js",
  "status": "active",
  "round_type": "technical",
  "continue_interview": true
}
```

#### POST `/ai-interview/answer`
Submit audio answer for evaluation.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `audio_file`: audio file (wav, mp3, m4a, ogg, webm, flac - max 50MB)
- `session_id`: string

**Response:**
```json
{
  "transcription": "I have 3 years of experience with React.js...",
  "evaluation": {
    "total_score": 8.5,
    "communication_evaluation": {
      "voice_scores": {
        "clarity": 8.0,
        "pace": 7.5,
        "confidence": 9.0,
        "total": 8.2
      },
      "voice_metrics": {
        "duration": 45.2,
        "pause_count": 3,
        "filler_words": 2
      }
    },
    "technical_evaluation": {
      "technical_depth": 8.5,
      "accuracy": 9.0,
      "completeness": 8.0
    },
    "feedback": "Good technical knowledge demonstrated...",
    "suggestions": ["Consider providing more specific examples"]
  },
  "next_question": "Can you explain the virtual DOM concept?",
  "continue_interview": true,
  "state": {
    "completed": false,
    "history": [
      {
        "question": "Tell me about your experience with React.js",
        "answer": "I have 3 years of experience...",
        "evaluation": { /* evaluation object */ }
      }
    ],
    "avg_scores": {
      "overall": 8.5,
      "communication": 8.2,
      "technical": 8.5
    }
  }
}
```

#### GET `/ai-interview/dashboard/:userId`
Get user's interview dashboard analytics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalInterviews": 15,
  "completedInterviews": 12,
  "averageScore": 7.8,
  "bestScore": 9.2,
  "currentStreak": 3,
  "longestStreak": 5,
  "totalTimeSpent": 7200,
  "recentSessions": [
    {
      "session_id": "session_12345",
      "role_title": "Software Engineer",
      "company_name": "Tech Corp",
      "status": "completed",
      "round_type": "technical",
      "overall_score": 8.5,
      "created_at": "2023-12-01T10:00:00.000Z",
      "question_count": 5
    }
  ],
  "roundStats": {
    "technical": {
      "averageScore": 8.2,
      "totalSessions": 8,
      "bestScore": 9.2
    },
    "behavioral": {
      "averageScore": 7.5,
      "totalSessions": 4,
      "bestScore": 8.8
    },
    "problemSolving": {
      "averageScore": 7.8,
      "totalSessions": 2,
      "bestScore": 8.5
    },
    "hr": {
      "averageScore": 8.0,
      "totalSessions": 1,
      "bestScore": 8.0
    }
  }
}
```

#### GET `/ai-interview/session-report/:sessionId`
Get detailed session report with all questions and analytics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "sessionId": "session_12345",
  "roleTitle": "Software Engineer",
  "companyName": "Tech Corp",
  "industry": "Technology",
  "roundType": "technical",
  "status": "completed",
  "overallScore": 8.5,
  "totalQuestions": 5,
  "completedAt": "2023-12-01T11:30:00.000Z",
  "scores": {
    "overall": 8.5,
    "communication": 8.2,
    "technical": 8.8
  },
  "areasForImprovement": [
    "Provide more specific examples",
    "Improve explanation clarity"
  ],
  "questions": [
    {
      "question": "Tell me about your experience with React.js",
      "answer": "I have 3 years of experience...",
      "transcription": "I have 3 years of experience...",
      "score": 8.5,
      "feedback": "Good technical knowledge...",
      "suggestions": ["Provide more examples"],
      "voiceMetrics": {
        "clarity": 8.0,
        "pace": 7.5,
        "confidence": 9.0,
        "duration": 45.2
      }
    }
  ]
}
```

---

## Enhanced Interview APIs

### Base URL: `/enhanced-interview`

#### POST `/enhanced-interview/start`
Start enhanced interview with comprehensive tracking.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "session_id": "enhanced_session_12345",
  "role_title": "Senior Software Engineer",
  "company_name": "Tech Corp",
  "industry": "Technology",
  "round_type": "technical",
  "jd_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "resume_id": "60f7b3b3b3b3b3b3b3b3b3b4"
}
```

**Response:**
```json
{
  "session_id": "enhanced_session_12345",
  "first_question": "Describe your approach to system design",
  "status": "active",
  "session": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b5",
    "sessionId": "enhanced_session_12345",
    "status": "active",
    "jobContext": {
      "roleTitle": "Senior Software Engineer",
      "companyName": "Tech Corp",
      "industry": "Technology",
      "resumeId": "60f7b3b3b3b3b3b3b3b3b3b4",
      "jobDescriptionId": "60f7b3b3b3b3b3b3b3b3b3b3"
    }
  },
  "resume": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "filename": "john_doe_resume.pdf"
  },
  "jobDescription": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "filename": "senior_engineer_jd.pdf"
  }
}
```

#### POST `/enhanced-interview/answer`
Submit enhanced answer with comprehensive analytics.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `audio_file`: audio file (optional)
- `session_id`: string
- `text_answer`: string (optional, fallback if no audio)

**Response:**
```json
{
  "transcription": "My approach to system design involves...",
  "evaluation": {
    "overall_score": 9.0,
    "communication_score": 8.5,
    "technical_score": 9.2,
    "behavioral_score": 8.8,
    "clarity_score": 8.7,
    "confidence_score": 9.1
  },
  "audio_analysis": {
    "speech_clarity": 8.7,
    "pace_score": 8.2,
    "confidence_level": 9.1,
    "duration": 62.5,
    "pause_count": 4,
    "filler_words": 1
  },
  "feedback": "Excellent system design approach...",
  "strengths": [
    "Clear architectural thinking",
    "Good scalability considerations"
  ],
  "improvements": [
    "Consider discussing monitoring strategies"
  ],
  "next_question": "How would you handle database scaling?",
  "analytics": {
    "scores": {
      "overall": 9.0,
      "communication": 8.5,
      "technical": 9.2,
      "behavioral": 8.8,
      "clarity": 8.7,
      "confidence": 9.1
    },
    "audioAnalysis": {
      "transcription": "My approach to system design involves...",
      "speechClarity": 8.7,
      "paceScore": 8.2,
      "confidenceLevel": 9.1,
      "duration": 62.5,
      "pauseCount": 4,
      "fillerWords": 1
    },
    "responseTime": 65,
    "feedback": "Excellent system design approach...",
    "strengths": ["Clear architectural thinking"],
    "improvements": ["Consider monitoring strategies"]
  }
}
```

#### GET `/enhanced-interview/sessions`
Get user's enhanced interview sessions with pagination.

**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response:**
```json
{
  "sessions": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "sessionId": "enhanced_session_12345",
      "roundType": "technical",
      "status": "completed",
      "jobContext": {
        "roleTitle": "Senior Software Engineer",
        "companyName": "Tech Corp",
        "industry": "Technology"
      },
      "scores": {
        "overall": 9.0,
        "communication": 8.5,
        "technical": 9.2
      },
      "metrics": {
        "totalQuestions": 6,
        "answeredQuestions": 6,
        "averageResponseTime": 58
      },
      "createdAt": "2023-12-01T10:00:00.000Z",
      "completedAt": "2023-12-01T11:45:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalSessions": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET `/enhanced-interview/analytics`
Get comprehensive analytics dashboard.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "overall": {
    "totalInterviews": 25,
    "completedInterviews": 22,
    "overallAverageScore": 8.3,
    "bestOverallScore": 9.5,
    "currentStreak": 4,
    "longestStreak": 7,
    "totalTimeSpent": 18000,
    "strengths": [
      "Technical knowledge",
      "Communication skills"
    ],
    "areasForImprovement": [
      "System design depth",
      "Leadership examples"
    ]
  },
  "roundStats": {
    "technical": {
      "totalSessions": 12,
      "completedSessions": 11,
      "averageScore": 8.5,
      "bestScore": 9.5,
      "improvementTrend": 0.3
    },
    "behavioral": {
      "totalSessions": 8,
      "completedSessions": 7,
      "averageScore": 8.0,
      "bestScore": 9.0,
      "improvementTrend": 0.2
    },
    "problemSolving": {
      "totalSessions": 3,
      "completedSessions": 3,
      "averageScore": 8.7,
      "bestScore": 9.2,
      "improvementTrend": 0.5
    },
    "hr": {
      "totalSessions": 2,
      "completedSessions": 1,
      "averageScore": 7.8,
      "bestScore": 7.8,
      "improvementTrend": 0.0
    }
  },
  "monthlyProgress": [
    {
      "month": "2023-11",
      "sessionsCount": 8,
      "averageScore": 8.1,
      "timeSpent": 6400
    },
    {
      "month": "2023-12",
      "sessionsCount": 17,
      "averageScore": 8.4,
      "timeSpent": 11600
    }
  ],
  "skillScores": {
    "React.js": 8.8,
    "Node.js": 8.5,
    "System Design": 8.2,
    "Database Design": 8.0,
    "Communication": 8.3
  }
}
```

#### GET `/enhanced-interview/resumes`
Get user's resumes with scores.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "resumes": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "filename": "john_doe_resume_v2.pdf",
      "score": 8.7,
      "createdAt": "2023-12-01T09:00:00.000Z"
    },
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b6",
      "filename": "john_doe_resume_v1.pdf",
      "score": 7.9,
      "createdAt": "2023-11-15T14:30:00.000Z"
    }
  ]
}
```

#### GET `/enhanced-interview/job-descriptions`
Get user's job descriptions.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "jobDescriptions": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "filename": "senior_engineer_jd.pdf"
    },
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b7",
      "filename": "fullstack_developer_jd.txt"
    }
  ]
}
```

---

## Resume Management APIs

### Base URL: `/resume`

#### POST `/resume/upload`
Upload resume with optional job description for analysis.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: file[] (first file: resume PDF, second file: optional JD PDF)
- `jd_text`: string (optional, JD as text)

**Response:**
```json
{
  "message": "Resume uploaded successfully",
  "resume": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "filename": "john_doe_resume.pdf",
    "path": "./uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/1234567890-john_doe_resume.pdf",
    "stats": {
      "overall_score": 8.7,
      "ats_score": 8.5,
      "content_score": 8.9,
      "format_score": 8.6,
      "keyword_match": 85,
      "sections_analysis": {
        "contact_info": "excellent",
        "summary": "good",
        "experience": "excellent",
        "education": "good",
        "skills": "excellent"
      },
      "suggestions": [
        "Add more quantifiable achievements",
        "Include relevant certifications"
      ]
    },
    "improvement_resume": null,
    "user": "60f7b3b3b3b3b3b3b3b3b3b3",
    "createdAt": "2023-12-01T09:00:00.000Z"
  }
}
```

#### GET `/resume/files`
Get user's uploaded resumes and job descriptions.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "resumes": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "john_doe_resume.pdf",
      "url": "http://localhost:3000/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/1234567890-john_doe_resume.pdf"
    }
  ],
  "jobDescriptions": [
    {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "senior_engineer_jd.pdf",
      "url": "http://localhost:3000/uploads/job-descriptions/1234567890-senior_engineer_jd.pdf"
    }
  ]
}
```

#### PATCH `/resume/improve/:id`
Improve existing resume with new job description.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `files`: file[] (optional JD file)
- `jd_text`: string (optional JD text)

---

## Job Management APIs

### Base URL: `/jobs`

#### GET `/jobs`
Get all available jobs.

**Response:**
```json
{
  "jobs": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b8",
      "title": "Senior Software Engineer",
      "description": "We are looking for a senior software engineer...",
      "requirements": [
        "5+ years of experience",
        "React.js expertise",
        "Node.js knowledge"
      ],
      "salary": 120000,
      "salaryRange": {
        "min": 110000,
        "max": 130000
      },
      "location": "San Francisco, CA",
      "jobType": "full-time",
      "experienceLevel": "senior",
      "skills": ["React", "Node.js", "TypeScript"],
      "benefits": ["Health insurance", "401k", "Remote work"],
      "employerId": "60f7b3b3b3b3b3b3b3b3b3b9",
      "isActive": true,
      "postedAt": "2023-12-01T08:00:00.000Z"
    }
  ]
}
```

#### POST `/jobs/:id/apply`
Apply for a job.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "coverLetter": "I am excited to apply for this position...",
  "resumeId": "60f7b3b3b3b3b3b3b3b3b3b4"
}
```

#### GET `/jobs/recommendations`
Get AI-powered job recommendations for user.

**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `limit`: number (default: 10)

---

## DSA Questions APIs

### Base URL: `/dsa-questions`

#### GET `/dsa-questions`
Get DSA questions with filtering.

**Query Parameters:**
- `difficulty`: string (Easy, Medium, Hard)
- `category`: string (Array, String, etc.)
- `page`: number
- `limit`: number

**Response:**
```json
{
  "questions": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3ba",
      "questionId": "two-sum",
      "title": "Two Sum",
      "description": "Given an array of integers nums and an integer target...",
      "difficulty": "Easy",
      "categories": ["Array", "Hash Table"],
      "tags": ["Amazon", "Google"],
      "acceptanceRate": 47.5,
      "totalSubmissions": 1000,
      "successfulSubmissions": 475,
      "likes": 150,
      "dislikes": 25
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalQuestions": 100
  }
}
```

#### GET `/dsa-questions/:questionId`
Get specific DSA question with details.

**Query Parameters:**
- `includeSolutions`: boolean (default: false)

---

## Data Schemas

### User Schema
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  passwordHash?: string,
  role: "employee" | "employer",
  company?: string,
  industry?: string,
  jobDescription?: string,
  resumeUrl?: string,
  profileImageUrl?: string,
  refreshTokenHash?: string,
  googleId?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Enhanced Interview Session Schema
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: string,
  roundType: "technical" | "behavioral" | "hr" | "problem-solving" | "full",
  status: "active" | "completed" | "abandoned" | "paused",
  jobContext: {
    roleTitle: string,
    companyName: string,
    industry: string,
    resumeId?: ObjectId,
    jobDescriptionId?: ObjectId,
    experienceLevel?: string
  },
  questions: ObjectId[], // References to InterviewQuestion
  scores?: {
    overall: number, // 0-10
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
    averageResponseTime: number, // seconds
    totalDuration: number, // seconds
    pauseCount: number,
    fillerWordsTotal: number,
    averageSpeechClarity: number,
    averageConfidenceLevel: number
  },
  strengths: string[],
  areasForImprovement: string[],
  recommendations: string[],
  startedAt?: Date,
  completedAt?: Date,
  pausedAt?: Date,
  aiSessionId?: string,
  finalReport?: any,
  aiState?: any,
  metadata?: Map<string, string>,
  createdAt: Date,
  updatedAt: Date
}
```

### Interview Question Schema
```typescript
{
  _id: ObjectId,
  sessionId: ObjectId, // Reference to InterviewSession
  userId: ObjectId,
  questionText: string,
  questionType?: string, // technical, behavioral, hr, problem-solving
  competency?: string, // leadership, communication, problem-solving, etc.
  difficulty?: string, // easy, medium, hard
  answerText?: string,
  audioFilePath?: string,
  audioUrl?: string,
  audioAnalysis?: {
    transcription?: string,
    speechClarity: number, // 0-10
    paceScore: number, // 0-10
    confidenceLevel: number, // 0-10
    duration?: number, // seconds
    pauseCount?: number,
    fillerWords?: number
  },
  scores?: {
    overall: number, // 0-10
    communication: number,
    technical: number,
    behavioral: number,
    problemSolving: number,
    clarity: number,
    confidence: number
  },
  feedback?: string,
  strengths: string[],
  improvements: string[],
  responseTime?: number, // seconds
  questionAskedAt?: Date,
  answerSubmittedAt?: Date,
  aiResponse?: any, // Raw AI response for debugging
  createdAt: Date,
  updatedAt: Date
}
```

### User Interview Analytics Schema
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  // Round-specific statistics
  technical: {
    totalSessions: number,
    completedSessions: number,
    averageScore: number, // 0-10
    bestScore: number, // 0-10
    latestScore: number, // 0-10
    bestSessionId?: string,
    latestSessionId?: string,
    totalTimeSpent: number, // seconds
    averageResponseTime: number, // seconds
    lastAttemptDate?: Date,
    improvementTrend: number // positive = improving, negative = declining
  },
  behavioral: { /* same structure as technical */ },
  problemSolving: { /* same structure as technical */ },
  hr: { /* same structure as technical */ },
  // Overall statistics
  overall: {
    totalInterviews: number,
    completedInterviews: number,
    overallAverageScore: number, // 0-10
    bestOverallScore: number, // 0-10
    bestSessionId?: string,
    totalTimeSpent: number, // seconds
    strengths: string[],
    areasForImprovement: string[],
    lastInterviewDate?: Date,
    currentStreak: number, // consecutive completed interviews
    longestStreak: number
  },
  // Progress tracking
  monthlyProgress: [
    {
      month: string, // YYYY-MM format
      sessionsCount: number,
      averageScore: number, // 0-10
      timeSpent: number // seconds
    }
  ],
  recentSessions: ObjectId[], // Last 10 sessions
  skillScores?: Map<string, number>, // skill -> average score
  lastUpdated?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Resume Schema
```typescript
{
  _id: ObjectId,
  filename: string,
  path: string,
  stats: {
    overall_score: number,
    ats_score: number,
    content_score: number,
    format_score: number,
    keyword_match: number,
    sections_analysis: {
      contact_info: string,
      summary: string,
      experience: string,
      education: string,
      skills: string
    },
    suggestions: string[]
  },
  improvement_resume?: any,
  user: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Response Examples

### Successful Interview Session Dashboard
```json
{
  "totalInterviews": 25,
  "completedInterviews": 22,
  "averageScore": 8.3,
  "bestScore": 9.5,
  "currentStreak": 4,
  "longestStreak": 7,
  "totalTimeSpent": 18000,
  "recentSessions": [
    {
      "session_id": "enhanced_session_12345",
      "role_title": "Senior Software Engineer",
      "company_name": "Tech Corp",
      "status": "completed",
      "round_type": "technical",
      "overall_score": 9.0,
      "created_at": "2023-12-01T10:00:00.000Z",
      "question_count": 6
    },
    {
      "session_id": "session_67890",
      "role_title": "Full Stack Developer",
      "company_name": "StartupXYZ",
      "status": "completed",
      "round_type": "behavioral",
      "overall_score": 8.2,
      "created_at": "2023-11-28T14:30:00.000Z",
      "question_count": 4
    }
  ],
  "roundStats": {
    "technical": {
      "averageScore": 8.5,
      "totalSessions": 12,
      "bestScore": 9.5
    },
    "behavioral": {
      "averageScore": 8.0,
      "totalSessions": 8,
      "bestScore": 9.0
    },
    "problemSolving": {
      "averageScore": 8.7,
      "totalSessions": 3,
      "bestScore": 9.2
    },
    "hr": {
      "averageScore": 7.8,
      "totalSessions": 2,
      "bestScore": 8.5
    }
  }
}
```

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": "session_id",
    "issue": "Session ID is required"
  }
}
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- File upload endpoints: 10 requests per hour
- General API endpoints: 100 requests per minute

## File Upload Limits

- Resume files: 10MB max
- Audio files: 50MB max
- Profile images: 5MB max
- Job description files: 10MB max

## Supported File Formats

- **Resumes**: PDF
- **Audio**: WAV, MP3, M4A, OGG, WEBM, FLAC
- **Images**: JPG, JPEG, PNG
- **Job Descriptions**: PDF, TXT

---

This documentation covers all the interview analytics APIs with real data structures and comprehensive examples. The system tracks detailed interview performance, provides analytics dashboards, and maintains historical data for progress tracking.