# Interview Analytics Dashboard - Complete Documentation

## 📊 Analytics Overview

The Interview Analytics Dashboard provides comprehensive insights into user performance across all interview sessions, including detailed response analysis and progress tracking.

## 🛣️ Analytics API Endpoints

### 1. Get Analytics Dashboard
```bash
GET /enhanced-interview/analytics
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "analytics": {
    "technical": {
      "totalSessions": 5,
      "completedSessions": 4,
      "averageScore": 7.8,
      "bestScore": 9.2,
      "latestScore": 8.1,
      "improvementTrend": 0.5,
      "totalTimeSpent": 7200,
      "averageResponseTime": 45
    },
    "behavioral": {
      "totalSessions": 3,
      "completedSessions": 3,
      "averageScore": 8.1,
      "bestScore": 8.9,
      "improvementTrend": 0.3
    },
    "overall": {
      "totalInterviews": 8,
      "completedInterviews": 7,
      "overallAverageScore": 7.9,
      "bestOverallScore": 9.2,
      "totalTimeSpent": 14400,
      "currentStreak": 3,
      "strengths": ["Clear communication", "Technical expertise"],
      "areasForImprovement": ["More specific examples", "Confidence building"]
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
      "sessionId": "session_123",
      "roundType": "technical",
      "scores": { "overall": 8.5 },
      "jobContext": {
        "roleTitle": "Software Engineer",
        "companyName": "Tech Corp"
      },
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

### 2. Get Session History with Responses
```bash
GET /enhanced-interview/sessions?page=1&limit=10
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "sessions": [
    {
      "sessionId": "session_123",
      "roundType": "technical",
      "status": "completed",
      "jobContext": {
        "roleTitle": "Software Engineer",
        "companyName": "Tech Corp",
        "industry": "Technology"
      },
      "scores": {
        "overall": 8.2,
        "communication": 8.8,
        "technical": 7.9,
        "behavioral": 8.1,
        "confidence": 7.5
      },
      "metrics": {
        "totalQuestions": 8,
        "answeredQuestions": 8,
        "averageResponseTime": 42,
        "totalDuration": 1800
      },
      "createdAt": "2024-01-15T10:00:00Z",
      "completedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

### 3. Get Detailed Session with All Responses
```bash
GET /enhanced-interview/session/:sessionId
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "sessionId": "session_123",
  "userId": "user_456",
  "roundType": "technical",
  "status": "completed",
  "jobContext": {
    "roleTitle": "Software Engineer",
    "companyName": "Tech Corp",
    "industry": "Technology"
  },
  "questions": [
    {
      "_id": "question_1",
      "questionText": "Tell me about yourself and what draws you to this role.",
      "answerText": "I am a software engineer with 5 years of experience...",
      "audioAnalysis": {
        "transcription": "I am a software engineer with 5 years of experience...",
        "speechClarity": 8.5,
        "paceScore": 7.2,
        "confidenceLevel": 8.0,
        "duration": 45,
        "pauseCount": 3,
        "fillerWords": 2
      },
      "scores": {
        "overall": 8.5,
        "relevance": 9.0,
        "depth": 8.0,
        "structure": 8.5,
        "examples": 7.5,
        "fluency": 8.2,
        "clarity": 8.8,
        "confidence": 8.0
      },
      "feedback": "Great introduction with clear structure. Consider adding more specific examples.",
      "strengths": ["Clear communication", "Good structure", "Relevant experience"],
      "improvements": ["Add specific examples", "Mention quantifiable achievements"],
      "responseTime": 45,
      "questionAskedAt": "2024-01-15T10:05:00Z",
      "answerSubmittedAt": "2024-01-15T10:05:45Z"
    },
    {
      "_id": "question_2",
      "questionText": "What's the most complex technical challenge you've solved recently?",
      "answerText": "Recently, I worked on optimizing a database query...",
      "audioAnalysis": {
        "transcription": "Recently, I worked on optimizing a database query...",
        "speechClarity": 7.8,
        "paceScore": 8.1,
        "confidenceLevel": 8.5,
        "duration": 62,
        "pauseCount": 4,
        "fillerWords": 1
      },
      "scores": {
        "overall": 8.8,
        "relevance": 9.2,
        "depth": 8.5,
        "structure": 8.0,
        "examples": 9.0,
        "technical": 9.1,
        "fluency": 8.0,
        "clarity": 7.8,
        "confidence": 8.5
      },
      "feedback": "Excellent technical example with clear problem-solution structure.",
      "strengths": ["Strong technical knowledge", "Clear problem definition", "Measurable results"],
      "improvements": ["Speak slightly slower for better clarity"],
      "responseTime": 62
    }
  ],
  "scores": {
    "overall": 8.2,
    "communication": 8.8,
    "technical": 7.9,
    "behavioral": 8.1
  },
  "metrics": {
    "totalQuestions": 8,
    "answeredQuestions": 8,
    "averageResponseTime": 48,
    "totalDuration": 1800
  },
  "strengths": ["Clear communication", "Technical expertise", "Good examples"],
  "areasForImprovement": ["Speaking pace", "More quantifiable results"],
  "recommendations": ["Practice speaking slower", "Prepare STAR method examples"]
}
```

## 🎨 Frontend Components

### 1. Analytics Dashboard
```jsx
const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/enhanced-interview/analytics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="analytics-dashboard">
      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard 
          title="Total Interviews" 
          value={analytics.summary.totalInterviews}
          icon="📊"
        />
        <SummaryCard 
          title="Average Score" 
          value={`${analytics.summary.averageScore.toFixed(1)}/10`}
          icon="⭐"
          trend={analytics.analytics.overall.improvementTrend}
        />
        <SummaryCard 
          title="Best Score" 
          value={`${analytics.summary.bestScore.toFixed(1)}/10`}
          icon="🏆"
        />
        <SummaryCard 
          title="Current Streak" 
          value={analytics.summary.currentStreak}
          icon="🔥"
        />
      </div>

      {/* Performance by Round Type */}
      <div className="performance-breakdown">
        <h3>Performance by Interview Type</h3>
        <div className="round-stats">
          <RoundStatsCard 
            title="Technical" 
            stats={analytics.analytics.technical}
            color="#3b82f6"
          />
          <RoundStatsCard 
            title="Behavioral" 
            stats={analytics.analytics.behavioral}
            color="#10b981"
          />
          <RoundStatsCard 
            title="Problem Solving" 
            stats={analytics.analytics.problemSolving}
            color="#f59e0b"
          />
          <RoundStatsCard 
            title="HR" 
            stats={analytics.analytics.hr}
            color="#ef4444"
          />
        </div>
      </div>

      {/* Progress Chart */}
      <div className="progress-section">
        <h3>Monthly Progress</h3>
        <ProgressChart data={analytics.analytics.monthlyProgress} />
      </div>

      {/* Recent Sessions */}
      <div className="recent-sessions">
        <h3>Recent Interview Sessions</h3>
        <SessionsList sessions={analytics.recentSessions} />
      </div>

      {/* Strengths & Improvements */}
      <div className="insights-section">
        <div className="strengths">
          <h3>Your Strengths</h3>
          <ul>
            {analytics.analytics.overall.strengths.map(strength => (
              <li key={strength} className="strength-item">
                ✅ {strength}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="improvements">
          <h3>Areas for Improvement</h3>
          <ul>
            {analytics.analytics.overall.areasForImprovement.map(area => (
              <li key={area} className="improvement-item">
                📈 {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
```

### 2. Session History with Response Viewer
```jsx
const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [page]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/enhanced-interview/sessions?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewSessionDetails = async (sessionId) => {
    try {
      const response = await fetch(`/enhanced-interview/session/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const sessionData = await response.json();
      setSelectedSession(sessionData);
    } catch (error) {
      console.error('Failed to fetch session details:', error);
    }
  };

  return (
    <div className="session-history">
      <div className="sessions-list">
        <h2>Interview History</h2>
        {loading ? (
          <div className="loading">Loading sessions...</div>
        ) : (
          <div className="sessions-grid">
            {sessions.map(session => (
              <SessionCard 
                key={session.sessionId}
                session={session}
                onClick={() => viewSessionDetails(session.sessionId)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedSession && (
        <SessionDetailModal 
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
};
```

### 3. Detailed Session Response Viewer
```jsx
const SessionDetailModal = ({ session, onClose }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="session-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Interview Session Details</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="session-info">
          <div className="session-meta">
            <h3>{session.jobContext.roleTitle} at {session.jobContext.companyName}</h3>
            <p>Round: {session.roundType} | Status: {session.status}</p>
            <p>Date: {new Date(session.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="session-scores">
            <ScoreDisplay label="Overall" score={session.scores.overall} />
            <ScoreDisplay label="Communication" score={session.scores.communication} />
            <ScoreDisplay label="Technical" score={session.scores.technical} />
            <ScoreDisplay label="Behavioral" score={session.scores.behavioral} />
          </div>
        </div>

        <div className="questions-section">
          <div className="questions-nav">
            <h3>Questions & Responses ({session.questions.length})</h3>
            <div className="question-tabs">
              {session.questions.map((_, index) => (
                <button
                  key={index}
                  className={`question-tab ${selectedQuestion === index ? 'active' : ''}`}
                  onClick={() => setSelectedQuestion(index)}
                >
                  Q{index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="question-detail">
            <QuestionResponseViewer 
              question={session.questions[selectedQuestion]}
              questionNumber={selectedQuestion + 1}
            />
          </div>
        </div>

        <div className="session-insights">
          <div className="strengths-section">
            <h4>Session Strengths</h4>
            <ul>
              {session.strengths.map(strength => (
                <li key={strength}>✅ {strength}</li>
              ))}
            </ul>
          </div>

          <div className="improvements-section">
            <h4>Areas for Improvement</h4>
            <ul>
              {session.areasForImprovement.map(area => (
                <li key={area}>📈 {area}</li>
              ))}
            </ul>
          </div>

          <div className="recommendations-section">
            <h4>Recommendations</h4>
            <ul>
              {session.recommendations.map(rec => (
                <li key={rec}>💡 {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 4. Individual Question Response Viewer
```jsx
const QuestionResponseViewer = ({ question, questionNumber }) => {
  const [showAudioAnalysis, setShowAudioAnalysis] = useState(false);

  return (
    <div className="question-response-viewer">
      <div className="question-header">
        <h4>Question {questionNumber}</h4>
        <div className="question-score">
          Score: {question.scores.overall.toFixed(1)}/10
        </div>
      </div>

      <div className="question-text">
        <p><strong>Question:</strong> {question.questionText}</p>
      </div>

      <div className="response-section">
        <h5>Your Response</h5>
        <div className="response-text">
          {question.audioAnalysis?.transcription || question.answerText}
        </div>
        
        <div className="response-meta">
          <span>Response Time: {question.responseTime}s</span>
          {question.audioAnalysis && (
            <span>Duration: {question.audioAnalysis.duration}s</span>
          )}
        </div>
      </div>

      <div className="evaluation-section">
        <h5>Evaluation Breakdown</h5>
        <div className="score-breakdown">
          <ScoreBar label="Relevance" score={question.scores.relevance} max={10} />
          <ScoreBar label="Depth" score={question.scores.depth} max={10} />
          <ScoreBar label="Structure" score={question.scores.structure} max={10} />
          <ScoreBar label="Examples" score={question.scores.examples} max={10} />
          {question.scores.technical > 0 && (
            <ScoreBar label="Technical" score={question.scores.technical} max={10} />
          )}
          <ScoreBar label="Fluency" score={question.scores.fluency} max={10} />
          <ScoreBar label="Clarity" score={question.scores.clarity} max={10} />
          <ScoreBar label="Confidence" score={question.scores.confidence} max={10} />
        </div>
      </div>

      {question.audioAnalysis && (
        <div className="audio-analysis-section">
          <button 
            onClick={() => setShowAudioAnalysis(!showAudioAnalysis)}
            className="toggle-audio-analysis"
          >
            {showAudioAnalysis ? 'Hide' : 'Show'} Voice Analysis
          </button>
          
          {showAudioAnalysis && (
            <div className="audio-metrics">
              <div className="metric">
                <span>Speech Clarity:</span>
                <span>{question.audioAnalysis.speechClarity.toFixed(1)}/10</span>
              </div>
              <div className="metric">
                <span>Pace Score:</span>
                <span>{question.audioAnalysis.paceScore.toFixed(1)}/10</span>
              </div>
              <div className="metric">
                <span>Confidence Level:</span>
                <span>{question.audioAnalysis.confidenceLevel.toFixed(1)}/10</span>
              </div>
              <div className="metric">
                <span>Filler Words:</span>
                <span>{question.audioAnalysis.fillerWords}</span>
              </div>
              <div className="metric">
                <span>Pause Count:</span>
                <span>{question.audioAnalysis.pauseCount}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="feedback-section">
        <h5>Feedback</h5>
        <p className="feedback-text">{question.feedback}</p>
        
        <div className="feedback-details">
          <div className="strengths">
            <h6>Strengths</h6>
            <ul>
              {question.strengths.map(strength => (
                <li key={strength}>✅ {strength}</li>
              ))}
            </ul>
          </div>
          
          <div className="improvements">
            <h6>Improvements</h6>
            <ul>
              {question.improvements.map(improvement => (
                <li key={improvement}>📈 {improvement}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 📊 Analytics Features

### Performance Tracking
- **Overall average scores** across all interviews
- **Round-specific performance** (technical, behavioral, HR, problem-solving)
- **Progress trends** and improvement tracking
- **Best scores** and achievement milestones

### Response Analysis
- **Complete transcriptions** of all audio responses
- **Detailed scoring breakdown** for each question
- **Voice analysis metrics** (clarity, pace, confidence)
- **Feedback and suggestions** for each response

### Progress Insights
- **Monthly progress charts** showing improvement over time
- **Streak tracking** for consistent interview practice
- **Strengths identification** based on consistent high scores
- **Improvement areas** with actionable recommendations

This comprehensive analytics system provides users with detailed insights into their interview performance and helps them track progress over time.