# API Input/Output Changes - Voice Analysis Integration

## Overview
This document focuses specifically on the API input and output changes required for voice analysis integration, highlighting the exact differences in request/response formats.

## Base URL
```
http://34.27.237.113:8000/api/interview/
```

---

## 🔄 API Endpoint Changes Summary

### 1. Start Interview API Changes

#### **Input Changes**

**BEFORE:**
```json
POST /api/interview/start
Content-Type: application/json

{
  "user_id": "user-123",
  "session_id": "session-123",
  "role_title": "Software Engineer",
  "company_name": "Tech Corp",
  "industry": "Technology",
  "jd": "Required job description text...",     // ❌ REQUIRED
  "cv": "Required resume text...",              // ❌ REQUIRED
  "round_type": "full"
}
```

**AFTER:**
```json
POST /api/interview/start
Content-Type: application/json

{
  "user_id": "test-user-001",
  "session_id": "session-001",
  "role_title": "Senior Backend Engineer",
  "company_name": "TechCorp Inc",
  "industry": "Technology",
  "cv_id": "67638f123456789abcdef012",          // ✅ NEW: MongoDB ObjectId (preferred)
  "jd_id": "67638f987654321fedcba098",          // ✅ NEW: MongoDB ObjectId (preferred)
  "round_type": "full"
}
```

**Key Changes:**
- ✅ **Added `cv_id`**: MongoDB ObjectId for user's resume
- ✅ **Added `jd_id`**: MongoDB ObjectId for job description
- ✅ **Removed `jd` and `cv`**: Now fetched automatically from database
- ✅ **Enhanced content fetching**: Automatic CV/JD content retrieval

#### **Output Changes**
**Enhanced response with fetched content:**
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

---

### 2. Submit Answer API Changes

#### **Input Changes**

**BEFORE:**
```json
POST /api/interview/answer
Content-Type: application/json

{
  "user_id": "user-123",
  "session_id": "session-123",
  "answer": "I am a software engineer with 5 years..."  // ❌ REQUIRED text
}
```

**AFTER:**
```bash
POST /api/interview/answer
Content-Type: multipart/form-data

# Form fields:
user_id=test-user-001               # ✅ CHANGED: Form field instead of JSON
session_id=session-001              # ✅ CHANGED: Form field instead of JSON
audio_file=@/path/to/audio.wav      # ✅ NEW: REQUIRED audio file
```

**cURL Example:**
```bash
curl -X POST "http://34.27.237.113:8000/api/interview/answer" \
  -F "user_id=test-user-001" \
  -F "session_id=session-001" \
  -F "audio_file=@/path/to/audio.wav"
```

**JavaScript Example:**
```javascript
// BEFORE - JSON request
const response = await fetch('/api/interview/answer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    user_id: 'user-123',
    session_id: 'session-123',
    answer: 'My text answer...'
  })
});

// AFTER - FormData request
const formData = new FormData();
formData.append('user_id', 'test-user-001');
formData.append('session_id', 'session-001');
formData.append('audio_file', audioBlob, 'answer.wav');

const response = await fetch('/api/interview/answer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Note: No Content-Type header - browser sets it automatically
  },
  body: formData
});
```

**Key Changes:**
- ❌ **BREAKING**: Changed from JSON to FormData
- ✅ **Added `audio_file`**: Required audio file upload
- ❌ **Removed `answer` text**: No longer supported
- ✅ **Form fields**: All parameters now form fields

#### **Output Changes**

**Enhanced Voice Evaluation Response:**
```json
{
  "evaluation": {
    "score": 5.8,                           // ✅ CHANGED: Out of 11.0 (5 text + 6 voice)
    "feedback": "Good relevance to the question | Good speech fluency | Confident delivery",
    "suggestions": [
      "Add more specific details about your experience",
      "Include concrete examples with measurable results",
      "Speak more clearly and maintain consistent volume"  // ✅ NEW: Voice-specific suggestions
    ],
    "breakdown": {
      // Text evaluation (unchanged - 5 points)
      "relevance": 1.3,
      "depth": 0.7,
      "structure": 0.3,
      "examples": 0.2,
      "technical": 0.0,
      "alignment": 0.3,
      
      // Voice evaluation (NEW - 6 points)
      "fluency": 1.0,                       // ✅ NEW: Speech flow and rate
      "clarity": 0.8,                       // ✅ NEW: Volume and articulation
      "confidence": 0.8,                    // ✅ NEW: Pitch variation and energy
      "pace": 0.6                           // ✅ NEW: Speaking speed appropriateness
    },
    "voice_metrics": {                      // ✅ NEW: Detailed voice analysis
      "duration": 15.2,                     // Speaking duration in seconds
      "speech_rate": 145,                   // Words per minute
      "avg_pitch": 180.5,                   // Average pitch in Hz
      "pitch_variation": 25.3,              // Pitch standard deviation
      "avg_energy": 0.025,                  // RMS energy level
      "pause_ratio": 0.12,                  // Silence to speech ratio
      "speech_segments": 3                  // Number of continuous speech parts
    },
    "total_possible": 11.0                  // ✅ CHANGED: 11 points total
  },
  "next_question": "I see you have experience with Python. Can you walk me through a challenging project where you used Python and the technical decisions you made?",
  "state": {
    "user_id": "test-user-001",
    "session_id": "session-001",
    "status": "active",
    "history": [
      {
        "question": "Tell me about yourself and what draws you to this role.",
        "answer": "I am a passionate software engineer with five years of experience in backend development using Python and FastAPI.",
        "transcribed_text": "I am a passionate software engineer with five years of experience in backend development using Python and FastAPI.",  // ✅ NEW
        "has_audio": true,                    // ✅ NEW: Indicates voice data present
        "evaluation": {...},
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

**Key Changes:**
- ✅ **Enhanced scoring**: 11-point scale (5 text + 6 voice)
- ✅ **Voice breakdown**: 4 new voice evaluation dimensions
- ✅ **Voice metrics**: Detailed speech analysis data
- ✅ **Transcribed text**: Speech-to-text conversion result in history
- ✅ **Audio flag**: Boolean indicating voice data presence
- ✅ **Enhanced feedback**: Voice-specific suggestions included
- ✅ **Complete state**: Full session state with history

---

### 3. Get Session State API

#### **Endpoint:**
```
GET /api/interview/state/{user_id}/{session_id}
```

#### **Response:**
```json
{
  "user_id": "test-user-001",
  "session_id": "session-001",
  "role_title": "Senior Backend Engineer",
  "company_name": "TechCorp Inc",
  "industry": "Technology",
  "jd": "Job Description content...",
  "cv": "Resume content...",
  "round_type": "full",
  "status": "active",
  "history": [
    {
      "question": "Tell me about yourself and what draws you to this role.",
      "answer": "I am a passionate software engineer...",
      "transcribed_text": "I am a passionate software engineer...",  // ✅ NEW
      "has_audio": true,                                                  // ✅ NEW
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
  "asked_questions": [                                                   // ✅ NEW
    "Tell me about yourself and what draws you to this role.",
    "I see you have experience with Python..."
  ]
}
```

#### **Changes Made:**
- ✅ Added `transcribed_text` in history items
- ✅ Added `has_audio` flag in history items
- ✅ Added `asked_questions` array for question tracking
- ✅ Enhanced evaluation data with voice metrics

---

### 4. Get User Sessions API

#### **Endpoint:**
```
GET /api/interview/sessions/{user_id}
```

#### **Response:**
```json
[
  {
    "session_id": "session-001",
    "role_title": "Senior Backend Engineer",
    "company_name": "TechCorp Inc",
    "status": "active",
    "question_count": 3
  },
  {
    "session_id": "session-002",
    "role_title": "Frontend Developer",
    "company_name": "StartupCorp",
    "status": "completed",
    "question_count": 8
  }
]
```

#### **Changes Made:**
- ✅ No structural changes to this endpoint
- ✅ Sessions now track voice-enabled interviews

---

### 5. Get Interview Report API

#### **Endpoint:**
```
GET /api/interview/report/{user_id}/{session_id}
```

#### **Response:**
```json
{
  "session_id": "session-001",
  "user_id": "test-user-001",
  "role": "Senior Backend Engineer",
  "company": "TechCorp Inc",
  "industry": "Technology",
  "avg_scores": {
    "overall": 6.2,
    "technical": 5.8,
    "communication": 6.5,
    "problem_solving": 6.0,
    "cultural_fit": 6.1
  },
  "history": [
    {
      "question": "Tell me about yourself and what draws you to this role.",
      "answer": "I am a passionate software engineer...",
      "transcribed_text": "I am a passionate software engineer...",  // ✅ NEW
      "has_audio": true,                                                  // ✅ NEW
      "evaluation": {
        "score": 5.8,
        "voice_metrics": {                                                // ✅ NEW
          "duration": 15.2,
          "speech_rate": 145,
          "avg_pitch": 180.5,
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
  "completed": true
}
```

#### **Changes Made:**
- ✅ Enhanced scoring includes voice analysis
- ✅ History items include voice transcription and metrics
- ✅ Overall scores reflect combined text + voice evaluation

---

## 🎯 Voice Analysis Features

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

## 🧪 Complete Testing Flow

```bash
# 1. Start voice interview
curl -X POST "http://34.27.237.113:8000/api/interview/start" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-001",
    "session_id": "session-001",
    "role_title": "Senior Backend Engineer",
    "company_name": "TechCorp Inc",
    "industry": "Technology",
    "cv_id": "67638f123456789abcdef012",
    "jd_id": "67638f987654321fedcba098",
    "round_type": "full"
  }'

# 2. Submit voice answers
curl -X POST "http://34.27.237.113:8000/api/interview/answer" \
  -F "user_id=test-user-001" \
  -F "session_id=session-001" \
  -F "audio_file=@answer1.wav"

# 3. Continue interview
curl -X POST "http://34.27.237.113:8000/api/interview/answer" \
  -F "user_id=test-user-001" \
  -F "session_id=session-001" \
  -F "audio_file=@answer2.wav"

# 4. Check session state
curl "http://34.27.237.113:8000/api/interview/state/test-user-001/session-001"

# 5. Get final report
curl "http://34.27.237.113:8000/api/interview/report/test-user-001/session-001"
```---

## 🚨 Breaking Changes Summary

### 1. Answer Submission API
- **Endpoint**: `/api/interview/answer` (was `/api/ai-interview/answer`)
- **Input Format**: JSON → FormData
- **Required Fields**: `answer` text → `audio_file`
- **Content-Type**: `application/json` → `multipart/form-data`
- **Removed**: Text answer support (audio only)

### 2. Start Interview API
- **Endpoint**: `/api/interview/start` (was `/api/ai-interview/start`)
- **Required Fields**: `cv_id`, `jd_id` (instead of `cv`, `jd` text)
- **Content Fetching**: Automatic from database
- **Response**: Enhanced with fetched CV/JD content

### 3. Evaluation Response
- **Score Range**: 0-5.0 → 0-11.0
- **New Fields**: `voice_metrics`, `transcribed_text`, `has_audio`
- **Enhanced Breakdown**: Added 4 voice evaluation dimensions
- **State Tracking**: Complete session state in response

### 4. All Endpoints
- **Base URL**: Changed to `/api/interview/` prefix
- **Voice Integration**: All responses include voice analysis data
- **Session Tracking**: Enhanced history with audio flags

---

## ✅ Backend Integration Requirements

### Controller Updates Required
```typescript
// Update endpoint paths
@Controller('interview')  // was 'ai-interview'
export class InterviewController {
  
  @Post('start')
  async startInterview(@Body() payload: {
    cv_id: string;     // NEW: Required
    jd_id: string;     // NEW: Required
    // ... other fields
  }) {
    // Fetch CV/JD content from database
    // Call AI service with fetched content
  }
  
  @Post('answer')
  @UseInterceptors(FileInterceptor('audio_file'))
  async submitAnswer(
    @UploadedFile() audioFile: Express.Multer.File,  // NEW: Required
    @Body() payload: {
      user_id: string;
      session_id: string;
      // No 'answer' text field
    }
  ) {
    // Process audio file
    // Call AI service with audio
  }
}
```

### Service Updates Required
```typescript
// Update AI service calls
export class InterviewService {
  async startInterview(payload: {
    cv_id: string;
    jd_id: string;
    // ...
  }) {
    // 1. Fetch CV content by cv_id
    const cvContent = await this.fetchCVContent(payload.cv_id);
    
    // 2. Fetch JD content by jd_id  
    const jdContent = await this.fetchJDContent(payload.jd_id);
    
    // 3. Call AI service with fetched content
    return this.aiService.startInterview({
      ...payload,
      cv: cvContent,
      jd: jdContent
    });
  }
  
  async submitVoiceAnswer(audioFile: Express.Multer.File, payload: any) {
    // Process audio file and call AI service
    const formData = new FormData();
    formData.append('audio_file', fs.createReadStream(audioFile.path));
    formData.append('user_id', payload.user_id);
    formData.append('session_id', payload.session_id);
    
    return this.aiService.submitAnswer(formData);
  }
}
```

---

*All endpoints under `/api/interview/` prefix now support comprehensive voice analysis with speech-to-text conversion and detailed voice metrics evaluation.*