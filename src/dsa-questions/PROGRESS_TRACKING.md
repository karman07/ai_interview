# DSA Questions Progress Tracking

## Overview

The DSA Progress Tracking system allows you to monitor each user's journey through the coding questions. It tracks attempts, submissions, completion status, time spent, languages used, bookmarks, notes, and much more.

## Features

### 📊 Core Tracking
- **Submission History**: Complete history of all code submissions with timestamps
- **Status Tracking**: Attempted, Solved, Failed status for each question
- **Test Case Results**: Track which test cases passed/failed
- **Performance Metrics**: Execution time and memory usage for each submission
- **Language Tracking**: Monitor which programming languages user attempted

### ⏱️ Time Analytics
- **Total Time Spent**: Cumulative time spent on each question
- **Best Execution Time**: Track the fastest accepted solution
- **First/Last Attempt Dates**: When user first and last attempted the question

### 📚 Learning Features
- **Hints Tracking**: Record which hints were revealed
- **Personal Notes**: Users can add their own notes to questions
- **User Ratings**: Users can rate questions (0-100)
- **Bookmarks**: Save questions for later review

### 🎯 Engagement Tracking
- **Like/Dislike**: Track user preferences
- **Attempt Statistics**: Total attempts vs successful attempts
- **Acceptance Rate**: Personal acceptance rate calculation

## Database Schema

### DsaProgress Collection

```typescript
{
  userId: ObjectId,           // Reference to User
  questionId: string,         // Reference to DsaQuestion.questionId
  questionRef: ObjectId,      // Reference to DsaQuestion._id
  
  // Status
  status: 'Attempted' | 'Solved' | 'Failed',
  isBookmarked: boolean,
  isLiked: boolean,
  isDisliked: boolean,
  
  // Attempt tracking
  totalAttempts: number,
  successfulAttempts: number,
  firstAttemptDate: Date,
  lastAttemptDate: Date,
  solvedDate: Date,
  
  // Time tracking
  totalTimeSpent: number,     // in seconds
  bestExecutionTime: number,  // in milliseconds
  
  // Submissions history
  submissions: [
    {
      submittedAt: Date,
      language: string,
      code: string,
      status: string,
      testCasesPassed: number,
      totalTestCases: number,
      executionTime: number,   // ms
      memoryUsed: number,      // MB
      errorMessage: string,
      isAccepted: boolean
    }
  ],
  
  // Learning aids
  hintsUsed: [string],
  userNotes: string,
  languagesAttempted: [string],
  userRating: number          // 0-100
}
```

### Indexes

- `{ userId: 1, questionId: 1 }` - Unique compound index
- `{ userId: 1, status: 1 }` - Filter by status
- `{ userId: 1, isBookmarked: 1 }` - Filter bookmarks
- `{ userId: 1, solvedDate: 1 }` - Filter solved questions

## API Endpoints

### 1. Record Submission
```
POST /dsa-progress/:questionId/submit
```

Record a code submission attempt.

**Request Body:**
```json
{
  "language": "javascript",
  "code": "function twoSum(nums, target) { ... }",
  "status": "Solved",
  "testCasesPassed": 5,
  "totalTestCases": 5,
  "executionTime": 42,
  "memoryUsed": 15.5,
  "timeSpent": 1800
}
```

**Response:**
```json
{
  "_id": "...",
  "userId": "...",
  "questionId": "two-sum",
  "status": "Solved",
  "totalAttempts": 3,
  "successfulAttempts": 1,
  "bestExecutionTime": 42,
  "submissions": [...]
}
```

### 2. Get User Progress
```
GET /dsa-progress/my-progress?status=Solved&isBookmarked=true
```

Retrieve all progress for the authenticated user with optional filters.

**Query Parameters:**
- `status` (optional): Filter by Attempted/Solved/Failed
- `isBookmarked` (optional): Filter bookmarked questions
- `isSolved` (optional): Filter solved questions

**Response:**
```json
[
  {
    "questionId": "two-sum",
    "status": "Solved",
    "totalAttempts": 3,
    "solvedDate": "2025-10-13T...",
    "questionRef": { /* populated question data */ }
  }
]
```

### 3. Get User Statistics
```
GET /dsa-progress/statistics
```

Get comprehensive statistics for the user.

**Response:**
```json
{
  "totalQuestions": 50,
  "solvedQuestions": 25,
  "attemptedQuestions": 15,
  "totalSubmissions": 120,
  "successfulSubmissions": 25,
  "acceptanceRate": "20.83",
  "totalTimeSpent": 36000,
  "averageTimePerQuestion": 720,
  "languagesUsed": ["javascript", "python", "java"],
  "bookmarkedCount": 10
}
```

### 4. Get Recent Submissions
```
GET /dsa-progress/recent-submissions?limit=10
```

Get the most recent submission attempts.

**Response:**
```json
[
  {
    "questionId": "two-sum",
    "question": { /* populated question */ },
    "lastAttempt": "2025-10-13T...",
    "status": "Solved",
    "latestSubmission": { /* submission details */ },
    "totalAttempts": 3
  }
]
```

### 5. Get Question Progress
```
GET /dsa-progress/:questionId
```

Get detailed progress for a specific question.

### 6. Get Submission History
```
GET /dsa-progress/:questionId/submissions
```

Get all submissions for a specific question.

**Response:**
```json
[
  {
    "submittedAt": "2025-10-13T10:30:00Z",
    "language": "javascript",
    "code": "...",
    "status": "Failed",
    "testCasesPassed": 3,
    "totalTestCases": 5,
    "executionTime": 55,
    "isAccepted": false
  },
  {
    "submittedAt": "2025-10-13T10:45:00Z",
    "language": "javascript",
    "code": "...",
    "status": "Solved",
    "testCasesPassed": 5,
    "totalTestCases": 5,
    "executionTime": 42,
    "isAccepted": true
  }
]
```

### 7. Update Progress Metadata
```
PATCH /dsa-progress/:questionId
```

Update bookmark status, notes, or rating.

**Request Body:**
```json
{
  "isBookmarked": true,
  "userNotes": "Remember to use hash map for O(n) solution",
  "userRating": 85
}
```

### 8. Toggle Like
```
POST /dsa-progress/:questionId/like
```

Toggle like status for a question.

### 9. Toggle Dislike
```
POST /dsa-progress/:questionId/dislike
```

Toggle dislike status for a question.

### 10. Record Hint Usage
```
POST /dsa-progress/:questionId/hint
```

Record when a user reveals a hint.

**Request Body:**
```json
{
  "hintContent": "Try using a hash map to store complements"
}
```

### 11. Reset Question Progress
```
DELETE /dsa-progress/:questionId
```

Reset all progress for a specific question.

### 12. Delete All Progress
```
DELETE /dsa-progress/all
```

Delete all progress for the current user (use with caution).

## Usage Examples

### Recording a Submission

```typescript
// Frontend code example
const submitCode = async (questionId: string, code: string) => {
  const response = await fetch(`/dsa-progress/${questionId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: 'javascript',
      code: code,
      status: 'Solved',
      testCasesPassed: 5,
      totalTestCases: 5,
      executionTime: 42,
      memoryUsed: 15.5,
      timeSpent: 1800  // 30 minutes in seconds
    })
  });
  
  return await response.json();
};
```

### Fetching User Dashboard Data

```typescript
const getDashboardData = async () => {
  // Get overall statistics
  const stats = await fetch('/dsa-progress/statistics', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  // Get recent activity
  const recent = await fetch('/dsa-progress/recent-submissions?limit=5', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  // Get bookmarked questions
  const bookmarked = await fetch('/dsa-progress/my-progress?isBookmarked=true', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  return { stats, recent, bookmarked };
};
```

### Tracking Time Spent

```typescript
let startTime: number;
let questionId: string;

const startQuestion = (qId: string) => {
  questionId = qId;
  startTime = Date.now();
};

const submitSolution = async (code: string, results: TestResults) => {
  const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds
  
  await fetch(`/dsa-progress/${questionId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: 'javascript',
      code: code,
      status: results.allPassed ? 'Solved' : 'Failed',
      testCasesPassed: results.passed,
      totalTestCases: results.total,
      executionTime: results.avgExecutionTime,
      timeSpent: timeSpent
    })
  });
};
```

## Integration with Questions

The progress system automatically links with questions through the `questionId` field. You can populate question details in queries:

```typescript
const progress = await this.dsaProgressModel
  .find({ userId })
  .populate('questionRef')  // Populates the full question object
  .exec();
```

## Statistics Calculations

### Acceptance Rate
```
Acceptance Rate = (Successful Submissions / Total Submissions) × 100
```

### Average Time Per Question
```
Average Time = Total Time Spent / Total Questions Attempted
```

### Question Status
- **Attempted**: User has submitted at least one solution that didn't pass all tests
- **Solved**: User has at least one submission that passed all test cases
- **Failed**: User's latest submission failed

## Best Practices

1. **Always track time spent**: Pass `timeSpent` in submissions to track learning patterns
2. **Record all submissions**: Even failed attempts provide valuable data
3. **Use bookmarks**: Encourage users to bookmark challenging questions
4. **Track hints carefully**: Only record hints when actually revealed to the user
5. **Validate test results**: Ensure `testCasesPassed <= totalTestCases`
6. **Store error messages**: Help users learn from their mistakes

## Security Notes

- All endpoints require JWT authentication
- Users can only access their own progress data
- UserId is extracted from the JWT token, not from request body
- Submissions store full code - ensure proper access controls

## Performance Considerations

- Progress documents are indexed for fast queries
- Use pagination for submission history on questions with many attempts
- Consider archiving old submissions after a certain period
- Limit submission code storage size to prevent database bloat

## Future Enhancements

Potential features to add:
- Leaderboards (fastest solutions, most problems solved)
- Streak tracking (consecutive days solving problems)
- Difficulty progression analysis
- Code similarity detection
- Automatic hints based on failed attempts
- Social features (share solutions, discuss approaches)
- Achievement/badge system
- Weekly/monthly challenge tracking

## Testing

Test the progress tracking with:

```bash
# Get your statistics
curl -X GET http://localhost:3000/dsa-progress/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit a solution
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { return [0, 1]; }",
    "status": "Solved",
    "testCasesPassed": 5,
    "totalTestCases": 5,
    "executionTime": 42,
    "timeSpent": 300
  }'

# Get progress
curl -X GET http://localhost:3000/dsa-progress/my-progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Conclusion

The DSA Progress Tracking system provides comprehensive monitoring of user learning journeys. It captures not just what problems users solve, but how they solve them, how long it takes, what languages they prefer, and their overall growth as programmers.
