# Complete cURL Commands Reference

## 🔑 Authentication
Replace `YOUR_JWT_TOKEN` with your actual JWT token in all commands.

```bash
# Set token as environment variable (Windows PowerShell)
$TOKEN = "your_jwt_token_here"

# Set token as environment variable (Linux/Mac)
export TOKEN="your_jwt_token_here"
```

---

## 📝 DSA Questions API (12 Endpoints)

### 1. Create Question
```bash
curl -X POST http://localhost:3000/dsa-questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "two-sum",
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "Easy",
    "categories": ["Array", "HashTable"],
    "tags": ["array", "hash-table", "two-pointers"],
    "testCases": [
      {
        "input": "[2,7,11,15], 9",
        "expectedOutput": "[0,1]",
        "isHidden": false
      }
    ],
    "functionSignatures": [
      {
        "language": "javascript",
        "signature": "function twoSum(nums, target)",
        "returnType": "number[]"
      }
    ],
    "constraints": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "timeLimit": 1000,
      "memoryLimit": 128
    },
    "hints": [
      {
        "order": 1,
        "content": "Try using a hash map"
      }
    ],
    "examples": [
      {
        "input": "[2,7,11,15], target = 9",
        "output": "[0,1]",
        "explanation": "nums[0] + nums[1] == 9, so we return [0, 1]"
      }
    ]
  }'
```

### 2. Get All Questions (with filters)
```bash
# Get all questions
curl -X GET http://localhost:3000/dsa-questions

# Filter by difficulty
curl -X GET "http://localhost:3000/dsa-questions?difficulty=Easy"

# Filter by category
curl -X GET "http://localhost:3000/dsa-questions?category=Array"

# Filter by multiple categories
curl -X GET "http://localhost:3000/dsa-questions?category=Array&category=HashTable"

# Search by keyword
curl -X GET "http://localhost:3000/dsa-questions?search=two%20sum"

# Filter by tags
curl -X GET "http://localhost:3000/dsa-questions?tags=array&tags=hash-table"

# Pagination
curl -X GET "http://localhost:3000/dsa-questions?page=1&limit=10"

# Sort by difficulty
curl -X GET "http://localhost:3000/dsa-questions?sortBy=difficulty&sortOrder=asc"

# Sort by acceptance rate
curl -X GET "http://localhost:3000/dsa-questions?sortBy=acceptanceRate&sortOrder=desc"

# Combined filters
curl -X GET "http://localhost:3000/dsa-questions?difficulty=Medium&category=Array&sortBy=likes&sortOrder=desc&page=1&limit=20"
```

### 3. Get Question Statistics
```bash
curl -X GET http://localhost:3000/dsa-questions/statistics
```

### 4. Get Random Question
```bash
# Random any difficulty
curl -X GET http://localhost:3000/dsa-questions/random

# Random easy question
curl -X GET "http://localhost:3000/dsa-questions/random?difficulty=Easy"

# Random medium question
curl -X GET "http://localhost:3000/dsa-questions/random?difficulty=Medium"

# Random hard question
curl -X GET "http://localhost:3000/dsa-questions/random?difficulty=Hard"
```

### 5. Get Single Question
```bash
# Without solutions
curl -X GET http://localhost:3000/dsa-questions/two-sum

# With solutions
curl -X GET "http://localhost:3000/dsa-questions/two-sum?includeSolutions=true"
```

### 6. Update Question
```bash
curl -X PATCH http://localhost:3000/dsa-questions/two-sum \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Two Sum - Updated",
    "difficulty": "Medium",
    "tags": ["array", "hash-table", "easy-problem"]
  }'
```

### 7. Soft Delete Question
```bash
curl -X DELETE http://localhost:3000/dsa-questions/two-sum \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Hard Delete Question
```bash
curl -X DELETE http://localhost:3000/dsa-questions/two-sum/hard \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Like Question
```bash
curl -X POST http://localhost:3000/dsa-questions/two-sum/like \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Dislike Question
```bash
curl -X POST http://localhost:3000/dsa-questions/two-sum/dislike \
  -H "Authorization: Bearer $TOKEN"
```

### 11. Submit Solution (Global Stats)
```bash
curl -X POST http://localhost:3000/dsa-questions/two-sum/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "isAccepted": true
  }'
```

### 12. Increment Submission Count
```bash
curl -X POST http://localhost:3000/dsa-questions/two-sum/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "isAccepted": false
  }'
```

---

## 📊 DSA Progress API (12 Endpoints)

### 1. Record Submission
```bash
# Successful submission
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
    "status": "Solved",
    "testCasesPassed": 5,
    "totalTestCases": 5,
    "executionTime": 42,
    "memoryUsed": 15.5,
    "timeSpent": 1800
  }'

# Failed submission
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { return [0, 1]; }",
    "status": "Failed",
    "testCasesPassed": 3,
    "totalTestCases": 5,
    "executionTime": 55,
    "memoryUsed": 12.0,
    "errorMessage": "Expected [0,2] but got [0,1]",
    "timeSpent": 900
  }'

# Python submission
curl -X POST http://localhost:3000/dsa-progress/reverse-linked-list/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev",
    "status": "Solved",
    "testCasesPassed": 8,
    "totalTestCases": 8,
    "executionTime": 38,
    "memoryUsed": 18.2,
    "timeSpent": 2400
  }'
```

### 2. Get All My Progress
```bash
# Get all progress
curl -X GET http://localhost:3000/dsa-progress/my-progress \
  -H "Authorization: Bearer $TOKEN"

# Filter by status - Solved
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Solved" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status - Attempted
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Attempted" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status - Failed
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Failed" \
  -H "Authorization: Bearer $TOKEN"

# Get bookmarked questions
curl -X GET "http://localhost:3000/dsa-progress/my-progress?isBookmarked=true" \
  -H "Authorization: Bearer $TOKEN"

# Get solved questions only
curl -X GET "http://localhost:3000/dsa-progress/my-progress?isSolved=true" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Solved&isBookmarked=true" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get User Statistics
```bash
curl -X GET http://localhost:3000/dsa-progress/statistics \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Get Recent Submissions
```bash
# Last 10 submissions (default)
curl -X GET http://localhost:3000/dsa-progress/recent-submissions \
  -H "Authorization: Bearer $TOKEN"

# Last 5 submissions
curl -X GET "http://localhost:3000/dsa-progress/recent-submissions?limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Last 20 submissions
curl -X GET "http://localhost:3000/dsa-progress/recent-submissions?limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Get Question Progress
```bash
curl -X GET http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Get Submission History
```bash
curl -X GET http://localhost:3000/dsa-progress/two-sum/submissions \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Update Progress Metadata
```bash
# Bookmark a question
curl -X PATCH http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isBookmarked": true
  }'

# Add personal notes
curl -X PATCH http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userNotes": "Remember to use hash map for O(n) solution. The key insight is target - nums[i] gives the complement."
  }'

# Rate the question
curl -X PATCH http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userRating": 85
  }'

# Update multiple fields
curl -X PATCH http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isBookmarked": true,
    "userNotes": "Great problem for learning hash tables",
    "userRating": 90
  }'

# Remove bookmark
curl -X PATCH http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isBookmarked": false
  }'
```

### 8. Toggle Like
```bash
curl -X POST http://localhost:3000/dsa-progress/two-sum/like \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Toggle Dislike
```bash
curl -X POST http://localhost:3000/dsa-progress/two-sum/dislike \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Record Hint Usage
```bash
# First hint
curl -X POST http://localhost:3000/dsa-progress/two-sum/hint \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hintContent": "Try using a hash map to store complements"
  }'

# Second hint
curl -X POST http://localhost:3000/dsa-progress/two-sum/hint \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hintContent": "For each number, check if target - number exists in the map"
  }'

# Third hint
curl -X POST http://localhost:3000/dsa-progress/two-sum/hint \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hintContent": "Store the number as key and its index as value in the hash map"
  }'
```

### 11. Reset Question Progress
```bash
curl -X DELETE http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN"
```

### 12. Delete All Progress
```bash
# ⚠️ WARNING: This deletes ALL progress for the user
curl -X DELETE http://localhost:3000/dsa-progress/all \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Common Workflows

### Complete User Journey
```bash
# 1. Get user's current statistics
curl -X GET http://localhost:3000/dsa-progress/statistics \
  -H "Authorization: Bearer $TOKEN"

# 2. Get a random easy question to solve
curl -X GET "http://localhost:3000/dsa-questions/random?difficulty=Easy"

# 3. Get detailed question info (e.g., two-sum)
curl -X GET http://localhost:3000/dsa-questions/two-sum

# 4. Check if user has attempted this before
curl -X GET http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN"

# 5. Reveal first hint
curl -X POST http://localhost:3000/dsa-progress/two-sum/hint \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hintContent": "Try using a hash map"}'

# 6. Bookmark the question for later
curl -X PATCH http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isBookmarked": true}'

# 7. Submit first attempt (failed)
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { return [0, 1]; }",
    "status": "Failed",
    "testCasesPassed": 3,
    "totalTestCases": 5,
    "executionTime": 40,
    "timeSpent": 900
  }'

# 8. Submit final attempt (success)
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }",
    "status": "Solved",
    "testCasesPassed": 5,
    "totalTestCases": 5,
    "executionTime": 42,
    "timeSpent": 1800
  }'

# 9. Update global question stats
curl -X POST http://localhost:3000/dsa-questions/two-sum/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language": "javascript", "isAccepted": true}'

# 10. Like the question
curl -X POST http://localhost:3000/dsa-progress/two-sum/like \
  -H "Authorization: Bearer $TOKEN"

# 11. Like globally
curl -X POST http://localhost:3000/dsa-questions/two-sum/like \
  -H "Authorization: Bearer $TOKEN"

# 12. Add personal notes
curl -X PATCH http://localhost:3000/dsa-progress/two-sum \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userNotes": "O(n) solution using hash map. Key insight: target - nums[i] = complement",
    "userRating": 95
  }'

# 13. View submission history
curl -X GET http://localhost:3000/dsa-progress/two-sum/submissions \
  -H "Authorization: Bearer $TOKEN"

# 14. Check updated statistics
curl -X GET http://localhost:3000/dsa-progress/statistics \
  -H "Authorization: Bearer $TOKEN"
```

### Review Session
```bash
# 1. Get all bookmarked questions
curl -X GET "http://localhost:3000/dsa-progress/my-progress?isBookmarked=true" \
  -H "Authorization: Bearer $TOKEN"

# 2. Get all attempted but not solved
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Attempted" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get recent activity
curl -X GET "http://localhost:3000/dsa-progress/recent-submissions?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Dashboard Data
```bash
# Get all data for user dashboard
curl -X GET http://localhost:3000/dsa-progress/statistics \
  -H "Authorization: Bearer $TOKEN" && \
curl -X GET http://localhost:3000/dsa-progress/recent-submissions?limit=5 \
  -H "Authorization: Bearer $TOKEN" && \
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Solved" \
  -H "Authorization: Bearer $TOKEN" && \
curl -X GET "http://localhost:3000/dsa-progress/my-progress?isBookmarked=true" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔧 Testing & Development

### Create Test Question
```bash
curl -X POST http://localhost:3000/dsa-questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "test-question",
    "title": "Test Question",
    "description": "This is a test question for development",
    "difficulty": "Easy",
    "categories": ["Array"],
    "tags": ["test"],
    "testCases": [{"input": "[1,2,3]", "expectedOutput": "6", "isHidden": false}],
    "functionSignatures": [{"language": "javascript", "signature": "function sum(arr)", "returnType": "number"}],
    "constraints": {"timeComplexity": "O(n)", "spaceComplexity": "O(1)", "timeLimit": 1000, "memoryLimit": 128},
    "hints": [{"order": 1, "content": "Use a loop"}],
    "examples": [{"input": "[1,2,3]", "output": "6", "explanation": "Sum of all elements"}]
  }'
```

### Test Progress Tracking
```bash
# Submit test data
curl -X POST http://localhost:3000/dsa-progress/test-question/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function sum(arr) { return arr.reduce((a,b) => a+b, 0); }",
    "status": "Solved",
    "testCasesPassed": 1,
    "totalTestCases": 1,
    "executionTime": 10,
    "timeSpent": 60
  }'

# Verify it was recorded
curl -X GET http://localhost:3000/dsa-progress/test-question \
  -H "Authorization: Bearer $TOKEN"
```

### Cleanup Test Data
```bash
# Delete test progress
curl -X DELETE http://localhost:3000/dsa-progress/test-question \
  -H "Authorization: Bearer $TOKEN"

# Delete test question
curl -X DELETE http://localhost:3000/dsa-questions/test-question/hard \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Response Examples

### Question Statistics Response
```json
{
  "totalQuestions": 150,
  "byDifficulty": {
    "Easy": 50,
    "Medium": 75,
    "Hard": 25
  },
  "byCategory": {
    "Array": 45,
    "String": 30,
    "Tree": 25,
    "Graph": 20,
    "DynamicProgramming": 30
  },
  "totalSubmissions": 5000,
  "averageAcceptanceRate": 45.5
}
```

### User Statistics Response
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

### Progress Document Response
```json
{
  "_id": "...",
  "userId": "...",
  "questionId": "two-sum",
  "status": "Solved",
  "isBookmarked": true,
  "isLiked": true,
  "isDisliked": false,
  "totalAttempts": 4,
  "successfulAttempts": 1,
  "firstAttemptDate": "2025-10-13T10:00:00.000Z",
  "lastAttemptDate": "2025-10-13T10:45:00.000Z",
  "solvedDate": "2025-10-13T10:45:00.000Z",
  "totalTimeSpent": 2700,
  "bestExecutionTime": 42,
  "submissions": [...],
  "hintsUsed": ["Try using a hash map"],
  "userNotes": "Great problem for hash tables",
  "languagesAttempted": ["javascript"],
  "userRating": 95
}
```

---

## 💡 Tips

1. **Use PowerShell Variables** (Windows):
```powershell
$TOKEN = "your_token"
$BASE_URL = "http://localhost:3000"

# Then use in commands
Invoke-RestMethod -Uri "$BASE_URL/dsa-progress/statistics" -Headers @{Authorization="Bearer $TOKEN"}
```

2. **Pretty Print JSON** (with jq):
```bash
curl -X GET http://localhost:3000/dsa-progress/statistics \
  -H "Authorization: Bearer $TOKEN" | jq
```

3. **Save Response to File**:
```bash
curl -X GET http://localhost:3000/dsa-progress/statistics \
  -H "Authorization: Bearer $TOKEN" -o statistics.json
```

4. **Test Multiple Questions**:
```bash
for question in two-sum reverse-linked-list valid-parentheses; do
  curl -X GET "http://localhost:3000/dsa-questions/$question"
done
```

---

## 🚀 Production URLs

Replace `http://localhost:3000` with your production URL:
- Development: `http://localhost:3000`
- Staging: `https://staging-api.yourdomain.com`
- Production: `https://api.yourdomain.com`

---

## 📚 Documentation

- Full API Docs: `PROGRESS_TRACKING.md`
- Quick Reference: `QUICK_REFERENCE.md`
- User Journey: `USER_JOURNEY.md`
- System Overview: `SYSTEM_OVERVIEW.md`
- Swagger UI: `http://localhost:3000/docs`
