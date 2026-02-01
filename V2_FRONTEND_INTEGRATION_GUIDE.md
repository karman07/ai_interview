# Interview API V2 - Complete Frontend Integration Guide

**Last Updated:** February 1, 2026  
**API Version:** 2.0.0  
**Base URL:** `http://localhost:3000/interview/v2`  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [All Routes - Frontend Reference](#all-routes---frontend-reference)
- [Complete Code Examples](#complete-code-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [TypeScript Types](#typescript-types)
- [React Integration Examples](#react-integration-examples)

---

## Overview

This guide provides complete frontend integration documentation for Interview API V2. All routes, request formats, response formats, and code examples are included.

### What's New in V2

- ✅ **9 Complete Routes** - Full interview lifecycle management
- ✅ **File Upload Support** - Resume & JD file uploads (PDF, DOCX, TXT)
- ✅ **Real-time Streaming** - Server-Sent Events for progressive question display
- ✅ **60-70% Faster** - MongoDB caching and optimized processing
- ✅ **Performance Monitoring** - Session and global metrics tracking
- ✅ **Enhanced Responses** - Richer data with evaluation scores

### Base Configuration

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000/interview/v2';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'API request failed');
  }
  
  return response.json();
}
```

---

## Quick Start

### Complete Interview Flow

```javascript
// 1. Start interview with file uploads (RECOMMENDED)
const formData = new FormData();
formData.append('user_id', 'user_123');
formData.append('session_id', `sess_${Date.now()}`);
formData.append('role', 'Senior Software Engineer');
formData.append('company', 'TechCorp');
formData.append('cv_file', resumeFile); // File from input
formData.append('jd_file', jdFile); // File from input

const startResponse = await fetch(`${API_BASE_URL}/start-with-ids`, {
  method: 'POST',
  body: formData
});
const session = await startResponse.json();
console.log('First Question:', session.question);

// 2. Record and submit answer
const answerData = new FormData();
answerData.append('session_id', session.session_id);
answerData.append('audio_file', audioBlob, 'answer.wav');

const answerResponse = await fetch(`${API_BASE_URL}/answer`, {
  method: 'POST',
  body: answerData
});
const nextQuestion = await answerResponse.json();

if (nextQuestion.status === 'completed') {
  // Interview finished - get full evaluation
  const completeResponse = await fetch(`${API_BASE_URL}/complete/${session.session_id}`, {
    method: 'POST'
  });
  const evaluation = await completeResponse.json();
  console.log('Final Score:', evaluation.evaluation.overall_score);
} else {
  // Show next question
  console.log('Next Question:', nextQuestion.question);
  console.log('Your Score:', nextQuestion.evaluation);
}
```

---

## All Routes - Frontend Reference

### 1. POST `/interview/v2/start`

**Purpose:** Start interview with direct CV/JD text (JSON body)

**When to Use:**
- When you have CV/JD as plain text strings
- Quick testing or simple integrations
- No file upload needed

**Request:**
```javascript
const response = await fetch(`${API_BASE_URL}/start`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_123',
    session_id: `sess_${Date.now()}`,
    role: 'Backend Developer',
    company: 'TechCorp',
    cv_text: 'John Doe\n5 years experience in Node.js...',
    jd_text: 'We are looking for a Backend Developer...'
  })
});

const data = await response.json();
```

**Response:**
```javascript
{
  session_id: "sess_1706745600123",
  status: "active",
  question: "Hello! I'm excited to speak with you about the Backend Developer role...",
  question_number: 1
}
```

**Frontend Implementation:**
```javascript
async function startInterviewWithText(userId, cvText, jdText, role, company) {
  try {
    const sessionId = `sess_${Date.now()}`;
    
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        role: role,
        company: company,
        cv_text: cvText,
        jd_text: jdText
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    const data = await response.json();
    
    // Store session info
    localStorage.setItem('current_session', data.session_id);
    localStorage.setItem('session_status', data.status);
    
    return {
      sessionId: data.session_id,
      firstQuestion: data.question,
      questionNumber: data.question_number,
      status: data.status
    };
    
  } catch (error) {
    console.error('Failed to start interview:', error);
    throw error;
  }
}

// Usage
const result = await startInterviewWithText(
  'user_123',
  cvTextArea.value,
  jdTextArea.value,
  'Software Engineer',
  'My Company'
);
displayQuestion(result.firstQuestion, result.questionNumber);
```

---

### 2. POST `/interview/v2/start-with-ids` ⭐ RECOMMENDED

**Purpose:** Start interview with file uploads, MongoDB IDs, or text

**When to Use:**
- **File uploads** (MOST COMMON) - When user uploads resume/JD files
- **MongoDB IDs** - When CV/JD are already stored in database
- **Mixed approach** - File for CV, ID for JD, etc.

**Priority Order:**
1. Files (`cv_file`, `jd_file`) → Best for user experience
2. MongoDB IDs (`cv_id`, `jd_id`) → Best for caching
3. Direct text (`cv_text`, `jd_text`) → Fallback option

**Request - File Upload (RECOMMENDED):**
```javascript
// HTML
<input type="file" id="resumeFile" accept=".pdf,.docx,.txt" />
<input type="file" id="jdFile" accept=".pdf,.docx,.txt" />

// JavaScript
const formData = new FormData();
formData.append('user_id', 'user_123');
formData.append('session_id', `sess_${Date.now()}`);
formData.append('role', 'Senior Developer');
formData.append('company', 'TechCorp');
formData.append('cv_file', resumeFileInput.files[0]);
formData.append('jd_file', jdFileInput.files[0]);

const response = await fetch(`${API_BASE_URL}/start-with-ids`, {
  method: 'POST',
  body: formData // No Content-Type header needed
});

const data = await response.json();
```

**Request - MongoDB IDs:**
```javascript
const formData = new FormData();
formData.append('user_id', 'user_123');
formData.append('session_id', `sess_${Date.now()}`);
formData.append('role', 'Frontend Developer');
formData.append('company', 'StartupCo');
formData.append('cv_id', '60d5ec49f1b2c8b1f8c4e5a1');
formData.append('jd_id', '60d5ec49f1b2c8b1f8c4e5a2');

const response = await fetch(`${API_BASE_URL}/start-with-ids`, {
  method: 'POST',
  body: formData
});
```

**Request - Mixed Approach:**
```javascript
const formData = new FormData();
formData.append('user_id', 'user_123');
formData.append('session_id', `sess_${Date.now()}`);
formData.append('role', 'DevOps Engineer');
formData.append('company', 'CloudCo');
formData.append('cv_file', resumeFile); // File upload
formData.append('jd_id', '60d5ec49f1b2c8b1f8c4e5a2'); // MongoDB ID

const response = await fetch(`${API_BASE_URL}/start-with-ids`, {
  method: 'POST',
  body: formData
});
```

**Response:**
```javascript
{
  session_id: "sess_1706745600123",
  status: "active",
  question: "Thanks for joining us today. Let's start by discussing your experience with cloud technologies...",
  question_number: 1
}
```

**Complete Frontend Implementation:**
```javascript
async function startInterviewWithFiles(userId, resumeFile, jdFile, role, company) {
  try {
    // Validate files
    if (!resumeFile || !jdFile) {
      throw new Error('Both resume and job description files are required');
    }

    // Check file types
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const resumeExt = resumeFile.name.substring(resumeFile.name.lastIndexOf('.')).toLowerCase();
    const jdExt = jdFile.name.substring(jdFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(resumeExt) || !allowedTypes.includes(jdExt)) {
      throw new Error('Only PDF, DOCX, and TXT files are allowed');
    }

    // Check file sizes (max 10MB each)
    const maxSize = 10 * 1024 * 1024;
    if (resumeFile.size > maxSize || jdFile.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Create session ID
    const sessionId = `sess_${Date.now()}_${userId}`;

    // Prepare form data
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('session_id', sessionId);
    formData.append('role', role);
    formData.append('company', company);
    formData.append('cv_file', resumeFile);
    formData.append('jd_file', jdFile);

    // Show loading state
    showLoading('Starting interview, analyzing your resume...');

    // Make request
    const response = await fetch(`${API_BASE_URL}/start-with-ids`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start interview');
    }

    const data = await response.json();

    // Store session data
    localStorage.setItem('current_session', data.session_id);
    localStorage.setItem('session_status', data.status);
    localStorage.setItem('question_number', data.question_number);
    localStorage.setItem('role', role);
    localStorage.setItem('company', company);

    hideLoading();

    return {
      sessionId: data.session_id,
      firstQuestion: data.question,
      questionNumber: data.question_number,
      status: data.status
    };

  } catch (error) {
    hideLoading();
    console.error('Failed to start interview:', error);
    showError(error.message);
    throw error;
  }
}

// Usage Example
document.getElementById('startButton').addEventListener('click', async () => {
  const resumeFile = document.getElementById('resumeFile').files[0];
  const jdFile = document.getElementById('jdFile').files[0];
  const role = document.getElementById('roleInput').value;
  const company = document.getElementById('companyInput').value;
  
  try {
    const result = await startInterviewWithFiles(
      currentUserId,
      resumeFile,
      jdFile,
      role,
      company
    );
    
    // Display first question
    displayQuestion(result.firstQuestion, result.questionNumber);
    
    // Enable answer recording
    enableRecording();
    
  } catch (error) {
    alert('Failed to start interview: ' + error.message);
  }
});
```

**Supported File Formats:**
- **PDF** (.pdf) - Recommended, most reliable
- **DOCX** (.docx) - Microsoft Word documents
- **TXT** (.txt) - Plain text files

**File Validation:**
```javascript
function validateFile(file, fieldName) {
  // Check if file exists
  if (!file) {
    throw new Error(`${fieldName} is required`);
  }

  // Check file type
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const fileName = file.name.toLowerCase();
  const isValidType = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  if (!isValidType) {
    throw new Error(`${fieldName} must be PDF, DOCX, or TXT file`);
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`${fieldName} must be less than 10MB`);
  }

  // Check if file has content
  if (file.size === 0) {
    throw new Error(`${fieldName} appears to be empty`);
  }

  return true;
}

// Usage
try {
  validateFile(resumeFile, 'Resume');
  validateFile(jdFile, 'Job Description');
  // Proceed with upload
} catch (error) {
  showError(error.message);
}
```

---

### 3. POST `/interview/v2/answer`

**Purpose:** Submit candidate's answer with audio or video recording

**When to Use:**
- After displaying each interview question
- When candidate finishes recording their answer
- Supports both audio-only and video recordings

**Request:**
```javascript
// HTML
<button id="recordBtn">Start Recording</button>
<button id="stopBtn">Stop Recording</button>
<button id="submitBtn">Submit Answer</button>

// JavaScript - Audio Recording
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };
  
  mediaRecorder.start();
}

function stopRecording() {
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      audioChunks = [];
      resolve(audioBlob);
    };
    
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  });
}

async function submitAnswer(sessionId, audioBlob) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('audio_file', audioBlob, 'answer.wav');
  
  const response = await fetch(`${API_BASE_URL}/answer`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

**Response - Active Interview:**
```javascript
{
  session_id: "sess_1706745600123",
  status: "active",
  question: "That's impressive. Can you describe a challenging technical problem you solved?",
  question_number: 2,
  evaluation: {
    clarity: 8,
    relevance: 9,
    depth: 7,
    feedback: "Clear and relevant answer with good technical details"
  },
  voice_analysis: { // Optional, if voice analysis is available
    fluency_score: 8.5,
    clarity_score: 9.0,
    confidence_score: 7.8,
    pace_score: 8.2,
    rate_wpm: 145,
    total_score: 8.4
  }
}
```

**Response - Interview Completed:**
```javascript
{
  session_id: "sess_1706745600123",
  status: "completed",
  message: "Interview completed",
  total_questions: 5
}
```

**Complete Frontend Implementation:**
```javascript
class InterviewRecorder {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  async startRecording() {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create media recorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // or 'audio/wav'
      });

      this.audioChunks = [];

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;

      console.log('Recording started');
      updateRecordingUI(true);

    } catch (error) {
      console.error('Failed to start recording:', error);
      if (error.name === 'NotAllowedError') {
        showError('Microphone permission denied. Please allow microphone access.');
      } else {
        showError('Failed to start recording: ' + error.message);
      }
      throw error;
    }
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        // Create audio blob
        const audioBlob = new Blob(this.audioChunks, { 
          type: 'audio/webm' 
        });

        // Stop all tracks
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        this.isRecording = false;
        console.log('Recording stopped, size:', audioBlob.size);
        
        updateRecordingUI(false);
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async submitAnswer() {
    try {
      // Stop recording and get audio
      const audioBlob = await this.stopRecording();

      // Validate audio
      if (audioBlob.size === 0) {
        throw new Error('Recording is empty');
      }

      if (audioBlob.size < 1000) {
        throw new Error('Recording is too short');
      }

      // Show processing state
      showLoading('Processing your answer...');

      // Prepare form data
      const formData = new FormData();
      formData.append('session_id', this.sessionId);
      formData.append('audio_file', audioBlob, 'answer.wav');

      // Submit to API
      const response = await fetch(`${API_BASE_URL}/answer`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to submit answer');
      }

      const data = await response.json();
      hideLoading();

      // Handle response
      if (data.status === 'completed') {
        // Interview finished
        return {
          completed: true,
          totalQuestions: data.total_questions,
          message: data.message
        };
      } else {
        // Continue interview
        localStorage.setItem('question_number', data.question_number);
        
        return {
          completed: false,
          nextQuestion: data.question,
          questionNumber: data.question_number,
          evaluation: data.evaluation,
          voiceAnalysis: data.voice_analysis
        };
      }

    } catch (error) {
      hideLoading();
      console.error('Failed to submit answer:', error);
      showError('Failed to submit answer: ' + error.message);
      throw error;
    }
  }
}

// Usage
let recorder;

document.getElementById('startBtn').addEventListener('click', async () => {
  const sessionId = localStorage.getItem('current_session');
  recorder = new InterviewRecorder(sessionId);
  
  try {
    await recorder.startRecording();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
  } catch (error) {
    alert('Failed to start recording: ' + error.message);
  }
});

document.getElementById('stopBtn').addEventListener('click', async () => {
  try {
    const result = await recorder.submitAnswer();
    
    if (result.completed) {
      // Interview finished - navigate to completion page
      showCompletionMessage(result.totalQuestions);
      setTimeout(() => {
        window.location.href = '/interview-complete';
      }, 2000);
    } else {
      // Show evaluation
      displayEvaluation(result.evaluation);
      if (result.voiceAnalysis) {
        displayVoiceAnalysis(result.voiceAnalysis);
      }
      
      // Show next question
      displayQuestion(result.nextQuestion, result.questionNumber);
      
      // Re-enable recording for next answer
      document.getElementById('startBtn').disabled = false;
      document.getElementById('stopBtn').disabled = true;
    }
    
  } catch (error) {
    alert('Failed to submit answer: ' + error.message);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
  }
});

// Helper functions
function displayEvaluation(evaluation) {
  document.getElementById('clarity-score').textContent = evaluation.clarity;
  document.getElementById('relevance-score').textContent = evaluation.relevance;
  document.getElementById('depth-score').textContent = evaluation.depth;
  document.getElementById('feedback').textContent = evaluation.feedback;
  document.getElementById('evaluation-panel').classList.remove('hidden');
}

function displayVoiceAnalysis(voiceAnalysis) {
  document.getElementById('fluency-score').textContent = voiceAnalysis.fluency_score.toFixed(1);
  document.getElementById('voice-clarity-score').textContent = voiceAnalysis.clarity_score.toFixed(1);
  document.getElementById('confidence-score').textContent = voiceAnalysis.confidence_score.toFixed(1);
  document.getElementById('pace-score').textContent = voiceAnalysis.pace_score.toFixed(1);
  document.getElementById('wpm').textContent = Math.round(voiceAnalysis.rate_wpm);
  document.getElementById('voice-panel').classList.remove('hidden');
}
```

**Video Recording Support:**
```javascript
async function startVideoRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: true, 
    audio: true 
  });
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm'
  });
  
  let videoChunks = [];
  
  mediaRecorder.ondataavailable = (event) => {
    videoChunks.push(event.data);
  };
  
  mediaRecorder.start();
  
  return {
    recorder: mediaRecorder,
    stop: () => new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        stream.getTracks().forEach(track => track.stop());
        resolve(videoBlob);
      };
      mediaRecorder.stop();
    })
  };
}

// Submit video
async function submitVideoAnswer(sessionId, videoBlob) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('video_file', videoBlob, 'answer.webm');
  
  const response = await fetch(`${API_BASE_URL}/answer`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

---

### 4. GET `/interview/v2/stream/:session_id` ⭐ REAL-TIME STREAMING

**Purpose:** Stream next question generation in real-time using Server-Sent Events

**When to Use:**
- For better user experience (progressive display)
- When you want to show question as it's being generated
- First chunk arrives in 0.5-1 second (vs 2-3s for complete)

**Frontend Implementation:**
```javascript
function streamQuestion(sessionId, onChunk, onComplete, onError) {
  const eventSource = new EventSource(`${API_BASE_URL}/stream/${sessionId}`);
  
  let fullQuestion = '';
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.chunk) {
        // Received a text chunk
        fullQuestion += data.chunk;
        onChunk(data.chunk, fullQuestion);
      }
      
      if (data.done) {
        // Streaming complete
        eventSource.close();
        onComplete(fullQuestion);
      }
      
      if (data.error) {
        // Error occurred
        eventSource.close();
        onError(new Error(data.error));
      }
    } catch (error) {
      eventSource.close();
      onError(error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    eventSource.close();
    onError(new Error('Streaming connection failed'));
  };
  
  // Return function to cancel streaming
  return () => eventSource.close();
}

// Usage
const cancelStream = streamQuestion(
  sessionId,
  // On each chunk
  (chunk, fullText) => {
    document.getElementById('question').textContent = fullText;
  },
  // On complete
  (finalQuestion) => {
    console.log('Question complete:', finalQuestion);
    enableAnswerRecording();
  },
  // On error
  (error) => {
    console.error('Streaming error:', error);
    showError('Failed to load question: ' + error.message);
  }
);

// Cancel if needed (e.g., user navigates away)
// cancelStream();
```

**React Implementation:**
```javascript
import { useState, useEffect, useRef } from 'react';

function StreamingQuestion({ sessionId }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Start streaming
    const eventSource = new EventSource(`${API_BASE_URL}/stream/${sessionId}`);
    eventSourceRef.current = eventSource;

    let fullQuestion = '';

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.chunk) {
          fullQuestion += data.chunk;
          setQuestion(fullQuestion);
        }
        
        if (data.done) {
          setIsLoading(false);
          eventSource.close();
        }
        
        if (data.error) {
          setError(data.error);
          setIsLoading(false);
          eventSource.close();
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setError('Connection lost');
      setIsLoading(false);
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [sessionId]);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="question-container">
      <p className="question-text">{question}</p>
      {isLoading && <span className="typing-indicator">▋</span>}
    </div>
  );
}
```

**Typing Animation Effect:**
```css
/* CSS for typing indicator */
.typing-indicator {
  display: inline-block;
  animation: blink 1s infinite;
  margin-left: 2px;
  font-weight: bold;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.question-text {
  font-size: 18px;
  line-height: 1.6;
  min-height: 60px;
}
```

---

### 5. GET `/interview/v2/state/:session_id`

**Purpose:** Get complete session state and conversation history

**When to Use:**
- Resume interrupted interview
- Show conversation history
- Display progress indicators
- Debug or review session

**Request:**
```javascript
async function getSessionState(sessionId) {
  const response = await fetch(`${API_BASE_URL}/state/${sessionId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Session not found');
  }
  
  return await response.json();
}
```

**Response:**
```javascript
{
  session_id: "sess_1706745600123",
  user_id: "user_123",
  role: "Senior Software Engineer",
  company: "TechCorp",
  question_count: 3,
  stage: "technical",
  completed: false,
  messages: [
    {
      role: "interviewer",
      content: "Tell me about your experience with Python...",
      timestamp: 1706745600.123,
      metadata: { stage: "intro" }
    },
    {
      role: "candidate",
      content: "I have 5 years of experience...",
      timestamp: 1706745620.456,
      metadata: {
        evaluation: {
          clarity: 8,
          relevance: 9,
          depth: 7,
          feedback: "Good answer"
        }
      }
    }
  ],
  avg_response_time: 2.34
}
```

**Frontend Implementation - Conversation History:**
```javascript
async function displayConversationHistory(sessionId) {
  try {
    const state = await getSessionState(sessionId);
    
    // Update progress indicator
    document.getElementById('question-count').textContent = state.question_count;
    document.getElementById('stage').textContent = state.stage;
    
    // Display conversation
    const container = document.getElementById('conversation-history');
    container.innerHTML = '';
    
    state.messages.forEach((message, index) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message message-${message.role}`;
      
      if (message.role === 'interviewer') {
        messageDiv.innerHTML = `
          <div class="message-header">
            <strong>Interviewer</strong>
            <span class="timestamp">${formatTimestamp(message.timestamp)}</span>
          </div>
          <div class="message-content">${message.content}</div>
          ${message.metadata?.stage ? `<span class="stage-badge">${message.metadata.stage}</span>` : ''}
        `;
      } else {
        messageDiv.innerHTML = `
          <div class="message-header">
            <strong>You</strong>
            <span class="timestamp">${formatTimestamp(message.timestamp)}</span>
          </div>
          <div class="message-content">${message.content}</div>
          ${message.metadata?.evaluation ? renderEvaluation(message.metadata.evaluation) : ''}
        `;
      }
      
      container.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
  } catch (error) {
    console.error('Failed to load conversation:', error);
    showError('Failed to load conversation history');
  }
}

function renderEvaluation(evaluation) {
  return `
    <div class="evaluation-scores">
      <span class="score-item">
        <label>Clarity:</label>
        <span class="score">${evaluation.clarity}/10</span>
      </span>
      <span class="score-item">
        <label>Relevance:</label>
        <span class="score">${evaluation.relevance}/10</span>
      </span>
      <span class="score-item">
        <label>Depth:</label>
        <span class="score">${evaluation.depth}/10</span>
      </span>
    </div>
    <div class="evaluation-feedback">${evaluation.feedback}</div>
  `;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString();
}
```

**Resume Interrupted Session:**
```javascript
async function resumeInterview() {
  const sessionId = localStorage.getItem('current_session');
  
  if (!sessionId) {
    showError('No active session found');
    return;
  }
  
  try {
    const state = await getSessionState(sessionId);
    
    if (state.completed) {
      showMessage('This interview is already completed');
      window.location.href = '/interview-complete';
      return;
    }
    
    // Display conversation history
    await displayConversationHistory(sessionId);
    
    // Get the last interviewer message (current question)
    const lastInterviewerMessage = state.messages
      .reverse()
      .find(msg => msg.role === 'interviewer');
    
    if (lastInterviewerMessage) {
      displayQuestion(lastInterviewerMessage.content, state.question_count);
      enableRecording();
    }
    
    showMessage(`Resumed interview at question ${state.question_count}`);
    
  } catch (error) {
    showError('Failed to resume interview: ' + error.message);
  }
}
```

---

### 6. GET `/interview/v2/performance/:session_id`

**Purpose:** Get performance metrics for session

**When to Use:**
- Monitor interview performance
- Debug slow responses
- Validate caching effectiveness
- Display performance stats to user

**Request:**
```javascript
async function getPerformanceMetrics(sessionId) {
  const response = await fetch(`${API_BASE_URL}/performance/${sessionId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get metrics');
  }
  
  return await response.json();
}
```

**Response:**
```javascript
{
  session_id: "sess_1706745600123",
  total_questions: 5,
  response_times: {
    min: 1.23,
    max: 4.56,
    avg: 2.45,
    all: [4.56, 2.12, 2.34, 1.98, 1.23]
  },
  cache_status: "active"
}
```

**Frontend Display:**
```javascript
async function displayPerformanceMetrics(sessionId) {
  try {
    const metrics = await getPerformanceMetrics(sessionId);
    
    document.getElementById('total-questions').textContent = metrics.total_questions;
    document.getElementById('avg-time').textContent = metrics.response_times.avg.toFixed(2) + 's';
    document.getElementById('min-time').textContent = metrics.response_times.min.toFixed(2) + 's';
    document.getElementById('max-time').textContent = metrics.response_times.max.toFixed(2) + 's';
    
    // Cache status indicator
    const cacheIndicator = document.getElementById('cache-status');
    if (metrics.cache_status === 'active') {
      cacheIndicator.textContent = '✅ Cached (Faster)';
      cacheIndicator.className = 'status-good';
    } else {
      cacheIndicator.textContent = '⚠️ Not Cached';
      cacheIndicator.className = 'status-warning';
    }
    
    // Performance chart
    createPerformanceChart(metrics.response_times.all);
    
  } catch (error) {
    console.error('Failed to load metrics:', error);
  }
}

function createPerformanceChart(responseTimes) {
  const canvas = document.getElementById('performance-chart');
  const ctx = canvas.getContext('2d');
  
  // Simple bar chart
  const maxTime = Math.max(...responseTimes);
  const barWidth = canvas.width / responseTimes.length;
  
  responseTimes.forEach((time, index) => {
    const barHeight = (time / maxTime) * (canvas.height - 40);
    const x = index * barWidth;
    const y = canvas.height - barHeight - 20;
    
    // Draw bar
    ctx.fillStyle = time > 4 ? '#f44336' : time > 3 ? '#ff9800' : '#4caf50';
    ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
    
    // Draw value
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText(time.toFixed(1) + 's', x + 10, canvas.height - 5);
  });
}
```

---

### 7. POST `/interview/v2/complete/:session_id`

**Purpose:** Complete interview and get full evaluation

**When to Use:**
- After interview status becomes "completed"
- To get comprehensive evaluation report
- Display final scores and feedback

**Request:**
```javascript
async function completeInterview(sessionId) {
  const response = await fetch(`${API_BASE_URL}/complete/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to complete interview');
  }
  
  return await response.json();
}
```

**Response:**
```javascript
{
  session_id: "sess_1706745600123",
  status: "completed",
  total_questions: 5,
  evaluation: {
    overall_score: 7.83,
    recommendation: "hire",
    clarity: 8.2,
    relevance: 8.4,
    depth: 6.9
  },
  conversation: [
    {
      question: "Tell me about your experience...",
      answer: "I have 5 years...",
      evaluation: {
        clarity: 8,
        relevance: 9,
        depth: 7,
        feedback: "Good answer"
      }
    }
  ],
  performance_metrics: {
    avg_response_time: 2.45,
    total_response_times: [4.56, 2.12, 2.34, 1.98, 1.23]
  }
}
```

**Frontend Implementation - Results Page:**
```javascript
async function displayInterviewResults(sessionId) {
  try {
    showLoading('Generating your evaluation report...');
    
    const results = await completeInterview(sessionId);
    
    hideLoading();
    
    // Overall Score
    const overallScore = results.evaluation.overall_score;
    document.getElementById('overall-score').textContent = overallScore.toFixed(2);
    document.getElementById('score-circle').style.setProperty('--score', overallScore * 10);
    
    // Recommendation
    const recommendation = results.evaluation.recommendation;
    const recommendationText = {
      'hire': '✅ Strong Hire',
      'maybe': '⚠️ Maybe',
      'no_hire': '❌ Not Recommended'
    };
    document.getElementById('recommendation').textContent = recommendationText[recommendation];
    document.getElementById('recommendation').className = `recommendation ${recommendation}`;
    
    // Score Breakdown
    document.getElementById('clarity-avg').textContent = results.evaluation.clarity.toFixed(1);
    document.getElementById('relevance-avg').textContent = results.evaluation.relevance.toFixed(1);
    document.getElementById('depth-avg').textContent = results.evaluation.depth.toFixed(1);
    
    // Progress bars
    updateProgressBar('clarity-bar', results.evaluation.clarity);
    updateProgressBar('relevance-bar', results.evaluation.relevance);
    updateProgressBar('depth-bar', results.evaluation.depth);
    
    // Conversation Review
    const conversationContainer = document.getElementById('conversation-review');
    conversationContainer.innerHTML = '';
    
    results.conversation.forEach((item, index) => {
      const qaDiv = document.createElement('div');
      qaDiv.className = 'qa-item';
      qaDiv.innerHTML = `
        <div class="question-section">
          <h4>Question ${index + 1}</h4>
          <p>${item.question}</p>
        </div>
        <div class="answer-section">
          <h5>Your Answer</h5>
          <p>${item.answer}</p>
          <div class="answer-evaluation">
            <div class="eval-scores">
              <span>Clarity: ${item.evaluation.clarity}/10</span>
              <span>Relevance: ${item.evaluation.relevance}/10</span>
              <span>Depth: ${item.evaluation.depth}/10</span>
            </div>
            <p class="eval-feedback">${item.evaluation.feedback}</p>
          </div>
        </div>
      `;
      conversationContainer.appendChild(qaDiv);
    });
    
    // Performance Stats
    document.getElementById('total-questions-stat').textContent = results.total_questions;
    document.getElementById('avg-response-stat').textContent = 
      results.performance_metrics.avg_response_time.toFixed(2) + 's';
    
    // Save results to localStorage for sharing/download
    localStorage.setItem('interview_results', JSON.stringify(results));
    
    // Enable download/share buttons
    document.getElementById('download-btn').disabled = false;
    document.getElementById('share-btn').disabled = false;
    
  } catch (error) {
    hideLoading();
    showError('Failed to load results: ' + error.message);
  }
}

function updateProgressBar(elementId, value) {
  const bar = document.getElementById(elementId);
  const percentage = (value / 10) * 100;
  bar.style.width = percentage + '%';
  
  // Color based on score
  if (value >= 8) {
    bar.style.backgroundColor = '#4caf50'; // Green
  } else if (value >= 6) {
    bar.style.backgroundColor = '#ff9800'; // Orange
  } else {
    bar.style.backgroundColor = '#f44336'; // Red
  }
}

// Download results as PDF
document.getElementById('download-btn').addEventListener('click', () => {
  const results = JSON.parse(localStorage.getItem('interview_results'));
  
  // Create printable version
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Interview Results - ${results.session_id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .score { font-size: 48px; font-weight: bold; color: #2196f3; }
          .recommendation { font-size: 24px; margin: 10px 0; }
          .breakdown { margin: 20px 0; }
          .qa-item { margin: 20px 0; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Interview Evaluation Report</h1>
          <div class="score">${results.evaluation.overall_score.toFixed(2)}/10</div>
          <div class="recommendation">${results.evaluation.recommendation}</div>
        </div>
        <div class="breakdown">
          <h2>Score Breakdown</h2>
          <p>Clarity: ${results.evaluation.clarity.toFixed(1)}/10</p>
          <p>Relevance: ${results.evaluation.relevance.toFixed(1)}/10</p>
          <p>Depth: ${results.evaluation.depth.toFixed(1)}/10</p>
        </div>
        <div class="conversation">
          <h2>Interview Conversation</h2>
          ${results.conversation.map((item, i) => `
            <div class="qa-item">
              <h3>Question ${i + 1}</h3>
              <p><strong>Q:</strong> ${item.question}</p>
              <p><strong>A:</strong> ${item.answer}</p>
              <p><strong>Feedback:</strong> ${item.evaluation.feedback}</p>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
});
```

---

### 8. GET `/interview/v2/metrics/global`

**Purpose:** Get system-wide performance metrics

**When to Use:**
- Admin dashboard
- System monitoring
- Performance analysis
- Cost tracking

**Request:**
```javascript
async function getGlobalMetrics() {
  const response = await fetch(`${API_BASE_URL}/metrics/global`);
  
  if (!response.ok) {
    throw new Error('Failed to get global metrics');
  }
  
  return await response.json();
}
```

**Response:**
```javascript
{
  status: "success",
  metrics: {
    llm_calls: {
      total: 127,
      avg_duration: 2.34,
      min_duration: 0.89,
      max_duration: 5.67
    },
    api_requests: {
      total: 89,
      avg_duration: 3.12,
      min_duration: 1.23,
      max_duration: 8.45
    },
    cache: {
      hits: 54,
      misses: 35,
      hit_rate: 0.6067,
      hit_rate_percentage: "60.7%"
    }
  },
  timestamp: 1706745600.123
}
```

**Admin Dashboard Implementation:**
```javascript
async function displayGlobalMetrics() {
  try {
    const data = await getGlobalMetrics();
    const metrics = data.metrics;
    
    // LLM Stats
    document.getElementById('llm-total').textContent = metrics.llm_calls.total;
    document.getElementById('llm-avg').textContent = metrics.llm_calls.avg_duration.toFixed(2) + 's';
    document.getElementById('llm-max').textContent = metrics.llm_calls.max_duration.toFixed(2) + 's';
    
    // API Stats
    document.getElementById('api-total').textContent = metrics.api_requests.total;
    document.getElementById('api-avg').textContent = metrics.api_requests.avg_duration.toFixed(2) + 's';
    
    // Cache Stats
    document.getElementById('cache-hits').textContent = metrics.cache.hits;
    document.getElementById('cache-misses').textContent = metrics.cache.misses;
    document.getElementById('cache-rate').textContent = metrics.cache.hit_rate_percentage;
    
    // Health indicators
    updateHealthIndicator('llm-health', metrics.llm_calls.avg_duration, 2.5, 4);
    updateHealthIndicator('api-health', metrics.api_requests.avg_duration, 3, 5);
    updateHealthIndicator('cache-health', metrics.cache.hit_rate, 0.6, 0.4, true);
    
  } catch (error) {
    console.error('Failed to load metrics:', error);
  }
}

function updateHealthIndicator(elementId, value, goodThreshold, badThreshold, higherIsBetter = false) {
  const indicator = document.getElementById(elementId);
  
  let status, color;
  if (higherIsBetter) {
    if (value >= goodThreshold) {
      status = '✅ Healthy';
      color = '#4caf50';
    } else if (value >= badThreshold) {
      status = '⚠️ Warning';
      color = '#ff9800';
    } else {
      status = '❌ Critical';
      color = '#f44336';
    }
  } else {
    if (value <= goodThreshold) {
      status = '✅ Healthy';
      color = '#4caf50';
    } else if (value <= badThreshold) {
      status = '⚠️ Warning';
      color = '#ff9800';
    } else {
      status = '❌ Critical';
      color = '#f44336';
    }
  }
  
  indicator.textContent = status;
  indicator.style.color = color;
}

// Auto-refresh every 30 seconds
setInterval(displayGlobalMetrics, 30000);
```

---

### 9. POST `/interview/v2/metrics/reset`

**Purpose:** Reset all performance metrics (Admin only)

**When to Use:**
- Testing environments
- After analyzing metrics
- Development/debugging
- Start fresh monitoring period

**Request:**
```javascript
async function resetMetrics() {
  const response = await fetch(`${API_BASE_URL}/metrics/reset`, {
    method: 'POST'
  });
  
  if (!response.ok) {
    throw new Error('Failed to reset metrics');
  }
  
  return await response.json();
}
```

**Response:**
```javascript
{
  status: "success",
  message: "Metrics reset successfully"
}
```

**Admin Implementation:**
```javascript
document.getElementById('reset-metrics-btn').addEventListener('click', async () => {
  const confirmed = confirm(
    'Are you sure you want to reset all performance metrics? This action cannot be undone.'
  );
  
  if (!confirmed) return;
  
  try {
    const result = await resetMetrics();
    alert(result.message);
    
    // Refresh metrics display
    await displayGlobalMetrics();
    
  } catch (error) {
    alert('Failed to reset metrics: ' + error.message);
  }
});
```

---

## Complete Code Examples

### Full Interview Application (Vanilla JavaScript)

```javascript
// config.js
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/interview/v2',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt'],
  ALLOWED_AUDIO_TYPES: ['audio/wav', 'audio/mp3', 'audio/webm']
};

// api.js - API Service
class InterviewAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async startWithFiles(userId, sessionId, role, company, cvFile, jdFile) {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('session_id', sessionId);
    formData.append('role', role);
    formData.append('company', company);
    formData.append('cv_file', cvFile);
    formData.append('jd_file', jdFile);

    return this._post('/start-with-ids', formData);
  }

  async submitAnswer(sessionId, audioBlob) {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('audio_file', audioBlob, 'answer.wav');

    return this._post('/answer', formData);
  }

  async getState(sessionId) {
    return this._get(`/state/${sessionId}`);
  }

  async getPerformance(sessionId) {
    return this._get(`/performance/${sessionId}`);
  }

  async completeInterview(sessionId) {
    return this._post(`/complete/${sessionId}`, {});
  }

  async getGlobalMetrics() {
    return this._get('/metrics/global');
  }

  streamQuestion(sessionId, onChunk, onComplete, onError) {
    const eventSource = new EventSource(`${this.baseURL}/stream/${sessionId}`);
    let fullQuestion = '';

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.chunk) {
          fullQuestion += data.chunk;
          onChunk(data.chunk, fullQuestion);
        }
        
        if (data.done) {
          eventSource.close();
          onComplete(fullQuestion);
        }
        
        if (data.error) {
          eventSource.close();
          onError(new Error(data.error));
        }
      } catch (error) {
        eventSource.close();
        onError(error);
      }
    };

    eventSource.onerror = (error) => {
      eventSource.close();
      onError(new Error('Connection failed'));
    };

    return () => eventSource.close();
  }

  async _get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    return this._handleResponse(response);
  }

  async _post(endpoint, body) {
    const options = { method: 'POST' };
    
    if (body instanceof FormData) {
      options.body = body;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, options);
    return this._handleResponse(response);
  }

  async _handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }
    return response.json();
  }
}

// recorder.js - Audio Recording Service
class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Recording failed:', error);
      throw error;
    }
  }

  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

// app.js - Main Application
class InterviewApp {
  constructor() {
    this.api = new InterviewAPI(CONFIG.API_BASE_URL);
    this.recorder = new AudioRecorder();
    this.currentSession = null;
    this.questionNumber = 0;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkExistingSession();
  }

  setupEventListeners() {
    document.getElementById('start-btn').addEventListener('click', () => this.startInterview());
    document.getElementById('record-btn').addEventListener('click', () => this.startRecording());
    document.getElementById('stop-btn').addEventListener('click', () => this.stopRecording());
  }

  async startInterview() {
    try {
      const resumeFile = document.getElementById('resume-file').files[0];
      const jdFile = document.getElementById('jd-file').files[0];
      const role = document.getElementById('role').value;
      const company = document.getElementById('company').value;

      if (!resumeFile || !jdFile || !role || !company) {
        throw new Error('All fields are required');
      }

      this.showLoading('Starting interview...');

      const sessionId = `sess_${Date.now()}`;
      const result = await this.api.startWithFiles(
        'user_123',
        sessionId,
        role,
        company,
        resumeFile,
        jdFile
      );

      this.currentSession = result.session_id;
      this.questionNumber = result.question_number;
      
      localStorage.setItem('current_session', this.currentSession);

      this.hideLoading();
      this.showQuestion(result.question, result.question_number);
      this.enableRecording();

    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
    }
  }

  async startRecording() {
    try {
      await this.recorder.start();
      this.updateRecordingUI(true);
    } catch (error) {
      this.showError('Failed to start recording: ' + error.message);
    }
  }

  async stopRecording() {
    try {
      this.showLoading('Processing your answer...');
      
      const audioBlob = await this.recorder.stop();
      const result = await this.api.submitAnswer(this.currentSession, audioBlob);

      this.hideLoading();

      if (result.status === 'completed') {
        this.showCompletionScreen(result.total_questions);
      } else {
        this.showEvaluation(result.evaluation);
        this.showQuestion(result.question, result.question_number);
        this.questionNumber = result.question_number;
      }

      this.updateRecordingUI(false);

    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
    }
  }

  showQuestion(question, number) {
    document.getElementById('question-text').textContent = question;
    document.getElementById('question-number').textContent = `Question ${number}`;
    document.getElementById('question-panel').classList.remove('hidden');
  }

  showEvaluation(evaluation) {
    document.getElementById('clarity-score').textContent = evaluation.clarity;
    document.getElementById('relevance-score').textContent = evaluation.relevance;
    document.getElementById('depth-score').textContent = evaluation.depth;
    document.getElementById('feedback-text').textContent = evaluation.feedback;
    document.getElementById('evaluation-panel').classList.remove('hidden');
  }

  updateRecordingUI(isRecording) {
    document.getElementById('record-btn').disabled = isRecording;
    document.getElementById('stop-btn').disabled = !isRecording;
    document.getElementById('recording-indicator').classList.toggle('active', isRecording);
  }

  showLoading(message) {
    document.getElementById('loading-message').textContent = message;
    document.getElementById('loading-overlay').classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
  }

  showError(message) {
    alert('Error: ' + message);
  }

  async checkExistingSession() {
    const sessionId = localStorage.getItem('current_session');
    if (sessionId) {
      const resume = confirm('You have an unfinished interview. Do you want to resume?');
      if (resume) {
        await this.resumeSession(sessionId);
      }
    }
  }

  async resumeSession(sessionId) {
    try {
      const state = await this.api.getState(sessionId);
      
      if (state.completed) {
        localStorage.removeItem('current_session');
        return;
      }

      this.currentSession = sessionId;
      this.questionNumber = state.question_count;

      // Get last question
      const lastQuestion = state.messages
        .reverse()
        .find(m => m.role === 'interviewer');

      if (lastQuestion) {
        this.showQuestion(lastQuestion.content, this.questionNumber);
        this.enableRecording();
      }

    } catch (error) {
      console.error('Failed to resume session:', error);
      localStorage.removeItem('current_session');
    }
  }

  enableRecording() {
    document.getElementById('record-btn').disabled = false;
    document.getElementById('recording-section').classList.remove('hidden');
  }

  async showCompletionScreen(totalQuestions) {
    try {
      this.showLoading('Generating evaluation...');
      
      const results = await this.api.completeInterview(this.currentSession);
      
      this.hideLoading();
      
      // Navigate to results page or display inline
      localStorage.setItem('interview_results', JSON.stringify(results));
      window.location.href = '/results.html';
      
    } catch (error) {
      this.hideLoading();
      this.showError('Failed to complete interview: ' + error.message);
    }
  }
}

// Initialize app
const app = new InterviewApp();
```

---

## Error Handling

### Common Errors and Solutions

```javascript
async function handleAPICall(apiFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    // Parse error
    let errorMessage = 'An error occurred';
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific errors
    if (errorMessage.includes('Session not found')) {
      // Session expired or invalid
      localStorage.removeItem('current_session');
      showError('Your session has expired. Please start a new interview.');
      redirectToHome();
      
    } else if (errorMessage.includes('not found')) {
      // Resource not found
      showError('Resource not found. Please try again.');
      
    } else if (errorMessage.includes('required')) {
      // Missing required field
      showError('Please fill in all required fields.');
      
    } else if (errorMessage.includes('file')) {
      // File upload error
      showError('File upload failed. Please check file format and size.');
      
    } else if (errorMessage.includes('timeout')) {
      // Timeout error
      showError('Request timed out. Please try again.');
      
    } else {
      // Generic error
      showError(errorMessage);
    }
    
    // Log for debugging
    console.error('API Error:', error);
    
    // Rethrow if needed
    throw error;
  }
}

// Usage
async function submitAnswer() {
  await handleAPICall(async () => {
    const audioBlob = await recorder.stop();
    return await api.submitAnswer(sessionId, audioBlob);
  });
}
```

---

## Best Practices

### 1. File Upload Validation

```javascript
function validateFiles(resumeFile, jdFile) {
  const errors = [];
  
  // Check if files exist
  if (!resumeFile) errors.push('Resume file is required');
  if (!jdFile) errors.push('Job description file is required');
  
  if (errors.length > 0) return { valid: false, errors };
  
  // Check file types
  const allowedExt = ['.pdf', '.docx', '.txt'];
  const resumeExt = resumeFile.name.substring(resumeFile.name.lastIndexOf('.')).toLowerCase();
  const jdExt = jdFile.name.substring(jdFile.name.lastIndexOf('.')).toLowerCase();
  
  if (!allowedExt.includes(resumeExt)) {
    errors.push('Resume must be PDF, DOCX, or TXT');
  }
  
  if (!allowedExt.includes(jdExt)) {
    errors.push('Job description must be PDF, DOCX, or TXT');
  }
  
  // Check file sizes (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (resumeFile.size > maxSize) {
    errors.push('Resume file must be less than 10MB');
  }
  
  if (jdFile.size > maxSize) {
    errors.push('Job description file must be less than 10MB');
  }
  
  // Check if files have content
  if (resumeFile.size === 0) {
    errors.push('Resume file is empty');
  }
  
  if (jdFile.size === 0) {
    errors.push('Job description file is empty');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Usage
const validation = validateFiles(resumeFile, jdFile);
if (!validation.valid) {
  showErrors(validation.errors);
  return;
}
```

### 2. Session Management

```javascript
class SessionManager {
  static save(sessionId, data) {
    localStorage.setItem('current_session', sessionId);
    localStorage.setItem('session_data', JSON.stringify(data));
    localStorage.setItem('session_timestamp', Date.now());
  }
  
  static get() {
    const sessionId = localStorage.getItem('current_session');
    const dataStr = localStorage.getItem('session_data');
    const timestamp = localStorage.getItem('session_timestamp');
    
    if (!sessionId) return null;
    
    // Check if session is expired (24 hours)
    const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      this.clear();
      return null;
    }
    
    return {
      sessionId,
      data: JSON.parse(dataStr),
      timestamp: parseInt(timestamp)
    };
  }
  
  static clear() {
    localStorage.removeItem('current_session');
    localStorage.removeItem('session_data');
    localStorage.removeItem('session_timestamp');
  }
}
```

### 3. Progressive Enhancement

```javascript
// Check browser support before starting
function checkBrowserSupport() {
  const errors = [];
  
  // Check getUserMedia support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errors.push('Your browser does not support audio recording');
  }
  
  // Check FormData support
  if (!window.FormData) {
    errors.push('Your browser does not support file uploads');
  }
  
  // Check EventSource support for streaming
  if (!window.EventSource) {
    console.warn('Streaming not supported, falling back to polling');
  }
  
  if (errors.length > 0) {
    showError('Browser compatibility issues:\n' + errors.join('\n'));
    return false;
  }
  
  return true;
}

// Initialize only if supported
if (checkBrowserSupport()) {
  const app = new InterviewApp();
}
```

---

## TypeScript Types

```typescript
// types.ts
export interface StartInterviewRequest {
  user_id: string;
  session_id: string;
  role: string;
  company: string;
  cv_text: string;
  jd_text: string;
}

export interface StartSessionResponse {
  session_id: string;
  status: 'active' | 'restored';
  question: string;
  question_number: number;
}

export interface Evaluation {
  clarity: number;
  relevance: number;
  depth: number;
  feedback: string;
}

export interface VoiceAnalysis {
  fluency_score: number;
  clarity_score: number;
  confidence_score: number;
  pace_score: number;
  rate_wpm: number;
  total_score: number;
}

export interface AnswerResponse {
  session_id: string;
  status: 'active' | 'completed';
  question?: string;
  question_number?: number;
  evaluation?: Evaluation;
  voice_analysis?: VoiceAnalysis;
  message?: string;
  total_questions?: number;
}

export interface SessionMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: number;
  metadata?: {
    stage?: string;
    evaluation?: Evaluation;
    voice_metrics?: VoiceAnalysis;
  };
}

export interface SessionState {
  session_id: string;
  user_id: string;
  role: string;
  company: string;
  question_count: number;
  stage: 'intro' | 'technical' | 'behavioral' | 'closing';
  completed: boolean;
  messages: SessionMessage[];
  avg_response_time: number;
}

export interface PerformanceMetrics {
  session_id: string;
  total_questions: number;
  response_times: {
    min: number;
    max: number;
    avg: number;
    all: number[];
  };
  cache_status: 'active' | 'not_cached';
}

export interface OverallEvaluation {
  overall_score: number;
  recommendation: 'hire' | 'maybe' | 'no_hire';
  clarity: number;
  relevance: number;
  depth: number;
}

export interface ConversationItem {
  question: string;
  answer: string;
  evaluation: Evaluation;
}

export interface CompleteInterviewResponse {
  session_id: string;
  status: 'completed';
  total_questions: number;
  evaluation: OverallEvaluation;
  conversation: ConversationItem[];
  performance_metrics: {
    avg_response_time: number;
    total_response_times: number[];
  };
}

export interface GlobalMetrics {
  status: 'success';
  metrics: {
    llm_calls: {
      total: number;
      avg_duration: number;
      min_duration: number;
      max_duration: number;
    };
    api_requests: {
      total: number;
      avg_duration: number;
      min_duration: number;
      max_duration: number;
    };
    cache: {
      hits: number;
      misses: number;
      hit_rate: number;
      hit_rate_percentage: string;
    };
  };
  timestamp: number;
}

export interface ErrorResponse {
  detail: string;
}
```

---

## React Integration Examples

### Complete React Interview Component

```typescript
// InterviewApp.tsx
import React, { useState, useEffect } from 'react';
import { InterviewAPI } from './api/InterviewAPI';
import FileUpload from './components/FileUpload';
import QuestionDisplay from './components/QuestionDisplay';
import AudioRecorder from './components/AudioRecorder';
import EvaluationPanel from './components/EvaluationPanel';
import ResultsScreen from './components/ResultsScreen';

const api = new InterviewAPI('http://localhost:3000/interview/v2');

function InterviewApp() {
  const [step, setStep] = useState<'upload' | 'interview' | 'results'>('upload');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartInterview = async (
    resumeFile: File,
    jdFile: File,
    role: string,
    company: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const sessionId = `sess_${Date.now()}`;
      const result = await api.startWithFiles(
        'user_123',
        sessionId,
        role,
        company,
        resumeFile,
        jdFile
      );

      setSessionId(result.session_id);
      setCurrentQuestion(result.question);
      setQuestionNumber(result.question_number);
      setStep('interview');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (audioBlob: Blob) => {
    try {
      setLoading(true);
      setError(null);

      const result = await api.submitAnswer(sessionId!, audioBlob);

      if (result.status === 'completed') {
        setStep('results');
      } else {
        setEvaluation(result.evaluation);
        setCurrentQuestion(result.question!);
        setQuestionNumber(result.question_number!);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interview-app">
      {loading && <LoadingOverlay />}
      
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {step === 'upload' && (
        <FileUpload onSubmit={handleStartInterview} />
      )}

      {step === 'interview' && (
        <>
          <QuestionDisplay 
            question={currentQuestion}
            questionNumber={questionNumber}
          />
          
          {evaluation && <EvaluationPanel evaluation={evaluation} />}
          
          <AudioRecorder onSubmit={handleSubmitAnswer} />
        </>
      )}

      {step === 'results' && (
        <ResultsScreen sessionId={sessionId!} />
      )}
    </div>
  );
}

export default InterviewApp;
```

---

**Last Updated:** February 1, 2026  
**Version:** 2.0.0  
**Status:** ✅ Production Ready  

**All Routes Documented** ✓  
**File Upload Support** ✓  
**Complete Code Examples** ✓  
**Error Handling** ✓  
**TypeScript Types** ✓  
**React Examples** ✓
