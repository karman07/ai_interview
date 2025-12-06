# DSA Questions Module

## Overview

The DSA (Data Structures & Algorithms) Questions Module is a comprehensive platform for coding interview preparation. It provides a complete system for managing DSA problems, tracking user progress, executing code in multiple languages, and validating solutions with automated test cases.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client/Frontend                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DSA Questions Module                        │
├─────────────────────────────────────────────────────────────────┤
│  Controllers:                                                    │
│  • DsaQuestionsController    → Question CRUD & filtering        │
│  • DsaProgressController     → User progress tracking           │
│  • CodeExecutionController   → Code execution & validation      │
├─────────────────────────────────────────────────────────────────┤
│  Services:                                                       │
│  • DsaQuestionsService       → Question management logic        │
│  • DsaProgressService        → Progress tracking & statistics   │
│  • CodeExecutionService      → Code execution orchestration     │
│  • TestRunnerService         → Test case execution & validation │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer:                                                     │
│  • DsaQuestion Schema        → Question definitions             │
│  • DsaProgress Schema        → User progress records            │
│  • ExecutionResult Schema    → Code execution history           │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### ✅ Core Features
- **Question Management**: CRUD operations for DSA questions
- **Multi-language Support**: JavaScript, Python, Java, C++, TypeScript
- **Code Execution**: Real-time code execution with test cases
- **Progress Tracking**: Track solved/attempted questions per user
- **Difficulty Levels**: Easy, Medium, Hard
- **Topic Categories**: Arrays, Strings, Trees, Graphs, Dynamic Programming, etc.
- **Bookmarking**: Save questions for later
- **Hints System**: Progressive hints for each question
- **Like/Dislike**: Community feedback on questions
- **Submission History**: Track all attempts with timestamps
- **Statistics Dashboard**: Personal analytics and insights

### 🎯 Advanced Features
- **Test Case Validation**: Automated testing with expected outputs
- **Complexity Analysis**: Time and space complexity tracking
- **Custom Test Cases**: Run code with user-defined inputs
- **Solution Templates**: Starter code for each language
- **Hidden Test Cases**: Comprehensive validation beyond sample tests
- **Pagination & Filtering**: Advanced query capabilities
- **Soft Delete**: Safe deletion with recovery option

## API Endpoints

### 1. Question Management

#### Get All Questions (with filtering)
```http
GET /dsa-questions
Query Parameters:
  - difficulty: easy | medium | hard
  - topic: arrays | strings | trees | graphs | dp | etc
  - status: solved | attempted | unsolved
  - tags: comma-separated list
  - search: keyword search
  - page: number (default: 1)
  - limit: number (default: 20)
  - sortBy: createdAt | difficulty | likes
  - sortOrder: asc | desc
```

**Response:**
```json
{
  "questions": [
    {
      "_id": "q1",
      "questionId": "two-sum",
      "title": "Two Sum",
      "difficulty": "easy",
      "topic": "arrays",
      "description": "Given an array of integers...",
      "examples": [...],
      "constraints": [...],
      "hints": ["Try using a hash map", "..."],
      "tags": ["array", "hash-table"],
      "likes": 150,
      "dislikes": 5,
      "submissions": 500,
      "acceptedSubmissions": 350,
      "acceptanceRate": 70.0
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

#### Get Single Question
```http
GET /dsa-questions/:questionId?includeSolutions=true
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "_id": "q1",
  "questionId": "two-sum",
  "title": "Two Sum",
  "difficulty": "easy",
  "topic": "arrays",
  "description": "Given an array of integers nums and an integer target...",
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]"
    }
  ],
  "constraints": [
    "2 <= nums.length <= 10^4",
    "Only one valid answer exists"
  ],
  "hints": [
    "Try using a hash map to store complements",
    "For each number, check if target - number exists in the map"
  ],
  "starterCode": {
    "javascript": "function twoSum(nums, target) {\n  // Your code here\n}",
    "python": "def twoSum(nums, target):\n    # Your code here\n    pass",
    "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}",
    "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};"
  },
  "testCases": [
    {
      "input": "[2,7,11,15], 9",
      "expectedOutput": "[0,1]",
      "isHidden": false
    }
  ],
  "solutions": [
    {
      "language": "javascript",
      "code": "function twoSum(nums, target) {...}",
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "explanation": "Using hash map for O(n) solution"
    }
  ],
  "companies": ["Amazon", "Google", "Facebook"],
  "relatedQuestions": ["three-sum", "four-sum"],
  "tags": ["array", "hash-table"],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T00:00:00Z"
}
```

#### Create Question (Admin)
```http
POST /dsa-questions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "questionId": "two-sum",
  "title": "Two Sum",
  "difficulty": "easy",
  "topic": "arrays",
  "description": "Given an array...",
  "examples": [...],
  "constraints": [...],
  "hints": [...],
  "starterCode": {...},
  "testCases": [...],
  "solutions": [...],
  "tags": ["array", "hash-table"]
}
```

#### Update Question
```http
PATCH /dsa-questions/:questionId
Authorization: Bearer <jwt_token>
```

#### Delete Question (Soft Delete)
```http
DELETE /dsa-questions/:questionId
Authorization: Bearer <jwt_token>
```

#### Hard Delete Question
```http
DELETE /dsa-questions/:questionId/hard
Authorization: Bearer <jwt_token>
```

#### Get Random Question
```http
GET /dsa-questions/random?difficulty=medium
```

#### Get Question Statistics
```http
GET /dsa-questions/statistics
```

**Response:**
```json
{
  "total": 500,
  "byDifficulty": {
    "easy": 150,
    "medium": 250,
    "hard": 100
  },
  "byTopic": {
    "arrays": 80,
    "strings": 60,
    "trees": 50,
    "graphs": 40,
    "dp": 30
  },
  "totalSubmissions": 50000,
  "totalAccepted": 30000,
  "avgAcceptanceRate": 60.0
}
```

#### Like/Dislike Question
```http
POST /dsa-questions/:questionId/like
POST /dsa-questions/:questionId/dislike
Authorization: Bearer <jwt_token>
```

### 2. Progress Tracking

#### Get My Progress
```http
GET /dsa-progress/my-progress
Authorization: Bearer <jwt_token>
Query Parameters:
  - status: solved | attempted | unsolved
  - isBookmarked: true | false
  - isSolved: true | false
```

**Response:**
```json
{
  "progress": [
    {
      "questionId": "two-sum",
      "status": "solved",
      "attempts": 3,
      "bestSubmission": {
        "code": "...",
        "language": "javascript",
        "runtime": 85,
        "memory": 42.5,
        "timestamp": "2025-01-15T10:30:00Z"
      },
      "isBookmarked": false,
      "hintsUsed": 1,
      "lastAttemptAt": "2025-01-15T10:30:00Z"
    }
  ],
  "summary": {
    "total": 100,
    "solved": 45,
    "attempted": 30,
    "unsolved": 25
  }
}
```

#### Get User Statistics
```http
GET /dsa-progress/statistics
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "userId": "user-123",
  "solvedQuestions": 45,
  "attemptedQuestions": 30,
  "totalSubmissions": 120,
  "successfulSubmissions": 45,
  "acceptanceRate": "37.5",
  "totalTimeSpent": 36000,
  "averageTimePerQuestion": 800,
  "languagesUsed": ["javascript", "python"],
  "bookmarkedCount": 10,
  "difficultyBreakdown": {
    "easy": { "solved": 20, "attempted": 5 },
    "medium": { "solved": 20, "attempted": 15 },
    "hard": { "solved": 5, "attempted": 10 }
  },
  "topicBreakdown": {
    "arrays": { "solved": 15, "attempted": 5 },
    "strings": { "solved": 10, "attempted": 3 }
  },
  "streakDays": 7,
  "lastActiveDate": "2025-01-15T00:00:00Z"
}
```

#### Get Recent Submissions
```http
GET /dsa-progress/recent-submissions?limit=10
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "submissions": [
    {
      "questionId": "two-sum",
      "questionTitle": "Two Sum",
      "language": "javascript",
      "status": "accepted",
      "runtime": 85,
      "memory": 42.5,
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Question Progress
```http
GET /dsa-progress/:questionId
Authorization: Bearer <jwt_token>
```

#### Get Submission History
```http
GET /dsa-progress/:questionId/submissions
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "questionId": "two-sum",
  "submissions": [
    {
      "submissionId": "sub-123",
      "code": "function twoSum(nums, target) {...}",
      "language": "javascript",
      "status": "accepted",
      "runtime": 85,
      "memory": 42.5,
      "testResults": {
        "passed": 10,
        "total": 10
      },
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Record Submission
```http
POST /dsa-progress/:questionId/submit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "code": "function twoSum(nums, target) {...}",
  "language": "javascript",
  "status": "accepted",
  "runtime": 85,
  "memory": 42.5,
  "timeSpent": 1200,
  "testsPassed": 10,
  "totalTests": 10
}
```

#### Update Progress (Bookmark, Notes, etc.)
```http
PATCH /dsa-progress/:questionId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "isBookmarked": true,
  "notes": "Remember to use hash map approach"
}
```

#### Toggle Like/Dislike
```http
POST /dsa-progress/:questionId/like
POST /dsa-progress/:questionId/dislike
Authorization: Bearer <jwt_token>
```

#### Add Hint Used
```http
POST /dsa-progress/:questionId/hint
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hintIndex": 0
}
```

#### Reset Progress
```http
DELETE /dsa-progress/:questionId
Authorization: Bearer <jwt_token>
```

#### Delete All Progress
```http
DELETE /dsa-progress
Authorization: Bearer <jwt_token>
```

### 3. Code Execution

#### Run Code with Test Cases
```http
POST /code-execution/:questionId/run
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "code": "function twoSum(nums, target) {...}",
  "language": "javascript",
  "includeHiddenTests": false,
  "testCaseIndices": [0, 1, 2]
}
```

**Response:**
```json
{
  "questionId": "two-sum",
  "userId": "user-123",
  "language": "javascript",
  "status": "Success",
  "testResults": [
    {
      "testCaseIndex": 0,
      "input": "[2,7,11,15], 9",
      "expectedOutput": "[0,1]",
      "actualOutput": "[0,1]",
      "passed": true,
      "executionTime": 42,
      "memoryUsed": 15.5,
      "error": null
    }
  ],
  "totalTestCases": 5,
  "passedTestCases": 5,
  "failedTestCases": 0,
  "totalExecutionTime": 210,
  "averageExecutionTime": 42,
  "maxMemoryUsed": 15.5,
  "allTestsPassed": true,
  "complexityAnalysis": {
    "estimatedTimeComplexity": "O(n)",
    "estimatedSpaceComplexity": "O(n)",
    "meetsRequirements": true,
    "analysis": "Single loop detected. Additional data structures used."
  }
}
```

#### Validate Solution (Run All Tests)
```http
POST /code-execution/:questionId/validate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "code": "function twoSum(nums, target) {...}",
  "language": "javascript"
}
```

**Response:**
```json
{
  "status": "Success",
  "allTestsPassed": true,
  "passedTestCases": 10,
  "totalTestCases": 10,
  "averageExecutionTime": 38,
  "complexityAnalysis": {
    "estimatedTimeComplexity": "O(n)",
    "meetsRequirements": true
  }
}
```

#### Run Custom Tests
```http
POST /code-execution/run-custom
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "code": "function twoSum(nums, target) {...}",
  "language": "javascript",
  "testCases": [
    {
      "input": "[1,2,3], 5",
      "expectedOutput": "[1,2]"
    }
  ]
}
```

**Response:**
```json
{
  "status": "Success",
  "testResults": [
    {
      "testCaseIndex": 0,
      "input": "[1,2,3], 5",
      "expectedOutput": "[1,2]",
      "actualOutput": "[1,2]",
      "passed": true,
      "executionTime": 35
    }
  ],
  "allTestsPassed": true
}
```

#### Get Complexity Requirements
```http
GET /code-execution/:questionId/complexity
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)"
}
```

#### Get Execution History
```http
GET /code-execution/history?questionId=two-sum&limit=10
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "history": [
    {
      "executionId": "exec-123",
      "questionId": "two-sum",
      "language": "javascript",
      "status": "Success",
      "passedTestCases": 5,
      "totalTestCases": 5,
      "allTestsPassed": true,
      "submittedAt": "2025-10-14T10:00:00Z"
    }
  ]
}
```

#### Get Execution Result
```http
GET /code-execution/result/:executionId
Authorization: Bearer <jwt_token>
```

## Data Models

### DsaQuestion Schema
```typescript
{
  questionId: string;           // Unique slug (e.g., "two-sum")
  title: string;                // Display title
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;                // Main category
  description: string;          // Problem statement (HTML)
  examples: [{
    input: string;
    output: string;
    explanation?: string;
  }];
  constraints: string[];
  hints: string[];
  starterCode: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
    typescript?: string;
  };
  testCases: [{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }];
  solutions?: [{
    language: string;
    code: string;
    timeComplexity: string;
    spaceComplexity: string;
    explanation: string;
  }];
  timeComplexity?: string;
  spaceComplexity?: string;
  companies?: string[];
  relatedQuestions?: string[];
  tags: string[];
  likes: number;
  dislikes: number;
  submissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  isDeleted: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### DsaProgress Schema
```typescript
{
  userId: string;
  questionId: string;
  status: 'solved' | 'attempted' | 'unsolved';
  attempts: number;
  submissions: [{
    submissionId: string;
    code: string;
    language: string;
    status: 'accepted' | 'wrong-answer' | 'runtime-error' | 'time-limit';
    runtime?: number;
    memory?: number;
    testResults?: {
      passed: number;
      total: number;
    };
    submittedAt: Date;
  }];
  bestSubmission?: {
    code: string;
    language: string;
    runtime: number;
    memory: number;
  };
  isBookmarked: boolean;
  hintsUsed: number[];
  notes?: string;
  timeSpent: number;
  lastAttemptAt: Date;
  solvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### ExecutionResult Schema
```typescript
{
  userId: string;
  questionId: string;
  code: string;
  language: string;
  status: 'Success' | 'Failed' | 'Error';
  testResults: [{
    testCaseIndex: number;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    executionTime: number;
    memoryUsed: number;
    error?: string;
  }];
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  maxMemoryUsed: number;
  allTestsPassed: boolean;
  complexityAnalysis?: {
    estimatedTimeComplexity: string;
    estimatedSpaceComplexity: string;
    meetsRequirements: boolean;
    analysis: string;
  };
  executedAt: Date;
}
```

## Supported Languages

| Language   | Extension | Execution Environment |
|------------|-----------|----------------------|
| JavaScript | `.js`     | Node.js              |
| Python     | `.py`     | Python 3.x           |
| Java       | `.java`   | JDK 11+              |
| C++        | `.cpp`    | g++ compiler         |
| TypeScript | `.ts`     | ts-node              |

## Configuration

### Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai_interview

# Code Execution
CODE_EXECUTION_TIMEOUT=10000
MAX_CODE_LENGTH=10000
ENABLE_HIDDEN_TESTS=true

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Rate Limiting
MAX_SUBMISSIONS_PER_HOUR=50
MAX_EXECUTIONS_PER_MINUTE=10
```

## Module Structure

```
src/dsa-questions/
├── controllers/
│   ├── dsa-questions.controller.ts     # Question CRUD & filtering
│   ├── dsa-progress.controller.ts      # Progress tracking
│   └── code-execution.controller.ts    # Code execution
├── services/
│   ├── dsa-questions.service.ts        # Question business logic
│   ├── dsa-progress.service.ts         # Progress tracking logic
│   ├── code-execution.service.ts       # Execution orchestration
│   └── test-runner.service.ts          # Test case validation
├── schemas/
│   ├── dsa-question.schema.ts          # Question model
│   ├── dsa-progress.schema.ts          # Progress model
│   └── execution-result.schema.ts      # Execution history model
├── dto/
│   ├── create-dsa-question.dto.ts
│   ├── update-dsa-question.dto.ts
│   ├── filter-dsa-questions.dto.ts
│   ├── progress.dto.ts
│   └── execute-code.dto.ts
├── seed-data/
│   └── questions.json                  # Sample questions
├── dsa-questions.module.ts             # Module definition
└── DSA_MODULE_README.md                # This file
```

## Usage Examples

### Frontend Integration (React)

#### Fetch and Display Questions

```tsx
import { useState, useEffect } from 'react';

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: '',
    topic: '',
    page: 1
  });

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    const queryParams = new URLSearchParams({
      difficulty: filters.difficulty,
      topic: filters.topic,
      page: filters.page.toString(),
      limit: '20'
    });

    const response = await fetch(
      `/dsa-questions?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const data = await response.json();
    setQuestions(data.questions);
  };

  return (
    <div>
      {/* Filters */}
      <div>
        <select onChange={(e) => setFilters({...filters, difficulty: e.target.value})}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Question List */}
      <div>
        {questions.map(q => (
          <div key={q._id}>
            <h3>{q.title}</h3>
            <span className={`difficulty-${q.difficulty}`}>
              {q.difficulty}
            </span>
            <p>Acceptance: {q.acceptanceRate}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Code Editor and Execution

```tsx
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

function CodeEditor({ questionId }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/code-execution/${questionId}/run`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code,
            language,
            includeHiddenTests: false
          })
        }
      );

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Execution failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitSolution = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/code-execution/${questionId}/validate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code, language })
        }
      );

      const data = await response.json();
      
      if (data.allTestsPassed) {
        // Record submission in progress
        await fetch(`/dsa-progress/${questionId}/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code,
            language,
            status: 'accepted',
            runtime: data.averageExecutionTime,
            testsPassed: data.passedTestCases,
            totalTests: data.totalTestCases
          })
        });

        alert('Solution Accepted! 🎉');
      } else {
        alert('Some tests failed. Keep trying!');
      }
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Language Selector */}
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
      </select>

      {/* Code Editor */}
      <CodeMirror
        value={code}
        height="400px"
        extensions={[javascript()]}
        onChange={(value) => setCode(value)}
      />

      {/* Action Buttons */}
      <div>
        <button onClick={runCode} disabled={loading}>
          Run Code
        </button>
        <button onClick={submitSolution} disabled={loading}>
          Submit Solution
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="results">
          <h3>Test Results</h3>
          <p>Status: {results.status}</p>
          <p>Passed: {results.passedTestCases}/{results.totalTestCases}</p>
          
          {results.testResults.map((test, idx) => (
            <div key={idx} className={test.passed ? 'pass' : 'fail'}>
              <p>Test {idx + 1}: {test.passed ? '✓' : '✗'}</p>
              <p>Input: {test.input}</p>
              <p>Expected: {test.expectedOutput}</p>
              <p>Actual: {test.actualOutput}</p>
              <p>Time: {test.executionTime}ms</p>
            </div>
          ))}

          {results.complexityAnalysis && (
            <div>
              <h4>Complexity Analysis</h4>
              <p>Time: {results.complexityAnalysis.estimatedTimeComplexity}</p>
              <p>Space: {results.complexityAnalysis.estimatedSpaceComplexity}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### Progress Dashboard

```tsx
function ProgressDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    const response = await fetch('/dsa-progress/statistics', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    setStats(data);
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>Your Progress</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.solvedQuestions}</h3>
          <p>Questions Solved</p>
        </div>
        <div className="stat-card">
          <h3>{stats.acceptanceRate}%</h3>
          <p>Acceptance Rate</p>
        </div>
        <div className="stat-card">
          <h3>{stats.streakDays}</h3>
          <p>Day Streak 🔥</p>
        </div>
      </div>

      <div className="difficulty-breakdown">
        <h3>By Difficulty</h3>
        <div>
          <p>Easy: {stats.difficultyBreakdown.easy.solved} solved</p>
          <p>Medium: {stats.difficultyBreakdown.medium.solved} solved</p>
          <p>Hard: {stats.difficultyBreakdown.hard.solved} solved</p>
        </div>
      </div>

      <div className="topic-breakdown">
        <h3>By Topic</h3>
        {Object.entries(stats.topicBreakdown).map(([topic, data]) => (
          <p key={topic}>
            {topic}: {data.solved} solved, {data.attempted} attempted
          </p>
        ))}
      </div>
    </div>
  );
}
```

## Security & Best Practices

### Authentication
- All endpoints require JWT authentication (except public question listing)
- User context extracted from JWT token
- Rate limiting on code execution endpoints

### Code Execution Safety
- Timeout limits to prevent infinite loops
- Memory limits to prevent resource exhaustion
- Sandboxed execution environment
- Input sanitization and validation
- No access to file system or network

### Data Validation
- DTOs with class-validator decorators
- Input length limits
- Test case validation
- Language whitelist

## Error Handling

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Question or resource not found |
| 408 | Request Timeout | Code execution timeout |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "code",
      "message": "Code length exceeds maximum limit"
    }
  ]
}
```

## Performance Optimization

### Implemented Optimizations
- **Pagination**: Limit query results with cursor-based pagination
- **Indexing**: MongoDB indexes on frequently queried fields (questionId, userId, difficulty, topic)
- **Caching**: Cache question metadata and test cases
- **Lazy Loading**: Load solutions and hidden tests only when needed
- **Async Processing**: Non-blocking code execution
- **Connection Pooling**: Efficient database connections

### Recommended Practices
- Use query filters to reduce data transfer
- Implement client-side caching for question lists
- Debounce code execution requests
- Prefetch commonly accessed questions

## Testing

### Unit Tests
```bash
npm run test:dsa-questions
```

### Integration Tests
```bash
npm run test:integration:dsa
```

### Test Coverage
- Controllers: 90%+
- Services: 95%+
- Schemas: 100%

## Monitoring & Analytics

### Key Metrics
- Questions solved per user
- Average time per difficulty level
- Language popularity
- Acceptance rates by topic
- Daily active users
- Code execution success rate

### Logging
- All code executions logged
- User progress tracked
- Error logs with stack traces
- Performance metrics

## Future Enhancements

- [ ] Real-time collaborative coding
- [ ] Video solutions for questions
- [ ] Discussion forums per question
- [ ] Contest mode with leaderboards
- [ ] AI-powered hints
- [ ] Code review and feedback
- [ ] Interview simulation mode
- [ ] Company-specific question sets
- [ ] Mobile app support
- [ ] Offline mode

## Contributing

### Adding New Questions

1. Prepare question data following the schema
2. Include multiple test cases (sample + hidden)
3. Provide starter code for all supported languages
4. Add comprehensive hints
5. Write at least one optimal solution with complexity analysis

### Code Submission Guidelines

- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Update DTOs and schemas as needed
- Document new endpoints in this README

## Troubleshooting

### Code Execution Issues

**Problem**: Code timeout
- **Solution**: Optimize algorithm, check for infinite loops

**Problem**: Memory limit exceeded
- **Solution**: Use more efficient data structures

**Problem**: Wrong Answer
- **Solution**: Review test cases, check edge cases

### API Issues

**Problem**: 401 Unauthorized
- **Solution**: Check JWT token validity and format

**Problem**: Questions not loading
- **Solution**: Verify MongoDB connection, check filters

## Support

For issues or questions:
- Check existing documentation
- Review error logs
- Contact the development team

## License

Private - Internal Use Only

---

**Version**: 1.0.0  
**Last Updated**: December 6, 2025  
**Maintained by**: AI Interview Platform Team
