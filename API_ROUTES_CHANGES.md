# API Routes & Changes Documentation

## Overview
Complete documentation of all new API routes, enhanced endpoints, and response changes made to the AI Interview and Job Management system.

---

## 🚀 **New API Routes**

### 1. **Enhanced Interview Management (`/interviews`)**

#### **Session Management**
```http
POST /interviews/start
```
**Description**: Start a new enhanced interview session with comprehensive tracking
**Request Body**:
```json
{
  "round": "technical" | "behavioral" | "problem-solving" | "hr",
  "role": "Senior Developer",
  "company": "Tech Corp",
  "jobDescription": "Full stack development role...",
  "experience": "5 years",
  "industry": "Technology"
}
```
**Response**:
```json
{
  "sessionId": "sess_123456789",
  "userId": "user_123",
  "round": "technical",
  "status": "active",
  "startedAt": "2025-01-27T10:00:00Z",
  "aiSessionId": "ai_sess_123"
}
```

---

```http
POST /interviews/:sessionId/complete
```
**Description**: Complete an interview session with final scores and report
**Request Body**:
```json
{
  "finalReport": {
    "overall_score": 8.5,
    "feedback": "Excellent performance...",
    "strengths": ["Problem solving", "Communication"],
    "weaknesses": ["Time management"]
  },
  "finalScores": {
    "overall": 8.5,
    "communication": 9.0,
    "technical": 8.0,
    "problemSolving": 8.5,
    "behavioral": 7.5
  }
}
```

---

#### **Analytics & Performance**
```http
GET /interviews/analytics
```
**Description**: Get comprehensive user analytics and performance data
**Response**:
```json
{
  "userId": "user_123",
  "technical": {
    "totalSessions": 8,
    "completedSessions": 7,
    "averageScore": 7.5,
    "bestScore": 9.1,
    "improvementTrend": 0.3,
    "lastAttemptDate": "2025-01-25T14:00:00Z"
  },
  "behavioral": { /* same structure */ },
  "problemSolving": { /* same structure */ },
  "hr": { /* same structure */ },
  "overall": {
    "totalInterviews": 25,
    "completedInterviews": 20,
    "overallAverageScore": 7.2,
    "bestOverallScore": 9.1,
    "currentStreak": 5,
    "longestStreak": 8,
    "totalTimeSpent": 18000,
    "strengths": ["Problem solving", "Communication"],
    "areasForImprovement": ["Time management"],
    "lastInterviewDate": "2025-01-25T14:00:00Z"
  },
  "monthlyProgress": [
    {
      "month": "2025-01",
      "sessionsCount": 5,
      "averageScore": 6.8,
      "timeSpent": 3600
    }
  ],
  "recentSessions": ["sess_123", "sess_456"],
  "skillScores": {
    "JavaScript": 8.5,
    "React": 9.0,
    "Node.js": 7.8
  }
}
```

---

```http
GET /interviews/dashboard-stats
```
**Description**: Get dashboard summary statistics for quick overview
**Response**:
```json
{
  "totalInterviews": 25,
  "completedInterviews": 20,
  "averageScore": 7.2,
  "bestScore": 9.1,
  "currentStreak": 5,
  "longestStreak": 8,
  "totalTimeSpent": 18000,
  "recentSessions": [
    {
      "id": "sess_123",
      "round": "technical",
      "score": 8.5,
      "date": "2025-01-27T10:00:00Z",
      "status": "completed"
    }
  ],
  "roundStats": {
    "technical": {
      "averageScore": 7.5,
      "totalSessions": 8,
      "bestScore": 9.1
    },
    "behavioral": { /* same structure */ },
    "problemSolving": { /* same structure */ },
    "hr": { /* same structure */ }
  }
}
```

---

```http
GET /interviews/performance-insights
```
**Description**: Get AI-generated performance insights and recommendations
**Response**:
```json
{
  "analytics": {
    "overall": {
      "totalInterviews": 25,
      "averageScore": 7.2,
      "improvementTrend": 0.3
    },
    "recentPerformance": [
      {
        "sessionId": "sess_123",
        "score": 8.5,
        "round": "technical",
        "date": "2025-01-27T10:00:00Z"
      }
    ]
  },
  "insights": [
    "Your performance is improving! Keep up the good work.",
    "Your strongest area is technical interviews.",
    "Great consistency! You've completed 5 interviews in a row."
  ],
  "recommendations": [
    "Focus on time management during technical rounds",
    "Practice STAR method for behavioral questions",
    "Review system design concepts"
  ],
  "nextGoals": [
    "Achieve 8.0+ average score in behavioral rounds",
    "Complete 10 consecutive interviews",
    "Improve response time by 10%"
  ]
}
```

---

```http
GET /interviews/monthly-progress
```
**Description**: Get monthly performance progress data for trend analysis
**Response**:
```json
{
  "monthlyProgress": [
    {
      "month": "2024-11",
      "sessionsCount": 3,
      "averageScore": 6.2,
      "timeSpent": 2400
    },
    {
      "month": "2024-12",
      "sessionsCount": 7,
      "averageScore": 6.8,
      "timeSpent": 4200
    },
    {
      "month": "2025-01",
      "sessionsCount": 8,
      "averageScore": 7.2,
      "timeSpent": 4800
    }
  ],
  "trends": {
    "scoreImprovement": 1.0,
    "activityIncrease": 5,
    "consistencyRating": 8.5
  }
}
```

---

```http
GET /interviews/round-comparison
```
**Description**: Compare performance across different interview rounds
**Response**:
```json
{
  "technical": {
    "averageScore": 7.5,
    "completedSessions": 8,
    "improvementTrend": 0.4,
    "bestScore": 9.1,
    "lastAttempt": "2025-01-25T14:00:00Z",
    "strengths": ["Algorithm design", "Code optimization"],
    "weaknesses": ["System design", "Time complexity"]
  },
  "behavioral": {
    "averageScore": 6.8,
    "completedSessions": 7,
    "improvementTrend": 0.2,
    "bestScore": 8.5,
    "lastAttempt": "2025-01-24T16:30:00Z",
    "strengths": ["Communication", "Leadership examples"],
    "weaknesses": ["Conflict resolution", "STAR method"]
  },
  "problemSolving": { /* same structure */ },
  "hr": { /* same structure */ },
  "recommendations": {
    "focusArea": "behavioral",
    "reason": "Lowest average score with room for improvement",
    "suggestedActions": [
      "Practice STAR method responses",
      "Prepare more leadership examples",
      "Work on conflict resolution scenarios"
    ]
  }
}
```

---

```http
GET /interviews/leaderboard
```
**Description**: Get leaderboard data for gamification
**Query Parameters**:
- `round`: Filter by specific round (optional)
- `limit`: Number of top performers (default: 10)

**Response**:
```json
[
  {
    "userId": "user_123",
    "userName": "John Doe",
    "score": 8.9,
    "totalInterviews": 15,
    "round": "technical",
    "rank": 1
  },
  {
    "userId": "user_456",
    "userName": "Jane Smith",
    "score": 8.7,
    "totalInterviews": 12,
    "round": "technical",
    "rank": 2
  }
]
```

---

```http
GET /interviews/my-sessions
```
**Description**: Get user's interview sessions with filtering and pagination
**Query Parameters**:
- `round`: Filter by interview round (optional)
- `limit`: Number of sessions (default: 20)
- `offset`: Pagination offset (default: 0)

**Response**:
```json
[
  {
    "sessionId": "sess_123",
    "round": "technical",
    "status": "completed",
    "role": "Senior Developer",
    "company": "Tech Corp",
    "metrics": {
      "overallScore": 8.5,
      "totalDuration": 3600,
      "questionsAnswered": 10,
      "averageResponseTime": 95
    },
    "startedAt": "2025-01-27T10:00:00Z",
    "completedAt": "2025-01-27T11:00:00Z"
  }
]
```

---

```http
GET /interviews/session/:sessionId
```
**Description**: Get detailed information about a specific interview session
**Response**:
```json
{
  "sessionId": "sess_123456789",
  "userId": "user_123",
  "round": "technical",
  "status": "completed",
  "role": "Senior Developer",
  "company": "Tech Corp",
  "questionsAnswers": [
    {
      "question": "Explain the difference between REST and GraphQL",
      "answer": "REST is an architectural style...",
      "audioUrl": "/uploads/audio/response1.mp3",
      "videoUrl": "/uploads/video/response1.mp4",
      "responseDuration": 120,
      "feedback": "Good explanation, but could mention caching differences",
      "score": 7.5,
      "answeredAt": "2025-01-27T10:15:00Z"
    }
  ],
  "metrics": {
    "totalQuestions": 10,
    "answeredQuestions": 10,
    "averageResponseTime": 95,
    "totalDuration": 3600,
    "overallScore": 8.2,
    "communicationScore": 8.5,
    "technicalScore": 8.0,
    "problemSolvingScore": 8.3,
    "behavioralScore": 7.8
  },
  "finalReport": {
    "overall_score": 8.2,
    "strengths": ["Strong technical knowledge", "Clear communication"],
    "weaknesses": ["Could improve on system design"],
    "recommendations": ["Practice more system design questions"]
  }
}
```

---

### 2. **Enhanced Job Management (`/jobs/enhanced`)**

#### **Job CRUD Operations**
```http
POST /jobs/enhanced
```
**Description**: Create a new job with PDF generation and AI integration
**Request Body**:
```json
{
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "requirements": ["5+ years React", "TypeScript experience"],
  "location": "San Francisco, CA",
  "jobType": "full-time",
  "experienceLevel": "senior",
  "skills": ["React", "TypeScript", "Node.js"],
  "salaryRange": { "min": 120000, "max": 180000 },
  "benefits": ["Health insurance", "401k matching"],
  "companyInfo": "We are a fast-growing startup..."
}
```
**Response**:
```json
{
  "_id": "job_123456789",
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "employerId": "employer_123",
  "isActive": true,
  "postedAt": "2025-01-27T10:00:00Z",
  "createdAt": "2025-01-27T10:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z"
}
```

---

```http
PUT /jobs/enhanced/:jobId
```
**Description**: Update job details (triggers PDF regeneration and AI update)
**Request Body**: Same as POST (partial updates allowed)

---

```http
DELETE /jobs/enhanced/:jobId
```
**Description**: Delete a job (with validation for active applications)
**Response**:
```json
{
  "message": "Job deleted successfully"
}
```

---

```http
GET /jobs/enhanced/my-jobs
```
**Description**: Get employer's jobs with filtering
**Query Parameters**:
- `isActive`: Filter by active status (optional)
- `jobType`: Filter by job type (optional)
- `experienceLevel`: Filter by experience level (optional)

**Response**:
```json
[
  {
    "_id": "job_123",
    "title": "Senior React Developer",
    "location": "San Francisco, CA",
    "jobType": "full-time",
    "experienceLevel": "senior",
    "isActive": true,
    "postedAt": "2025-01-27T10:00:00Z",
    "applicationCount": 15,
    "viewCount": 120,
    "avgAIMatch": 73.5
  }
]
```

---

#### **Application Management**
```http
GET /jobs/enhanced/:jobId/applications
```
**Description**: Get job applications with AI match scores and interview performance
**Response**:
```json
[
  {
    "_id": "app_123",
    "jobId": "job_456",
    "applicantId": {
      "_id": "user_789",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "pending",
    "appliedAt": "2025-01-27T09:00:00Z",
    "aiMatchingScore": {
      "overallMatch": 87,
      "skillsMatch": 92,
      "experienceMatch": 83,
      "matchingKeywords": ["React", "TypeScript", "Node.js"],
      "missingSkills": ["GraphQL", "Docker"],
      "aiRecommendation": "Strong candidate with excellent React skills. Consider for technical interview."
    },
    "interviewScores": {
      "overall": 8.2,
      "technical": 8.5,
      "behavioral": 7.8,
      "problemSolving": 8.7,
      "hr": 7.9,
      "bestSessionId": "sess_best_123",
      "totalInterviews": 3,
      "lastInterviewDate": "2025-01-20T14:30:00Z"
    },
    "employerNotes": "Strong technical background",
    "resumeUrl": "/uploads/resumes/resume_123.pdf"
  }
]
```

---

```http
GET /jobs/enhanced/:jobId/top-candidates
```
**Description**: Get AI-recommended top candidates for a job
**Query Parameters**:
- `limit`: Number of candidates (default: 10)

**Response**: Same structure as applications, sorted by AI match + interview scores

---

```http
PUT /jobs/enhanced/applications/:applicationId/status
```
**Description**: Update application status with notes
**Request Body**:
```json
{
  "status": "shortlisted",
  "notes": "Moving to next round based on strong technical scores",
  "rejectionReason": "Not a good fit for the role" // only for rejected status
}
```

---

```http
POST /jobs/enhanced/bulk-update-status
```
**Description**: Update multiple applications at once
**Request Body**:
```json
{
  "applicationIds": ["app_123", "app_456", "app_789"],
  "status": "shortlisted",
  "notes": "Moving to next round",
  "rejectionReason": "Skills don't match requirements"
}
```
**Response**:
```json
{
  "totalProcessed": 3,
  "successful": 2,
  "failed": 1,
  "results": [
    {
      "applicationId": "app_123",
      "success": true,
      "application": { /* updated application */ }
    },
    {
      "applicationId": "app_456",
      "success": false,
      "error": "Application not found"
    }
  ]
}
```

---

#### **Analytics & Insights**
```http
GET /jobs/enhanced/:jobId/analytics
```
**Description**: Get comprehensive job performance analytics
**Response**:
```json
{
  "totalApplications": 45,
  "statusBreakdown": {
    "pending": 12,
    "reviewed": 15,
    "shortlisted": 8,
    "rejected": 8,
    "hired": 2
  },
  "averageAIMatch": 73.5,
  "averageInterviewScore": 7.2,
  "topSkills": [
    { "skill": "React", "count": 38 },
    { "skill": "JavaScript", "count": 42 },
    { "skill": "TypeScript", "count": 35 }
  ],
  "applicationTrend": [
    { "date": "2025-01-15", "count": 3 },
    { "date": "2025-01-16", "count": 7 },
    { "date": "2025-01-17", "count": 5 }
  ],
  "scoreDistribution": {
    "aiMatch": [
      { "range": "90-100", "count": 8 },
      { "range": "80-89", "count": 15 },
      { "range": "70-79", "count": 12 }
    ],
    "interview": [
      { "range": "8-10", "count": 6 },
      { "range": "6-7.9", "count": 18 },
      { "range": "0-5.9", "count": 8 }
    ]
  }
}
```

---

```http
GET /jobs/enhanced/dashboard-stats
```
**Description**: Get employer dashboard statistics
**Response**:
```json
{
  "totalJobs": 15,
  "activeJobs": 12,
  "totalApplications": 247,
  "pendingApplications": 23,
  "recentJobs": [
    {
      "id": "job_123",
      "title": "Senior React Developer",
      "location": "San Francisco, CA",
      "postedAt": "2025-01-20T10:00:00Z",
      "isActive": true,
      "applicationCount": 15,
      "pendingApplications": 3
    }
  ]
}
```

---

### 3. **AI Matcher Integration**

#### **New AI Matcher Service Methods**
```typescript
// Get match score between applicant and job
async getMatchScore(applicantId: string, jobDescription: string, jobFilePath?: string)

// Upload job description for AI processing
async uploadJobDescription(jobId: string, jobFilePath: string)
```

**AI Matcher API Calls**:
```http
POST http://localhost:8000/match-score
Content-Type: multipart/form-data

applicant_id: user_123
jd_text: "Job description text..."
// OR
jd_file: @job_description.pdf
```

**Response**:
```json
{
  "applicant_id": "user_123",
  "match_score": 85.5,
  "skills_match": 90,
  "experience_match": 80,
  "missing_keywords": ["Docker", "AWS"],
  "matching_keywords": ["React", "TypeScript", "Node.js"],
  "suggestions": ["Add cloud experience", "Learn containerization"]
}
```

---

## 🔄 **Enhanced Response Structures**

### **Interview Session Response**
```json
{
  "sessionId": "sess_123456789",
  "userId": "user_123",
  "round": "technical",
  "status": "completed",
  "role": "Senior Developer",
  "company": "Tech Corp",
  "jobDescription": "Full stack development role...",
  "experience": "5 years",
  "industry": "Technology",
  "questionsAnswers": [
    {
      "question": "Explain closures in JavaScript",
      "answer": "A closure is a function that has access to...",
      "audioUrl": "/uploads/audio/response1.mp3",
      "videoUrl": "/uploads/video/response1.mp4",
      "responseDuration": 120,
      "feedback": "Good explanation with examples",
      "score": 8.0,
      "answeredAt": "2025-01-27T10:15:00Z"
    }
  ],
  "metrics": {
    "totalQuestions": 10,
    "answeredQuestions": 10,
    "averageResponseTime": 95,
    "totalDuration": 3600,
    "overallScore": 8.2,
    "communicationScore": 8.5,
    "technicalScore": 8.0,
    "problemSolvingScore": 8.3,
    "behavioralScore": 7.8
  },
  "startedAt": "2025-01-27T10:00:00Z",
  "completedAt": "2025-01-27T11:00:00Z",
  "createdAt": "2025-01-27T10:00:00Z",
  "updatedAt": "2025-01-27T11:00:00Z",
  "aiSessionId": "ai_sess_123",
  "finalReport": {
    "overall_score": 8.2,
    "communication_score": 8.5,
    "behavioral_score": 7.8,
    "technical_score": 8.0,
    "problem_solving_score": 8.3,
    "feedback": "Strong performance across all areas",
    "strengths": ["Clear communication", "Strong technical knowledge"],
    "weaknesses": ["Could improve on system design"],
    "recommendations": ["Practice more system design questions"]
  }
}
```

### **Job Application Response (Enhanced)**
```json
{
  "_id": "app_123456789",
  "jobId": "job_456",
  "applicantId": "user_789",
  "employerId": "employer_123",
  "status": "pending",
  "resumeUrl": "/uploads/resumes/resume_123.pdf",
  "coverLetter": "I am excited to apply...",
  "aiMatchingScore": {
    "overallMatch": 87,
    "skillsMatch": 92,
    "experienceMatch": 83,
    "matchingKeywords": ["React", "TypeScript", "Node.js"],
    "missingSkills": ["GraphQL", "Docker"],
    "aiRecommendation": "Strong candidate with excellent React skills. Consider for technical interview."
  },
  "interviewScores": {
    "overall": 8.2,
    "technical": 8.5,
    "behavioral": 7.8,
    "problemSolving": 8.7,
    "hr": 7.9,
    "bestSessionId": "sess_best_123",
    "totalInterviews": 3,
    "lastInterviewDate": "2025-01-20T14:30:00Z"
  },
  "employerNotes": "Strong technical background, good communication skills",
  "rejectionReason": null,
  "appliedAt": "2025-01-27T09:00:00Z",
  "reviewedAt": null,
  "interviewScheduledAt": null,
  "statusUpdatedAt": "2025-01-27T09:00:00Z",
  "createdAt": "2025-01-27T09:00:00Z",
  "updatedAt": "2025-01-27T09:00:00Z"
}
```

### **User Analytics Response**
```json
{
  "userId": "user_123",
  "technical": {
    "totalSessions": 8,
    "completedSessions": 7,
    "averageScore": 7.5,
    "bestScore": 9.1,
    "latestScore": 8.2,
    "bestSessionId": "sess_best_tech",
    "latestSessionId": "sess_latest_tech",
    "totalTimeSpent": 14400,
    "averageResponseTime": 85,
    "lastAttemptDate": "2025-01-25T14:00:00Z",
    "improvementTrend": 0.4
  },
  "behavioral": { /* same structure */ },
  "problemSolving": { /* same structure */ },
  "hr": { /* same structure */ },
  "overall": {
    "totalInterviews": 25,
    "completedInterviews": 20,
    "overallAverageScore": 7.2,
    "bestOverallScore": 9.1,
    "bestSessionId": "sess_best_overall",
    "totalTimeSpent": 18000,
    "strengths": ["Problem solving", "Communication", "Technical skills"],
    "areasForImprovement": ["Time management", "System design"],
    "lastInterviewDate": "2025-01-25T14:00:00Z",
    "currentStreak": 5,
    "longestStreak": 8
  },
  "monthlyProgress": [
    {
      "month": "2025-01",
      "sessionsCount": 5,
      "averageScore": 6.8,
      "timeSpent": 3600
    }
  ],
  "recentSessions": ["sess_123", "sess_456", "sess_789"],
  "skillScores": {
    "JavaScript": 8.5,
    "React": 9.0,
    "Node.js": 7.8,
    "System Design": 6.5
  },
  "lastUpdated": "2025-01-27T10:00:00Z",
  "createdAt": "2025-01-15T08:00:00Z",
  "updatedAt": "2025-01-27T10:00:00Z"
}
```

---

## 🔧 **Database Schema Changes**

### **New Collections**
1. **InterviewSession**: Comprehensive session tracking
2. **UserInterviewAnalytics**: User performance analytics
3. **JobApplication**: Enhanced application tracking with AI scores

### **Enhanced Schemas**
1. **Job Schema**: Added salary range, job type, experience level, skills, benefits
2. **User Schema**: Enhanced with role-based access control
3. **Application Schema**: Added AI matching scores and interview performance

---

## 🚦 **Error Handling**

### **HTTP Status Codes**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (role-based access)
- `404`: Not Found
- `500`: Internal Server Error

### **Error Response Format**
```json
{
  "error": true,
  "message": "Validation failed",
  "details": {
    "field": "title",
    "message": "Job title is required"
  },
  "statusCode": 400
}
```

---

## 🔐 **Authentication & Authorization**

### **Required Headers**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Role-based Access**
- **Employee Routes**: Require `UserRole.EMPLOYEE`
- **Employer Routes**: Require `UserRole.EMPLOYER`
- **Admin Routes**: Require `UserRole.ADMIN` (future)

### **JWT Token Payload**
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "role": "employee",
  "iat": 1640995200,
  "exp": 1640998800
}
```

This comprehensive documentation covers all new routes, enhanced responses, and system changes made to support the enhanced interview and job management features.