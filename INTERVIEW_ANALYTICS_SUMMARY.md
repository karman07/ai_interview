# Interview System - Analytics & Answer Submission

## Answer Submission APIs

### POST /enhanced-interview/answer-audio
Submit audio answer with comprehensive analysis.

**Request:**
```javascript
const formData = new FormData();
formData.append('session_id', sessionId);
formData.append('audio_file', audioFile); // Required
formData.append('text_answer', textAnswer); // Optional fallback
```

### POST /enhanced-interview/answer-video
Submit video answer with comprehensive analysis.

**Request:**
```javascript
const formData = new FormData();
formData.append('session_id', sessionId);
formData.append('video_file', videoFile); // Required
formData.append('text_answer', textAnswer); // Optional fallback
```

**Response (Both endpoints):**
```javascript
{
  next_question: "...",
  feedback: "...",
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
    audioAnalysis: { // Only for audio endpoint
      transcription: "...",
      speechClarity: 8,
      paceScore: 7,
      confidenceLevel: 9,
      duration: 45,
      pauseCount: 3,
      fillerWords: 2
    },
    videoAnalysis: { // Only for video endpoint
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

## File Storage
- **Development**: Files saved to `./uploads/audio/` and `./uploads/video/`
- **Production**: Files processed in memory, not saved to disk

## Analytics Endpoints

### GET /enhanced-interview/analytics
Get comprehensive user analytics dashboard.

**Response:**
```javascript
{
  analytics: {
    overall: {
      totalInterviews: 15,
      completedInterviews: 12,
      overallAverageScore: 7.8,
      bestOverallScore: 9.2,
      totalTimeSpent: 3600
    },
    technical: {
      totalSessions: 5,
      averageScore: 8.1,
      bestScore: 9.5
    },
    behavioral: {
      totalSessions: 4,
      averageScore: 7.5,
      bestScore: 8.8
    },
    monthlyProgress: [
      { month: "2024-01", sessionsCount: 3, averageScore: 7.2 },
      { month: "2024-02", sessionsCount: 5, averageScore: 8.1 }
    ]
  },
  recentSessions: [...],
  summary: {
    totalInterviews: 15,
    averageScore: 7.8,
    bestScore: 9.2
  }
}
```

### GET /enhanced-interview/sessions
Get user sessions with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### GET /enhanced-interview/report/:sessionId
Get detailed interview report for a specific session.

**Response:**
```javascript
{
  session: {
    sessionId: "...",
    jobContext: {
      roleTitle: "Software Engineer",
      companyName: "Tech Corp"
    },
    scores: { overall: 8.5, ... },
    strengths: [...],
    areasForImprovement: [...],
    questions: [...]
  },
  analytics: {
    totalQuestions: 8,
    averageScore: 8.5,
    recommendations: [...]
  }
}
```

## Key Analytics Features

### Performance Tracking
- **Overall Score**: Composite performance metric (0-10)
- **Round-specific Scores**: Technical, behavioral, HR, problem-solving
- **Progress Over Time**: Monthly improvement tracking
- **Best Performance**: Highest scores and sessions

### Audio Analysis
- **Speech Clarity**: Voice quality assessment
- **Pace Score**: Speaking speed evaluation
- **Confidence Level**: Voice confidence indicators
- **Filler Words**: Count of hesitation words

### Video Analysis
- **Face Presence**: Visibility percentage
- **Eye Contact**: Professional engagement score
- **Head Stability**: Posture and movement assessment
- **Behavior Score**: Overall professional demeanor
- **Cheating Detection**: Integrity monitoring

### Session Metrics
- **Response Time**: Answer submission speed
- **Session Duration**: Total interview time
- **Completion Rate**: Finished vs started interviews
- **Question Analysis**: Per-question performance breakdown