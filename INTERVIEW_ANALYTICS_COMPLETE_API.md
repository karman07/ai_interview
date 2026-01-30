# Interview Analytics APIs - Complete Documentation

## Overview
Complete API documentation for interview analytics endpoints with per-question saving and real-time analytics computation.

**Base URL:** `http://localhost:3000/api/interview-results`

**Authentication:** All endpoints require JWT Bearer token

---

## 📊 Analytics Endpoints

### 1. Get User Dashboard Analytics
Get comprehensive analytics dashboard for the authenticated user.

**Endpoint:** `GET /api/interview-results/dashboard`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X GET http://localhost:3000/api/interview-results/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "userId": "697c87811135ecf66c3d23e2",
  "summary": {
    "totalInterviews": 8,
    "completedInterviews": 8,
    "averageScore": 78.5,
    "totalQuestionsAnswered": 42,
    "lastInterviewDate": "2026-01-30T14:25:30.000Z"
  },
  "roundBreakdown": [
    {
      "roundType": "technical",
      "count": 3,
      "averageScore": 82.3,
      "lastAttempted": "2026-01-30T14:25:30.000Z"
    },
    {
      "roundType": "behavioral",
      "count": 2,
      "averageScore": 75.8,
      "lastAttempted": "2026-01-28T10:15:22.000Z"
    },
    {
      "roundType": "hr",
      "count": 2,
      "averageScore": 73.2,
      "lastAttempted": "2026-01-27T16:42:18.000Z"
    },
    {
      "roundType": "problem-solving",
      "count": 1,
      "averageScore": 80.0,
      "lastAttempted": "2026-01-25T09:30:45.000Z"
    }
  ],
  "performanceTrend": {
    "technical": [78, 82, 87],
    "behavioral": [72, 79],
    "hr": [70, 76],
    "problem-solving": [80]
  },
  "topSkills": [
    {
      "skill": "Technical Depth",
      "score": 85.5
    },
    {
      "skill": "Communication",
      "score": 79.2
    },
    {
      "skill": "Problem Solving",
      "score": 80.0
    },
    {
      "skill": "Clarity",
      "score": 77.8
    }
  ],
  "recentInterviews": [
    {
      "sessionId": "679d234a5f6e7c8d9e0f1a2b",
      "roundType": "technical",
      "companyName": "TechCorp Inc",
      "roleTitle": "Senior Software Engineer",
      "totalQuestions": 8,
      "overallScore": 87.2,
      "completedAt": "2026-01-30T14:25:30.000Z"
    },
    {
      "sessionId": "679d234a5f6e7c8d9e0f1a2c",
      "roundType": "behavioral",
      "companyName": "StartupXYZ",
      "roleTitle": "Tech Lead",
      "totalQuestions": 6,
      "overallScore": 79.5,
      "completedAt": "2026-01-28T10:15:22.000Z"
    },
    {
      "sessionId": "679d234a5f6e7c8d9e0f1a2d",
      "roundType": "technical",
      "companyName": "DataSoft",
      "roleTitle": "Full Stack Developer",
      "totalQuestions": 7,
      "overallScore": 82.8,
      "completedAt": "2026-01-26T18:45:12.000Z"
    }
  ]
}
```

---

### 2. Get Interview History
Get paginated list of all user's interviews with basic info.

**Endpoint:** `GET /api/interview-results/history`

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 10
- `roundType` (optional): Filter by round type (technical, behavioral, hr, problem-solving)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X GET "http://localhost:3000/api/interview-results/history?page=1&limit=5&roundType=technical" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "data": [
    {
      "sessionId": "679d234a5f6e7c8d9e0f1a2b",
      "userId": "697c87811135ecf66c3d23e2",
      "roundType": "technical",
      "totalQuestions": 8,
      "scores": {
        "overall": 87.2,
        "technical": 89.5,
        "clarity": 85.0,
        "confidence": 86.8,
        "communication": 84.5
      },
      "roleTitle": "Senior Software Engineer",
      "companyName": "TechCorp Inc",
      "industry": "Software",
      "completedAt": "2026-01-30T14:25:30.000Z"
    },
    {
      "sessionId": "679d234a5f6e7c8d9e0f1a2c",
      "userId": "697c87811135ecf66c3d23e2",
      "roundType": "technical",
      "totalQuestions": 7,
      "scores": {
        "overall": 82.8,
        "technical": 84.2,
        "clarity": 81.5,
        "confidence": 83.0,
        "communication": 82.0
      },
      "roleTitle": "Full Stack Developer",
      "companyName": "DataSoft",
      "industry": "Technology",
      "completedAt": "2026-01-26T18:45:12.000Z"
    },
    {
      "sessionId": "679d234a5f6e7c8d9e0f1a2d",
      "userId": "697c87811135ecf66c3d23e2",
      "roundType": "technical",
      "totalQuestions": 6,
      "scores": {
        "overall": 78.5,
        "technical": 80.0,
        "clarity": 77.5,
        "confidence": 78.0,
        "communication": 76.5
      },
      "roleTitle": "Backend Developer",
      "companyName": "CloudServices LLC",
      "industry": "Cloud Computing",
      "completedAt": "2026-01-22T11:30:45.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 3,
    "itemsPerPage": 5
  }
}
```

---

### 3. Get Session Details with Questions
Get complete details of a specific interview session including all questions.

**Endpoint:** `GET /api/interview-results/session/:sessionId`

**Path Parameters:**
- `sessionId`: MongoDB ObjectId of the session

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X GET http://localhost:3000/api/interview-results/session/679d234a5f6e7c8d9e0f1a2b \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "sessionId": "679d234a5f6e7c8d9e0f1a2b",
  "userId": "697c87811135ecf66c3d23e2",
  "roundType": "technical",
  "totalQuestions": 8,
  "scores": {
    "overall": 87.2,
    "technical": 89.5,
    "clarity": 85.0,
    "confidence": 86.8,
    "communication": 84.5
  },
  "voiceMetrics": {
    "avgClarity": 84.5,
    "avgConfidence": 86.8,
    "avgPace": 82.0
  },
  "questions": [
    {
      "questionNumber": 1,
      "question": "Can you explain the difference between REST and GraphQL APIs?",
      "answer": "REST APIs use multiple endpoints with standard HTTP methods, while GraphQL uses a single endpoint with a flexible query language. GraphQL allows clients to request exactly the data they need, reducing over-fetching and under-fetching problems common in REST.",
      "totalScore": 88,
      "technicalDepth": 90,
      "clarity": 86,
      "feedback": "Excellent explanation covering key differences. Good understanding of both paradigms.",
      "suggestions": [
        "Could mention performance considerations",
        "Add examples of when to use each"
      ]
    },
    {
      "questionNumber": 2,
      "question": "What are the SOLID principles in object-oriented programming?",
      "answer": "SOLID stands for Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. These principles help create maintainable and scalable code. For example, Single Responsibility means each class should have one reason to change.",
      "totalScore": 92,
      "technicalDepth": 94,
      "clarity": 90,
      "feedback": "Outstanding answer with clear explanations and examples.",
      "suggestions": [
        "Could provide real-world code examples"
      ]
    },
    {
      "questionNumber": 3,
      "question": "How would you optimize a slow database query?",
      "answer": "I would first use EXPLAIN to analyze the query execution plan, check for missing indexes, look for N+1 query problems, consider query caching, optimize JOIN operations, and possibly denormalize data if needed. I'd also check for slow functions or complex calculations in the query.",
      "totalScore": 85,
      "technicalDepth": 87,
      "clarity": 83,
      "feedback": "Good systematic approach. Shows understanding of multiple optimization techniques.",
      "suggestions": [
        "Mention monitoring tools",
        "Discuss when to use database-specific features"
      ]
    },
    {
      "questionNumber": 4,
      "question": "Explain the concept of microservices architecture.",
      "answer": "Microservices architecture breaks down applications into small, independent services that communicate via APIs. Each service handles a specific business capability and can be developed, deployed, and scaled independently. This provides better scalability and fault isolation compared to monolithic architecture.",
      "totalScore": 86,
      "technicalDepth": 88,
      "clarity": 84,
      "feedback": "Solid understanding of microservices. Good comparison with monolithic architecture.",
      "suggestions": [
        "Discuss challenges like distributed tracing",
        "Mention service mesh concepts"
      ]
    },
    {
      "questionNumber": 5,
      "question": "What is the difference between authentication and authorization?",
      "answer": "Authentication verifies who you are - like logging in with username and password. Authorization determines what you can access - like checking if you have permission to view a resource. Authentication comes first, then authorization.",
      "totalScore": 90,
      "technicalDepth": 92,
      "clarity": 88,
      "feedback": "Clear and concise explanation with good examples.",
      "suggestions": []
    },
    {
      "questionNumber": 6,
      "question": "How do you handle errors in asynchronous JavaScript code?",
      "answer": "I use try-catch blocks with async/await for cleaner error handling. For Promises, I use .catch() or the second parameter in .then(). I also implement global error handlers and proper logging. For unhandled rejections, I set up process-level handlers.",
      "totalScore": 84,
      "technicalDepth": 86,
      "clarity": 82,
      "feedback": "Good coverage of different error handling approaches.",
      "suggestions": [
        "Mention error boundaries in React",
        "Discuss error monitoring tools"
      ]
    },
    {
      "questionNumber": 7,
      "question": "Explain the concept of database transactions and ACID properties.",
      "answer": "Transactions ensure data consistency. ACID stands for Atomicity (all or nothing), Consistency (data remains valid), Isolation (concurrent transactions don't interfere), and Durability (committed data persists). These properties guarantee reliable database operations.",
      "totalScore": 87,
      "technicalDepth": 89,
      "clarity": 85,
      "feedback": "Excellent explanation of ACID properties with clear definitions.",
      "suggestions": [
        "Could mention transaction isolation levels"
      ]
    },
    {
      "questionNumber": 8,
      "question": "What are your strategies for writing testable code?",
      "answer": "I follow dependency injection, write pure functions when possible, keep functions small and focused, use interfaces for abstraction, avoid tight coupling, and separate business logic from framework code. I also practice TDD where appropriate.",
      "totalScore": 86,
      "technicalDepth": 88,
      "clarity": 84,
      "feedback": "Strong understanding of testability principles.",
      "suggestions": [
        "Mention mocking strategies",
        "Discuss test coverage goals"
      ]
    }
  ],
  "roleTitle": "Senior Software Engineer",
  "companyName": "TechCorp Inc",
  "industry": "Software"
}
```

---

### 4. Get Questions Only
Get just the questions list for a session without full analytics.

**Endpoint:** `GET /api/interview-results/session/:sessionId/questions`

**Path Parameters:**
- `sessionId`: MongoDB ObjectId of the session

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X GET http://localhost:3000/api/interview-results/session/679d234a5f6e7c8d9e0f1a2b/questions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "sessionId": "679d234a5f6e7c8d9e0f1a2b",
  "totalQuestions": 8,
  "questions": [
    {
      "_id": "679d345b6c7d8e9f0a1b2c3d",
      "questionText": "Can you explain the difference between REST and GraphQL APIs?",
      "answerText": "REST APIs use multiple endpoints with standard HTTP methods, while GraphQL uses a single endpoint with a flexible query language...",
      "scores": {
        "overall": 88,
        "technical": 90,
        "clarity": 86,
        "confidence": 87,
        "communication": 85
      },
      "feedback": "Excellent explanation covering key differences.",
      "createdAt": "2026-01-30T14:20:15.000Z"
    },
    {
      "_id": "679d345b6c7d8e9f0a1b2c3e",
      "questionText": "What are the SOLID principles in object-oriented programming?",
      "answerText": "SOLID stands for Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion...",
      "scores": {
        "overall": 92,
        "technical": 94,
        "clarity": 90,
        "confidence": 91,
        "communication": 89
      },
      "feedback": "Outstanding answer with clear explanations and examples.",
      "createdAt": "2026-01-30T14:21:30.000Z"
    },
    {
      "_id": "679d345b6c7d8e9f0a1b2c3f",
      "questionText": "How would you optimize a slow database query?",
      "answerText": "I would first use EXPLAIN to analyze the query execution plan, check for missing indexes...",
      "scores": {
        "overall": 85,
        "technical": 87,
        "clarity": 83,
        "confidence": 84,
        "communication": 82
      },
      "feedback": "Good systematic approach. Shows understanding of multiple optimization techniques.",
      "createdAt": "2026-01-30T14:22:45.000Z"
    }
  ]
}
```

---

### 5. Get Voice & Communication Analytics
Get detailed voice and communication metrics for a session.

**Endpoint:** `GET /api/interview-results/session/:sessionId/voice-analytics`

**Path Parameters:**
- `sessionId`: MongoDB ObjectId of the session

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X GET http://localhost:3000/api/interview-results/session/679d234a5f6e7c8d9e0f1a2b/voice-analytics \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "sessionId": "679d234a5f6e7c8d9e0f1a2b",
  "roundType": "technical",
  "totalQuestions": 8,
  "overallVoiceMetrics": {
    "avgSpeechClarity": 84.5,
    "avgConfidenceLevel": 86.8,
    "avgPaceScore": 82.0,
    "avgCommunicationScore": 84.5
  },
  "questionWiseAnalysis": [
    {
      "questionNumber": 1,
      "question": "Can you explain the difference between REST and GraphQL APIs?",
      "audioAnalysis": {
        "speechClarity": 85,
        "confidenceLevel": 87,
        "paceScore": 82,
        "transcription": "REST APIs use multiple endpoints with standard HTTP methods, while GraphQL uses a single endpoint with a flexible query language..."
      },
      "communicationScore": 85
    },
    {
      "questionNumber": 2,
      "question": "What are the SOLID principles in object-oriented programming?",
      "audioAnalysis": {
        "speechClarity": 89,
        "confidenceLevel": 91,
        "paceScore": 85,
        "transcription": "SOLID stands for Single Responsibility, Open-Closed, Liskov Substitution..."
      },
      "communicationScore": 89
    },
    {
      "questionNumber": 3,
      "question": "How would you optimize a slow database query?",
      "audioAnalysis": {
        "speechClarity": 82,
        "confidenceLevel": 84,
        "paceScore": 80,
        "transcription": "I would first use EXPLAIN to analyze the query execution plan..."
      },
      "communicationScore": 82
    },
    {
      "questionNumber": 4,
      "question": "Explain the concept of microservices architecture.",
      "audioAnalysis": {
        "speechClarity": 84,
        "confidenceLevel": 86,
        "paceScore": 81,
        "transcription": "Microservices architecture breaks down applications into small, independent services..."
      },
      "communicationScore": 84
    },
    {
      "questionNumber": 5,
      "question": "What is the difference between authentication and authorization?",
      "audioAnalysis": {
        "speechClarity": 88,
        "confidenceLevel": 90,
        "paceScore": 84,
        "transcription": "Authentication verifies who you are - like logging in with username and password..."
      },
      "communicationScore": 88
    },
    {
      "questionNumber": 6,
      "question": "How do you handle errors in asynchronous JavaScript code?",
      "audioAnalysis": {
        "speechClarity": 82,
        "confidenceLevel": 84,
        "paceScore": 80,
        "transcription": "I use try-catch blocks with async/await for cleaner error handling..."
      },
      "communicationScore": 82
    },
    {
      "questionNumber": 7,
      "question": "Explain the concept of database transactions and ACID properties.",
      "audioAnalysis": {
        "speechClarity": 85,
        "confidenceLevel": 87,
        "paceScore": 83,
        "transcription": "Transactions ensure data consistency. ACID stands for Atomicity..."
      },
      "communicationScore": 85
    },
    {
      "questionNumber": 8,
      "question": "What are your strategies for writing testable code?",
      "audioAnalysis": {
        "speechClarity": 84,
        "confidenceLevel": 86,
        "paceScore": 81,
        "transcription": "I follow dependency injection, write pure functions when possible..."
      },
      "communicationScore": 84
    }
  ],
  "insights": {
    "strengthAreas": [
      "Consistent confidence level throughout interview",
      "Good speech clarity on complex topics"
    ],
    "improvementAreas": [
      "Maintain consistent pace across all answers",
      "Some questions had lower clarity scores"
    ],
    "trend": "improving"
  }
}
```

---

### 6. Get Performance Statistics
Get overall performance statistics across all interviews.

**Endpoint:** `GET /api/interview-results/stats/performance`

**Query Parameters:**
- `roundType` (optional): Filter by round type
- `days` (optional): Number of days to analyze (default: 30)

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X GET "http://localhost:3000/api/interview-results/stats/performance?days=30" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "userId": "697c87811135ecf66c3d23e2",
  "timeRange": {
    "days": 30,
    "from": "2025-12-31T00:00:00.000Z",
    "to": "2026-01-30T23:59:59.000Z"
  },
  "overallStats": {
    "totalInterviews": 8,
    "totalQuestions": 42,
    "averageScore": 83.7,
    "highestScore": 92.0,
    "lowestScore": 70.0,
    "scoreImprovement": 12.5
  },
  "roundWisePerformance": {
    "technical": {
      "attempts": 3,
      "averageScore": 84.5,
      "averageTechnicalDepth": 87.2,
      "averageClarity": 82.8,
      "trend": "improving",
      "scoreProgression": [78.5, 82.8, 87.2]
    },
    "behavioral": {
      "attempts": 2,
      "averageScore": 77.6,
      "averageTechnicalDepth": 0,
      "averageClarity": 76.5,
      "trend": "improving",
      "scoreProgression": [75.8, 79.5]
    },
    "hr": {
      "attempts": 2,
      "averageScore": 73.2,
      "averageTechnicalDepth": 0,
      "averageClarity": 72.0,
      "trend": "stable",
      "scoreProgression": [70.0, 76.5]
    },
    "problem-solving": {
      "attempts": 1,
      "averageScore": 80.0,
      "averageTechnicalDepth": 82.5,
      "averageClarity": 78.0,
      "trend": "stable",
      "scoreProgression": [80.0]
    }
  },
  "skillAnalysis": {
    "technicalDepth": {
      "average": 85.4,
      "trend": "improving",
      "topPerformance": 94,
      "needsImprovement": false
    },
    "clarity": {
      "average": 79.8,
      "trend": "improving",
      "topPerformance": 90,
      "needsImprovement": false
    },
    "confidence": {
      "average": 82.1,
      "trend": "stable",
      "topPerformance": 91,
      "needsImprovement": false
    },
    "communication": {
      "average": 81.5,
      "trend": "improving",
      "topPerformance": 89,
      "needsImprovement": false
    }
  },
  "timeBasedInsights": {
    "mostProductiveDay": "Wednesday",
    "mostProductiveTime": "14:00-16:00",
    "interviewsThisWeek": 2,
    "interviewsLastWeek": 1
  },
  "recommendations": [
    "Continue practicing technical interviews - showing strong improvement",
    "Focus on HR round preparation - lowest average score",
    "Maintain consistent interview practice schedule",
    "Consider mock interviews for behavioral rounds"
  ]
}
```

---

### 7. Get Company-wise Analytics
Get analytics grouped by company.

**Endpoint:** `GET /api/interview-results/stats/by-company`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X GET http://localhost:3000/api/interview-results/stats/by-company \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "userId": "697c87811135ecf66c3d23e2",
  "companies": [
    {
      "companyName": "TechCorp Inc",
      "totalInterviews": 3,
      "rounds": {
        "technical": 2,
        "behavioral": 1,
        "hr": 0,
        "problem-solving": 0
      },
      "averageScore": 85.2,
      "highestScore": 90.5,
      "lowestScore": 78.5,
      "rolesTested": [
        "Senior Software Engineer",
        "Tech Lead"
      ],
      "lastInterviewDate": "2026-01-30T14:25:30.000Z",
      "trend": "improving"
    },
    {
      "companyName": "StartupXYZ",
      "totalInterviews": 2,
      "rounds": {
        "technical": 1,
        "behavioral": 1,
        "hr": 0,
        "problem-solving": 0
      },
      "averageScore": 78.6,
      "highestScore": 82.8,
      "lowestScore": 74.5,
      "rolesTested": [
        "Full Stack Developer",
        "Backend Developer"
      ],
      "lastInterviewDate": "2026-01-28T10:15:22.000Z",
      "trend": "stable"
    },
    {
      "companyName": "DataSoft",
      "totalInterviews": 2,
      "rounds": {
        "technical": 1,
        "behavioral": 0,
        "hr": 1,
        "problem-solving": 0
      },
      "averageScore": 77.5,
      "highestScore": 82.8,
      "lowestScore": 72.2,
      "rolesTested": [
        "Data Engineer"
      ],
      "lastInterviewDate": "2026-01-26T18:45:12.000Z",
      "trend": "improving"
    },
    {
      "companyName": "CloudServices LLC",
      "totalInterviews": 1,
      "rounds": {
        "technical": 0,
        "behavioral": 0,
        "hr": 1,
        "problem-solving": 0
      },
      "averageScore": 70.0,
      "highestScore": 70.0,
      "lowestScore": 70.0,
      "rolesTested": [
        "Cloud Architect"
      ],
      "lastInterviewDate": "2026-01-22T11:30:45.000Z",
      "trend": "stable"
    }
  ],
  "summary": {
    "totalCompanies": 4,
    "bestPerformingCompany": "TechCorp Inc",
    "mostInterviewedCompany": "TechCorp Inc",
    "averageScoreAcrossAll": 77.8
  }
}
```

---

### 8. Get Role-wise Analytics
Get analytics grouped by role.

**Endpoint:** `GET /api/interview-results/stats/by-role`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X GET http://localhost:3000/api/interview-results/stats/by-role \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "userId": "697c87811135ecf66c3d23e2",
  "roles": [
    {
      "roleTitle": "Senior Software Engineer",
      "totalInterviews": 3,
      "companies": [
        "TechCorp Inc",
        "DataSoft"
      ],
      "rounds": {
        "technical": 2,
        "behavioral": 1,
        "hr": 0,
        "problem-solving": 0
      },
      "averageScore": 86.5,
      "highestScore": 90.5,
      "lowestScore": 82.0,
      "lastInterviewDate": "2026-01-30T14:25:30.000Z",
      "skillsEvaluated": {
        "technicalDepth": 88.5,
        "clarity": 84.2,
        "confidence": 85.8,
        "communication": 83.5
      }
    },
    {
      "roleTitle": "Full Stack Developer",
      "totalInterviews": 2,
      "companies": [
        "StartupXYZ",
        "TechCorp Inc"
      ],
      "rounds": {
        "technical": 2,
        "behavioral": 0,
        "hr": 0,
        "problem-solving": 0
      },
      "averageScore": 80.6,
      "highestScore": 82.8,
      "lowestScore": 78.5,
      "lastInterviewDate": "2026-01-26T18:45:12.000Z",
      "skillsEvaluated": {
        "technicalDepth": 84.2,
        "clarity": 79.0,
        "confidence": 80.5,
        "communication": 78.8
      }
    },
    {
      "roleTitle": "Tech Lead",
      "totalInterviews": 1,
      "companies": [
        "TechCorp Inc"
      ],
      "rounds": {
        "technical": 0,
        "behavioral": 1,
        "hr": 0,
        "problem-solving": 0
      },
      "averageScore": 79.5,
      "highestScore": 79.5,
      "lowestScore": 79.5,
      "lastInterviewDate": "2026-01-28T10:15:22.000Z",
      "skillsEvaluated": {
        "technicalDepth": 0,
        "clarity": 78.5,
        "confidence": 80.0,
        "communication": 79.0
      }
    },
    {
      "roleTitle": "Backend Developer",
      "totalInterviews": 1,
      "companies": [
        "StartupXYZ"
      ],
      "rounds": {
        "technical": 1,
        "behavioral": 0,
        "hr": 0,
        "problem-solving": 0
      },
      "averageScore": 78.5,
      "highestScore": 78.5,
      "lowestScore": 78.5,
      "lastInterviewDate": "2026-01-22T11:30:45.000Z",
      "skillsEvaluated": {
        "technicalDepth": 80.0,
        "clarity": 77.5,
        "confidence": 78.0,
        "communication": 76.5
      }
    },
    {
      "roleTitle": "Data Engineer",
      "totalInterviews": 1,
      "companies": [
        "DataSoft"
      ],
      "rounds": {
        "technical": 1,
        "behavioral": 0,
        "hr": 0,
        "problem-solving": 0
      },
      "averageScore": 77.5,
      "highestScore": 77.5,
      "lowestScore": 77.5,
      "lastInterviewDate": "2026-01-24T09:20:18.000Z",
      "skillsEvaluated": {
        "technicalDepth": 79.0,
        "clarity": 76.0,
        "confidence": 77.5,
        "communication": 75.8
      }
    }
  ],
  "summary": {
    "totalRoles": 5,
    "bestPerformingRole": "Senior Software Engineer",
    "mostInterviewedRole": "Senior Software Engineer",
    "averageScoreAcrossAll": 80.5
  }
}
```

---

### 9. Delete Session Data
Delete all questions and analytics for a specific session.

**Endpoint:** `DELETE /api/interview-results/session/:sessionId`

**Path Parameters:**
- `sessionId`: MongoDB ObjectId of the session

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/interview-results/session/679d234a5f6e7c8d9e0f1a2b \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Session deleted successfully",
  "sessionId": "679d234a5f6e7c8d9e0f1a2b",
  "deletedQuestions": 8
}
```

---

## 🔍 Frontend Integration Examples

### React/Next.js Example

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/interview-results';

// Get auth token from localStorage or context
const getAuthToken = () => localStorage.getItem('authToken');

// Dashboard Analytics
export const getDashboardAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return response.data;
};

// Interview History with Pagination
export const getInterviewHistory = async (page = 1, limit = 10, roundType?: string) => {
  const params = new URLSearchParams({ 
    page: page.toString(), 
    limit: limit.toString() 
  });
  if (roundType) params.append('roundType', roundType);
  
  const response = await axios.get(`${API_BASE_URL}/history?${params}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return response.data;
};

// Session Details
export const getSessionDetails = async (sessionId: string) => {
  const response = await axios.get(`${API_BASE_URL}/session/${sessionId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return response.data;
};

// Voice Analytics
export const getVoiceAnalytics = async (sessionId: string) => {
  const response = await axios.get(`${API_BASE_URL}/session/${sessionId}/voice-analytics`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return response.data;
};

// Performance Stats
export const getPerformanceStats = async (days = 30) => {
  const response = await axios.get(`${API_BASE_URL}/stats/performance?days=${days}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return response.data;
};

// Company-wise Analytics
export const getCompanyAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/stats/by-company`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return response.data;
};

// Role-wise Analytics
export const getRoleAnalytics = async () => {
  const response = await axios.get(`${API_BASE_URL}/stats/by-role`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return response.data;
};

// Delete Session
export const deleteSession = async (sessionId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/session/${sessionId}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` }
  });
  return response.data;
};
```

### React Component Example

```tsx
import React, { useEffect, useState } from 'react';
import { getDashboardAnalytics, getInterviewHistory } from './api';

const InterviewDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, historyData] = await Promise.all([
          getDashboardAnalytics(),
          getInterviewHistory(1, 5)
        ]);
        setDashboard(dashboardData);
        setHistory(historyData.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Interview Analytics Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Interviews</h3>
          <p>{dashboard.summary.totalInterviews}</p>
        </div>
        <div className="card">
          <h3>Average Score</h3>
          <p>{dashboard.summary.averageScore}%</p>
        </div>
        <div className="card">
          <h3>Questions Answered</h3>
          <p>{dashboard.summary.totalQuestionsAnswered}</p>
        </div>
      </div>

      {/* Round Breakdown */}
      <div className="round-breakdown">
        <h2>Performance by Round</h2>
        {dashboard.roundBreakdown.map((round) => (
          <div key={round.roundType} className="round-item">
            <span>{round.roundType}</span>
            <span>{round.count} interviews</span>
            <span>{round.averageScore}% avg</span>
          </div>
        ))}
      </div>

      {/* Recent Interviews */}
      <div className="recent-interviews">
        <h2>Recent Interviews</h2>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Type</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((interview) => (
              <tr key={interview.sessionId}>
                <td>{interview.companyName}</td>
                <td>{interview.roleTitle}</td>
                <td>{interview.roundType}</td>
                <td>{interview.scores.overall}%</td>
                <td>{new Date(interview.completedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InterviewDashboard;
```

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Session not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 📝 Notes

1. **Per-Question Saving**: All questions are now saved immediately after each answer is submitted, ensuring real-time data availability.

2. **Console Logging**: Extensive console logs with box-drawn separators appear in the server terminal every time a question is saved.

3. **MongoDB Indexes**: Ensure indexes are created on `userId`, `sessionId`, and compound indexes for optimal query performance.

4. **Real-time Analytics**: Analytics are computed on-the-fly from saved questions, no waiting for interview completion.

5. **Session Management**: Sessions are identified by ObjectId, grouped automatically by the service layer.

6. **Authentication**: All endpoints require valid JWT token in Authorization header.

7. **Data Retention**: Questions remain in database until explicitly deleted via DELETE endpoint.

---

## 🚀 Testing with Postman

Import the collection and test all endpoints:

1. Set environment variable `baseUrl` = `http://localhost:3000`
2. Set environment variable `authToken` = `<your_jwt_token>`
3. Use `{{baseUrl}}/api/interview-results/...` in requests
4. Add header: `Authorization: Bearer {{authToken}}`

---

**Last Updated:** January 30, 2026  
**API Version:** 2.0  
**Backend:** NestJS + MongoDB + Socket.io
