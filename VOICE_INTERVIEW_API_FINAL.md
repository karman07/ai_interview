# 🎤 Voice-Enabled Interview API - Final Documentation

## **Overview**
Complete voice analysis integration with automatic next question flow and interview completion detection.

---

## **API Endpoints**

### **1. POST `/api/interview/start` - Start Interview Session**

#### **Input (JSON):**
```json
{
  "user_id": "test-user-001",
  "session_id": "session-001",
  "role_title": "Senior Backend Engineer", 
  "company_name": "TechCorp Inc",
  "industry": "Technology",
  "cv": "67638f123456789abcdef012",
  "jd": "67638f987654321fedcba098",
  "round_type": "full"
}
```

#### **Response:**
```json
{
  "user_id": "test-user-001",
  "session_id": "session-001",
  "first_question": "Tell me about yourself and what draws you to this role.",
  "state": {
    "user_id": "test-user-001",
    "session_id": "session-001",
    "role_title": "Senior Backend Engineer",
    "company_name": "TechCorp Inc",
    "industry": "Technology",
    "status": "active",
    "history": [
      {
        "question": "Tell me about yourself and what draws you to this role.",
        "answer": null,
        "evaluation": null,
        "stage": "intro",
        "timestamp": "2025-12-26T11:12:29.587461"
      }
    ],
    "completed": false
  },
  "cv_content": "Resume: CV (2).pdf\nContact details are clear...",
  "jd_content": "Job Description: Senior backend role requiring Python..."
}
```

#### **Key Changes:**
- ✅ **Field Names**: `cv_id` → `cv`, `jd_id` → `jd` (CV/JD IDs as strings)
- ✅ **Content Fetching**: AI service fetches CV/JD content using provided IDs
- ✅ **First Question**: Immediate question provided in response

---

### **2. POST `/api/interview/answer` - Submit Voice Answer**

#### **Input (Form Data):**
```bash
curl -X POST "http://34.27.237.113:8000/api/interview/answer" \
  -F "user_id=test-user-001" \
  -F "session_id=session-001" \
  -F "audio_file=@/path/to/audio.wav"
```

#### **Response:**
```json
{
  "evaluation": {
    "score": 5.8,
    "feedback": "Good relevance to the question | Good speech fluency | Confident delivery",
    "suggestions": [
      "Add more specific details about your experience",
      "Include concrete examples with measurable results",
      "Speak more clearly and maintain consistent volume"
    ],
    "breakdown": {
      "relevance": 1.3,
      "depth": 0.7,
      "structure": 0.3,
      "examples": 0.2,
      "technical": 0.0,
      "alignment": 0.3,
      "fluency": 1.0,
      "clarity": 0.8,
      "confidence": 0.8,
      "pace": 0.6
    },
    "voice_metrics": {
      "duration": 15.2,
      "speech_rate": 145,
      "avg_pitch": 180.5,
      "pitch_variation": 25.3,
      "avg_energy": 0.025,
      "pause_ratio": 0.12,
      "speech_segments": 3
    },
    "total_possible": 11.0
  },
  "next_question": "I see you have experience with Python. Can you walk me through a challenging project where you used Python and the technical decisions you made?",
  "continue_interview": true,
  "state": {
    "user_id": "test-user-001",
    "session_id": "session-001",
    "status": "active",
    "history": [
      {
        "question": "Tell me about yourself and what draws you to this role.",
        "answer": "I am a passionate software engineer with five years of experience in backend development using Python and FastAPI.",
        "transcribed_text": "I am a passionate software engineer with five years of experience in backend development using Python and FastAPI.",
        "has_audio": true,
        "evaluation": {
          "score": 5.8,
          "voice_metrics": {...},
          "breakdown": {...}
        },
        "stage": "intro",
        "timestamp": "2025-12-26T11:12:29.587461"
      },
      {
        "question": "I see you have experience with Python...",
        "answer": null,
        "evaluation": null,
        "stage": "technical_background",
        "timestamp": "2025-12-26T11:13:15.776636"
      }
    ],
    "completed": false
  }
}
```

#### **Interview Completion Response:**
```json
{
  "evaluation": {
    "score": 7.2,
    "feedback": "Excellent technical depth and clear communication",
    "suggestions": [...],
    "breakdown": {...},
    "voice_metrics": {...}
  },
  "next_question": null,
  "continue_interview": false,
  "interview_completed": true,
  "final_report": {
    "overall_score": 6.8,
    "technical_score": 7.1,
    "communication_score": 6.9,
    "behavioral_score": 6.4,
    "total_questions": 8,
    "strengths": [
      "Strong technical knowledge",
      "Clear communication",
      "Good problem-solving approach"
    ],
    "weaknesses": [
      "Could provide more specific examples",
      "Improve confidence in delivery"
    ],
    "recommendations": [
      "Practice behavioral questions with STAR method",
      "Prepare more concrete project examples"
    ]
  },
  "state": {
    "user_id": "test-user-001",
    "session_id": "session-001",
    "status": "completed",
    "completed": true,
    "history": [...] // Full interview history
  }
}
```

#### **Key Features:**
- ✅ **Automatic Flow**: `next_question` provided in response
- ✅ **Continue Flag**: `continue_interview` indicates if more questions remain
- ✅ **Completion Detection**: `interview_completed: true` when finished
- ✅ **Final Report**: Complete evaluation when interview ends
- ✅ **Voice Analysis**: Full speech-to-text and voice metrics

---

### **3. GET `/api/interview/state/{user_id}/{session_id}` - Get Session State**

#### **Response:**
```json
{
  "user_id": "test-user-001",
  "session_id": "session-001",
  "role_title": "Senior Backend Engineer",
  "company_name": "TechCorp Inc",
  "industry": "Technology",
  "cv": "Resume content...",
  "jd": "Job Description content...",
  "round_type": "full",
  "status": "active",
  "history": [
    {
      "question": "Tell me about yourself and what draws you to this role.",
      "answer": "I am a passionate software engineer...",
      "transcribed_text": "I am a passionate software engineer...",
      "has_audio": true,
      "evaluation": {
        "score": 5.8,
        "voice_metrics": {...},
        "breakdown": {...}
      },
      "stage": "intro",
      "timestamp": "2025-12-26T11:12:29.587461"
    }
  ],
  "completed": false,
  "current_stage": "technical_background",
  "question_count": 2,
  "asked_questions": [
    "Tell me about yourself and what draws you to this role.",
    "I see you have experience with Python..."
  ]
}
```

---

### **4. GET `/api/interview/sessions/{user_id}` - Get User Sessions**

#### **Response:**
```json
[
  {
    "session_id": "session-001",
    "role_title": "Senior Backend Engineer",
    "company_name": "TechCorp Inc",
    "status": "active",
    "question_count": 3,
    "created_at": "2025-12-26T11:12:29.587461"
  },
  {
    "session_id": "session-002", 
    "role_title": "Frontend Developer",
    "company_name": "StartupCorp",
    "status": "completed",
    "question_count": 8,
    "created_at": "2025-12-25T10:30:15.123456"
  }
]
```

---

### **5. GET `/api/interview/report/{user_id}/{session_id}` - Get Interview Report**

#### **Response:**
```json
{
  "session_id": "session-001",
  "user_id": "test-user-001",
  "role": "Senior Backend Engineer",
  "company": "TechCorp Inc",
  "industry": "Technology",
  "status": "completed",
  "avg_scores": {
    "overall": 6.8,
    "technical": 7.1,
    "communication": 6.9,
    "problem_solving": 6.5,
    "behavioral": 6.4,
    "cultural_fit": 6.7
  },
  "voice_analysis_summary": {
    "avg_fluency": 0.85,
    "avg_clarity": 0.78,
    "avg_confidence": 0.82,
    "avg_pace": 0.75,
    "total_speaking_time": 420.5,
    "avg_speech_rate": 152
  },
  "history": [
    {
      "question": "Tell me about yourself and what draws you to this role.",
      "answer": "I am a passionate software engineer...",
      "transcribed_text": "I am a passionate software engineer...",
      "has_audio": true,
      "evaluation": {
        "score": 5.8,
        "voice_metrics": {
          "duration": 15.2,
          "speech_rate": 145,
          "fluency": 1.0,
          "clarity": 0.8,
          "confidence": 0.8,
          "pace": 0.6
        },
        "breakdown": {...}
      },
      "stage": "intro"
    }
  ],
  "total_questions": 8,
  "completed": true,
  "strengths": [
    "Strong technical knowledge in Python and backend development",
    "Clear and confident communication style",
    "Good problem-solving methodology"
  ],
  "weaknesses": [
    "Could provide more specific project examples",
    "Improve speaking pace consistency",
    "Add more quantifiable achievements"
  ],
  "recommendations": [
    "Practice STAR method for behavioral questions",
    "Prepare 3-4 detailed project examples with metrics",
    "Work on maintaining consistent speaking pace"
  ]
}
```

---

## **🎯 Interview Flow**

### **Complete Interview Cycle:**

1. **Start Interview** → Get first question
2. **Submit Audio Answer** → Get evaluation + next question
3. **Continue Loop** until `continue_interview: false`
4. **Interview Complete** → Receive final report
5. **Access Report** anytime via report endpoint

### **Frontend Integration:**

```javascript
// 1. Start interview
const startResponse = await fetch('/api/interview/start', {
  method: 'POST',
  body: JSON.stringify({
    user_id: 'user123',
    session_id: 'session456',
    role_title: 'Backend Engineer',
    company_name: 'TechCorp',
    industry: 'Technology',
    cv: 'cv_id_here',
    jd: 'jd_id_here',
    round_type: 'full'
  })
});

// 2. Submit answers in loop
while (continueInterview) {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('session_id', sessionId);
  formData.append('audio_file', audioBlob);
  
  const response = await fetch('/api/interview/answer', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.continue_interview) {
    // Show next question: result.next_question
    continueInterview = true;
  } else {
    // Interview complete: result.final_report
    continueInterview = false;
  }
}
```

---

## **🎤 Voice Analysis Features**

### **Voice Metrics Tracked:**
- **Duration**: Total speaking time (seconds)
- **Speech Rate**: Words per minute estimation  
- **Average Pitch**: Fundamental frequency (Hz)
- **Pitch Variation**: Voice modulation range
- **Average Energy**: Volume/intensity levels
- **Pause Ratio**: Silence to speech ratio
- **Speech Segments**: Continuous speech parts

### **Voice Scoring (6 points total):**
- **Fluency** (0-2): Speech rate, pause patterns
- **Clarity** (0-1.5): Volume consistency, energy
- **Confidence** (0-1.5): Pitch variation, energy  
- **Pace** (0-1): Speaking speed, duration

### **Combined Evaluation:**
- **Text Analysis** (5 points): Content quality
- **Voice Analysis** (6 points): Delivery quality
- **Total Score** (11 points): Scaled to 10-point system

---

## **🔧 Backend Configuration**

### **Environment Variables:**
```env
AI_INTERVIEW_API_BASE_URL=http://34.27.237.113:8000/api
AI_INTERVIEW_START_ENDPOINT=/interview/start
AI_INTERVIEW_ANSWER_ENDPOINT=/interview/answer
AI_INTERVIEW_STATE_ENDPOINT=/interview/state
AI_INTERVIEW_REPORT_ENDPOINT=/interview/report
AI_INTERVIEW_SESSIONS_ENDPOINT=/interview/sessions
```

### **Key Features:**
- ✅ **Automatic Next Questions**: No separate endpoint needed
- ✅ **Interview Completion**: Automatic detection and final report
- ✅ **Voice Analysis**: Complete speech-to-text and metrics
- ✅ **Backward Compatibility**: Legacy `/ai-interview/` endpoints maintained
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Session Management**: Full state tracking and persistence