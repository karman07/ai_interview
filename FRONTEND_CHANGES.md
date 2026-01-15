# Frontend Changes Required for Video Interview Support

## Overview
The backend now supports both audio and video file uploads in the existing `/enhanced-interview/answer` endpoint. No new endpoint required.

## Updated API Endpoint
- **POST** `/enhanced-interview/answer`
- Field name changed from `audio_file` to `media_file`
- Accepts both audio and video files up to 100MB
- 5-minute timeout for video processing
- Returns comprehensive audio/video analysis

## Required Frontend Changes

### 1. Video Recording Component
```javascript
// Add video recording capability
const [isVideoRecording, setIsVideoRecording] = useState(false);
const [videoBlob, setVideoBlob] = useState(null);
const videoRef = useRef(null);
const mediaRecorderRef = useRef(null);

const startVideoRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: true, 
    audio: true 
  });
  videoRef.current.srcObject = stream;
  
  const mediaRecorder = new MediaRecorder(stream);
  mediaRecorderRef.current = mediaRecorder;
  
  const chunks = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/mp4' });
    setVideoBlob(blob);
  };
  
  mediaRecorder.start();
  setIsVideoRecording(true);
};

const stopVideoRecording = () => {
  mediaRecorderRef.current?.stop();
  videoRef.current.srcObject?.getTracks().forEach(track => track.stop());
  setIsVideoRecording(false);
};
```

### 2. Updated Upload Function (Single Endpoint)
```javascript
const submitAnswer = async (sessionId, mediaFile, textAnswer = '') => {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('media_file', mediaFile); // Changed from audio_file to media_file
  if (textAnswer) formData.append('text_answer', textAnswer);

  const response = await fetch('/api/enhanced-interview/answer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

### 3. UI Components to Add

#### Video Recording Interface
```jsx
<div className="video-recording-section">
  <video ref={videoRef} autoPlay muted className="video-preview" />
  
  <div className="recording-controls">
    {!isVideoRecording ? (
      <button onClick={startVideoRecording} className="start-video-btn">
        📹 Start Video Recording
      </button>
    ) : (
      <button onClick={stopVideoRecording} className="stop-video-btn">
        ⏹️ Stop Recording
      </button>
    )}
  </div>
  
  {videoBlob && (
    <button onClick={() => submitAnswer(sessionId, videoBlob)}>
      Submit Video Answer
    </button>
  )}
</div>
```

#### Answer Mode Toggle
```jsx
<div className="answer-mode-selector">
  <button 
    className={answerMode === 'audio' ? 'active' : ''}
    onClick={() => setAnswerMode('audio')}
  >
    🎤 Audio Only
  </button>
  <button 
    className={answerMode === 'video' ? 'active' : ''}
    onClick={() => setAnswerMode('video')}
  >
    📹 Video Answer
  </button>
  <button 
    className={answerMode === 'text' ? 'active' : ''}
    onClick={() => setAnswerMode('text')}
  >
    ✏️ Text Only
  </button>
</div>
```

### 4. Enhanced Analytics Display

#### Video Analysis Results
```jsx
const VideoAnalysisDisplay = ({ videoAnalysis }) => (
  <div className="video-analysis">
    <h3>Video Analysis</h3>
    <div className="metrics">
      <div className="metric">
        <span>Face Presence:</span>
        <span>{videoAnalysis.facePresence}%</span>
      </div>
      <div className="metric">
        <span>Eye Contact:</span>
        <span>{videoAnalysis.eyeContact}/10</span>
      </div>
      <div className="metric">
        <span>Head Stability:</span>
        <span>{videoAnalysis.headStability}/10</span>
      </div>
      <div className="metric">
        <span>Behavior Score:</span>
        <span>{videoAnalysis.behaviorScore}/10</span>
      </div>
      {videoAnalysis.cheatingRisk !== 'NONE' && (
        <div className="warning">
          <span>⚠️ Attention Required: {videoAnalysis.cheatingRisk}</span>
        </div>
      )}
    </div>
  </div>
);
```

### 5. File Size and Format Validation
```javascript
const validateVideoFile = (file) => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/webm', 'video/mkv'];
  
  if (file.size > maxSize) {
    throw new Error('Video file must be less than 100MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only MP4, AVI, MOV, WebM, and MKV files are allowed');
  }
  
  return true;
};
```

### 6. Progress Indicator for Media Upload
```jsx
const [uploadProgress, setUploadProgress] = useState(0);

const submitAnswerWithProgress = async (sessionId, mediaFile) => {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('media_file', mediaFile);

  const xhr = new XMLHttpRequest();
  
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      setUploadProgress((e.loaded / e.total) * 100);
    }
  };

  return new Promise((resolve, reject) => {
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = reject;
    xhr.open('POST', '/api/enhanced-interview/answer');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};
```

### 7. Complete Interview Flow Integration
```jsx
const InterviewSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answerMode, setAnswerMode] = useState('audio'); // 'audio', 'video', 'text'
  const [isRecording, setIsRecording] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');

  // Start interview
  const startInterview = async (interviewData) => {
    const response = await fetch('/api/enhanced-interview/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(interviewData)
    });
    const data = await response.json();
    setSessionId(data.session.sessionId);
    setCurrentQuestion(data.first_question);
  };

  // Submit answer
  const submitAnswer = async () => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    
    if (answerMode === 'text') {
      formData.append('text_answer', textAnswer);
    } else if (mediaBlob) {
      formData.append('media_file', mediaBlob);
    }

    const response = await fetch('/api/enhanced-interview/answer', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const data = await response.json();
    
    // Handle response
    if (data.next_question) {
      setCurrentQuestion(data.next_question);
      setMediaBlob(null);
      setTextAnswer('');
    } else {
      // Interview complete
      showInterviewReport(sessionId);
    }
  };

  return (
    <div className="interview-session">
      <div className="question-section">
        <h3>Question:</h3>
        <p>{currentQuestion}</p>
      </div>
      
      <div className="answer-section">
        <AnswerModeSelector 
          mode={answerMode} 
          onModeChange={setAnswerMode} 
        />
        
        {answerMode === 'video' && (
          <VideoRecorder 
            onRecordingComplete={setMediaBlob}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        )}
        
        {answerMode === 'audio' && (
          <AudioRecorder 
            onRecordingComplete={setMediaBlob}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        )}
        
        {answerMode === 'text' && (
          <textarea 
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
        )}
        
        <button 
          onClick={submitAnswer}
          disabled={!mediaBlob && !textAnswer}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};
```
```jsx
const [uploadProgress, setUploadProgress] = useState(0);

const submitAnswerWithProgress = async (sessionId, mediaFile) => {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('media_file', mediaFile);

  const xhr = new XMLHttpRequest();
  
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      setUploadProgress((e.loaded / e.total) * 100);
    }
  };

  return new Promise((resolve, reject) => {
    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = reject;
    xhr.open('POST', '/api/enhanced-interview/answer');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};
```

## Updated Response Structure

The unified endpoint returns both audio and video analysis:
```javascript
{
  // Standard response fields
  next_question: "...",
  feedback: "...",
  
  // Enhanced analytics with audio/video data
  analytics: {
    scores: { /* same as before */ },
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
    feedback: "...",
    strengths: [...],
    improvements: [...]
  }
}
```

## Implementation Priority

1. **High Priority**: Video recording and upload functionality
2. **Medium Priority**: Video analysis display components
3. **Low Priority**: Advanced video controls and settings

## Browser Compatibility

Ensure support for:
- `navigator.mediaDevices.getUserMedia()`
- `MediaRecorder` API
- `FormData` for file uploads
- Modern video codecs (H.264, VP8/VP9)