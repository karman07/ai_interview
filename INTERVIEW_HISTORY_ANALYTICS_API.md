# 📊 Interview History & Analytics API Documentation

## **Overview**
Complete API documentation for accessing interview history, analytics, and performance metrics.

---

## **🎯 Interview History & Analytics Endpoints**

### **1. GET `/ai-interview/history/:userId` - Get Interview History**

Get complete interview history for a user with all sessions.

#### **Request:**
```bash
GET /ai-interview/history/68edfb398df3bfece0f3daf5
Authorization: Bearer <jwt_token>
```

#### **Response:**
```json
{
  "userId": "68edfb398df3bfece0f3daf5",
  "totalSessions": 5,
  "sessions": [
    {
      "session_id": "session_68edfb398df3bfece0f3daf5_technical_1768386681507",
      "role_title": "Developer",
      "company_name": "Dine3D",
      "status": "completed",
      "round_type": "technical",
      "created_at": "2026-01-14T10:31:21.999664",
      "completed_at": "2026-01-14T10:32:35.117738",
      "total_questions": 8,
      "overall_score": 1.2
    }
  ]
}
```

---

### **2. GET `/ai-interview/sessions/:userId` - List User Sessions**

Get list of all interview sessions for a user.

#### **Request:**
```bash
GET /ai-interview/sessions/68edfb398df3bfece0f3daf5
Authorization: Bearer <jwt_token>
```

#### **Response:**
```json
[
  {
    "session_id": "session_001",
    "role_title": "Backend Engineer",
    "company_name": "TechCorp",
    "status": "completed",
    "question_count": 8,
    "created_at": "2026-01-14T10:31:21.999664"
  },
  {
    "session_id": "session_002",
    "role_title": "Frontend Developer",
    "company_name": "StartupCo",
    "status": "active",
    "question_count": 3,
    "created_at": "2026-01-13T15:20:10.123456"
  }
]
```

---

### **3. GET `/ai-interview/state/:userId/:sessionId` - Get Session State**

Get detailed state of a specific interview session.

#### **Request:**
```bash
GET /ai-interview/state/68edfb398df3bfece0f3daf5/session_68edfb398df3bfece0f3daf5_technical_1768386681507
Authorization: Bearer <jwt_token>
```

#### **Response:**
```json
{
  "user_id": "68edfb398df3bfece0f3daf5",
  "session_id": "session_68edfb398df3bfece0f3daf5_technical_1768386681507",
  "role_title": "Developer",
  "company_name": "Dine3D",
  "industry": "Technology",
  "round_type": "technical",
  "status": "completed",
  "history": [
    {
      "question": "Tell me about yourself and what draws you to this role.",
      "answer": "I encountered no problem. Please don't ask me this question.",
      "transcribed_text": "I encountered no problem. Please don't ask me this question.",
      "has_audio": true,
      "evaluation": {
        "total_score": 1.2,
        "feedback": "Technical depth could be improved | Could improve speech fluency | Could sound more confident",
        "suggestions": [
          "Provide more technical specifics and examples",
          "Include concrete examples with measurable results"
        ]
      },
      "technical_evaluation": {
        "technical_depth": 0,
        "clarity": 0,
        "confidence": 0,
        "summary": "The candidate failed to provide a meaningful response..."
      },
      "communication_evaluation": {
        "voice_scores": {
          "fluency": 0.5,
          "clarity": 0.3,
          "confidence": 0.3,
          "pace": 0.2,
          "total": 1.3
        },
        "voice_metrics": {
          "duration": 0,
          "speech_rate": 0,
          "avg_pitch": 0,
          "pitch_variation": 0,
          "avg_energy": 0,
          "pause_ratio": 0,
          "speech_segments": 0
        }
      },
      "stage": "intro",
      "timestamp": "2026-01-14T10:31:21.999664"
    }
  ],
  "completed": true,
  "current_stage": "closing",
  "question_count": 8
}
```

---

### **4. GET `/ai-interview/report/:userId/:sessionId` - Get Interview Report**

Get final comprehensive report for a completed interview.

#### **Request:**
```bash
GET /ai-interview/report/68edfb398df3bfece0f3daf5/session_68edfb398df3bfece0f3daf5_technical_1768386681507
Authorization: Bearer <jwt_token>
```

#### **Response:**
```json
{
  "session_id": "session_68edfb398df3bfece0f3daf5_technical_1768386681507",
  "user_id": "68edfb398df3bfece0f3daf5",
  "role": "Developer",
  "company": "Dine3D",
  "industry": "Technology",
  "status": "completed",
  "avg_scores": {
    "overall": 1.2,
    "technical": 0.0,
    "communication": 1.3,
    "problem_solving": 0.0,
    "behavioral": 0.0,
    "cultural_fit": 0.0
  },
  "voice_analysis_summary": {
    "avg_fluency": 0.5,
    "avg_clarity": 0.3,
    "avg_confidence": 0.3,
    "avg_pace": 0.2,
    "total_speaking_time": 0,
    "avg_speech_rate": 0
  },
  "history": [
    {
      "question": "Tell me about yourself and what draws you to this role.",
      "answer": "I encountered no problem. Please don't ask me this question.",
      "transcribed_text": "I encountered no problem. Please don't ask me this question.",
      "has_audio": true,
      "evaluation": {
        "total_score": 1.2,
        "feedback": "Technical depth could be improved | Could improve speech fluency | Could sound more confident"
      },
      "stage": "intro"
    }
  ],
  "total_questions": 8,
  "completed": true,
  "strengths": [],
  "weaknesses": [
    "Lack of technical depth in responses",
    "Poor communication and engagement",
    "Negative attitude towards interview process",
    "No concrete examples or achievements provided"
  ],
  "recommendations": [
    "Practice STAR method for behavioral questions",
    "Prepare specific technical examples with measurable results",
    "Work on maintaining professional demeanor",
    "Improve speaking pace and clarity"
  ],
  "interview_duration": "74 seconds",
  "completion_rate": "100%"
}
```

---

## **📈 Analytics Data Structure**

### **Question-Level Analytics:**
```json
{
  "userId": "68edfb398df3bfece0f3daf5",
  "sessionId": "session_001",
  "question": "Tell me about yourself...",
  "answer": "I am a passionate software engineer...",
  "transcribedText": "I am a passionate software engineer...",
  "hasAudio": true,
  "evaluation": {
    "score": 5.8,
    "feedback": "Good relevance | Good fluency | Confident delivery",
    "suggestions": ["Add more specific details", "Include concrete examples"],
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
  "stage": "intro",
  "roundType": "technical",
  "roleTitle": "Backend Engineer",
  "companyName": "TechCorp",
  "industry": "Technology",
  "timestamp": "2026-01-14T10:31:21.999664"
}
```

### **Session Completion Analytics:**
```json
{
  "userId": "68edfb398df3bfece0f3daf5",
  "sessionId": "session_001",
  "question": "SESSION_COMPLETION",
  "answer": "COMPLETED",
  "stage": "completion",
  "evaluation": {
    "score": 6.8,
    "feedback": "Session completed",
    "suggestions": ["Practice STAR method", "Prepare more examples"],
    "breakdown": {
      "overall": 6.8,
      "technical": 7.1,
      "communication": 6.9,
      "problem_solving": 6.5,
      "behavioral": 6.4
    }
  },
  "sessionMetadata": {
    "totalQuestions": 8,
    "duration": 420,
    "completedAt": "2026-01-14T10:32:35.117738",
    "finalScores": {
      "overall": 6.8,
      "technical": 7.1,
      "communication": 6.9
    },
    "strengths": ["Strong technical knowledge", "Clear communication"],
    "weaknesses": ["Could provide more examples"],
    "recommendations": ["Practice behavioral questions"],
    "voiceAnalysisSummary": {
      "avg_fluency": 0.85,
      "avg_clarity": 0.78,
      "avg_confidence": 0.82,
      "total_speaking_time": 420.5
    }
  }
}
```

### **Failure Analytics:**
```json
{
  "userId": "68edfb398df3bfece0f3daf5",
  "sessionId": "session_002",
  "question": "INTERVIEW_FAILURE",
  "answer": "start_failed",
  "stage": "failure",
  "evaluation": {
    "score": 0,
    "feedback": "Failed to start interview session",
    "suggestions": []
  },
  "failureMetadata": {
    "failureType": "start_failed",
    "errorMessage": "Network timeout",
    "timestamp": "2026-01-14T10:30:00.000000",
    "role": "Backend Engineer",
    "company": "TechCorp",
    "roundType": "technical"
  }
}
```

---

## **🔍 Analytics Insights**

### **Performance Metrics Tracked:**
- ✅ **Overall Score**: Average across all questions
- ✅ **Technical Depth**: Technical knowledge demonstrated
- ✅ **Communication**: Voice clarity, fluency, confidence
- ✅ **Problem Solving**: Approach and methodology
- ✅ **Behavioral**: STAR method and examples
- ✅ **Cultural Fit**: Alignment with company values

### **Voice Metrics Tracked:**
- ✅ **Duration**: Total speaking time per answer
- ✅ **Speech Rate**: Words per minute
- ✅ **Pitch**: Average and variation
- ✅ **Energy**: Volume and intensity
- ✅ **Pause Ratio**: Silence to speech ratio
- ✅ **Fluency**: Speech smoothness (0-2 points)
- ✅ **Clarity**: Volume consistency (0-1.5 points)
- ✅ **Confidence**: Pitch variation (0-1.5 points)
- ✅ **Pace**: Speaking speed (0-1 point)

### **Interview Stages:**
- `intro` - Introduction questions
- `background` - Experience and background
- `technical` - Technical questions
- `behavioral` - Behavioral questions
- `problem_solving` - Problem-solving scenarios
- `company_culture` - Culture fit questions
- `closing` - Final questions
- `completion` - Interview completed
- `failure` - Interview failed

---

## **📊 Usage Examples**

### **Get User's Complete Interview History:**
```javascript
const response = await fetch('/ai-interview/history/68edfb398df3bfece0f3daf5', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const history = await response.json();
console.log(`Total interviews: ${history.totalSessions}`);
```

### **Get Specific Session Details:**
```javascript
const response = await fetch(
  '/ai-interview/state/68edfb398df3bfece0f3daf5/session_001',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const session = await response.json();
console.log(`Questions answered: ${session.history.length}`);
```

### **Get Final Report:**
```javascript
const response = await fetch(
  '/ai-interview/report/68edfb398df3bfece0f3daf5/session_001',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const report = await response.json();
console.log(`Overall score: ${report.avg_scores.overall}/10`);
```

---

## **🎯 Key Features**

### **1. Complete History Tracking:**
- All interviews saved with full details
- Question-by-question breakdown
- Voice analysis for each answer
- Technical and communication scores

### **2. Performance Analytics:**
- Aggregate scores across sessions
- Trend analysis over time
- Strengths and weaknesses identification
- Personalized recommendations

### **3. Failure Tracking:**
- Failed interview attempts logged
- Error types categorized
- Debugging information saved
- Retry analytics available

### **4. Voice Analysis:**
- Speech-to-text transcription
- Voice quality metrics
- Speaking pace analysis
- Confidence indicators

---

## **🔐 Authentication**

All endpoints require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

---

## **⚡ Performance Notes**

- **No Audio Storage**: Audio files not saved on server (memory only)
- **Real-time Processing**: Immediate transcription and analysis
- **Efficient Queries**: Indexed database queries for fast retrieval
- **Scalable**: Handles multiple concurrent interviews

---

## **📝 Response Codes**

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (session/user not found)
- `500` - Internal Server Error
