# Enhanced Analytics API - New Endpoints & Response Changes

## New Analytics Endpoints

### GET /enhanced-interview/analytics/average
Get average analytics across all completed user interviews.

**Response:**
```javascript
{
  totalInterviews: 15,
  averageScores: {
    overall: 7.8,
    communication: 8.2,
    technical: 7.5,
    behavioral: 8.0,
    problemSolving: 7.2,
    clarity: 8.1,
    confidence: 7.9
  },
  averageDuration: 1800, // seconds
  averageQuestions: 8,
  averageResponseTime: 45 // seconds
}
```

### GET /enhanced-interview/analytics/session/:sessionId
Get complete analytics for a specific session including all questions and answers.

**Response:**
```javascript
{
  session: {
    sessionId: "session_123",
    roundType: "technical",
    status: "COMPLETED",
    startedAt: "2024-01-15T10:00:00Z",
    completedAt: "2024-01-15T10:30:00Z",
    jobContext: {
      roleTitle: "Software Engineer",
      companyName: "Tech Corp",
      industry: "Technology"
    },
    scores: {
      overall: 8.5,
      communication: 9.0,
      technical: 8.0,
      behavioral: 8.5,
      problemSolving: 7.5,
      clarity: 9.0,
      confidence: 8.0
    },
    metrics: {
      totalQuestions: 8,
      answeredQuestions: 8,
      averageResponseTime: 45,
      totalDuration: 1800
    },
    strengths: ["Clear communication", "Good technical knowledge"],
    areasForImprovement: ["Provide more examples", "Speak slower"],
    recommendations: ["Practice coding problems", "Work on presentation skills"]
  },
  questions: [
    {
      question: "Tell me about yourself",
      answer: "I am a software engineer with 5 years...",
      scores: {
        overall: 8.0,
        communication: 9.0,
        technical: 7.5,
        behavioral: 8.5,
        clarity: 9.0,
        confidence: 8.0
      },
      audioAnalysis: {
        transcription: "I am a software engineer...",
        speechClarity: 8,
        paceScore: 7,
        confidenceLevel: 9,
        duration: 45,
        pauseCount: 3,
        fillerWords: 2
      },
      videoAnalysis: {
        duration: 45,
        facePresence: 95,
        eyeContact: 8,
        headStability: 7,
        cheatingRisk: "NONE",
        behaviorScore: 8
      },
      feedback: "Good introduction with clear communication",
      strengths: ["Clear voice", "Good eye contact"],
      improvements: ["Add more specific examples"],
      responseTime: 3,
      timestamp: "2024-01-15T10:05:00Z"
    }
    // ... more questions
  ],
  summary: {
    totalQuestions: 8,
    answeredQuestions: 8,
    averageScore: 8.5,
    totalDuration: 1800
  }
}
```

## Enhanced Response Changes

### POST /enhanced-interview/answer
Now includes comprehensive question history syncing from AI service.

**New Features:**
- Syncs all questions from AI service history
- Preserves original timestamps from AI service
- Links questions to sessions and users
- Tracks question stages (intro, technical_background, etc.)

**Enhanced Response:**
```javascript
{
  // Standard AI response fields
  next_question: "How do you see your experience aligning...",
  evaluation: {
    total_score: 0.5,
    feedback: "Technical depth could be improved",
    suggestions: [...]
  },
  state: {
    user_id: "6968966ba463d2d4480cbe48",
    session_id: "session_123",
    history: [
      {
        question: "Tell me about yourself",
        answer: "I am a software engineer...",
        evaluation: {...},
        stage: "intro",
        timestamp: "2026-01-15T15:11:47.530265"
      }
      // ... all previous questions
    ]
  },
  
  // Enhanced analytics section
  analytics: {
    scores: {
      overall: 8.5,
      communication: 9.0,
      technical: 8.0,
      behavioral: 8.5,
      problemSolving: 7.5,
      clarity: 9.0,
      confidence: 8.0
    },
    audioAnalysis: { // Only present for audio files
      transcription: "...",
      speechClarity: 8,
      paceScore: 7,
      confidenceLevel: 9,
      duration: 45,
      pauseCount: 3,
      fillerWords: 2
    },
    videoAnalysis: { // Only present for video files
      transcription: "...",
      duration: 45,
      facePresence: 95,
      eyeContact: 8,
      headStability: 7,
      cheatingRisk: "NONE",
      behaviorScore: 8
    },
    responseTime: 3,
    strengths: ["Clear communication", "Good technical knowledge"],
    improvements: ["Speak slower", "More examples"]
  }
}
```

## Database Changes

### Question Storage
- All questions from AI service history are now saved to database
- Each question linked to session via `sessionId`
- Each question linked to user via `userId`
- Preserves original timestamps from AI service
- Tracks question stages and types

### Session Analytics
- Complete question-answer tracking
- Audio and video analysis per question
- Comprehensive scoring per question
- Feedback and improvement suggestions per question

## Usage Examples

### Get User's Average Performance
```javascript
const averageAnalytics = await fetch('/api/enhanced-interview/analytics/average', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Get Detailed Session Analysis
```javascript
const sessionAnalytics = await fetch(`/api/enhanced-interview/analytics/session/${sessionId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Access Question History
```javascript
// All questions are automatically saved during interview
// Access via session analytics or session details endpoints
const sessionDetails = await fetch(`/api/enhanced-interview/session/${sessionId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Key Benefits

1. **Complete Traceability**: Every question asked is saved with full context
2. **Historical Analysis**: Compare performance across multiple interviews
3. **Detailed Insights**: Question-by-question breakdown with scores and feedback
4. **User-Centric**: All data linked to user for personalized analytics
5. **Session-Specific**: Detailed analysis for individual interview sessions