# Interview Evaluation API Documentation

## 📊 Evaluation Response Structure

When `next_question` is `None`, the interview is complete and the system automatically uploads analytics data.

### Complete Evaluation Response Format

```json
{
  "evaluation": {
    "score": 1.9,
    "feedback": "Poor content relevance | Could improve speech fluency | Could sound more confident",
    "suggestions": [
      "Answer the specific question asked",
      "Include concrete examples with measurable results",
      "Adjust speaking pace - aim for 140-170 words per minute"
    ],
    "breakdown": {
      "relevance": 0.0,
      "depth": 0.8,
      "structure": 0.3,
      "examples": 0.0,
      "technical": 0.0,
      "alignment": 0,
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
    },
    "total_possible": 11.0
  },
  "next_question": null,
  "state": {
    "user_id": "68edfb398df3bfece0f3daf5",
    "session_id": "session_68edfb398df3bfece0f3daf5_technical_1767703886782",
    "role_title": "Developer",
    "company_name": "Dine3D",
    "industry": "Technology",
    "jd": "Developer",
    "cv": "5 years",
    "round_type": "technical",
    "status": "completed",
    "completed": true,
    "history": [
      {
        "question": "Tell me about yourself and what draws you to this role.",
        "answer": "This is a sample answer for testing purposes...",
        "evaluation": {
          "score": 2.1,
          "feedback": "Content needs improvement | Could improve speech fluency | Could sound more confident",
          "suggestions": [
            "Answer the specific question asked",
            "Include concrete examples with measurable results",
            "Adjust speaking pace - aim for 140-170 words per minute"
          ],
          "breakdown": {
            "relevance": 0.3,
            "depth": 0.8,
            "structure": 0.3,
            "examples": 0.0,
            "technical": 0.0,
            "alignment": 0,
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
          },
          "total_possible": 11.0
        },
        "stage": "intro",
        "timestamp": "2026-01-06T12:51:26.805096",
        "transcribed_text": "This is a sample answer for testing purposes...",
        "has_audio": true
      }
    ]
  }
}
```

## 🎯 Evaluation Breakdown Metrics

### Content Evaluation (0-1 scale)
- **relevance**: How well the answer addresses the question
- **depth**: Level of detail and insight provided
- **structure**: Organization and flow of the response
- **examples**: Use of concrete examples and evidence
- **technical**: Technical accuracy and knowledge demonstration
- **alignment**: Alignment with job requirements

### Communication Evaluation (0-1 scale)
- **fluency**: Speech flow and natural delivery
- **clarity**: Clear articulation and understandability
- **confidence**: Confidence level in delivery
- **pace**: Speaking speed appropriateness

### Voice Metrics
- **duration**: Length of response in seconds
- **speech_rate**: Words per minute
- **avg_pitch**: Average pitch level
- **pitch_variation**: Pitch range and variation
- **avg_energy**: Average energy/volume level
- **pause_ratio**: Ratio of pauses to speech
- **speech_segments**: Number of distinct speech segments

## 🔄 Analytics Upload Process

When `next_question` is `None`, the enhanced controller automatically:

1. **Completes the session** in the analytics database
2. **Calculates final scores** from all questions
3. **Updates user analytics** with session data
4. **Generates comprehensive report** with all evaluation data

### Backend Processing

```typescript
// Enhanced controller automatically handles completion
if (!aiResponse.next_question) {
  // Extract comprehensive scores
  const finalScores = {
    overall: calculateOverallScore(sessionHistory),
    communication: calculateCommunicationScore(sessionHistory),
    technical: calculateTechnicalScore(sessionHistory),
    behavioral: calculateBehavioralScore(sessionHistory),
    problemSolving: calculateProblemSolvingScore(sessionHistory)
  };

  // Complete session with full analytics
  await this.analyticsService.completeSession(
    payload.session_id,
    finalScores,
    aiResponse
  );

  // Return completion response
  return {
    ...aiResponse,
    interview_complete: true,
    final_scores: finalScores,
    session_completed: true
  };
}
```

## 📈 Analytics Data Stored

### Session Completion Data
```typescript
{
  sessionId: string,
  userId: ObjectId,
  status: 'completed',
  finalScores: {
    overall: number,
    communication: number,
    technical: number,
    behavioral: number,
    problemSolving: number
  },
  metrics: {
    totalQuestions: number,
    answeredQuestions: number,
    averageResponseTime: number,
    totalDuration: number,
    averageScore: number
  },
  completedAt: Date,
  finalReport: {
    overallFeedback: string,
    strengths: string[],
    improvements: string[],
    recommendations: string[]
  }
}
```

### Question-Level Analytics
```typescript
{
  questionId: ObjectId,
  sessionId: ObjectId,
  questionText: string,
  answerText: string,
  evaluation: {
    score: number,
    feedback: string,
    suggestions: string[],
    breakdown: {
      relevance: number,
      depth: number,
      structure: number,
      examples: number,
      technical: number,
      alignment: number,
      fluency: number,
      clarity: number,
      confidence: number,
      pace: number,
      total: number
    },
    voice_metrics: {
      duration: number,
      speech_rate: number,
      avg_pitch: number,
      pitch_variation: number,
      avg_energy: number,
      pause_ratio: number,
      speech_segments: number
    }
  },
  stage: string,
  timestamp: string,
  has_audio: boolean
}
```

## 🎨 Frontend Integration

### Interview Completion Handler
```jsx
const handleAnswerSubmission = async (audioBlob) => {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('audio_file', audioBlob, 'answer.wav');

  const response = await fetch('/enhanced-interview/answer', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  const result = await response.json();

  if (!result.next_question || result.interview_complete) {
    // Interview completed - show final results
    setInterviewComplete(true);
    setFinalEvaluation(result.evaluation);
    
    // Navigate to comprehensive report
    setTimeout(() => {
      window.location.href = `/interview-report/${sessionId}`;
    }, 3000);
  } else {
    // Continue with next question
    setCurrentQuestion(result.next_question);
    setCurrentEvaluation(result.evaluation);
  }
};
```

### Completion Screen Component
```jsx
const InterviewCompletionScreen = ({ evaluation, sessionId }) => {
  return (
    <div className="interview-completion">
      <div className="completion-header">
        <h1>🎉 Interview Complete!</h1>
        <p>Thank you for completing the interview.</p>
      </div>

      <div className="final-scores">
        <div className="overall-score">
          <h2>Overall Score</h2>
          <div className="score-display">
            {evaluation.score.toFixed(1)}/{evaluation.total_possible}
          </div>
        </div>

        <div className="breakdown-scores">
          <ScoreBar label="Relevance" score={evaluation.breakdown.relevance} />
          <ScoreBar label="Depth" score={evaluation.breakdown.depth} />
          <ScoreBar label="Structure" score={evaluation.breakdown.structure} />
          <ScoreBar label="Fluency" score={evaluation.breakdown.fluency} />
          <ScoreBar label="Clarity" score={evaluation.breakdown.clarity} />
          <ScoreBar label="Confidence" score={evaluation.breakdown.confidence} />
        </div>
      </div>

      <div className="feedback-section">
        <h3>Feedback</h3>
        <p>{evaluation.feedback}</p>
        
        <h3>Suggestions for Improvement</h3>
        <ul>
          {evaluation.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button onClick={() => window.location.href = `/interview-report/${sessionId}`}>
          View Detailed Report
        </button>
        <button onClick={() => window.location.href = '/dashboard'}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
```

## 📊 Report Generation

### Comprehensive Report API
```bash
GET /enhanced-interview/report/:sessionId
Authorization: Bearer <token>
```

### Report Response
```json
{
  "session": {
    "sessionId": "session_123",
    "status": "completed",
    "scores": {
      "overall": 2.0,
      "communication": 1.8,
      "technical": 2.2
    },
    "questions": [
      {
        "questionText": "Tell me about yourself...",
        "evaluation": {
          "score": 2.1,
          "breakdown": { /* detailed scores */ },
          "voice_metrics": { /* voice analysis */ }
        }
      }
    ]
  },
  "analytics": {
    "totalQuestions": 8,
    "averageScore": 2.0,
    "strengths": ["Good technical knowledge", "Clear structure"],
    "improvements": ["More specific examples needed", "Improve speaking pace"],
    "recommendations": ["Practice behavioral questions", "Work on confidence"]
  }
}
```

This comprehensive evaluation system provides detailed analytics and automatic session completion when the interview ends.