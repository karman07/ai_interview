# Interview Audio & Video Recording - UI Implementation Guide

## Overview
This guide provides instructions for implementing audio and video recording functionality for interview questions in the frontend application.

## API Endpoints

### 1. Upload Audio/Video Response
```
POST /ai-interview/session/{sessionId}/upload-response
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data
```

**Form Data:**
- `files`: Audio file (audio/webm, audio/mp3, audio/wav)
- `files`: Video file (video/webm, video/mp4)
- `question_id`: String (required)
- `text`: String (optional - transcribed text)
- `response_duration`: Number (optional - duration in seconds)

### 2. Submit Text + Media URLs
```
POST /ai-interview/session/{sessionId}/answer
```

**Body:**
```json
{
  "question_id": "string",
  "text": "string",
  "audio_url": "string (optional)",
  "video_url": "string (optional)",
  "response_duration": "number (optional)"
}
```

## Frontend Implementation

### 1. Recording Component Structure

```jsx
// InterviewRecorder.jsx
import React, { useState, useRef, useEffect } from 'react';

const InterviewRecorder = ({ questionId, onSubmit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingType, setRecordingType] = useState('audio'); // 'audio' | 'video'
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Implementation details below...
};
```

### 2. Media Recording Setup

```javascript
// Start recording function
const startRecording = async () => {
  try {
    const constraints = recordingType === 'video' 
      ? { video: true, audio: true }
      : { audio: true };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { 
        type: recordingType === 'video' ? 'video/webm' : 'audio/webm' 
      });
      setRecordedBlob(blob);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    
  } catch (error) {
    console.error('Error starting recording:', error);
    alert('Could not access camera/microphone');
  }
};

// Stop recording function
const stopRecording = () => {
  if (mediaRecorderRef.current && isRecording) {
    mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    clearInterval(timerRef.current);
  }
};
```

### 3. File Upload Implementation

```javascript
// Upload recorded media
const uploadResponse = async (textAnswer = '') => {
  if (!recordedBlob) return;
  
  const formData = new FormData();
  
  // Add the recorded file
  const fileName = `${questionId}_${Date.now()}.webm`;
  formData.append('files', recordedBlob, fileName);
  
  // Add metadata
  formData.append('question_id', questionId);
  formData.append('text', textAnswer);
  formData.append('response_duration', duration.toString());
  
  try {
    const response = await fetch(`/api/ai-interview/session/${sessionId}/upload-response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      onSubmit(result);
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload response');
  }
};
```

### 4. UI Components

```jsx
// Recording controls UI
const RecordingControls = () => (
  <div className="recording-controls">
    {/* Recording type selector */}
    <div className="recording-type">
      <label>
        <input 
          type="radio" 
          value="audio" 
          checked={recordingType === 'audio'}
          onChange={(e) => setRecordingType(e.target.value)}
          disabled={isRecording}
        />
        Audio Only
      </label>
      <label>
        <input 
          type="radio" 
          value="video" 
          checked={recordingType === 'video'}
          onChange={(e) => setRecordingType(e.target.value)}
          disabled={isRecording}
        />
        Video + Audio
      </label>
    </div>
    
    {/* Recording button */}
    <button 
      onClick={isRecording ? stopRecording : startRecording}
      className={`record-btn ${isRecording ? 'recording' : ''}`}
    >
      {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
    </button>
    
    {/* Timer */}
    {isRecording && (
      <div className="timer">
        Recording: {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
      </div>
    )}
    
    {/* Preview */}
    {recordedBlob && (
      <div className="preview">
        {recordingType === 'video' ? (
          <video 
            src={URL.createObjectURL(recordedBlob)} 
            controls 
            width="300"
          />
        ) : (
          <audio 
            src={URL.createObjectURL(recordedBlob)} 
            controls 
          />
        )}
      </div>
    )}
  </div>
);
```

### 5. Complete Interview Question Component

```jsx
const InterviewQuestion = ({ question, questionId, sessionId, onNext }) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (mediaResult) => {
    setIsSubmitting(true);
    
    try {
      // If we have media, it's already uploaded
      if (mediaResult) {
        onNext();
        return;
      }
      
      // Submit text-only answer
      const response = await fetch(`/api/ai-interview/session/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_id: questionId,
          text: textAnswer
        })
      });
      
      if (response.ok) {
        onNext();
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="interview-question">
      <h3>{question}</h3>
      
      {/* Text answer */}
      <textarea
        value={textAnswer}
        onChange={(e) => setTextAnswer(e.target.value)}
        placeholder="Type your answer here..."
        rows={4}
      />
      
      {/* Recording component */}
      <InterviewRecorder 
        questionId={questionId}
        sessionId={sessionId}
        onSubmit={handleSubmit}
      />
      
      {/* Submit text-only button */}
      <button 
        onClick={() => handleSubmit()}
        disabled={!textAnswer.trim() || isSubmitting}
      >
        Submit Text Answer
      </button>
    </div>
  );
};
```

## CSS Styles

```css
.recording-controls {
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  margin: 20px 0;
}

.recording-type {
  margin-bottom: 15px;
}

.recording-type label {
  margin-right: 20px;
  cursor: pointer;
}

.record-btn {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #007bff;
  color: white;
}

.record-btn.recording {
  background: #dc3545;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.timer {
  margin: 10px 0;
  font-weight: bold;
  color: #dc3545;
}

.preview {
  margin-top: 15px;
}

.interview-question {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.interview-question textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}
```

## Browser Compatibility Notes

- **MediaRecorder API**: Supported in Chrome 47+, Firefox 25+, Safari 14.1+
- **getUserMedia**: Requires HTTPS in production
- **File formats**: WebM is widely supported, fallback to MP4 for video

## Error Handling

```javascript
// Permission handling
const checkPermissions = async () => {
  try {
    const permissions = await navigator.permissions.query({ name: 'microphone' });
    if (permissions.state === 'denied') {
      alert('Microphone permission is required for audio recording');
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Permission check not supported');
    return true;
  }
};

// Feature detection
const isRecordingSupported = () => {
  return !!(navigator.mediaDevices && 
           navigator.mediaDevices.getUserMedia && 
           window.MediaRecorder);
};
```

## CURL Examples

### Upload Audio/Video Response
```bash
curl -X POST "http://localhost:3000/ai-interview/session/SESSION_ID/upload-response" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "files=@audio_response.webm" \
  -F "files=@video_response.webm" \
  -F "question_id=q1" \
  -F "text=This is my spoken answer" \
  -F "response_duration=45"
```

### Submit Text + Media URLs
```bash
curl -X POST "http://localhost:3000/ai-interview/session/SESSION_ID/answer" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": "q1",
    "text": "My answer text",
    "audio_url": "/uploads/audio/1234567890-audio.webm",
    "video_url": "/uploads/video/1234567890-video.webm",
    "response_duration": 45
  }'
```