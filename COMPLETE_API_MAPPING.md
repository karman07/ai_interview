# AI Interview System - Complete API Mapping & Implementation Guide

## 🎯 AI Service Endpoints (External API at localhost:8080)

Based on the OpenAPI specification, the AI service provides these endpoints:

### Live Interview Endpoints
- `POST /api/interview/start` - Start interview session
- `POST /api/interview/answer` - Submit voice answer
- `GET /api/interview/state/{user_id}/{session_id}` - Get interview state
- `GET /api/interview/sessions/{user_id}` - Get user sessions
- `GET /api/interview/report/{user_id}/{session_id}` - Get interview report

### Alternative Interview Endpoints (No Prefix)
- `POST /start` - Start interview session
- `POST /answer` - Submit voice answer
- `GET /state/{user_id}/{session_id}` - Get interview state
- `GET /sessions/{user_id}` - Get user sessions
- `GET /report/{user_id}/{session_id}` - Get interview report

## 🔧 Environment Configuration Update

```env
# AI Interview Coach API Configuration
AI_INTERVIEW_API_BASE_URL=http://localhost:8080
AI_INTERVIEW_API_TIMEOUT=60000

# Interview Session Endpoints (Updated to match OpenAPI)
AI_INTERVIEW_START_ENDPOINT=/api/interview/start
AI_INTERVIEW_ANSWER_ENDPOINT=/api/interview/answer
AI_INTERVIEW_STATE_ENDPOINT=/api/interview/state
AI_INTERVIEW_REPORT_ENDPOINT=/api/interview/report
AI_INTERVIEW_SESSIONS_ENDPOINT=/api/interview/sessions
```

## 🛣️ Backend Routes Implementation

### Enhanced Interview Controller Routes
**Base**: `/enhanced-interview` (Our custom analytics layer)

| Method | Backend Route | AI Service Route | Description |
|--------|---------------|------------------|-------------|
| POST | `/enhanced-interview/start` | `/api/interview/start` | Start with analytics |
| POST | `/enhanced-interview/answer` | `/api/interview/answer` | Submit with tracking |
| GET | `/enhanced-interview/session/:sessionId` | N/A | Get session details |
| GET | `/enhanced-interview/sessions` | N/A | Get user sessions |
| GET | `/enhanced-interview/analytics` | N/A | Analytics dashboard |
| GET | `/enhanced-interview/job-descriptions` | N/A | User's JDs only |
| GET | `/enhanced-interview/resumes` | N/A | User's resumes |
| GET | `/enhanced-interview/report/:sessionId` | `/api/interview/report/{user_id}/{session_id}` | Enhanced report |

### Legacy Interview Controller Routes
**Base**: `/interview` and `/ai-interview`

| Method | Backend Route | AI Service Route | Description |
|--------|---------------|------------------|-------------|
| POST | `/interview/start` | `/api/interview/start` | Direct AI start |
| POST | `/interview/answer` | `/api/interview/answer` | Direct AI answer |
| GET | `/interview/state/:userId/:sessionId` | `/api/interview/state/{user_id}/{session_id}` | Get state |
| GET | `/interview/report/:userId/:sessionId` | `/api/interview/report/{user_id}/{session_id}` | Get report |
| GET | `/interview/sessions/:userId` | `/api/interview/sessions/{user_id}` | List sessions |

## 📊 Database Schemas Created

### 1. Enhanced Interview Session
**Collection**: `enhancedinterviewsessions`
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: string (unique),
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
    overall: number (0-10),
    communication: number (0-10),
    technical: number (0-10),
    behavioral: number (0-10),
    problemSolving: number (0-10),
    leadership: number (0-10),
    clarity: number (0-10),
    confidence: number (0-10)
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
  recommendations: string[],
  startedAt: Date,
  completedAt?: Date,
  aiSessionId?: string,
  finalReport?: any,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Interview Question
**Collection**: `interviewquestions`
```typescript
{
  _id: ObjectId,
  sessionId: ObjectId, // Reference to EnhancedInterviewSession
  userId: ObjectId,
  questionText: string,
  questionType?: string,
  competency?: string,
  difficulty?: string,
  answerText?: string,
  audioFilePath?: string,
  audioUrl?: string,
  audioAnalysis?: {
    transcription?: string,
    speechClarity: number (0-10),
    paceScore: number (0-10),
    confidenceLevel: number (0-10),
    duration?: number,
    pauseCount?: number,
    fillerWords?: number
  },
  scores?: {
    overall: number (0-10),
    communication: number (0-10),
    technical: number (0-10),
    behavioral: number (0-10),
    problemSolving: number (0-10),
    clarity: number (0-10),
    confidence: number (0-10)
  },
  feedback?: string,
  strengths: string[],
  improvements: string[],
  responseTime?: number,
  questionAskedAt?: Date,
  answerSubmittedAt?: Date,
  aiResponse?: any,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. User Interview Analytics (Enhanced)
**Collection**: `userinterviewanalytics`
```typescript
{
  _id: ObjectId,
  userId: ObjectId (unique),
  technical: {
    totalSessions: number,
    completedSessions: number,
    averageScore: number,
    bestScore: number,
    latestScore: number,
    bestSessionId?: string,
    latestSessionId?: string,
    totalTimeSpent: number,
    averageResponseTime: number,
    lastAttemptDate?: Date,
    improvementTrend: number
  },
  behavioral: { /* same structure */ },
  problemSolving: { /* same structure */ },
  hr: { /* same structure */ },
  overall: {
    totalInterviews: number,
    completedInterviews: number,
    overallAverageScore: number,
    bestOverallScore: number,
    bestSessionId?: string,
    totalTimeSpent: number,
    strengths: string[],
    areasForImprovement: string[],
    lastInterviewDate?: Date,
    currentStreak: number,
    longestStreak: number
  },
  monthlyProgress: [{
    month: string, // YYYY-MM
    sessionsCount: number,
    averageScore: number,
    timeSpent: number
  }],
  recentSessions: ObjectId[], // Last 10 sessions
  skillScores?: Map<string, number>,
  lastUpdated?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 UI Implementation Requirements

### 1. Interview Start Form
```jsx
const InterviewStartForm = () => {
  const [formData, setFormData] = useState({
    roleTitle: '',
    companyName: '',
    industry: '',
    roundType: 'full',
    selectedJD: '',
    selectedResume: ''
  });

  const startInterview = async () => {
    const response = await fetch('/enhanced-interview/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        session_id: generateUniqueId(),
        role_title: formData.roleTitle,
        company_name: formData.companyName,
        industry: formData.industry,
        round_type: formData.roundType,
        jd_id: formData.selectedJD || undefined,
        resume_id: formData.selectedResume || undefined
      })
    });
    
    const result = await response.json();
    // Navigate to interview session with result.session.sessionId
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="roleTitle" placeholder="Job Title" required />
      <input name="companyName" placeholder="Company Name" required />
      <input name="industry" placeholder="Industry" required />
      
      <select name="roundType">
        <option value="full">Full Interview</option>
        <option value="technical">Technical Round</option>
        <option value="behavioral">Behavioral Round</option>
        <option value="hr">HR Round</option>
        <option value="problem-solving">Problem Solving</option>
      </select>
      
      <JobDescriptionSelector 
        value={formData.selectedJD}
        onChange={(jdId) => setFormData({...formData, selectedJD: jdId})}
      />
      
      <ResumeSelector 
        value={formData.selectedResume}
        onChange={(resumeId) => setFormData({...formData, selectedResume: resumeId})}
      />
      
      <button type="submit">Start Interview</button>
    </form>
  );
};
```

### 2. Interview Session Component
```jsx
const InterviewSession = ({ sessionId }) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const submitAnswer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('audio_file', audioBlob, 'answer.wav');

    const response = await fetch('/enhanced-interview/answer', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const result = await response.json();
    
    // Show real-time analytics
    setAnalytics(result.analytics);
    
    if (result.next_question) {
      setCurrentQuestion(result.next_question);
    } else {
      // Interview complete
      window.location.href = `/interview-report/${sessionId}`;
    }
  };

  return (
    <div className="interview-session">
      <div className="question-display">
        <h2>{currentQuestion}</h2>
      </div>
      
      <AudioRecorder 
        onSubmit={submitAnswer}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
      />
      
      {analytics && (
        <div className="live-analytics">
          <div className="scores">
            <span>Overall: {analytics.scores.overall}/10</span>
            <span>Communication: {analytics.scores.communication}/10</span>
            <span>Technical: {analytics.scores.technical}/10</span>
          </div>
          
          {analytics.audioAnalysis && (
            <div className="audio-feedback">
              <span>Speech Clarity: {analytics.audioAnalysis.speechClarity}/10</span>
              <span>Confidence: {analytics.audioAnalysis.confidenceLevel}/10</span>
              <span>Response Time: {analytics.responseTime}s</span>
            </div>
          )}
          
          <div className="feedback">
            <p>{analytics.feedback}</p>
            <ul>
              {analytics.strengths.map(strength => (
                <li key={strength} className="strength">✓ {strength}</li>
              ))}
              {analytics.improvements.map(improvement => (
                <li key={improvement} className="improvement">→ {improvement}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3. Analytics Dashboard
```jsx
const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch('/enhanced-interview/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(setAnalytics);
  }, []);

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="analytics-dashboard">
      <div className="summary-cards">
        <StatCard 
          title="Total Interviews" 
          value={analytics.summary.totalInterviews}
          icon="📊"
        />
        <StatCard 
          title="Average Score" 
          value={`${analytics.summary.averageScore.toFixed(1)}/10`}
          icon="⭐"
        />
        <StatCard 
          title="Best Score" 
          value={`${analytics.summary.bestScore.toFixed(1)}/10`}
          icon="🏆"
        />
        <StatCard 
          title="Current Streak" 
          value={analytics.summary.currentStreak}
          icon="🔥"
        />
      </div>

      <div className="charts-section">
        <div className="progress-chart">
          <h3>Monthly Progress</h3>
          <LineChart data={analytics.analytics.monthlyProgress} />
        </div>
        
        <div className="score-breakdown">
          <h3>Score Breakdown</h3>
          <RadarChart data={{
            technical: analytics.analytics.technical.averageScore,
            behavioral: analytics.analytics.behavioral.averageScore,
            communication: analytics.analytics.overall.overallAverageScore,
            problemSolving: analytics.analytics.problemSolving.averageScore
          }} />
        </div>
      </div>

      <div className="recent-sessions">
        <h3>Recent Sessions</h3>
        {analytics.recentSessions.map(session => (
          <SessionCard 
            key={session.sessionId}
            session={session}
            onClick={() => window.location.href = `/interview-report/${session.sessionId}`}
          />
        ))}
      </div>
    </div>
  );
};
```

### 4. Job Description & Resume Selectors
```jsx
const JobDescriptionSelector = ({ value, onChange }) => {
  const [jds, setJds] = useState([]);

  useEffect(() => {
    fetch('/enhanced-interview/job-descriptions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setJds(data.jobDescriptions));
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select Job Description (Optional)</option>
      {jds.map(jd => (
        <option key={jd.id} value={jd.id}>{jd.filename}</option>
      ))}
    </select>
  );
};

const ResumeSelector = ({ value, onChange }) => {
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    fetch('/enhanced-interview/resumes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setResumes(data.resumes));
  }, []);

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Use Best Resume (Auto-selected)</option>
      {resumes.map(resume => (
        <option key={resume.id} value={resume.id}>
          {resume.filename} (Score: {resume.score.toFixed(1)}/10)
        </option>
      ))}
    </select>
  );
};
```

## 🔒 Security Implementation

### User Data Isolation
```javascript
// All API calls automatically filter by authenticated user
const fetchUserData = async (endpoint) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/enhanced-interview/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};
```

## 📱 Mobile Responsive Audio Recording
```jsx
const AudioRecorder = ({ onSubmit, isRecording, setIsRecording }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        onSubmit(audioBlob);
        setAudioChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access required for voice interviews');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="audio-recorder">
      {!isRecording ? (
        <button 
          onClick={startRecording}
          className="record-button start"
        >
          🎤 Start Recording
        </button>
      ) : (
        <button 
          onClick={stopRecording}
          className="record-button stop"
        >
          ⏹️ Stop & Submit
        </button>
      )}
      
      {isRecording && (
        <div className="recording-indicator">
          <div className="pulse"></div>
          Recording...
        </div>
      )}
    </div>
  );
};
```

This comprehensive implementation provides enterprise-level interview analytics with proper AI service integration, user security, and mobile-responsive design.