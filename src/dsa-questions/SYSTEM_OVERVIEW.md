# DSA Questions + Progress Tracking - Complete System Overview

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Application                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS Backend API                            │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            DsaQuestionsModule                              │  │
│  │                                                             │  │
│  │  ┌─────────────────────────┐  ┌────────────────────────┐  │  │
│  │  │  DsaQuestionsController │  │ DsaProgressController  │  │  │
│  │  │                          │  │                        │  │  │
│  │  │ • Create Question        │  │ • Record Submission    │  │  │
│  │  │ • Get Questions          │  │ • Get Progress         │  │  │
│  │  │ • Update Question        │  │ • Get Statistics       │  │  │
│  │  │ • Delete Question        │  │ • Bookmark             │  │  │
│  │  │ • Get Statistics         │  │ • Like/Dislike         │  │  │
│  │  │ • Random Question        │  │ • Track Hints          │  │  │
│  │  │ • Like/Dislike           │  │ • Reset Progress       │  │  │
│  │  │ • Submit Solution        │  │ • Get History          │  │  │
│  │  └────────┬────────────────┘  └──────────┬─────────────┘  │  │
│  │           │                                │                 │  │
│  │           ▼                                ▼                 │  │
│  │  ┌─────────────────────────┐  ┌────────────────────────┐  │  │
│  │  │  DsaQuestionsService    │  │  DsaProgressService    │  │  │
│  │  │                          │  │                        │  │  │
│  │  │ • Business Logic         │  │ • Track Submissions    │  │  │
│  │  │ • CRUD Operations        │  │ • Calculate Stats      │  │  │
│  │  │ • Filtering/Sorting      │  │ • Manage Bookmarks     │  │  │
│  │  │ • Search                 │  │ • Track Time           │  │  │
│  │  │ • Statistics             │  │ • History Management   │  │  │
│  │  └────────┬────────────────┘  └──────────┬─────────────┘  │  │
│  │           │                                │                 │  │
│  │           ▼                                ▼                 │  │
│  │  ┌─────────────────────────┐  ┌────────────────────────┐  │  │
│  │  │   DsaQuestion Schema    │  │  DsaProgress Schema    │  │  │
│  │  │                          │  │                        │  │  │
│  │  │ • Question Data          │  │ • User Progress        │  │  │
│  │  │ • Test Cases             │  │ • Submissions          │  │  │
│  │  │ • Solutions              │  │ • Time Tracking        │  │  │
│  │  │ • Hints                  │  │ • Status               │  │  │
│  │  │ • Examples               │  │ • Bookmarks            │  │  │
│  │  └────────┬────────────────┘  └──────────┬─────────────┘  │  │
│  └───────────┼─────────────────────────────┼────────────────┘  │
└──────────────┼─────────────────────────────┼───────────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                         MongoDB Database                          │
│                                                                   │
│  ┌──────────────────────┐      ┌──────────────────────────┐     │
│  │  dsaquestions        │      │      dsaprogresses       │     │
│  │  Collection          │      │      Collection           │     │
│  │                      │      │                           │     │
│  │ • questionId (idx)   │◄─────┤ • userId (idx)            │     │
│  │ • title              │      │ • questionId (idx)        │     │
│  │ • difficulty         │      │ • status                  │     │
│  │ • categories         │      │ • submissions[]           │     │
│  │ • testCases[]        │      │ • totalAttempts           │     │
│  │ • solutions[]        │      │ • bestExecutionTime       │     │
│  │ • hints[]            │      │ • isBookmarked            │     │
│  └──────────────────────┘      └──────────────────────────┘     │
└───────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. User Solves a Question

```
User submits code
        │
        ▼
POST /dsa-progress/:questionId/submit
        │
        ▼
DsaProgressController
        │
        ▼
DsaProgressService.recordSubmission()
        │
        ├─► Find or Create Progress Document
        │
        ├─► Add Submission to History
        │
        ├─► Update Status (Solved/Failed)
        │
        ├─► Update Time Tracking
        │
        ├─► Update Best Execution Time
        │
        └─► Save to MongoDB
                │
                ▼
        Return Updated Progress
```

### 2. User Views Dashboard

```
User opens dashboard
        │
        ▼
GET /dsa-progress/statistics
        │
        ▼
DsaProgressController
        │
        ▼
DsaProgressService.getUserStatistics()
        │
        ├─► Query All User Progress
        │
        ├─► Calculate Total Questions
        │
        ├─► Calculate Solved Questions
        │
        ├─► Calculate Acceptance Rate
        │
        ├─► Calculate Time Stats
        │
        └─► Aggregate Language Usage
                │
                ▼
        Return Statistics Object
```

### 3. User Bookmarks Question

```
User clicks bookmark
        │
        ▼
PATCH /dsa-progress/:questionId
Body: { isBookmarked: true }
        │
        ▼
DsaProgressController
        │
        ▼
DsaProgressService.updateProgress()
        │
        ├─► Find Progress Document
        │
        ├─► Update Bookmark Status
        │
        └─► Save to MongoDB
                │
                ▼
        Return Updated Progress
```

## 📊 Database Relationships

```
┌─────────────┐
│    User     │
│             │
│  • _id      │◄─────────────┐
│  • email    │              │
│  • name     │              │ (userId reference)
└─────────────┘              │
                             │
                    ┌────────┴──────────┐
                    │   DsaProgress     │
                    │                   │
                    │  • userId         │
                    │  • questionId     │──────┐
                    │  • status         │      │
                    │  • submissions[]  │      │ (questionId reference)
                    │  • bookmarked     │      │
                    └───────────────────┘      │
                                               │
                                        ┌──────▼────────┐
                                        │  DsaQuestion  │
                                        │               │
                                        │  • questionId │
                                        │  • title      │
                                        │  • testCases[]│
                                        └───────────────┘
```

## 🎯 Complete Feature Matrix

| Feature | Questions Module | Progress Module |
|---------|-----------------|-----------------|
| **CRUD Operations** | ✅ | ✅ |
| **Authentication** | ✅ | ✅ |
| **Filtering** | ✅ (difficulty, category, tags) | ✅ (status, bookmarked, solved) |
| **Pagination** | ✅ | ✅ |
| **Search** | ✅ (title, description) | ❌ |
| **Sorting** | ✅ | ✅ (by date) |
| **Statistics** | ✅ (global) | ✅ (per user) |
| **Like/Dislike** | ✅ (global count) | ✅ (per user) |
| **Bookmarks** | ❌ | ✅ |
| **Time Tracking** | ❌ | ✅ |
| **Submission History** | ❌ | ✅ |
| **Code Storage** | ❌ | ✅ |
| **Hints Tracking** | ❌ | ✅ |
| **Personal Notes** | ❌ | ✅ |
| **User Ratings** | ❌ | ✅ |

## 🔌 Complete API Reference

### Questions Endpoints (12)

```
POST   /dsa-questions                    - Create question
GET    /dsa-questions                    - List questions (with filters)
GET    /dsa-questions/statistics         - Global statistics
GET    /dsa-questions/random             - Random question
GET    /dsa-questions/:questionId        - Get single question
PATCH  /dsa-questions/:questionId        - Update question
DELETE /dsa-questions/:questionId        - Soft delete
DELETE /dsa-questions/:questionId/hard   - Hard delete
POST   /dsa-questions/:questionId/like   - Like question
POST   /dsa-questions/:questionId/dislike - Dislike question
POST   /dsa-questions/:questionId/submit - Submit solution
POST   /dsa-questions/seed               - Seed sample data
```

### Progress Endpoints (12)

```
POST   /dsa-progress/:questionId/submit     - Record submission
GET    /dsa-progress/my-progress            - Get all progress
GET    /dsa-progress/statistics             - User statistics
GET    /dsa-progress/recent-submissions     - Recent activity
GET    /dsa-progress/:questionId            - Question progress
GET    /dsa-progress/:questionId/submissions - Submission history
PATCH  /dsa-progress/:questionId            - Update metadata
POST   /dsa-progress/:questionId/like       - Toggle like
POST   /dsa-progress/:questionId/dislike    - Toggle dislike
POST   /dsa-progress/:questionId/hint       - Record hint usage
DELETE /dsa-progress/:questionId            - Reset progress
DELETE /dsa-progress/all                    - Delete all progress
```

## 💡 Common Use Cases

### Case 1: User Starts a Question
```
1. GET /dsa-questions/random?difficulty=Medium
   → Returns random medium question
   
2. GET /dsa-progress/two-sum
   → Check if user has attempted before
   → Load previous submissions if any
```

### Case 2: User Submits Solution
```
1. POST /dsa-progress/two-sum/submit
   → Record submission with results
   → Update progress status
   
2. POST /dsa-questions/two-sum/submit
   → Update global question statistics
   → Increment submission count
```

### Case 3: User Views Their Dashboard
```
1. GET /dsa-progress/statistics
   → Overall user statistics
   
2. GET /dsa-progress/recent-submissions?limit=5
   → Recent activity
   
3. GET /dsa-progress/my-progress?status=Solved
   → All solved questions
   
4. GET /dsa-progress/my-progress?isBookmarked=true
   → Bookmarked questions
```

### Case 4: User Reviews Past Submissions
```
1. GET /dsa-progress/two-sum
   → Get overall progress for question
   
2. GET /dsa-progress/two-sum/submissions
   → Get full submission history
   → View all code attempts
   → See test results over time
```

## 🎨 Frontend Integration Example

```typescript
// Question Solving Page Component
const QuestionPage = ({ questionId }) => {
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(null);
  const [code, setCode] = useState('');
  
  useEffect(() => {
    // Load question
    fetch(`/dsa-questions/${questionId}`)
      .then(r => r.json())
      .then(setQuestion);
    
    // Load user's progress
    fetch(`/dsa-progress/${questionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setProgress);
  }, [questionId]);
  
  const handleSubmit = async (results) => {
    // Record in progress
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
        executionTime: results.time,
        timeSpent: getTimeSpent()
      })
    });
    
    // Update global stats
    await fetch(`/dsa-questions/${questionId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: 'javascript',
        isAccepted: results.allPassed
      })
    });
  };
  
  return (
    <div>
      <h1>{question?.title}</h1>
      <CodeEditor value={code} onChange={setCode} />
      <Button onClick={handleSubmit}>Submit</Button>
      
      {progress && (
        <ProgressStats
          attempts={progress.totalAttempts}
          solved={progress.status === 'Solved'}
          bestTime={progress.bestExecutionTime}
        />
      )}
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  
  useEffect(() => {
    fetch('/dsa-progress/statistics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setStats);
    
    fetch('/dsa-progress/recent-submissions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setRecent);
  }, []);
  
  return (
    <div>
      <StatsCards stats={stats} />
      <RecentActivity submissions={recent} />
      <ProgressChart data={stats} />
    </div>
  );
};
```

## 🚀 Deployment Checklist

- [x] Schemas defined with proper indexes
- [x] DTOs with validation decorators
- [x] Services with business logic
- [x] Controllers with proper guards
- [x] Module configuration complete
- [x] Swagger documentation added
- [x] Error handling implemented
- [x] No TypeScript errors
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Load testing performed
- [ ] Frontend integration complete

## 📈 Analytics Possibilities

With this system, you can analyze:

1. **User Behavior**
   - Time spent per difficulty level
   - Success rate trends over time
   - Language preferences
   - Hint usage patterns

2. **Question Quality**
   - Which questions are too hard/easy
   - Questions with high bookmark rates
   - Questions that take longest to solve
   - Most liked/disliked questions

3. **Learning Patterns**
   - Optimal difficulty progression
   - Common mistakes (from failed submissions)
   - Average attempts before success
   - Time-to-solve distributions

4. **Platform Metrics**
   - Daily active users
   - Retention rates
   - Completion rates
   - Popular categories

## 🎉 Summary

You now have a **complete LeetCode-style platform** with:

✅ **Questions System**: 12 endpoints for managing coding problems  
✅ **Progress Tracking**: 12 endpoints for user journey monitoring  
✅ **Rich Data Models**: Questions with test cases, solutions, hints  
✅ **Comprehensive Tracking**: Every submission, attempt, and interaction  
✅ **Statistics Dashboard**: Personal and global analytics  
✅ **User Features**: Bookmarks, notes, ratings, likes  
✅ **Developer Experience**: Full Swagger docs, TypeScript types  
✅ **Production Ready**: Proper validation, error handling, authentication  

**Total: 24 API endpoints** across two integrated systems! 🚀
