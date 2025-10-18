# DSA Platform - Quick Setup Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- Backend API running on `http://localhost:3000`

### Installation

The DSA platform has been integrated into your existing frontend application. No additional installation is required.

### Backend Setup

Ensure your backend API is running with the following endpoints:
- `/dsa-questions/*` - Questions API (12 endpoints)
- `/dsa-progress/*` - Progress Tracking API (12 endpoints)

### Environment Variables

Make sure your `.env` file includes:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 📋 Quick Test

### 1. Start the Application

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm dev
```

### 2. Access DSA Platform

1. Login to your account
2. Click "DSA Practice" in the sidebar
3. You'll see the DSA Dashboard

### 3. Test Basic Workflow

**Dashboard** (`/dsa`)
- View your statistics
- Click "Browse Questions" to see all questions
- Click "Random Question" to practice
- Click "Bookmarked" to see saved questions

**Questions List** (`/dsa/questions`)
- Use filters to find questions by difficulty
- Search for specific problems
- Click on any question to start solving

**Solve a Question** (`/dsa/questions/:questionId`)
- Read the problem description
- Write your code in the editor
- Submit your solution
- Track your progress

## 🧪 Testing API Endpoints

### Get Questions
```powershell
# Get all questions
curl http://localhost:3000/dsa-questions

# Get easy questions
curl "http://localhost:3000/dsa-questions?difficulty=Easy"

# Search questions
curl "http://localhost:3000/dsa-questions?search=two"
```

### Get User Progress (requires authentication)
```powershell
# Set your token
$TOKEN = "your_jwt_token_here"

# Get statistics
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/dsa-progress/statistics

# Get solved questions
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/dsa-progress/my-progress?status=Solved"

# Get recent submissions
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/dsa-progress/recent-submissions?limit=5"
```

## 📁 New Files Created

### Types
- `src/types/dsa.ts` - All TypeScript interfaces and types

### API Services
- `src/api/dsaQuestions.ts` - Questions API service
- `src/api/dsaProgress.ts` - Progress tracking API service

### Contexts
- `src/contexts/DSAQuestionsContext.tsx` - Questions state management
- `src/contexts/DSAProgressContext.tsx` - Progress state management

### Components
- `src/components/dsa/QuestionCard.tsx` - Question display card
- `src/components/dsa/CodeEditor.tsx` - Code editor component
- `src/components/dsa/DSAStatCard.tsx` - Statistics card
- `src/components/dsa/SubmissionHistory.tsx` - Submission history

### Pages
- `src/pages/DSA/DSADashboard.tsx` - Main dashboard
- `src/pages/DSA/DSAQuestionsList.tsx` - Questions list
- `src/pages/DSA/DSAQuestionSolvePage.tsx` - Question solve page

### Documentation
- `DSA_IMPLEMENTATION.md` - Complete implementation guide

## 🔑 Key Routes

| Route | Description |
|-------|-------------|
| `/dsa` | DSA Dashboard - Overview and statistics |
| `/dsa/questions` | Questions List - Browse all problems |
| `/dsa/questions/:questionId` | Solve Page - Solve a specific problem |

## 🎯 Features Available

### ✅ Implemented
- Questions browsing with filters
- Search and pagination
- Code editor with syntax highlighting
- Progress tracking
- Statistics dashboard
- Submission history
- Bookmarking
- Personal notes
- Rating system
- Hints system
- Like/Dislike functionality

### 🚧 Future Enhancements
- Real code execution
- Test case runner
- Discussion forum
- Solution comparison
- Video tutorials
- Peer reviews
- Leaderboards
- Achievements/Badges

## 🐛 Troubleshooting

### API Connection Issues
```powershell
# Check if backend is running
curl http://localhost:3000/health

# Check if DSA endpoints are available
curl http://localhost:3000/dsa-questions/statistics
```

### Authentication Issues
- Ensure you're logged in
- Check JWT token in browser dev tools (Application > Cookies)
- Try logging out and logging back in

### CORS Issues
Ensure your backend has CORS configured to allow requests from your frontend origin.

### TypeScript Errors
```powershell
# Reinstall dependencies
pnpm install

# Clear cache and rebuild
pnpm clean
pnpm build
```

## 📊 Sample Data

To test the platform, you may need to seed your database with sample questions. Use the API to create test questions:

```powershell
$TOKEN = "your_jwt_token_here"

curl -X POST http://localhost:3000/dsa-questions `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "questionId": "two-sum",
    "title": "Two Sum",
    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "difficulty": "Easy",
    "categories": ["Array", "HashTable"],
    "tags": ["array", "hash-table"],
    "testCases": [{
      "input": "[2,7,11,15], 9",
      "expectedOutput": "[0,1]",
      "isHidden": false
    }],
    "functionSignatures": [{
      "language": "javascript",
      "signature": "function twoSum(nums, target)",
      "returnType": "number[]"
    }],
    "constraints": {
      "timeComplexity": "O(n)",
      "spaceComplexity": "O(n)",
      "timeLimit": 1000,
      "memoryLimit": 128
    },
    "hints": [{
      "order": 1,
      "content": "Use a hash map"
    }],
    "examples": [{
      "input": "[2,7,11,15], 9",
      "output": "[0,1]",
      "explanation": "Sum equals target"
    }]
  }'
```

## 🎓 User Guide

### For Students
1. **Start with the Dashboard** to see your progress
2. **Filter by Easy** when starting out
3. **Use bookmarks** to save interesting problems
4. **Add notes** for future reference
5. **Review submission history** to learn from mistakes

### For Interviewers/Admins
1. Create questions via API
2. Monitor question statistics
3. Review user submissions
4. Adjust difficulty ratings based on acceptance rates

## 🔐 Security Notes

- All API calls use JWT authentication
- Tokens are stored in httpOnly cookies
- Automatic token refresh on expiry
- Protected routes require authentication

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify backend logs

---

**Happy Coding! 🚀**
