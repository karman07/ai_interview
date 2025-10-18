# DSA (Data Structures & Algorithms) Platform Implementation

## 🎯 Overview

This implementation provides a complete DSA practice platform with comprehensive features for tracking progress, solving problems, and analyzing performance. The platform integrates with a backend API that provides 36 endpoints across two main services: Questions API and Progress Tracking API.

## 📁 Project Structure

```
src/
├── api/
│   ├── dsaQuestions.ts          # API service for DSA questions
│   └── dsaProgress.ts           # API service for progress tracking
├── components/
│   └── dsa/
│       ├── CodeEditor.tsx       # Code editor component
│       ├── DSAStatCard.tsx      # Statistics card component
│       ├── QuestionCard.tsx     # Question display card
│       └── SubmissionHistory.tsx # Submission history component
├── contexts/
│   ├── DSAQuestionsContext.tsx  # State management for questions
│   └── DSAProgressContext.tsx   # State management for progress
├── pages/
│   └── DSA/
│       ├── DSADashboard.tsx            # Main dashboard page
│       ├── DSAQuestionsList.tsx        # Questions list with filters
│       └── DSAQuestionSolvePage.tsx    # Question detail & solve page
└── types/
    └── dsa.ts                   # TypeScript type definitions
```

## 🚀 Features Implemented

### 1. **DSA Questions Management**
- ✅ Browse all questions with filters (difficulty, category, tags)
- ✅ Search questions by keywords
- ✅ Sort by difficulty, likes, acceptance rate
- ✅ Pagination support
- ✅ View question statistics
- ✅ Get random questions (with difficulty filter)
- ✅ Like/Dislike questions
- ✅ Submit solutions

### 2. **Progress Tracking**
- ✅ Submit code solutions
- ✅ Track question status (Not Started, Attempted, Solved, Failed)
- ✅ View submission history
- ✅ Bookmark questions
- ✅ Add personal notes
- ✅ Rate questions
- ✅ Record hint usage
- ✅ Reset progress for questions

### 3. **Statistics & Analytics**
- ✅ User statistics dashboard
- ✅ Progress by difficulty (Easy, Medium, Hard)
- ✅ Progress by category
- ✅ Success rate tracking
- ✅ Time spent tracking
- ✅ Recent submissions
- ✅ Current streak tracking

### 4. **User Experience**
- ✅ Code editor with syntax highlighting
- ✅ Interactive hints system
- ✅ Test case management
- ✅ Responsive design
- ✅ Mobile-friendly interface

## 🔌 API Integration

### Questions API (12 Endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dsa-questions` | POST | Create a question (Admin) |
| `/dsa-questions` | GET | Get all questions with filters |
| `/dsa-questions/statistics` | GET | Get question statistics |
| `/dsa-questions/random` | GET | Get random question |
| `/dsa-questions/:id` | GET | Get single question |
| `/dsa-questions/:id` | PATCH | Update question (Admin) |
| `/dsa-questions/:id` | DELETE | Soft delete question (Admin) |
| `/dsa-questions/:id/hard` | DELETE | Hard delete question (Admin) |
| `/dsa-questions/:id/like` | POST | Like question |
| `/dsa-questions/:id/dislike` | POST | Dislike question |
| `/dsa-questions/:id/submit` | POST | Submit solution (update stats) |

### Progress API (12 Endpoints)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dsa-progress/:id/submit` | POST | Submit code solution |
| `/dsa-progress/my-progress` | GET | Get all user progress |
| `/dsa-progress/statistics` | GET | Get user statistics |
| `/dsa-progress/recent-submissions` | GET | Get recent submissions |
| `/dsa-progress/:id` | GET | Get question progress |
| `/dsa-progress/:id/submissions` | GET | Get submission history |
| `/dsa-progress/:id` | PATCH | Update progress metadata |
| `/dsa-progress/:id/like` | POST | Like question (user) |
| `/dsa-progress/:id/dislike` | POST | Dislike question (user) |
| `/dsa-progress/:id/hint` | POST | Record hint usage |
| `/dsa-progress/:id` | DELETE | Reset question progress |
| `/dsa-progress/all` | DELETE | Delete all progress |

## 🛠️ Usage

### 1. Access the DSA Platform

Navigate to the DSA section via the sidebar or directly:
- Dashboard: `/dsa`
- Questions List: `/dsa/questions`
- Solve Question: `/dsa/questions/:questionId`

### 2. Browse Questions

```typescript
// Filter by difficulty
GET /dsa-questions?difficulty=Easy

// Search questions
GET /dsa-questions?search=two sum

// Filter by category
GET /dsa-questions?category=Array

// Pagination
GET /dsa-questions?page=1&limit=10

// Sort results
GET /dsa-questions?sortBy=likes&sortOrder=desc
```

### 3. Solve a Question

1. Navigate to a question
2. Read the description, examples, and constraints
3. Write your solution in the code editor
4. Submit your solution
5. Track your progress

### 4. Track Progress

```typescript
// Get your statistics
GET /dsa-progress/statistics

// Get solved questions
GET /dsa-progress/my-progress?status=Solved

// Get bookmarked questions
GET /dsa-progress/my-progress?isBookmarked=true

// Get recent submissions
GET /dsa-progress/recent-submissions?limit=5
```

### 5. Submit a Solution

```typescript
POST /dsa-progress/:questionId/submit
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

## 🎨 Components

### QuestionCard
Displays a question with:
- Title and description
- Difficulty badge
- Status indicator
- Category tags
- Like/Dislike counts
- Acceptance rate

### CodeEditor
A code editor with:
- Syntax highlighting
- Line numbers
- Copy functionality
- Multi-language support
- Responsive design

### DSAStatCard
Statistics display card with:
- Title and value
- Subtitle
- Icon
- Color theming

### SubmissionHistory
Shows recent submissions with:
- Question details
- Status badges
- Test case results
- Execution time
- Timestamp

## 🔐 Authentication

All protected endpoints require JWT authentication. The token is automatically included in requests via the HTTP interceptor configured in `src/api/http.ts`.

## 📊 Data Models

### DSAQuestion
```typescript
interface DSAQuestion {
  questionId: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categories: string[];
  tags: string[];
  testCases: TestCase[];
  functionSignatures: FunctionSignature[];
  constraints: Constraints;
  hints: Hint[];
  examples: Example[];
  likes: number;
  dislikes: number;
  acceptanceRate: number;
}
```

### DSAProgress
```typescript
interface DSAProgress {
  userId: string;
  questionId: string;
  status: 'Not Started' | 'Attempted' | 'Solved' | 'Failed';
  attempts: number;
  submissions: Submission[];
  totalTimeSpent: number;
  isBookmarked: boolean;
  userNotes?: string;
  userRating?: number;
  hintsUsed: string[];
}
```

## 🎯 Key Features by Page

### DSA Dashboard (`/dsa`)
- Overview statistics
- Progress by difficulty
- Progress by category
- Recent submissions
- Quick actions (Browse, Random, Bookmarked)
- Solved questions list

### Questions List (`/dsa/questions`)
- Advanced filtering
- Search functionality
- Sort options
- Pagination
- User progress indicators
- Bookmark status

### Question Solve Page (`/dsa/questions/:id`)
- Problem description
- Examples and constraints
- Hints system
- Code editor
- Submission history
- Personal notes
- Rating system
- Like/Dislike functionality

## 🔄 State Management

The application uses React Context API for state management:

- **DSAQuestionsContext**: Manages questions data, filters, and actions
- **DSAProgressContext**: Manages user progress, submissions, and statistics

Both contexts provide:
- Loading states
- Error handling
- Optimistic UI updates
- Automatic data synchronization

## 🚦 Routing

New routes added to the application:

```typescript
routes = {
  dsaDashboard: '/dsa',
  dsaQuestions: '/dsa/questions',
  dsaQuestionDetails: (questionId: string) => `/dsa/questions/${questionId}`,
}
```

All DSA routes are protected and require authentication.

## 📱 Responsive Design

The platform is fully responsive:
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔧 Configuration

### API Base URL
Set in environment variables:
```
VITE_API_BASE_URL=http://localhost:3000
```

### Authentication
Uses JWT tokens stored in httpOnly cookies with automatic refresh functionality.

## 🧪 Testing the API

Use the provided cURL commands or the application UI to test all endpoints. See the main API documentation for complete cURL examples.

## 🎓 Learning Path

Recommended workflow:
1. Start with the DSA Dashboard to see your overview
2. Browse questions by difficulty (start with Easy)
3. Select a question and study the problem
4. Write your solution in the code editor
5. Submit and track your progress
6. Review statistics to identify improvement areas

## 🌟 Best Practices

1. **Start with Easy problems** to build confidence
2. **Use bookmarks** to save questions for later review
3. **Add notes** to remember key insights
4. **Review submission history** to learn from mistakes
5. **Track your progress** regularly on the dashboard
6. **Use hints wisely** - try solving first before revealing

## 🤝 Contributing

When adding new features:
1. Update type definitions in `src/types/dsa.ts`
2. Add API methods in `src/api/`
3. Update context providers if needed
4. Create/update components in `src/components/dsa/`
5. Update pages in `src/pages/DSA/`
6. Test thoroughly before deployment

## 📝 Notes

- All timestamps are stored in ISO 8601 format
- Execution times are in milliseconds
- Memory usage is in MB
- Time spent is in seconds
- Ratings are on a scale of 0-100

---

**Built with React, TypeScript, and Tailwind CSS**
