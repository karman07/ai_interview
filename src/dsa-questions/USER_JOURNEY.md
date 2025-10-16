# User Journey Flow - DSA Questions with Progress Tracking

## 🎯 Complete User Journey

```
                    ┌─────────────────────────┐
                    │   User Opens Platform   │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   View Dashboard        │
                    │                          │
                    │ GET /dsa-progress/      │
                    │     statistics          │
                    │                          │
                    │ Shows:                   │
                    │ • 25/100 solved         │
                    │ • 75% acceptance rate   │
                    │ • 10 hours total time   │
                    └───────────┬─────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
    │  Browse New      │ │  View Saved  │ │  Continue Last   │
    │  Questions       │ │  Bookmarks   │ │  Question        │
    │                  │ │              │ │                  │
    │ GET /dsa-        │ │ GET /dsa-    │ │ GET /dsa-        │
    │ questions?       │ │ progress/    │ │ progress/recent- │
    │ difficulty=Easy  │ │ my-progress? │ │ submissions      │
    │                  │ │ isBookmarked │ │                  │
    └────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘
             │                  │                   │
             └──────────────────┼───────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │  Select Question        │
                    │  "Two Sum"              │
                    │                          │
                    │ GET /dsa-questions/     │
                    │     two-sum             │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │  Load Progress          │
                    │                          │
                    │ GET /dsa-progress/      │
                    │     two-sum             │
                    │                          │
                    │ Shows:                   │
                    │ • 3 previous attempts   │
                    │ • Not solved yet        │
                    │ • 45 mins spent         │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │  Start Solving          │
                    │  [Start Timer]          │
                    └───────────┬─────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
    │  Reveal Hint     │ │  Add Note    │ │  Bookmark It     │
    │                  │ │              │ │                  │
    │ POST /dsa-       │ │ PATCH /dsa-  │ │ PATCH /dsa-      │
    │ progress/        │ │ progress/    │ │ progress/        │
    │ two-sum/hint     │ │ two-sum      │ │ two-sum          │
    │                  │ │              │ │                  │
    │ Body:            │ │ Body:        │ │ Body:            │
    │ {hintContent}    │ │ {userNotes}  │ │ {isBookmarked}   │
    └────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘
             │                  │                   │
             └──────────────────┼───────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │  Write Solution Code    │
                    │  [Code Editor]          │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │  Run Code Against       │
                    │  Test Cases             │
                    │  [Execute locally]      │
                    └───────────┬─────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │  Tests Failed        │        │  Tests Passed!       │
    │  3/5 passed          │        │  5/5 passed          │
    └──────────┬───────────┘        └──────────┬───────────┘
               │                               │
               ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │  Submit Failed       │        │  Submit Success      │
    │  Attempt             │        │                      │
    │                      │        │ POST /dsa-progress/  │
    │ POST /dsa-progress/  │        │      two-sum/submit  │
    │      two-sum/submit  │        │                      │
    │                      │        │ Body:                │
    │ Body:                │        │ {                    │
    │ {                    │        │   language: "js",    │
    │   language: "js",    │        │   code: "...",       │
    │   code: "...",       │        │   status: "Solved",  │
    │   status: "Failed",  │        │   testCasesPassed:5, │
    │   testCasesPassed:3, │        │   totalTestCases:5,  │
    │   totalTestCases:5,  │        │   executionTime:42,  │
    │   executionTime:55,  │        │   timeSpent:2700     │
    │   timeSpent:2700,    │        │ }                    │
    │   errorMessage:"..." │        │                      │
    │ }                    │        │ Also update global:  │
    │                      │        │ POST /dsa-questions/ │
    └──────────┬───────────┘        │      two-sum/submit  │
               │                     └──────────┬───────────┘
               │                                │
               │                                ▼
               │                    ┌──────────────────────┐
               │                    │  🎉 Celebration!     │
               │                    │                      │
               │                    │  Question Marked     │
               │                    │  as SOLVED           │
               │                    │                      │
               │                    │  Statistics Updated  │
               │                    └──────────┬───────────┘
               │                                │
               └────────────────────┬───────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │  View Submission     │
                        │  History             │
                        │                      │
                        │ GET /dsa-progress/   │
                        │     two-sum/         │
                        │     submissions      │
                        │                      │
                        │ Shows all attempts:  │
                        │ 1. Failed - 40ms     │
                        │ 2. Failed - 50ms     │
                        │ 3. Failed - 55ms     │
                        │ 4. ✅ Solved - 42ms  │
                        └──────────┬───────────┘
                                   │
                   ┌───────────────┼───────────────┐
                   │               │               │
                   ▼               ▼               ▼
       ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
       │  Like Question   │ │  Rate It     │ │  Share/Discuss   │
       │                  │ │              │ │                  │
       │ POST /dsa-       │ │ PATCH /dsa-  │ │ [Future Feature] │
       │ progress/        │ │ progress/    │ │                  │
       │ two-sum/like     │ │ two-sum      │ │                  │
       │                  │ │              │ │                  │
       │ Also update:     │ │ Body:        │ │                  │
       │ POST /dsa-       │ │ {userRating: │ │                  │
       │ questions/       │ │  95}         │ │                  │
       │ two-sum/like     │ │              │ │                  │
       └────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘
                │                  │                   │
                └──────────────────┼───────────────────┘
                                   │
                                   ▼
                       ┌──────────────────────┐
                       │  Move to Next        │
                       │  Question            │
                       │                      │
                       │ GET /dsa-questions/  │
                       │     random?          │
                       │     difficulty=      │
                       │     Medium           │
                       └──────────────────────┘
```

## 📊 Data Created During Journey

### After First Failed Attempt
```json
{
  "userId": "user123",
  "questionId": "two-sum",
  "status": "Failed",
  "totalAttempts": 1,
  "successfulAttempts": 0,
  "firstAttemptDate": "2025-10-13T10:00:00Z",
  "lastAttemptDate": "2025-10-13T10:00:00Z",
  "totalTimeSpent": 900,
  "submissions": [
    {
      "submittedAt": "2025-10-13T10:00:00Z",
      "language": "javascript",
      "code": "function twoSum(nums, target) { ... }",
      "status": "Failed",
      "testCasesPassed": 3,
      "totalTestCases": 5,
      "executionTime": 40,
      "isAccepted": false,
      "errorMessage": "Expected [0,1] but got [1,0]"
    }
  ],
  "hintsUsed": [],
  "languagesAttempted": ["javascript"]
}
```

### After Revealing Hint
```json
{
  ...
  "hintsUsed": ["Try using a hash map to store complements"]
}
```

### After Adding Note & Bookmark
```json
{
  ...
  "isBookmarked": true,
  "userNotes": "Remember: target - nums[i] gives complement"
}
```

### After Final Success
```json
{
  "userId": "user123",
  "questionId": "two-sum",
  "status": "Solved",
  "totalAttempts": 4,
  "successfulAttempts": 1,
  "firstAttemptDate": "2025-10-13T10:00:00Z",
  "lastAttemptDate": "2025-10-13T10:45:00Z",
  "solvedDate": "2025-10-13T10:45:00Z",
  "totalTimeSpent": 2700,
  "bestExecutionTime": 42,
  "isBookmarked": true,
  "isLiked": true,
  "userNotes": "Remember: target - nums[i] gives complement",
  "userRating": 95,
  "submissions": [
    {
      "submittedAt": "2025-10-13T10:00:00Z",
      "status": "Failed",
      "testCasesPassed": 3,
      "totalTestCases": 5,
      "executionTime": 40,
      "isAccepted": false
    },
    {
      "submittedAt": "2025-10-13T10:15:00Z",
      "status": "Failed",
      "testCasesPassed": 4,
      "totalTestCases": 5,
      "executionTime": 50,
      "isAccepted": false
    },
    {
      "submittedAt": "2025-10-13T10:30:00Z",
      "status": "Failed",
      "testCasesPassed": 4,
      "totalTestCases": 5,
      "executionTime": 55,
      "isAccepted": false
    },
    {
      "submittedAt": "2025-10-13T10:45:00Z",
      "status": "Solved",
      "testCasesPassed": 5,
      "totalTestCases": 5,
      "executionTime": 42,
      "isAccepted": true
    }
  ],
  "hintsUsed": ["Try using a hash map to store complements"],
  "languagesAttempted": ["javascript"]
}
```

## 📈 Statistics Impact

### Before Solving
```json
{
  "totalQuestions": 50,
  "solvedQuestions": 24,
  "attemptedQuestions": 16,
  "totalSubmissions": 119,
  "successfulSubmissions": 24,
  "acceptanceRate": "20.17"
}
```

### After Solving
```json
{
  "totalQuestions": 50,
  "solvedQuestions": 25,  ← +1
  "attemptedQuestions": 15,  ← -1 (moved to solved)
  "totalSubmissions": 123,  ← +4 attempts
  "successfulSubmissions": 25,  ← +1
  "acceptanceRate": "20.33"  ← improved!
}
```

## 🎯 Key Interactions

1. **Question + Progress Link**: `questionId` connects both systems
2. **Dual Updates**: Submissions update both progress and question stats
3. **Real-time Stats**: Every action immediately updates user statistics
4. **Complete History**: Full code and results stored for every attempt
5. **Learning Aids**: Notes, hints, bookmarks help users learn
6. **Engagement**: Likes, ratings help curate best questions

## 🚀 Result

Every user action is tracked, creating a comprehensive learning profile that shows:
- What they've learned (solved questions)
- How they learned it (submission history)
- What helped them (hints used)
- What they're working on (bookmarks)
- Their progress over time (statistics)

This enables powerful features like:
- Personalized recommendations
- Adaptive difficulty progression
- Learning pattern analysis
- Peer comparison
- Achievement systems
- Progress visualization

**The platform knows exactly where each user is in their coding journey!** 🎉
