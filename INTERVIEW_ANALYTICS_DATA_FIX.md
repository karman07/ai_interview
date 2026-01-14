# Interview Analytics Data Storage Fix

## Issues Identified

1. **Analytics only updated for completed sessions** - Active sessions weren't being tracked properly
2. **Dashboard returning zero scores** - Even when sessions had valid scores
3. **Session completion logic incomplete** - Sessions weren't being marked as completed properly
4. **Missing fallback calculations** - When analytics collection was empty, no fallback from session data

## Fixes Applied

### 1. Enhanced Analytics Update Logic

**File:** `src/interview_rounds/services/interview-session.service.ts`

```typescript
async updateAnalytics(userId: string, session: EnhancedInterviewSessionDocument) {
  // Always update total sessions count (not just completed)
  analytics.overall.totalInterviews++;
  analytics[roundKey].totalSessions++;
  
  if (session.status === InterviewStatus.COMPLETED) {
    // Update completed session stats
    analytics.overall.completedInterviews++;
    analytics[roundKey].completedSessions++;
    // Calculate averages and best scores
  } else {
    // For active sessions, still track the score if available
    const score = session.scores?.overall || 0;
    if (score > 0) {
      analytics[roundKey].latestScore = score;
      if (score > analytics[roundKey].bestScore) {
        analytics[roundKey].bestScore = score;
      }
    }
  }
}
```

### 2. Improved Dashboard Calculation

**File:** `src/interview_rounds/services/interview-session.service.ts`

```typescript
async getDashboard(userId: string) {
  // Get both analytics and sessions
  const analytics = await this.analyticsModel.findOne({ userId: new Types.ObjectId(userId) });
  const sessions = await this.sessionModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(5);
  
  // Calculate stats from sessions if analytics is missing or incomplete
  const completedSessions = sessions.filter(s => s.status === InterviewStatus.COMPLETED);
  const allScores = sessions.map(s => s.scores?.overall || 0).filter(score => score > 0);
  const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
  
  // Use analytics data if available, otherwise calculate from sessions
  return {
    totalInterviews: analytics?.overall.totalInterviews || sessions.length,
    completedInterviews: analytics?.overall.completedInterviews || completedSessions.length,
    averageScore: Number((analytics?.overall.overallAverageScore || avgScore).toFixed(2)),
    bestScore: analytics?.overall.bestOverallScore || bestScore,
    // ... rest of the data
  };
}
```

### 3. Fixed Session Completion Logic

**File:** `src/interview_rounds/controllers/ai-interview.controller.ts`

```typescript
// Enhanced completion detection
status: aiResponse.state.completed === true || 
        aiResponse.continue_interview === false || 
        !aiResponse.next_question ? 'completed' : 'active',

// Proper completion handling
if (aiResponse.continue_interview === false || !aiResponse.next_question) {
  console.log('🏁 Interview completed - updating session status');
  
  // Update session to completed status
  const session = await this.sessionService.getSession(payload.session_id);
  if (session && session.status !== 'completed') {
    await this.sessionService.saveSession({
      ...sessionData,
      status: 'completed'
    });
  }
}
```

### 4. Added Round Statistics Calculation

**File:** `src/interview_rounds/services/interview-session.service.ts`

```typescript
private calculateRoundStats(sessions: EnhancedInterviewSessionDocument[], roundType: RoundType) {
  const roundSessions = sessions.filter(s => s.roundType === roundType);
  const completedRoundSessions = roundSessions.filter(s => s.status === InterviewStatus.COMPLETED);
  const scores = roundSessions.map(s => s.scores?.overall || 0).filter(score => score > 0);
  
  return {
    averageScore: scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0,
    totalSessions: roundSessions.length,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0
  };
}
```

### 5. Added Interview History Method

**File:** `src/interview_rounds/services/interview-session.service.ts`

```typescript
async getHistory(userId: string) {
  const sessions = await this.sessionModel.find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .populate('questions');
  
  return sessions.map(session => ({
    sessionId: session.sessionId,
    roleTitle: session.jobContext.roleTitle,
    companyName: session.jobContext.companyName,
    industry: session.jobContext.industry,
    roundType: session.roundType,
    status: session.status,
    overallScore: session.scores?.overall || 0,
    totalQuestions: session.metrics.totalQuestions,
    answeredQuestions: session.metrics.answeredQuestions,
    createdAt: session.createdAt,
    completedAt: session.completedAt
  }));
}
```

## Expected Results After Fix

### Dashboard Response (with real data):
```json
{
  "totalInterviews": 1,
  "completedInterviews": 1,
  "averageScore": 1.2,
  "bestScore": 1.2,
  "currentStreak": 0,
  "longestStreak": 0,
  "totalTimeSpent": 0,
  "recentSessions": [
    {
      "session_id": "session_68edfb398df3bfece0f3daf5_technical_1768404723965",
      "role_title": "Developer",
      "company_name": "Dine3D",
      "status": "completed",
      "round_type": "technical",
      "overall_score": 1.2,
      "created_at": "2026-01-14T15:32:21.066Z",
      "question_count": 2
    }
  ],
  "roundStats": {
    "technical": {
      "averageScore": 1.2,
      "totalSessions": 1,
      "bestScore": 1.2
    },
    "behavioral": {
      "averageScore": 0,
      "totalSessions": 0,
      "bestScore": 0
    },
    "problemSolving": {
      "averageScore": 0,
      "totalSessions": 0,
      "bestScore": 0
    },
    "hr": {
      "averageScore": 0,
      "totalSessions": 0,
      "bestScore": 0
    }
  }
}
```

### Session History Response:
```json
[
  {
    "sessionId": "session_68edfb398df3bfece0f3daf5_technical_1768404723965",
    "roleTitle": "Developer",
    "companyName": "Dine3D",
    "industry": "Technology",
    "roundType": "technical",
    "status": "completed",
    "overallScore": 1.2,
    "totalQuestions": 2,
    "answeredQuestions": 2,
    "createdAt": "2026-01-14T15:32:21.066Z",
    "completedAt": "2026-01-14T15:32:21.066Z"
  }
]
```

## Key Changes Summary

1. **Analytics now track both active and completed sessions**
2. **Dashboard calculates from session data when analytics are incomplete**
3. **Session completion is properly detected and marked**
4. **Round statistics are calculated from actual session data**
5. **Interview history shows all previous sessions with real scores**
6. **No more dummy/zero responses when real data exists**

The system will now properly display:
- Real interview scores (like the 1.2 score from your example)
- Actual session counts and statistics
- Previous interview history with all details
- Proper completion status tracking