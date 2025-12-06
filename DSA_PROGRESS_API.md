# DSA Progress API Documentation

## Base URL
```
http://localhost:3000/dsa-progress
```

## Authentication
All endpoints require JWT Bearer token in Authorization header.

## POST Endpoints

### 1. Start Question Tracking
```bash
curl -X POST "http://localhost:3000/dsa-progress/two-sum/start" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Record Time Spent
```bash
curl -X POST "http://localhost:3000/dsa-progress/two-sum/time" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timeSpent": 300}'
```

### 3. Record Coding Attempt
```bash
curl -X POST "http://localhost:3000/dsa-progress/two-sum/attempt" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function twoSum(nums, target) { return []; }",
    "language": "javascript"
  }'
```

### 4. Submit Solution
```bash
curl -X POST "http://localhost:3000/dsa-progress/two-sum/submit" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { /* solution */ }",
    "status": "Solved",
    "testCasesPassed": 5,
    "totalTestCases": 5,
    "executionTime": 42,
    "memoryUsed": 15.5,
    "timeSpent": 1800
  }'
```

### 5. Toggle Bookmark
```bash
curl -X POST "http://localhost:3000/dsa-progress/two-sum/bookmark" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 6. Toggle Like
```bash
curl -X POST "http://localhost:3000/dsa-progress/two-sum/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 7. Toggle Dislike
```bash
curl -X POST "http://localhost:3000/dsa-progress/two-sum/dislike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 8. Record Hint Usage
```bash
curl -X POST "http://localhost:3000/dsa-progress/two-sum/hint" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hintContent": "Try using a hash map"}'
```

## GET Endpoints

### 9. Get My Progress
```bash
curl -X GET "http://localhost:3000/dsa-progress/my-progress" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 10. Get My Progress (Filtered)
```bash
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Solved&isBookmarked=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. Get Statistics
```bash
curl -X GET "http://localhost:3000/dsa-progress/statistics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 12. Get Recent Submissions
```bash
curl -X GET "http://localhost:3000/dsa-progress/recent-submissions?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 13. Get Question Progress
```bash
curl -X GET "http://localhost:3000/dsa-progress/two-sum" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 14. Get Submission History
```bash
curl -X GET "http://localhost:3000/dsa-progress/two-sum/submissions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## PATCH Endpoints

### 15. Update Progress Metadata
```bash
curl -X PATCH "http://localhost:3000/dsa-progress/two-sum" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isBookmarked": true,
    "userNotes": "Remember O(n) solution with hash map",
    "userRating": 85
  }'
```

## DELETE Endpoints

### 16. Reset Question Progress
```bash
curl -X DELETE "http://localhost:3000/dsa-progress/two-sum" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 17. Delete All Progress
```bash
curl -X DELETE "http://localhost:3000/dsa-progress/all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Data Models

### Submission Status
- `Attempted`
- `Solved` 
- `Failed`

### Programming Languages
- `javascript`
- `python`
- `java`
- `cpp`
- `typescript`
- `go`
- `rust`
- `csharp`

## Response Examples

### Statistics Response
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
  "languagesUsed": ["javascript", "python"],
  "bookmarkedCount": 10
}
```

### Progress Response
```json
{
  "userId": "user123",
  "questionId": "two-sum",
  "status": "Solved",
  "isBookmarked": true,
  "totalAttempts": 3,
  "successfulAttempts": 1,
  "totalTimeSpent": 1800,
  "submissions": [...],
  "languagesAttempted": ["javascript"]
}
```