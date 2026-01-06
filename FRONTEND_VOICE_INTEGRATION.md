# Frontend Changes for Voice Analysis Integration

## Overview
This document outlines the required frontend changes to support the voice analysis integration with the AI Interview Coach API. The frontend needs to be updated to handle CV/JD IDs, audio recording, and enhanced evaluation responses.

---

## 🔄 Required Frontend Changes

### 1. Interview Start Component Updates

#### **BEFORE** - Text-based Interview Start
```typescript
// Interview start payload
const startInterviewPayload = {
  user_id: userId,
  session_id: sessionId,
  role_title: jobTitle,
  company_name: companyName,
  industry: industry,
  jd: jobDescriptionText,        // Required JD text
  cv: resumeText,                // Required CV text
  round_type: roundType
};

// API call
const response = await fetch('/api/ai-interview/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(startInterviewPayload)
});
```

#### **AFTER** - Enhanced Interview Start with CV/JD IDs
```typescript
// Enhanced interview start payload
const startInterviewPayload = {
  user_id: userId,
  session_id: sessionId,
  role_title: jobTitle,
  company_name: companyName,
  industry: industry,
  cv_id: selectedResumeId,       // ✅ NEW: MongoDB ObjectId for resume
  jd_id: selectedJobId,          // ✅ NEW: MongoDB ObjectId for job description
  jd: jobDescriptionText,        // Optional fallback JD text
  cv: resumeText,                // Optional fallback CV text
  round_type: roundType
};

// API call (same as before)
const response = await fetch('/api/ai-interview/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(startInterviewPayload)
});
```

**Required UI Changes:**
- ✅ **Resume Selector**: Dropdown to select from user's uploaded resumes
- ✅ **Job Selector**: Dropdown to select from available job descriptions
- ✅ **Fallback Fields**: Optional text areas for manual JD/CV input
- ✅ **Validation**: Ensure either IDs or text content is provided

---

### 2. Answer Submission Component Updates

#### **BEFORE** - Text-only Answer Submission
```typescript
// Text answer submission
const submitAnswer = async (answerText: string) => {
  const payload = {
    user_id: userId,
    session_id: sessionId,
    answer: answerText             // Required text answer
  };

  const response = await fetch('/api/ai-interview/answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
};
```

#### **AFTER** - Audio-based Answer Submission
```typescript
// Audio answer submission with FormData
const submitVoiceAnswer = async (audioBlob: Blob, fallbackText?: string) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('session_id', sessionId);
  formData.append('audio_file', audioBlob, 'answer.wav');
  
  // Optional fallback text
  if (fallbackText) {
    formData.append('answer', fallbackText);
  }

  const response = await fetch('/api/ai-interview/answer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Note: Don't set Content-Type, let browser set it for FormData
    },
    body: formData
  });
};
```

**Required UI Changes:**
- ✅ **Audio Recording**: Record button with start/stop functionality
- ✅ **Audio Playback**: Play recorded audio before submission
- ✅ **Recording Timer**: Show recording duration
- ✅ **Audio Visualization**: Optional waveform or level indicator
- ✅ **Fallback Text**: Optional text input for backup

---

### 3. Audio Recording Implementation

#### **Audio Recording Hook**
```typescript
// useAudioRecorder.ts
import { useState, useRef, useCallback } from 'react';

interface AudioRecorderHook {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playRecording: () => void;
  clearRecording: () => void;
}

export const useAudioRecorder = (): AudioRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start duration timer
      let seconds = 0;
      intervalRef.current = setInterval(() => {
        seconds++;
        setDuration(seconds);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied. Please enable microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop duration timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  }, [audioBlob]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
  }, []);

  return {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording
  };
};
```

#### **Audio Recording Component**
```tsx
// AudioRecorder.tsx
import React from 'react';
import { useAudioRecorder } from './useAudioRecorder';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
  disabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onAudioReady, 
  disabled = false 
}) => {
  const {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    playRecording,
    clearRecording
  } = useAudioRecorder();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (audioBlob) {
      onAudioReady(audioBlob);
    }
  };

  return (
    <div className="audio-recorder">
      <div className="recording-controls">
        {!isRecording && !audioBlob && (
          <button 
            onClick={startRecording}
            disabled={disabled}
            className="record-btn start"
          >
            🎤 Start Recording
          </button>
        )}
        
        {isRecording && (
          <div className="recording-active">
            <button 
              onClick={stopRecording}
              className="record-btn stop"
            >
              ⏹️ Stop Recording
            </button>
            <div className="duration">
              Recording: {formatDuration(duration)}
            </div>
            <div className="recording-indicator">🔴 REC</div>
          </div>
        )}
        
        {audioBlob && !isRecording && (
          <div className="recording-complete">
            <div className="duration">
              Duration: {formatDuration(duration)}
            </div>
            <div className="playback-controls">
              <button onClick={playRecording} className="play-btn">
                ▶️ Play
              </button>
              <button onClick={clearRecording} className="clear-btn">
                🗑️ Clear
              </button>
              <button onClick={handleSubmit} className="submit-btn">
                📤 Submit Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

### 4. Enhanced Evaluation Display

#### **BEFORE** - Basic Evaluation Display
```tsx
// Basic evaluation display
interface BasicEvaluation {
  score: number;
  feedback: string;
  suggestions: string[];
  breakdown: {
    relevance: number;
    depth: number;
    structure: number;
    examples: number;
    technical: number;
    alignment: number;
  };
  total_possible: number;
}

const EvaluationDisplay = ({ evaluation }: { evaluation: BasicEvaluation }) => (
  <div className="evaluation">
    <h3>Score: {evaluation.score}/{evaluation.total_possible}</h3>
    <p>{evaluation.feedback}</p>
    <div className="breakdown">
      {Object.entries(evaluation.breakdown).map(([key, value]) => (
        <div key={key}>
          {key}: {value}
        </div>
      ))}
    </div>
  </div>
);
```

#### **AFTER** - Enhanced Evaluation with Voice Metrics
```tsx
// Enhanced evaluation with voice analysis
interface EnhancedEvaluation {
  score: number;
  feedback: string;
  suggestions: string[];
  breakdown: {
    // Text evaluation (5 points)
    relevance: number;
    depth: number;
    structure: number;
    examples: number;
    technical: number;
    alignment: number;
    
    // Voice evaluation (6 points) ✅ NEW
    fluency: number;
    clarity: number;
    confidence: number;
    pace: number;
  };
  voice_metrics?: {                    // ✅ NEW: Voice analysis data
    duration: number;
    speech_rate: number;
    avg_pitch: number;
    pitch_variation: number;
    avg_energy: number;
    pause_ratio: number;
    speech_segments: number;
  };
  total_possible: number;              // Now 11.0 (5 text + 6 voice)
}

const EnhancedEvaluationDisplay = ({ evaluation }: { evaluation: EnhancedEvaluation }) => (
  <div className="enhanced-evaluation">
    <div className="overall-score">
      <h3>Overall Score: {evaluation.score.toFixed(1)}/{evaluation.total_possible}</h3>
      <div className="score-bar">
        <div 
          className="score-fill" 
          style={{ width: `${(evaluation.score / evaluation.total_possible) * 100}%` }}
        />
      </div>
    </div>

    <div className="feedback-section">
      <h4>Feedback</h4>
      <p>{evaluation.feedback}</p>
    </div>

    <div className="suggestions-section">
      <h4>Suggestions for Improvement</h4>
      <ul>
        {evaluation.suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </div>

    <div className="breakdown-section">
      <h4>Detailed Breakdown</h4>
      
      {/* Text Evaluation */}
      <div className="text-evaluation">
        <h5>Content Analysis (5.0 points)</h5>
        <div className="metrics-grid">
          <div className="metric">
            <span>Relevance:</span>
            <span>{evaluation.breakdown.relevance.toFixed(1)}</span>
          </div>
          <div className="metric">
            <span>Depth:</span>
            <span>{evaluation.breakdown.depth.toFixed(1)}</span>
          </div>
          <div className="metric">
            <span>Structure:</span>
            <span>{evaluation.breakdown.structure.toFixed(1)}</span>
          </div>
          <div className="metric">
            <span>Examples:</span>
            <span>{evaluation.breakdown.examples.toFixed(1)}</span>
          </div>
          <div className="metric">
            <span>Technical:</span>
            <span>{evaluation.breakdown.technical.toFixed(1)}</span>
          </div>
          <div className="metric">
            <span>Alignment:</span>
            <span>{evaluation.breakdown.alignment.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Voice Evaluation */}
      <div className="voice-evaluation">
        <h5>Voice Analysis (6.0 points)</h5>
        <div className="metrics-grid">
          <div className="metric">
            <span>Fluency:</span>
            <span>{evaluation.breakdown.fluency.toFixed(1)}</span>
          </div>
          <div className="metric">
            <span>Clarity:</span>
            <span>{evaluation.breakdown.clarity.toFixed(1)}</span>
          </div>
          <div className="metric">
            <span>Confidence:</span>
            <span>{evaluation.breakdown.confidence.toFixed(1)}</span>
          </div>
          <div className="metric">
            <span>Pace:</span>
            <span>{evaluation.breakdown.pace.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Voice Metrics */}
      {evaluation.voice_metrics && (
        <div className="voice-metrics">
          <h5>Voice Metrics</h5>
          <div className="metrics-grid">
            <div className="metric">
              <span>Duration:</span>
              <span>{evaluation.voice_metrics.duration.toFixed(1)}s</span>
            </div>
            <div className="metric">
              <span>Speech Rate:</span>
              <span>{evaluation.voice_metrics.speech_rate} WPM</span>
            </div>
            <div className="metric">
              <span>Average Pitch:</span>
              <span>{evaluation.voice_metrics.avg_pitch.toFixed(1)} Hz</span>
            </div>
            <div className="metric">
              <span>Pitch Variation:</span>
              <span>{evaluation.voice_metrics.pitch_variation.toFixed(1)}</span>
            </div>
            <div className="metric">
              <span>Energy Level:</span>
              <span>{evaluation.voice_metrics.avg_energy.toFixed(3)}</span>
            </div>
            <div className="metric">
              <span>Pause Ratio:</span>
              <span>{(evaluation.voice_metrics.pause_ratio * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
```

---

### 5. Resume/Job Selection Components

#### **Resume Selector Component**
```tsx
// ResumeSelector.tsx
import React, { useState, useEffect } from 'react';

interface Resume {
  _id: string;
  filename: string;
  stats?: {
    overall_score?: number;
    score?: number;
  };
  createdAt: string;
}

interface ResumeSelectorProps {
  selectedResumeId: string | null;
  onResumeSelect: (resumeId: string | null) => void;
}

export const ResumeSelector: React.FC<ResumeSelectorProps> = ({
  selectedResumeId,
  onResumeSelect
}) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserResumes();
  }, []);

  const fetchUserResumes = async () => {
    try {
      const response = await fetch('/api/resume/my-resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setResumes(data);
      
      // Auto-select best resume
      if (data.length > 0 && !selectedResumeId) {
        const bestResume = data.reduce((best: Resume, current: Resume) => {
          const bestScore = best.stats?.overall_score || best.stats?.score || 0;
          const currentScore = current.stats?.overall_score || current.stats?.score || 0;
          return currentScore > bestScore ? current : best;
        });
        onResumeSelect(bestResume._id);
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading resumes...</div>;

  return (
    <div className="resume-selector">
      <label htmlFor="resume-select">Select Resume:</label>
      <select
        id="resume-select"
        value={selectedResumeId || ''}
        onChange={(e) => onResumeSelect(e.target.value || null)}
      >
        <option value="">-- Select Resume --</option>
        {resumes.map((resume) => (
          <option key={resume._id} value={resume._id}>
            {resume.filename} 
            {resume.stats && (
              <span> (Score: {(resume.stats.overall_score || resume.stats.score || 0).toFixed(1)})</span>
            )}
          </option>
        ))}
      </select>
    </div>
  );
};
```

#### **Job Description Selector Component**
```tsx
// JobSelector.tsx
import React, { useState, useEffect } from 'react';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  createdAt: string;
}

interface JobSelectorProps {
  selectedJobId: string | null;
  onJobSelect: (jobId: string | null) => void;
}

export const JobSelector: React.FC<JobSelectorProps> = ({
  selectedJobId,
  onJobSelect
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  const fetchAvailableJobs = async () => {
    try {
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading jobs...</div>;

  return (
    <div className="job-selector">
      <label htmlFor="job-select">Select Job Description:</label>
      <select
        id="job-select"
        value={selectedJobId || ''}
        onChange={(e) => onJobSelect(e.target.value || null)}
      >
        <option value="">-- Select Job --</option>
        {jobs.map((job) => (
          <option key={job._id} value={job._id}>
            {job.title} at {job.company} ({job.location})
          </option>
        ))}
      </select>
    </div>
  );
};
```

---

### 6. Updated Interview Flow Component

```tsx
// InterviewFlow.tsx
import React, { useState } from 'react';
import { ResumeSelector } from './ResumeSelector';
import { JobSelector } from './JobSelector';
import { AudioRecorder } from './AudioRecorder';
import { EnhancedEvaluationDisplay } from './EnhancedEvaluationDisplay';

export const InterviewFlow: React.FC = () => {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const payload = {
        user_id: 'current-user-id', // Get from auth context
        session_id: `session-${Date.now()}`,
        role_title: 'Software Engineer',
        company_name: 'Tech Corp',
        industry: 'Technology',
        cv_id: selectedResumeId,
        jd_id: selectedJobId,
        round_type: 'full'
      };

      const response = await fetch('/api/ai-interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setSessionId(payload.session_id);
      setCurrentQuestion(data.question);
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitVoiceAnswer = async (audioBlob: Blob) => {
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', 'current-user-id');
      formData.append('session_id', sessionId);
      formData.append('audio_file', audioBlob, 'answer.wav');

      const response = await fetch('/api/ai-interview/answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      setEvaluation(data.evaluation);
      setCurrentQuestion(data.next_question || '');
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="interview-flow">
      {!sessionId ? (
        <div className="interview-setup">
          <h2>Setup Interview</h2>
          <ResumeSelector 
            selectedResumeId={selectedResumeId}
            onResumeSelect={setSelectedResumeId}
          />
          <JobSelector 
            selectedJobId={selectedJobId}
            onJobSelect={setSelectedJobId}
          />
          <button 
            onClick={startInterview}
            disabled={!selectedResumeId || !selectedJobId || isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Interview'}
          </button>
        </div>
      ) : (
        <div className="interview-session">
          <div className="question-section">
            <h3>Question:</h3>
            <p>{currentQuestion}</p>
          </div>

          <AudioRecorder 
            onAudioReady={submitVoiceAnswer}
            disabled={isLoading}
          />

          {evaluation && (
            <EnhancedEvaluationDisplay evaluation={evaluation} />
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 📱 Required Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "@types/dom-mediacapture-record": "^1.0.11"
  }
}
```

### Browser Permissions
```typescript
// Request microphone permissions
const requestMicrophonePermission = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};
```

---

## 🎨 CSS Styles

```css
/* Audio Recorder Styles */
.audio-recorder {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin: 20px 0;
}

.recording-controls {
  text-align: center;
}

.record-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin: 5px;
}

.record-btn.start {
  background-color: #4CAF50;
  color: white;
}

.record-btn.stop {
  background-color: #f44336;
  color: white;
}

.recording-active {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.recording-indicator {
  color: #f44336;
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.duration {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
}

.playback-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

/* Enhanced Evaluation Styles */
.enhanced-evaluation {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.overall-score {
  text-align: center;
  margin-bottom: 20px;
}

.score-bar {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #feca57, #48dbfb, #0abde3);
  transition: width 0.3s ease;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin: 10px 0;
}

.metric {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.voice-evaluation {
  border-left: 4px solid #28a745;
}

.voice-metrics {
  border-left: 4px solid #ffc107;
}
```

---

## 🧪 Testing Checklist

### Audio Recording Tests
- ✅ **Microphone Permission**: Test permission request flow
- ✅ **Recording Quality**: Test different audio formats and quality
- ✅ **File Size**: Ensure reasonable file sizes for upload
- ✅ **Browser Compatibility**: Test across Chrome, Firefox, Safari
- ✅ **Mobile Support**: Test on mobile devices

### API Integration Tests
- ✅ **Resume Selection**: Test CV ID selection and fallback
- ✅ **Job Selection**: Test JD ID selection and fallback
- ✅ **Audio Upload**: Test FormData submission
- ✅ **Error Handling**: Test network failures and invalid responses
- ✅ **Loading States**: Test UI during API calls

### Voice Analysis Tests
- ✅ **Evaluation Display**: Test enhanced evaluation rendering
- ✅ **Voice Metrics**: Test voice metrics visualization
- ✅ **Score Breakdown**: Test text vs voice score display
- ✅ **Responsive Design**: Test on different screen sizes

---

