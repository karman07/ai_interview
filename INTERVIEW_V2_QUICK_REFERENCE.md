# Interview V2 API - Quick Reference Guide

## 🚀 Quick Start

```typescript
import {
  startInterviewWithIDs,
  submitAnswerV2,
  completeInterviewV2,
  streamQuestion,
  getSessionState,
  generateSessionId,
  validateFiles,
  createAudioFile,
  SessionManager
} from '@/api/interviewV2';
```

---

## 📋 All 9 Routes at a Glance

| # | Route | Method | Function | Purpose |
|---|-------|--------|----------|---------|
| 1 | `/interview/v2/start` | POST | `startInterviewV2()` | Start with text |
| 2 | `/interview/v2/start-with-ids` ⭐ | POST | `startInterviewWithIDs()` | Start with files/IDs |
| 3 | `/interview/v2/answer` | POST | `submitAnswerV2()` | Submit answer |
| 4 | `/interview/v2/stream/:session_id` | GET | `streamQuestion()` | Stream question |
| 5 | `/interview/v2/state/:session_id` | GET | `getSessionState()` | Get state |
| 6 | `/interview/v2/performance/:session_id` | GET | `getPerformanceMetrics()` | Get metrics |
| 7 | `/interview/v2/complete/:session_id` | POST | `completeInterviewV2()` | Complete |
| 8 | `/interview/v2/metrics/global` | GET | `getGlobalMetrics()` | Global metrics |
| 9 | `/interview/v2/metrics/reset` | POST | `resetMetrics()` | Reset metrics |

---

## 💡 Common Use Cases

### 1. Start Interview with Files (Most Common)

```typescript
// Validate files first
const validation = validateFiles(resumeFile, jdFile);
if (!validation.valid) {
  alert(validation.errors.join('\n'));
  return;
}

// Start interview
const sessionId = generateSessionId(userId);
const result = await startInterviewWithIDs({
  user_id: userId,
  session_id: sessionId,
  role: 'Software Engineer',
  company: 'TechCorp',
  cv_file: resumeFile,
  jd_file: jdFile
});

// Save session
SessionManager.save(sessionId, result);

// Display first question
console.log(result.question);
```

### 2. Submit Answer with Evaluation

```typescript
// Create audio file
const audioFile = createAudioFile(audioBlob, sessionId);

// Submit
const response = await submitAnswerV2(sessionId, {
  session_id: sessionId,
  answer_audio: audioFile
});

// Show evaluation
if (response.evaluation) {
  console.log('Clarity:', response.evaluation.clarity, '/10');
  console.log('Relevance:', response.evaluation.relevance, '/10');
  console.log('Depth:', response.evaluation.depth, '/10');
  console.log('Feedback:', response.evaluation.feedback);
}

// Check if complete
if (response.status === 'completed') {
  await completeInterview();
} else {
  // Show next question
  console.log('Next:', response.question);
}
```

### 3. Stream Question for Better UX

```typescript
const cancel = streamQuestion(
  sessionId,
  (chunk, fullText) => setQuestion(fullText),
  (final) => {
    setIsStreaming(false);
    speakQuestion(final);
  },
  (error) => showError(error.message)
);

// Cancel on unmount
useEffect(() => () => cancel(), []);
```

### 4. Resume Interrupted Interview

```typescript
const state = await getSessionState(sessionId);

if (state.completed) {
  navigate('/results');
  return;
}

// Get last question
const lastQuestion = state.messages
  .reverse()
  .find(m => m.role === 'interviewer');

if (lastQuestion) {
  displayQuestion(lastQuestion.content, state.question_count);
}
```

### 5. Complete Interview with Report

```typescript
// Get performance metrics first
const metrics = await getPerformanceMetrics(sessionId);
console.log('Avg response time:', metrics.response_times.avg);

// Complete interview
const report = await completeInterviewV2(sessionId);

// Display results
console.log('Score:', report.evaluation.overall_score);
console.log('Recommendation:', report.evaluation.recommendation);
console.log('Duration:', report.interview_duration_minutes, 'min');

// Save for results page
localStorage.setItem('interview_report', JSON.stringify(report));
navigate('/results');
```

---

## 🛠️ Helper Functions

### File Validation

```typescript
// Single file
const validation = validateFile(file, 'Resume');
if (!validation.valid) {
  alert(validation.error);
}

// Multiple files
const validation = validateFiles(resumeFile, jdFile);
if (!validation.valid) {
  validation.errors.forEach(err => console.error(err));
}

// Audio file
const validation = validateAudioFile(audioBlob);
```

### Session Management

```typescript
// Save
SessionManager.save(sessionId, data);

// Get
const session = SessionManager.get();

// Update question number
SessionManager.updateQuestionNumber(3);

// Clear
SessionManager.clear();
```

### Error Handling

```typescript
try {
  await submitAnswerV2(sessionId, data);
} catch (error) {
  const message = handleAPIError(error);
  showError(message);
}
```

---

## 📊 Response Structures

### Start Response
```typescript
{
  session_id: string;
  status: 'active';
  question: string;
  question_number: number;
}
```

### Answer Response
```typescript
{
  session_id: string;
  status: 'active' | 'completed';
  question?: string;
  question_number?: number;
  evaluation?: {
    clarity: number;      // 0-10
    relevance: number;    // 0-10
    depth: number;        // 0-10
    feedback: string;
  };
  voice_analysis?: {
    fluency_score: number;
    clarity_score: number;
    confidence_score: number;
    pace_score: number;
    rate_wpm: number;
    total_score: number;
  };
}
```

### Complete Response
```typescript
{
  session_id: string;
  status: 'completed';
  total_questions: number;
  interview_duration_minutes: number;
  evaluation: {
    overall_score: number;
    recommendation: 'hire' | 'maybe' | 'reject';
    clarity: number;
    relevance: number;
    depth: number;
    // ... more fields
  };
  conversation: Array<{
    question: string;
    answer: string;
    evaluation: {...};
  }>;
}
```

---

## ⚡ Performance Tips

1. **Use Streaming** - Stream questions for 60% faster perceived performance
2. **Validate Early** - Validate files before uploading
3. **Cache Files** - Use MongoDB IDs for repeated documents
4. **Monitor Metrics** - Track performance with Route 6
5. **Handle Errors** - Always use try-catch blocks

---

## 🎯 Best Practices

1. **Always validate files before upload**
2. **Use streaming for better UX**
3. **Save session to localStorage**
4. **Show evaluation feedback immediately**
5. **Handle completion status properly**
6. **Clean up on unmount (cancel streaming)**
7. **Provide error messages to users**
8. **Monitor performance metrics**

---

## 🔍 Debugging

### Check Session State
```typescript
const state = await getSessionState(sessionId);
console.log('Messages:', state.messages.length);
console.log('Stage:', state.stage);
console.log('Completed:', state.completed);
```

### Check Performance
```typescript
const metrics = await getPerformanceMetrics(sessionId);
console.log('Response times:', metrics.response_times.all);
console.log('Cache:', metrics.cache_status);
```

### Global Metrics (Admin)
```typescript
const global = await getGlobalMetrics();
console.log('LLM calls:', global.metrics.llm_calls.total);
console.log('Cache hit rate:', global.metrics.cache.hit_rate_percentage);
```

---

## 📱 Component Integration

See `InterviewRoomV2.tsx` for complete example with:
- ✅ Real-time streaming
- ✅ Evaluation display
- ✅ Voice analysis
- ✅ Status indicators
- ✅ Error handling
- ✅ Session management

---

**Quick Reference Complete** ✓  
**All Routes Covered** ✓  
**Ready to Use** ✓
