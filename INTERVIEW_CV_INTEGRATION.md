# Interview API with Best CV Integration

## Overview
The interview API now automatically includes the user's best CV (highest scoring resume) when starting an interview session.

## Enhanced Endpoints

### 1. Generate Interview Questions
**Endpoint**: `POST /interview/generate`

**Response** (Enhanced):
```json
{
  "raw": "string",
  "structured": {
    "questions": [
      {
        "question": "string",
        "options": ["A", "B", "C", "D"],
        "answer": "string"
      }
    ]
  },
  "bestCV": {
    "filename": "john_doe_resume.pdf",
    "path": "uploads/resumes/1755927218132-19566636.pdf"
  }
}
```

### 2. Run Interview with Evaluation
**Endpoint**: `POST /interview/run`

**Response** (Enhanced):
```json
{
  "_id": "string",
  "owner": "string",
  "jobDescription": "string",
  "questions": ["string"],
  "difficulty": "string",
  "items": [
    {
      "question": "string",
      "answer": "string",
      "isCorrect": boolean,
      "explanation": "string",
      "score": number
    }
  ],
  "overall": {
    "summary": "string",
    "overallScore": number
  },
  "bestCV": {
    "filename": "john_doe_resume.pdf",
    "path": "uploads/resumes/1755927218132-19566636.pdf"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Best CV Selection Logic

The system automatically selects the user's best CV based on:

1. **Highest Overall Score**: Prioritizes resumes with the highest `overall_score` or `score` from AI evaluation
2. **Most Recent**: If scores are equal, selects the most recently uploaded resume
3. **File Existence**: Verifies the CV file exists on the server before including it
4. **Fallback**: Returns `null` if no valid CV is found

## Implementation Details

### CV Selection Algorithm
```typescript
// Finds resume with highest overall score
const resumes = await this.resumeModel.find({ user: userId }).sort({ createdAt: -1 });
let bestResume = resumes[0];
let highestScore = 0;

for (const resume of resumes) {
  const overallScore = resume.stats?.overall_score || resume.stats?.score || 0;
  if (overallScore > highestScore) {
    highestScore = overallScore;
    bestResume = resume;
  }
}
```

### Error Handling
- Gracefully handles missing resumes (returns `bestCV: null`)
- Validates file existence before including CV path
- Continues interview process even if CV retrieval fails

## Frontend Integration

### Using Best CV in Interview Flow
```javascript
// Start interview and get best CV
const response = await fetch('/interview/generate', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(interviewData)
});

const { structured, bestCV } = await response.json();

// Use CV for additional context or display
if (bestCV) {
  console.log(`Using CV: ${bestCV.filename}`);
  // Display CV info to user or pass to AI for context
}
```

## Benefits

1. **Automatic CV Selection**: No manual CV selection required
2. **Quality Assurance**: Always uses the highest-rated resume
3. **Seamless Integration**: Works with existing interview flow
4. **Error Resilient**: Continues without CV if none available
5. **Performance Optimized**: Single database query with sorting