# DSA Questions Module - Quick Start Guide

## ✅ What's Been Created

Your LeetCode-style DSA questions system is now fully implemented with:

### 📁 Files Created:
```
src/dsa-questions/
├── schemas/
│   └── dsa-question.schema.ts       # MongoDB schema with all fields
├── dto/
│   ├── create-dsa-question.dto.ts   # Create validation
│   ├── update-dsa-question.dto.ts   # Update validation
│   ├── filter-dsa-questions.dto.ts  # Query filters
│   └── submit-solution.dto.ts       # Submission DTO
├── seed-data/
│   └── sample-questions.ts          # 3 sample questions
├── dsa-questions.controller.ts      # API endpoints
├── dsa-questions.service.ts         # Business logic
├── dsa-questions.module.ts          # Module definition
├── seed.script.ts                   # Database seeder
└── README.md                        # Full documentation
```

### 🎯 Features Implemented:

1. **CRUD Operations**
   - ✅ Create questions
   - ✅ Read (single & list with filters)
   - ✅ Update questions
   - ✅ Delete (soft & hard)

2. **Advanced Features**
   - ✅ Pagination & sorting
   - ✅ Multiple filters (difficulty, category, tags)
   - ✅ Search functionality
   - ✅ Random question generator
   - ✅ Statistics dashboard
   - ✅ Like/Dislike system
   - ✅ Submission tracking
   - ✅ Acceptance rate calculation

3. **Rich Question Data**
   - ✅ Multi-language support
   - ✅ Test cases (visible & hidden)
   - ✅ Function signatures/boilerplates
   - ✅ Hints system
   - ✅ Solutions with complexity analysis
   - ✅ Related questions
   - ✅ Company tags

---

## 🚀 Getting Started

### Step 1: Server Should Already Be Running
Your module is already integrated into `app.module.ts`

### Step 2: Access Swagger Documentation
```
http://localhost:3000/docs
```
Look for the "DSA Questions" section

### Step 3: Seed Sample Questions (Optional)

**Option A: Via Script**
Add to your `package.json`:
```json
{
  "scripts": {
    "seed:dsa": "ts-node -r tsconfig-paths/register src/dsa-questions/seed.script.ts"
  }
}
```

Then run:
```bash
npm run seed:dsa
```

**Option B: Via API**
Use Postman or curl to create questions using the sample data.

---

## 📝 Quick API Examples

### 1. Create a Question
```bash
curl -X POST http://localhost:3000/api/dsa-questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionId": "fizz-buzz",
    "title": "Fizz Buzz",
    "description": "Write a program that prints numbers 1 to n...",
    "difficulty": "Easy",
    "categories": ["Math"],
    "tags": ["Google"],
    "testCases": [
      {
        "input": "{\"n\": 15}",
        "expectedOutput": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",...]",
        "isHidden": false
      }
    ],
    "functionSignatures": [
      {
        "language": "javascript",
        "code": "function fizzBuzz(n) { // Your code }"
      }
    ]
  }'
```

### 2. Get All Questions (Easy difficulty, Array category)
```bash
curl "http://localhost:3000/api/dsa-questions?difficulty=Easy&categories=Array&page=1&limit=10"
```

### 3. Get Single Question with Solutions
```bash
curl "http://localhost:3000/api/dsa-questions/two-sum?includeSolutions=true"
```

### 4. Get Random Question
```bash
curl "http://localhost:3000/api/dsa-questions/random?difficulty=Medium"
```

### 5. Get Statistics
```bash
curl "http://localhost:3000/api/dsa-questions/statistics"
```

### 6. Submit Solution (Update Stats)
```bash
curl -X POST http://localhost:3000/api/dsa-questions/two-sum/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"isSuccess": true}'
```

---

## 🎨 Frontend Integration Examples

### React Example - Fetch Questions
```typescript
import { useState, useEffect } from 'react';

interface Question {
  questionId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categories: string[];
  // ... other fields
}

function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      const response = await fetch(
        'http://localhost:3000/api/dsa-questions?page=1&limit=20'
      );
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {questions.map(q => (
        <div key={q.questionId}>
          <h3>{q.title}</h3>
          <span className={`difficulty-${q.difficulty.toLowerCase()}`}>
            {q.difficulty}
          </span>
          <div>{q.categories.join(', ')}</div>
        </div>
      ))}
    </div>
  );
}
```

### React Example - Question Detail Page
```typescript
function QuestionDetail({ questionId }: { questionId: string }) {
  const [question, setQuestion] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    async function fetchQuestion() {
      const url = `http://localhost:3000/api/dsa-questions/${questionId}` +
        (showSolution ? '?includeSolutions=true' : '');
      const response = await fetch(url);
      const data = await response.json();
      setQuestion(data);
    }
    fetchQuestion();
  }, [questionId, showSolution]);

  if (!question) return <div>Loading...</div>;

  return (
    <div>
      <h1>{question.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: question.description }} />
      
      <h3>Test Cases:</h3>
      {question.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
        <div key={i}>
          <code>{tc.input}</code> → <code>{tc.expectedOutput}</code>
        </div>
      ))}

      <h3>Code Template:</h3>
      <pre>{question.functionSignatures[0]?.code}</pre>

      <button onClick={() => setShowSolution(!showSolution)}>
        {showSolution ? 'Hide' : 'Show'} Solution
      </button>

      {showSolution && question.solutions && (
        <div>
          <h3>Solution:</h3>
          <pre>{question.solutions[0]?.code}</pre>
          <p>Time: {question.solutions[0]?.timeComplexity}</p>
          <p>Space: {question.solutions[0]?.spaceComplexity}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔧 Customization

### Add New Categories
Edit `src/dsa-questions/schemas/dsa-question.schema.ts`:
```typescript
export enum QuestionCategory {
  // ... existing categories
  UNION_FIND = 'Union Find',
  TOPOLOGICAL_SORT = 'Topological Sort',
  // Add more...
}
```

### Add More Fields
Add to the schema:
```typescript
@Prop()
videoSolutionUrl?: string;

@Prop()
editorial?: string;

@Prop()
discussionCount?: number;
```

Then update the DTOs accordingly.

---

## 🧪 Testing Checklist

- [ ] Server starts without errors
- [ ] Access Swagger UI at `/docs`
- [ ] Create a question via API
- [ ] Get all questions with filters
- [ ] Get single question
- [ ] Update a question
- [ ] Delete a question
- [ ] Get statistics
- [ ] Get random question
- [ ] Like/Dislike a question
- [ ] Submit solution (stats update)

---

## 📊 Database Collections

The module creates a collection: `dsaquestions`

Sample document structure:
```javascript
{
  _id: ObjectId("..."),
  questionId: "two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  categories: ["Array", "Hash Table"],
  testCases: [...],
  functionSignatures: [...],
  acceptanceRate: 45.5,
  totalSubmissions: 1000,
  successfulSubmissions: 455,
  likes: 123,
  dislikes: 5,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## 🎯 Next Steps

1. **Seed the database** with sample questions
2. **Test all endpoints** via Swagger
3. **Build frontend** to display and solve questions
4. **Add code execution** (optional - requires additional service)
5. **Implement user solutions** tracking (optional)

---

## 🆘 Troubleshooting

### Module not found errors?
```bash
npm install
```

### Database connection issues?
Check your `.env` file has:
```
MONGO_URI=your_mongodb_connection_string
```

### Authentication errors?
Make sure you have a valid JWT token. Get one from your login endpoint.

---

## 📚 Additional Resources

- Full API documentation: See `README.md` in this folder
- Sample questions: See `seed-data/sample-questions.ts`
- Swagger UI: `http://localhost:3000/docs`

---

**Your DSA Questions system is ready! Start creating amazing coding challenges!** 🎉💻
