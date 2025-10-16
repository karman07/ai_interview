# DSA Questions Module

A comprehensive LeetCode-style DSA (Data Structures & Algorithms) questions management system built with NestJS.

## Features

✅ **Complete CRUD Operations**
- Create, Read, Update, Delete DSA questions
- Soft delete support (set isActive flag)
- Hard delete for permanent removal

✅ **Advanced Filtering & Search**
- Filter by difficulty (Easy, Medium, Hard)
- Filter by categories (Array, Tree, Graph, etc.)
- Filter by tags (Company names, topics)
- Full-text search in title and description
- Pagination support
- Sorting by multiple fields

✅ **Rich Question Schema**
- Multiple programming language support
- Test cases (visible and hidden)
- Function signatures/boilerplates
- Hints system
- Official solutions with complexity analysis
- Code constraints (time/memory limits)
- Related questions linking

✅ **Statistics & Analytics**
- Acceptance rate tracking
- Submission counting
- Like/Dislike system
- Question statistics dashboard

✅ **Random Question Generator**
- Get random questions by difficulty
- Perfect for practice sessions

## API Endpoints

### Create Question
```http
POST /api/dsa-questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "questionId": "two-sum",
  "title": "Two Sum",
  "description": "Given an array...",
  "difficulty": "Easy",
  "categories": ["Array", "Hash Table"],
  "tags": ["Amazon", "Google"],
  "testCases": [...],
  "functionSignatures": [...],
  "hints": [...],
  "solutions": [...]
}
```

### Get All Questions (with filters)
```http
GET /api/dsa-questions?difficulty=Easy&categories=Array&page=1&limit=20
```

Query Parameters:
- `difficulty`: Easy | Medium | Hard
- `categories`: Array of categories
- `tags`: Array of tags
- `search`: Search query
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: createdAt | difficulty | acceptanceRate | totalSubmissions
- `sortOrder`: asc | desc

### Get Single Question
```http
GET /api/dsa-questions/two-sum?includeSolutions=true
```

### Update Question
```http
PATCH /api/dsa-questions/two-sum
Authorization: Bearer <token>

{
  "difficulty": "Medium",
  "hints": [...]
}
```

### Delete Question (Soft)
```http
DELETE /api/dsa-questions/two-sum
Authorization: Bearer <token>
```

### Delete Question (Hard)
```http
DELETE /api/dsa-questions/two-sum/hard
Authorization: Bearer <token>
```

### Get Statistics
```http
GET /api/dsa-questions/statistics
```

Response:
```json
{
  "totalQuestions": 150,
  "byDifficulty": [
    { "_id": "Easy", "count": 50 },
    { "_id": "Medium", "count": 75 },
    { "_id": "Hard", "count": 25 }
  ],
  "byCategory": [
    { "_id": "Array", "count": 45 },
    { "_id": "Tree", "count": 30 },
    ...
  ],
  "topAcceptanceRate": [...]
}
```

### Get Random Question
```http
GET /api/dsa-questions/random?difficulty=Medium
```

### Like Question
```http
POST /api/dsa-questions/two-sum/like
Authorization: Bearer <token>
```

### Dislike Question
```http
POST /api/dsa-questions/two-sum/dislike
Authorization: Bearer <token>
```

### Submit Solution (Update Stats)
```http
POST /api/dsa-questions/two-sum/submit
Authorization: Bearer <token>

{
  "isSuccess": true
}
```

## Schema Structure

### Question Categories
- Array
- String
- Linked List
- Tree
- Graph
- Dynamic Programming
- Sorting
- Searching
- Stack
- Queue
- Heap
- Hash Table
- Backtracking
- Greedy
- Bit Manipulation
- Math
- Two Pointers
- Sliding Window
- Recursion
- Trie
- Segment Tree

### Difficulty Levels
- Easy
- Medium
- Hard

### Test Case Structure
```typescript
{
  input: string;           // JSON string of inputs
  expectedOutput: string;  // Expected output
  isHidden: boolean;       // Hidden test cases
  explanation?: string;    // Test case explanation
}
```

### Function Signature Structure
```typescript
{
  language: string;        // 'javascript', 'python', 'java', etc.
  code: string;           // Boilerplate code
}
```

### Solution Structure
```typescript
{
  language: string;
  code: string;
  explanation?: string;
  timeComplexity?: string;    // e.g., "O(n)"
  spaceComplexity?: string;   // e.g., "O(1)"
}
```

## Sample Data

Use the sample questions in `seed-data/sample-questions.ts`:
- Two Sum (Easy)
- Reverse Linked List (Easy)
- Valid Parentheses (Easy)

## Integration with Your App

1. **Module is already registered** in `app.module.ts`

2. **Protected routes** use JWT authentication via `JwtAuthGuard`

3. **Access Swagger docs** at: `http://localhost:3000/docs`

## Usage Examples

### Creating a Question via API
```javascript
const question = {
  questionId: "merge-two-sorted-lists",
  title: "Merge Two Sorted Lists",
  description: "Merge two sorted linked lists...",
  difficulty: "Easy",
  categories: ["Linked List", "Recursion"],
  tags: ["Amazon", "Microsoft"],
  testCases: [
    {
      input: '{"list1": [1,2,4], "list2": [1,3,4]}',
      expectedOutput: '[1,1,2,3,4,4]',
      isHidden: false
    }
  ],
  functionSignatures: [
    {
      language: "javascript",
      code: "function mergeTwoLists(list1, list2) { /* code */ }"
    }
  ]
};

const response = await fetch('http://localhost:3000/api/dsa-questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourToken}`
  },
  body: JSON.stringify(question)
});
```

### Fetching Questions with Filters
```javascript
const params = new URLSearchParams({
  difficulty: 'Easy',
  categories: 'Array,Hash Table',
  page: '1',
  limit: '20',
  sortBy: 'acceptanceRate',
  sortOrder: 'desc'
});

const response = await fetch(`http://localhost:3000/api/dsa-questions?${params}`);
const data = await response.json();

console.log(`Total: ${data.total}, Pages: ${data.totalPages}`);
console.log(data.questions);
```

## Database Indexes

The following indexes are automatically created for optimal performance:
- `questionId` (unique)
- `difficulty`
- `categories`
- `tags`
- `isActive`

## Future Enhancements

Potential features to add:
- Code execution engine integration
- User submission history
- Discussion forum per question
- Video solution links
- Editorial content
- Difficulty rating by users
- Time/space complexity verification
- Test case generation
- Plagiarism detection

## Testing

Access Swagger UI to test all endpoints:
```
http://localhost:3000/docs
```

## Security

- All write operations require JWT authentication
- Read operations are public (except solutions)
- Solutions only visible with `includeSolutions=true` query parameter
- User ID tracked for all created questions

## Performance

- Pagination prevents large data transfers
- Indexes ensure fast queries
- Solutions excluded by default in list views
- Aggregation pipelines optimized for statistics

---

**Your DSA Questions module is ready to use!** 🚀
