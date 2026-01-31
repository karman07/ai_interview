# V2 Interview Dashboard - Quick Integration Guide

## 🚀 Quick Start

The V2 Interview Dashboard is now fully implemented. Follow these steps to integrate it into your application.

---

## 📋 Prerequisites

Ensure you have the following dependencies installed:

```bash
npm install framer-motion lucide-react axios react-router-dom
```

Or with pnpm:

```bash
pnpm add framer-motion lucide-react axios react-router-dom
```

---

## 🔌 Router Setup

Add the results route to your router configuration. In your main router file (e.g., `src/App.tsx` or `src/routes/index.tsx`):

```typescript
import InterviewResultsV2 from '@/pages/Interview_round/InterviewResultsV2';

// Add this route to your router configuration
{
  path: '/interview/results/:sessionId',
  element: <InterviewResultsV2 />
}
```

### Complete Example (React Router v6):

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InterviewHome from '@/pages/Interview_round/InterviewHome';
import InterviewStart from '@/pages/Interview_round/InterviewStart';
import InterviewRoomPage from '@/pages/Interview_round/InterviewRoomPage';
import InterviewResultsV2 from '@/pages/Interview_round/InterviewResultsV2';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Interview Routes */}
        <Route path="/interview_round" element={<InterviewHome />} />
        <Route path="/interview/start/:type" element={<InterviewStart />} />
        <Route path="/interview/room/:type" element={<InterviewRoomPage />} />
        <Route path="/interview/results/:sessionId" element={<InterviewResultsV2 />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🌐 API Configuration

### Backend URL Configuration

Update your axios configuration to point to the V2 API endpoints. In `src/api/http.ts`:

```typescript
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 300000, // 5 minutes for large file uploads
});

// Request interceptor for auth tokens
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
```

### Environment Variables

Create/update `.env` file:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000

# V2 Interview API (if using different backend)
VITE_V2_INTERVIEW_API=http://localhost:3000/v2/interview
```

---

## 🎯 Usage Flow

### 1. **Dashboard** (`/interview_round`)
- User sees analytics and interview history
- Clicks "Start New Interview"
- Selects interview type (Technical/Behavioral/HR/Problem)

### 2. **Interview Setup** (`/interview/start/:type`)
- User enters role and company
- Uploads resume (file or text)
- Uploads job description (file or text)
- Clicks "Start AI Interview"
- System calls `startInterviewV2()` API
- Navigates to interview room

### 3. **Interview Room** (`/interview/room/:type`)
- Question displayed and spoken
- User records audio answer
- System calls `submitAnswerV2()` API
- Receives next question or completion signal
- Auto-navigates to results on completion

### 4. **Results** (`/interview/results/:sessionId`)
- Displays comprehensive evaluation
- Shows voice and video analytics
- Provides detailed feedback
- Allows download/print
- Option to start new interview

---

## 📡 API Endpoints Used

### Base URL: `http://localhost:3000/v2/interview`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/start` | POST | Start new interview session |
| `/:sessionId/answer` | POST | Submit answer (text or audio) |
| `/:sessionId/status` | GET | Get current interview status |
| `/:sessionId/complete` | POST | Complete interview & get report |

---

## 🔑 Key Functions

### Starting Interview

```typescript
import { startInterviewV2 } from '@/api/interviewV2';

const response = await startInterviewV2({
  role: 'Software Engineer',
  company: 'Google',
  resume_file: resumeFile, // or resume_text
  jd_file: jdFile, // or jd_text
});

// Store session for interview room
localStorage.setItem('v2_interview_session', JSON.stringify({
  sessionId: response.session_id,
  firstQuestion: response.question,
  questionNumber: response.question_number,
}));
```

### Submitting Answer

```typescript
import { submitAnswerV2, createAudioFile } from '@/api/interviewV2';

// With audio
const audioFile = createAudioFile(audioBlob, sessionId);
const response = await submitAnswerV2(sessionId, {
  answer_audio: audioFile
});

// Or with text
const response = await submitAnswerV2(sessionId, {
  answer: 'My answer text...'
});
```

### Completing Interview

```typescript
import { completeInterviewV2 } from '@/api/interviewV2';

const report = await completeInterviewV2(sessionId, {
  final_notes: 'Interview completed successfully'
});

// Store for results page
localStorage.setItem('v2_interview_report', JSON.stringify(report));
```

---

## 🎨 Customization

### Color Themes

The interview UI uses Tailwind CSS gradients. Customize in component files:

```typescript
// Interview Start
const types = {
  technical: { color: "from-blue-500 to-blue-600" },
  behavioral: { color: "from-emerald-500 to-emerald-600" },
  problem: { color: "from-amber-500 to-orange-500" },
  hr: { color: "from-purple-500 to-purple-600" }
};
```

### Voice Settings

Adjust text-to-speech in `InterviewRoomV2.tsx`:

```typescript
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 0.9; // Speed (0.1 to 10)
utterance.pitch = 1.0; // Pitch (0 to 2)
utterance.volume = 1.0; // Volume (0 to 1)
```

### Auto-Stop Silence Duration

Adjust in `AudioRecorderV2.tsx`:

```typescript
// Current: 3 seconds (6 * 500ms)
if (newVal >= 6) {
  stopRecording();
}

// Change to 5 seconds:
if (newVal >= 10) { // 10 * 500ms = 5 seconds
  stopRecording();
}
```

---

## 🧪 Testing Locally

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Ensure V2 endpoints are running at `http://localhost:3000/v2/interview`

### 2. Start Frontend

```bash
cd frontend
npm run dev
# or
pnpm dev
```

### 3. Test Flow

1. Navigate to `http://localhost:5173/interview_round`
2. Click "Start New Interview"
3. Select interview type
4. Fill in details and upload files
5. Start interview
6. Record audio answers
7. View comprehensive results

---

## 📱 Mobile Support

All components are mobile-responsive:

- Interview Start: Stacked layout on small screens
- Interview Room: Single column on mobile
- Results: Card grid adapts to screen size
- Audio Recorder: Touch-optimized buttons

Test on:
- iPhone (Safari)
- Android (Chrome)
- Tablet devices

---

## 🐛 Troubleshooting

### Issue: "Microphone not accessible"
**Solution:** Ensure HTTPS or localhost. Browsers require secure context for MediaRecorder API.

### Issue: "Session not found"
**Solution:** Check localStorage for `v2_interview_session`. Session may have expired.

### Issue: "File upload fails"
**Solution:** Check file size (<10MB) and type (PDF/DOCX/TXT). Verify backend accepts multipart/form-data.

### Issue: "Audio not playing"
**Solution:** Check browser audio permissions. Try unmuting the tab.

### Issue: "Results not displaying"
**Solution:** Check `v2_interview_report` in localStorage. Ensure `completeInterviewV2()` was called.

---

## 🔒 Security Considerations

### File Uploads
- ✅ File type validation (PDF, DOCX, TXT only)
- ✅ File size limit (10MB)
- ✅ Backend should also validate

### Audio Recording
- ✅ User permission required
- ✅ Auto-cleanup of media streams
- ✅ Blob URLs properly revoked

### Data Storage
- ✅ Sensitive data in localStorage (consider encryption)
- ✅ Clear session data after completion
- ✅ No API keys in frontend code

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
pnpm build
```

### Environment Variables (Production)

```bash
VITE_API_URL=https://api.yourdomain.com
```

### Hosting Recommendations
- **Vercel**: Auto HTTPS, global CDN
- **Netlify**: Easy deployment, form handling
- **AWS S3 + CloudFront**: Scalable, cost-effective

---

## 📊 Analytics Integration

Track interview events:

```typescript
// In InterviewStart.tsx
analytics.track('interview_started', {
  role: details.role,
  company: details.company,
  type: type,
});

// In InterviewRoomV2.tsx
analytics.track('answer_submitted', {
  sessionId: sessionId,
  questionNumber: questionNumber,
  hasAudio: !!audioFile,
});

// In InterviewResultsV2.tsx
analytics.track('interview_completed', {
  sessionId: sessionId,
  score: report.evaluation.overall_score,
  recommendation: report.evaluation.recommendation,
});
```

---

## 🎓 Best Practices

### Performance
- Use React.lazy() for code splitting
- Implement image optimization
- Cache API responses where appropriate

### Accessibility
- Test with screen readers
- Ensure keyboard navigation
- Add ARIA labels

### User Experience
- Show loading states
- Handle errors gracefully
- Provide clear feedback

---

## 📚 Additional Resources

- [V2 API Documentation](./V2_INTERVIEW_IMPLEMENTATION.md)
- [Component Documentation](./COMPONENT_GUIDE.md)
- [API Reference](./API_REFERENCE.md)

---

## 💡 Tips

1. **Always test audio** on different browsers (Chrome, Safari, Firefox)
2. **Clear localStorage** between tests to avoid stale data
3. **Monitor file sizes** for large resumes/JDs
4. **Use error boundaries** to catch React errors
5. **Implement retry logic** for failed API calls

---

## ✅ Checklist

Before going live:

- [ ] Test all 4 interview types
- [ ] Verify file uploads work
- [ ] Test audio recording on different devices
- [ ] Ensure results page displays all sections
- [ ] Check mobile responsiveness
- [ ] Verify error handling
- [ ] Test with real API backend
- [ ] Set up production environment variables
- [ ] Configure CORS on backend
- [ ] Test print/download functionality

---

## 🎉 You're Ready!

The V2 Interview Dashboard is fully integrated and ready to use. Start interviewing with AI-powered insights! 🚀

For questions or issues, refer to the main implementation guide or check the inline code comments.
