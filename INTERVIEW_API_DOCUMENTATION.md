# Interview System API Documentation

## Overview
Complete documentation for the AI Interview System including all routes, schemas, WebSocket events, and UI specifications.

---

## 🚀 API Endpoints

### 1. Enhanced Interview Controller (`/interviews`)

#### **Session Management**

##### `POST /interviews/start`
Start a new enhanced interview session with comprehensive tracking.

**Request Body:**
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

**Response:**
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

**UI Components:**
- Interview start form with role/company inputs
- Round selection buttons
- Progress indicator

---

##### `POST /interviews/:sessionId/complete`
Complete an interview session with final scores and report.

**Request Body:**
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

**Response:**
```json
{
  "sessionId": "sess_123456789",
  "status": "completed",
  "completedAt": "2025-01-27T11:30:00Z",
  "finalScores": {...},
  "analytics": {
    "totalDuration": 5400,
    "questionsAnswered": 8,
    "averageResponseTime": 45
  }
}
```

**UI Components:**
- Completion confirmation modal
- Score display cards
- Performance summary charts

---

#### **User Data & Analytics**

##### `GET /interviews/my-sessions`
Get user's interview sessions with filtering and pagination.

**Query Parameters:**
- `round`: Filter by interview round
- `limit`: Number of sessions (default: 20)
- `offset`: Pagination offset (default: 0)

**Response:**
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
      "questionsAnswered": 10
    },
    "startedAt": "2025-01-27T10:00:00Z",
    "completedAt": "2025-01-27T11:00:00Z"
  }
]
```

**UI Components:**
- Session history table
- Filter dropdowns
- Pagination controls
- Session detail cards

---

##### `GET /interviews/analytics`
Get comprehensive user analytics and performance data.

**Response:**
```json
{
  "userId": "user_123",
  "technical": {
    "totalSessions": 8,
    "completedSessions": 7,
    "averageScore": 7.5,
    "bestScore": 9.1,
    "improvementTrend": 0.3
  },
  "behavioral": {...},
  "problemSolving": {...},
  "hr": {...},
  "overall": {
    "totalInterviews": 25,
    "completedInterviews": 20,
    "overallAverageScore": 7.2,
    "bestOverallScore": 9.1,
    "currentStreak": 5,
    "longestStreak": 8,
    "totalTimeSpent": 18000,
    "strengths": ["Problem solving", "Communication"],
    "areasForImprovement": ["Time management"]
  },
  "monthlyProgress": [
    {
      "month": "2025-01",
      "sessionsCount": 5,
      "averageScore": 6.8,
      "timeSpent": 3600
    }
  ]
}
```

**UI Components:**
- Analytics dashboard
- Performance charts (line, bar, radar)
- Progress indicators
- Strength/weakness cards

---

##### `GET /interviews/dashboard-stats`
Get dashboard summary statistics for quick overview.

**Response:**
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
    }
  }
}
```

**UI Components:**
- Dashboard summary cards
- Recent sessions list
- Quick stats widgets
- Round comparison chart

---

##### `GET /interviews/leaderboard`
Get leaderboard data for gamification.

**Query Parameters:**
- `round`: Filter by specific round
- `limit`: Number of top performers (default: 10)

**Response:**
```json
[
  {
    "userId": "user_123",
    "userName": "John Doe",
    "score": 8.9,
    "totalInterviews": 15,
    "round": "technical",
    "rank": 1
  }
]
```

**UI Components:**
- Leaderboard table
- User ranking cards
- Achievement badges
- Filter controls

---

##### `GET /interviews/performance-insights`
Get AI-generated performance insights and recommendations.

**Response:**
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
    "Great consistency! You've completed 5 interviews in a row.",
    "Consider practicing behavioral questions more."
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

**UI Components:**
- Insights cards with AI recommendations
- Progress indicators for goals
- Performance trend charts
- Action items list

---

##### `GET /interviews/monthly-progress`
Get monthly performance progress data for trend analysis.

**Response:**
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

**UI Components:**
- Monthly progress line chart
- Trend indicators (up/down arrows)
- Activity heatmap
- Consistency metrics

---

##### `GET /interviews/round-comparison`
Compare performance across different interview rounds.

**Response:**
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
  "problemSolving": {
    "averageScore": 7.8,
    "completedSessions": 6,
    "improvementTrend": 0.5,
    "bestScore": 9.0,
    "lastAttempt": "2025-01-23T11:15:00Z",
    "strengths": ["Logical thinking", "Creative solutions"],
    "weaknesses": ["Edge cases", "Optimization"]
  },
  "hr": {
    "averageScore": 7.0,
    "completedSessions": 4,
    "improvementTrend": 0.1,
    "bestScore": 8.0,
    "lastAttempt": "2025-01-22T09:45:00Z",
    "strengths": ["Company knowledge", "Career goals"],
    "weaknesses": ["Salary negotiation", "Work-life balance"]
  },
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

**UI Components:**
- Radar chart comparing all rounds
- Round-specific performance cards
- Improvement trend indicators
- Recommendation panel
- Strengths/weaknesses breakdown

---

##### `GET /interviews/session/:sessionId`
Get detailed information about a specific interview session.

**Response:**
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
  "startedAt": "2025-01-27T10:00:00Z",
  "completedAt": "2025-01-27T11:00:00Z",
  "finalReport": {
    "overall_score": 8.2,
    "strengths": ["Strong technical knowledge", "Clear communication"],
    "weaknesses": ["Could improve on system design"],
    "recommendations": ["Practice more system design questions"]
  }
}
```

**UI Components:**
- Session overview card
- Question-answer timeline
- Score breakdown charts
- Audio/video playback controls
- Detailed feedback panels

---

#### **Best Performance & Statistics**

##### `GET /interviews/best-sessions`
Get user's best performing interview sessions across all rounds.

**Query Parameters:**
- `round`: Filter by specific round (optional)
- `limit`: Number of sessions (default: 5)

**Response:**
```json
[
  {
    "sessionId": "sess_best_123",
    "round": "technical",
    "score": 9.1,
    "role": "Senior Developer",
    "company": "Tech Corp",
    "completedAt": "2025-01-20T15:30:00Z",
    "highlights": [
      "Perfect algorithm implementation",
      "Excellent time complexity analysis",
      "Clear code structure"
    ]
  }
]
```

**UI Components:**
- Best sessions showcase
- Achievement badges
- Score highlights
- Performance milestones

---

##### `GET /interviews/statistics`
Get comprehensive user statistics and performance metrics.

**Response:**
```json
{
  "overallStats": {
    "totalInterviews": 25,
    "completedInterviews": 20,
    "abandonedInterviews": 3,
    "averageScore": 7.2,
    "bestScore": 9.1,
    "worstScore": 4.5,
    "totalTimeSpent": 18000,
    "averageSessionDuration": 3600,
    "currentStreak": 5,
    "longestStreak": 8
  },
  "roundBreakdown": {
    "technical": {
      "count": 8,
      "averageScore": 7.5,
      "bestScore": 9.1,
      "completionRate": 87.5
    },
    "behavioral": {
      "count": 7,
      "averageScore": 6.8,
      "bestScore": 8.5,
      "completionRate": 85.7
    },
    "problemSolving": {
      "count": 6,
      "averageScore": 7.8,
      "bestScore": 9.0,
      "completionRate": 100
    },
    "hr": {
      "count": 4,
      "averageScore": 7.0,
      "bestScore": 8.0,
      "completionRate": 75
    }
  },
  "timeAnalysis": {
    "averageResponseTime": 85,
    "fastestResponse": 15,
    "slowestResponse": 180,
    "mostActiveHour": 14,
    "mostActiveDay": "Tuesday"
  },
  "improvementMetrics": {
    "scoreImprovement": 1.2,
    "consistencyRating": 8.5,
    "learningVelocity": 0.3
  },
  "achievements": [
    {
      "id": "first_perfect",
      "title": "Perfect Score",
      "description": "Achieved a perfect 10/10 in technical round",
      "unlockedAt": "2025-01-20T15:30:00Z",
      "badge": "🏆"
    },
    {
      "id": "streak_5",
      "title": "Consistent Performer",
      "description": "Completed 5 interviews in a row",
      "unlockedAt": "2025-01-25T12:00:00Z",
      "badge": "🔥"
    }
  ]
}
```

**UI Components:**
- Comprehensive stats dashboard
- Achievement showcase
- Time analysis charts
- Improvement metrics
- Performance comparison graphs

---

### 2. AI Interview Controller (`/ai-interview`)

#### **Session Management**

##### `POST /ai-interview/start`
Start interview with AI service integration.

**Request Body:**
```json
{
  "user_id": "user_123",
  "session_id": "sess_123",
  "role_title": "Senior Developer",
  "company_name": "Tech Corp",
  "industry": "Technology",
  "jd": "Job description...",
  "cv": "Resume content...",
  "round_type": "technical"
}
```

##### `POST /ai-interview/start-with-resume`
Start interview with resume file upload.

**Form Data:**
- `resume`: File upload
- Other fields as JSON

##### `POST /ai-interview/answer`
Submit answer to AI service.

**Request Body:**
```json
{
  "user_id": "user_123",
  "session_id": "sess_123",
  "answer": "My answer to the question..."
}
```

---

### 3. Basic Interview Controller (`/interviews`)

##### `POST /interviews/start`
Basic interview start (legacy).

**Request Body:**
```json
{
  "userId": "user_123",
  "round": "technical",
  "role": "Senior Developer",
  "company": "Tech Corp",
  "jobDescription": "Full stack development role...",
  "experience": "5 years"
}
```

##### `GET /interviews/history/:userId`
Get interview history for a specific user.

**Response:**
```json
[
  {
    "_id": "interview_123",
    "userId": "user_123",
    "round": "technical",
    "question": "Explain closures in JavaScript",
    "answer": "A closure is a function that has access to...",
    "feedback": "Good explanation with examples",
    "score": 8.0,
    "createdAt": "2025-01-27T10:00:00Z"
  }
]
```

##### `GET /interviews/results/:userId`
Get interview results summary for a user.

**Response:**
```json
{
  "userId": "user_123",
  "totalInterviews": 25,
  "averageScore": 7.2,
  "roundResults": {
    "technical": {
      "count": 8,
      "averageScore": 7.5,
      "bestScore": 9.1
    },
    "behavioral": {
      "count": 7,
      "averageScore": 6.8,
      "bestScore": 8.5
    }
  },
  "recentPerformance": [
    {
      "round": "technical",
      "score": 8.5,
      "date": "2025-01-27T10:00:00Z"
    }
  ]
}
```

---

## 📡 WebSocket Events

### Connection: `/behavioral`, `/technical`, `/hr`, `/problemsolving`

#### **Client → Server Events**

##### `start`
```json
{
  "userId": "user_123",
  "role": "Senior Developer",
  "company": "Tech Corp",
  "jobDescription": "Full stack role...",
  "experience": "5 years",
  "industry": "Technology"
}
```

##### `answer`
```json
{
  "id": "question_123",
  "userId": "user_123",
  "answer": "My answer...",
  "audioUrl": "/uploads/audio/response.mp3",
  "videoUrl": "/uploads/video/response.mp4",
  "responseDuration": 45
}
```

##### `pause`
```json
{
  "userId": "user_123"
}
```

##### `resume`
```json
{
  "userId": "user_123"
}
```

#### **Server → Client Events**

##### `question`
```json
{
  "id": "question_123",
  "question": "Tell me about a challenging project...",
  "sessionId": "sess_123"
}
```

##### `feedback`
```json
{
  "id": "question_123",
  "feedback": "Good answer, but could be more specific...",
  "score": 7.5,
  "aiResponse": {...}
}
```

##### `finalReport`
```json
{
  "overall_score": 8.5,
  "communication_score": 9.0,
  "behavioral_score": 8.0,
  "feedback": "Excellent performance...",
  "strengths": ["Communication", "Problem solving"],
  "weaknesses": ["Time management"],
  "recommendations": ["Practice coding under pressure"],
  "round": "behavioral",
  "sessionId": "sess_123"
}
```

##### `paused` / `resumed`
```json
{
  "sessionId": "sess_123"
}
```

---

## 🗄️ Database Schemas

### InterviewSession Schema
```typescript
{
  _id: ObjectId,
  userId: ObjectId, // ref: 'User'
  sessionId: string, // unique
  round: 'technical' | 'behavioral' | 'problem-solving' | 'hr',
  status: 'active' | 'completed' | 'abandoned' | 'paused',
  
  // Job Context
  role?: string,
  company?: string,
  jobDescription?: string,
  experience?: string,
  industry?: string,
  
  // Questions & Answers
  questionsAnswers: [{
    question: string,
    answer?: string,
    audioUrl?: string,
    videoUrl?: string,
    responseDuration?: number, // seconds
    feedback?: string,
    score?: number, // 0-10
    answeredAt?: Date
  }],
  
  // Session Metrics
  metrics: {
    totalQuestions: number,
    answeredQuestions: number,
    averageResponseTime: number, // seconds
    totalDuration: number, // seconds
    overallScore: number, // 0-10
    communicationScore: number,
    technicalScore: number,
    problemSolvingScore: number,
    behavioralScore: number
  },
  
  // Timing
  startedAt?: Date,
  completedAt?: Date,
  pausedAt?: Date,
  createdAt: Date, // auto
  updatedAt: Date, // auto
  
  // AI Integration
  aiSessionId?: string,
  finalReport?: any,
  
  // Metadata
  metadata?: Map<string, string>
}
```

### UserInterviewAnalytics Schema
```typescript
{
  _id: ObjectId,
  userId: ObjectId, // ref: 'User', unique
  
  // Round-specific Statistics
  technical: RoundStats,
  behavioral: RoundStats,
  problemSolving: RoundStats,
  hr: RoundStats,
  
  // Overall Statistics
  overall: {
    totalInterviews: number,
    completedInterviews: number,
    overallAverageScore: number, // 0-10
    bestOverallScore: number,
    bestSessionId?: string,
    totalTimeSpent: number, // seconds
    strengths: string[],
    areasForImprovement: string[],
    lastInterviewDate?: Date,
    currentStreak: number,
    longestStreak: number
  },
  
  // Progress tracking
  monthlyProgress: [{
    month: string, // YYYY-MM
    sessionsCount: number,
    averageScore: number,
    timeSpent: number // seconds
  }],
  
  // Recent sessions (last 10)
  recentSessions: ObjectId[], // ref: 'InterviewSession'
  
  // Performance insights
  skillScores?: Map<string, number>, // skill -> average score
  
  lastUpdated?: Date,
  createdAt: Date, // auto
  updatedAt: Date // auto
}

// RoundStats Sub-schema
{
  totalSessions: number,
  completedSessions: number,
  averageScore: number, // 0-10
  bestScore: number,
  latestScore: number,
  bestSessionId?: string,
  latestSessionId?: string,
  totalTimeSpent: number, // seconds
  averageResponseTime: number, // seconds
  lastAttemptDate?: Date,
  improvementTrend: number // positive = improving
}rentStreak: number,
    longestStreak: number
  },
  
  // Progress Tracking
  monthlyProgress: [{
    month: string, // YYYY-MM
    sessionsCount: number,
    averageScore: number,
    timeSpent: number // seconds
  }],
  
  // Recent Sessions (last 10)
  recentSessions: ObjectId[], // ref: 'InterviewSession'
  
  // Performance Insights
  skillScores?: Map<string, number>, // skill -> average score
  
  lastUpdated?: Date,
  createdAt: Date, // auto
  updatedAt: Date // auto
}

// RoundStats Sub-schema
{
  totalSessions: number,
  completedSessions: number,
  averageScore: number, // 0-10
  bestScore: number,
  latestScore: number,
  bestSessionId?: string,
  latestSessionId?: string,
  totalTimeSpent: number, // seconds
  averageResponseTime: number, // seconds
  lastAttemptDate?: Date,
  improvementTrend: number // positive = improving
}
```

---

## 🎨 UI Component Specifications

### 1. Interview Dashboard
```jsx
<InterviewDashboard>
  <StatsCards>
    <StatCard title="Total Interviews" value={25} />
    <StatCard title="Average Score" value={7.2} />
    <StatCard title="Current Streak" value={5} />
    <StatCard title="Best Score" value={9.1} />
  </StatsCards>
  
  <ChartsSection>
    <PerformanceChart data={monthlyProgress} />
    <RoundComparisonChart data={roundStats} />
  </ChartsSection>
  
  <RecentSessions sessions={recentSessions} />
</InterviewDashboard>
```

### 2. Interview Session Interface
```jsx
<InterviewSession>
  <SessionHeader>
    <Timer duration={sessionTime} />
    <ProgressBar current={5} total={10} />
    <PauseButton onClick={handlePause} />
  </SessionHeader>
  
  <QuestionDisplay question={currentQuestion} />
  
  <ResponseSection>
    <TextArea value={answer} onChange={setAnswer} />
    <MediaRecorder onRecord={handleRecord} />
    <SubmitButton onClick={handleSubmit} />
  </ResponseSection>
  
  <FeedbackPanel feedback={lastFeedback} score={lastScore} />
</InterviewSession>
```

### 3. Analytics Dashboard
```jsx
<AnalyticsDashboard>
  <OverviewSection>
    <ScoreRadarChart data={skillScores} />
    <TrendLineChart data={performanceTrend} />
  </OverviewSection>
  
  <RoundBreakdown>
    <RoundCard round="technical" stats={technicalStats} />
    <RoundCard round="behavioral" stats={behavioralStats} />
    <RoundCard round="problem-solving" stats={problemSolvingStats} />
    <RoundCard round="hr" stats={hrStats} />
  </RoundBreakdown>
  
  <InsightsPanel insights={aiInsights} />
</AnalyticsDashboard>
```

### 4. Leaderboard Component
```jsx
<Leaderboard>
  <FilterControls>
    <RoundFilter onChange={setRoundFilter} />
    <TimeFilter onChange={setTimeFilter} />
  </FilterControls>
  
  <LeaderboardTable>
    <UserRank rank={1} user={topUser} score={8.9} />
    <UserRank rank={2} user={secondUser} score={8.7} />
    {/* ... */}
  </LeaderboardTable>
  
  <UserPosition currentUser={user} position={15} />
</Leaderboard>
```

### 5. Session History
```jsx
<SessionHistory>
  <FilterBar>
    <RoundFilter />
    <DateRangeFilter />
    <StatusFilter />
  </FilterBar>
  
  <SessionTable>
    <SessionRow 
      session={session}
      onView={handleView}
      onReplay={handleReplay}
    />
  </SessionTable>
  
  <Pagination 
    current={page}
    total={totalPages}
    onChange={setPage}
  />
</SessionHistory>
```

---

## 🔄 Data Flow

### Interview Session Flow
1. **Start Session**: `POST /interviews/start` → WebSocket `start` event
2. **Question Loop**: Server sends `question` → Client sends `answer` → Server sends `feedback`
3. **Session End**: Server sends `finalReport` → `POST /interviews/:sessionId/complete`
4. **Analytics Update**: Background job updates user analytics

### Real-time Updates
- WebSocket connections for live interview sessions
- Real-time scoring and feedback
- Session pause/resume functionality
- Live progress tracking

### Data Persistence
- All sessions stored in MongoDB
- Analytics calculated and cached
- Historical data preserved
- Performance metrics tracked

---

## 🚦 Error Handling

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid data)
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

### WebSocket Error Events
```json
{
  "error": true,
  "message": "Session not found",
  "code": "SESSION_NOT_FOUND"
}
```

### UI Error States
- Network connection errors
- Session timeout handling
- Invalid input validation
- Graceful degradation

---

## 🔐 Authentication & Authorization

### JWT Authentication
- All routes protected with `JwtAuthGuard`
- WebSocket connections use `WsJwtGuard`
- User context available in `@CurrentUser()` decorator

### Role-based Access
- User roles included in JWT payload
- Route-level authorization
- Feature-based permissions

---

## 📱 Mobile Responsiveness

### Responsive Design Requirements
- Mobile-first approach
- Touch-friendly interfaces
- Optimized for various screen sizes
- Progressive Web App (PWA) support

### Mobile-specific Features
- Voice recording optimization
- Camera access for video responses
- Offline capability for basic features
- Push notifications for session reminders

This documentation provides a complete reference for implementing the interview system UI with all necessary API endpoints, data structures, and component specifications.