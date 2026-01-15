# Enhanced Interview Analytics Documentation

## Overview
The enhanced interview system provides comprehensive analytics tracking for interview sessions, questions, answers, and user performance across multiple dimensions.

## Additional API Endpoints

### Resource Management
- **GET** `/enhanced-interview/job-descriptions` - Get user's job descriptions
- **GET** `/enhanced-interview/resumes` - Get user's resumes with scores

### Complete API Reference
```typescript
// Start Interview
POST /enhanced-interview/start
{
  session_id: string;
  role_title: string;
  company_name: string;
  industry: string;
  round_type: 'technical' | 'behavioral' | 'hr' | 'problem-solving' | 'full';
  jd_id?: string;
  resume_id?: string;
}

// Submit Answer (Audio/Video/Text)
POST /enhanced-interview/answer
FormData: {
  session_id: string;
  media_file?: File; // Audio or Video
  text_answer?: string;
}

// Get Session Details
GET /enhanced-interview/session/:sessionId

// Get User Sessions (Paginated)
GET /enhanced-interview/sessions?page=1&limit=10

// Get Analytics Dashboard
GET /enhanced-interview/analytics

// Get Interview Report
GET /enhanced-interview/report/:sessionId

// Get Job Descriptions
GET /enhanced-interview/job-descriptions

// Get Resumes
GET /enhanced-interview/resumes
```

## Data Models

### Session Analytics
```typescript
interface SessionAnalytics {
  sessionId: string;
  userId: string;
  roundType: 'technical' | 'behavioral' | 'hr' | 'problem-solving';
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  startedAt: Date;
  completedAt?: Date;
  jobContext: {
    roleTitle: string;
    companyName: string;
    industry: string;
    resumeId?: string;
    jobDescriptionId?: string;
  };
  metrics: {
    totalQuestions: number;
    answeredQuestions: number;
    averageResponseTime: number;
    totalDuration: number;
    pauseCount: number;
    fillerWordsTotal: number;
    averageSpeechClarity: number;
    averageConfidenceLevel: number;
  };
  scores: {
    overall: number;
    communication: number;
    technical: number;
    behavioral: number;
    problemSolving: number;
    clarity: number;
    confidence: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}
```

### Question Analytics
```typescript
interface QuestionAnalytics {
  questionText: string;
  questionType: string;
  competency?: string;
  difficulty?: string;
  questionAskedAt: Date;
  answerText?: string;
  audioFilePath?: string;
  audioUrl?: string;
  videoFilePath?: string;
  videoUrl?: string;
  audioAnalysis?: {
    transcription: string;
    speechClarity: number;
    paceScore: number;
    confidenceLevel: number;
    duration: number;
    pauseCount: number;
    fillerWords: number;
  };
  videoAnalysis?: {
    transcription: string;
    duration: number;
    facePresence: number;
    eyeContact: number;
    headStability: number;
    cheatingRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    behaviorScore: number;
  };
  scores: {
    overall: number;
    communication: number;
    technical: number;
    behavioral: number;
    problemSolving: number;
    clarity: number;
    confidence: number;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  responseTime: number;
  answerSubmittedAt?: Date;
}
```

### User Analytics
```typescript
interface UserAnalytics {
  userId: string;
  technical: RoundStats;
  behavioral: RoundStats;
  hr: RoundStats;
  problemSolving: RoundStats;
  overall: {
    totalInterviews: number;
    completedInterviews: number;
    overallAverageScore: number;
    bestOverallScore: number;
    bestSessionId: string;
    totalTimeSpent: number;
    strengths: string[];
    areasForImprovement: string[];
    lastInterviewDate: Date;
    currentStreak: number;
  };
  monthlyProgress: Array<{
    month: string; // YYYY-MM format
    sessionsCount: number;
    averageScore: number;
    timeSpent: number;
  }>;
  recentSessions: string[]; // Last 10 session IDs
  lastUpdated: Date;
}

interface RoundStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  bestScore: number;
  bestSessionId: string;
  latestScore: number;
  latestSessionId: string;
  totalTimeSpent: number;
  averageResponseTime: number;
  lastAttemptDate: Date;
}
```

## Analytics Features

### 1. Real-time Session Tracking
- Session start/completion tracking
- Question-by-question analytics
- Response time monitoring
- Audio/video analysis integration

### 2. Performance Scoring
- **Overall Score**: Composite score across all dimensions
- **Communication Score**: Clarity, articulation, engagement
- **Technical Score**: Technical knowledge and problem-solving
- **Behavioral Score**: Soft skills and cultural fit
- **Problem-solving Score**: Analytical thinking and approach
- **Clarity Score**: Answer structure and coherence
- **Confidence Score**: Voice tone and body language

### 3. Audio Analysis Metrics
- **Speech Clarity**: Voice quality and articulation (0-10)
- **Pace Score**: Speaking speed appropriateness (0-10)
- **Confidence Level**: Voice confidence indicators (0-10)
- **Pause Count**: Number of significant pauses
- **Filler Words**: Count of "um", "uh", etc.
- **Duration**: Total speaking time

### 4. Video Analysis Metrics
- **Face Presence**: Percentage of time face is visible (0-100%)
- **Eye Contact**: Average eye contact score (0-10)
- **Head Stability**: Movement and posture score (0-10)
- **Behavior Score**: Overall professional behavior (0-10)
- **Cheating Detection**: Risk level assessment
- **Duration**: Total video length

### 5. Progress Tracking
- **Monthly Progress**: Session count and scores by month
- **Improvement Trends**: Score progression over time
- **Streak Tracking**: Consecutive interview sessions
- **Best Performance**: Highest scores and sessions

### 6. Comprehensive Reporting
- **Session Reports**: Detailed breakdown per interview
- **Performance Summaries**: Strengths and improvement areas
- **Recommendations**: Personalized feedback for growth
- **Comparative Analysis**: Performance across different rounds

## Frontend Integration Examples

### Analytics Dashboard Component
```jsx
const AnalyticsDashboard = ({ userId }) => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    fetch(`/api/enhanced-interview/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setAnalytics);
  }, []);

  return (
    <div className="analytics-dashboard">
      <div className="summary-cards">
        <div className="card">
          <h3>Total Interviews</h3>
          <span>{analytics?.summary.totalInterviews}</span>
        </div>
        <div className="card">
          <h3>Average Score</h3>
          <span>{analytics?.summary.averageScore.toFixed(1)}</span>
        </div>
        <div className="card">
          <h3>Best Score</h3>
          <span>{analytics?.summary.bestScore.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="progress-chart">
        <MonthlyProgressChart data={analytics?.analytics.monthlyProgress} />
      </div>
      
      <div className="recent-sessions">
        <h3>Recent Sessions</h3>
        {analytics?.recentSessions.map(session => (
          <SessionCard key={session._id} session={session} />
        ))}
      </div>
    </div>
  );
};
```

### Session Report Component
```jsx
const SessionReport = ({ sessionId }) => {
  const [report, setReport] = useState(null);
  
  useEffect(() => {
    fetch(`/api/enhanced-interview/report/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setReport);
  }, [sessionId]);

  return (
    <div className="session-report">
      <div className="session-header">
        <h2>{report?.session.jobContext.roleTitle}</h2>
        <p>{report?.session.jobContext.companyName}</p>
      </div>
      
      <div className="scores-section">
        <h3>Performance Scores</h3>
        <div className="score-grid">
          <div className="score-item">
            <span>Overall</span>
            <span>{report?.session.scores.overall}/10</span>
          </div>
          <div className="score-item">
            <span>Communication</span>
            <span>{report?.session.scores.communication}/10</span>
          </div>
          <div className="score-item">
            <span>Technical</span>
            <span>{report?.session.scores.technical}/10</span>
          </div>
        </div>
      </div>
      
      <div className="feedback-section">
        <h3>Strengths</h3>
        <ul>
          {report?.session.strengths.map((strength, i) => (
            <li key={i}>{strength}</li>
          ))}
        </ul>
        
        <h3>Areas for Improvement</h3>
        <ul>
          {report?.session.areasForImprovement.map((area, i) => (
            <li key={i}>{area}</li>
          ))}
        </ul>
      </div>
      
      <div className="questions-section">
        <h3>Question Analysis</h3>
        {report?.session.questions.map((q, i) => (
          <QuestionAnalysis key={i} question={q} />
        ))}
      </div>
    </div>
  );
};
```

## Key Metrics for Tracking

### Performance Indicators
1. **Completion Rate**: % of started interviews completed
2. **Average Session Duration**: Time spent per interview
3. **Score Progression**: Improvement over time
4. **Response Quality**: Audio/video analysis trends
5. **Consistency**: Performance stability across sessions

### Behavioral Insights
1. **Communication Patterns**: Speech clarity and pace trends
2. **Confidence Levels**: Voice and body language analysis
3. **Professional Behavior**: Video analysis insights
4. **Engagement Metrics**: Eye contact and attention indicators

### Learning Analytics
1. **Skill Development**: Progress in specific competencies
2. **Weakness Identification**: Consistent improvement areas
3. **Strength Recognition**: Best-performing skills
4. **Recommendation Tracking**: Action item completion