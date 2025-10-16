# All cURL Commands - Ready to Execute

## 🔑 Setup Token First
```bash
# Windows PowerShell
$TOKEN = "your_jwt_token_here"

# Linux/Mac Bash
export TOKEN="your_jwt_token_here"
```

---

## 🚀 Execute All Commands (Copy & Paste Ready)

### 1️⃣ CREATE A QUESTION
```bash
curl -X POST http://localhost:3000/dsa-questions -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"questionId\":\"two-sum\",\"title\":\"Two Sum\",\"description\":\"Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\",\"difficulty\":\"Easy\",\"categories\":[\"Array\",\"HashTable\"],\"tags\":[\"array\",\"hash-table\"],\"testCases\":[{\"input\":\"[2,7,11,15], 9\",\"expectedOutput\":\"[0,1]\",\"isHidden\":false}],\"functionSignatures\":[{\"language\":\"javascript\",\"signature\":\"function twoSum(nums, target)\",\"returnType\":\"number[]\"}],\"constraints\":{\"timeComplexity\":\"O(n)\",\"spaceComplexity\":\"O(n)\",\"timeLimit\":1000,\"memoryLimit\":128},\"hints\":[{\"order\":1,\"content\":\"Use a hash map\"}],\"examples\":[{\"input\":\"[2,7,11,15], 9\",\"output\":\"[0,1]\",\"explanation\":\"Sum equals target\"}]}"
```

### 2️⃣ GET ALL QUESTIONS
```bash
curl -X GET http://localhost:3000/dsa-questions
```

### 3️⃣ GET QUESTIONS BY DIFFICULTY (EASY)
```bash
curl -X GET "http://localhost:3000/dsa-questions?difficulty=Easy"
```

### 4️⃣ GET QUESTIONS BY CATEGORY (ARRAY)
```bash
curl -X GET "http://localhost:3000/dsa-questions?category=Array"
```

### 5️⃣ SEARCH QUESTIONS
```bash
curl -X GET "http://localhost:3000/dsa-questions?search=two"
```

### 6️⃣ GET QUESTIONS WITH PAGINATION
```bash
curl -X GET "http://localhost:3000/dsa-questions?page=1&limit=10"
```

### 7️⃣ GET QUESTION STATISTICS
```bash
curl -X GET http://localhost:3000/dsa-questions/statistics
```

### 8️⃣ GET RANDOM QUESTION
```bash
curl -X GET http://localhost:3000/dsa-questions/random
```

### 9️⃣ GET RANDOM EASY QUESTION
```bash
curl -X GET "http://localhost:3000/dsa-questions/random?difficulty=Easy"
```

### 🔟 GET SINGLE QUESTION
```bash
curl -X GET http://localhost:3000/dsa-questions/two-sum
```

### 1️⃣1️⃣ GET QUESTION WITH SOLUTIONS
```bash
curl -X GET "http://localhost:3000/dsa-questions/two-sum?includeSolutions=true"
```

### 1️⃣2️⃣ UPDATE QUESTION
```bash
curl -X PATCH http://localhost:3000/dsa-questions/two-sum -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"Two Sum - Updated\"}"
```

### 1️⃣3️⃣ LIKE QUESTION
```bash
curl -X POST http://localhost:3000/dsa-questions/two-sum/like -H "Authorization: Bearer $TOKEN"
```

### 1️⃣4️⃣ DISLIKE QUESTION
```bash
curl -X POST http://localhost:3000/dsa-questions/two-sum/dislike -H "Authorization: Bearer $TOKEN"
```

### 1️⃣5️⃣ SUBMIT SOLUTION TO QUESTION
```bash
curl -X POST http://localhost:3000/dsa-questions/two-sum/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"isAccepted\":true}"
```

### 1️⃣6️⃣ SOFT DELETE QUESTION
```bash
curl -X DELETE http://localhost:3000/dsa-questions/two-sum -H "Authorization: Bearer $TOKEN"
```

### 1️⃣7️⃣ HARD DELETE QUESTION
```bash
curl -X DELETE http://localhost:3000/dsa-questions/two-sum/hard -H "Authorization: Bearer $TOKEN"
```

---

## 📊 PROGRESS TRACKING API

### 1️⃣8️⃣ SUBMIT CODE (SOLVED)
```bash
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\",\"status\":\"Solved\",\"testCasesPassed\":5,\"totalTestCases\":5,\"executionTime\":42,\"memoryUsed\":15.5,\"timeSpent\":1800}"
```

### 1️⃣9️⃣ SUBMIT CODE (FAILED)
```bash
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { return [0, 1]; }\",\"status\":\"Failed\",\"testCasesPassed\":3,\"totalTestCases\":5,\"executionTime\":55,\"errorMessage\":\"Wrong answer\",\"timeSpent\":900}"
```

### 2️⃣0️⃣ GET ALL MY PROGRESS
```bash
curl -X GET http://localhost:3000/dsa-progress/my-progress -H "Authorization: Bearer $TOKEN"
```

### 2️⃣1️⃣ GET SOLVED QUESTIONS
```bash
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Solved" -H "Authorization: Bearer $TOKEN"
```

### 2️⃣2️⃣ GET BOOKMARKED QUESTIONS
```bash
curl -X GET "http://localhost:3000/dsa-progress/my-progress?isBookmarked=true" -H "Authorization: Bearer $TOKEN"
```

### 2️⃣3️⃣ GET USER STATISTICS
```bash
curl -X GET http://localhost:3000/dsa-progress/statistics -H "Authorization: Bearer $TOKEN"
```

### 2️⃣4️⃣ GET RECENT SUBMISSIONS
```bash
curl -X GET http://localhost:3000/dsa-progress/recent-submissions -H "Authorization: Bearer $TOKEN"
```

### 2️⃣5️⃣ GET RECENT 5 SUBMISSIONS
```bash
curl -X GET "http://localhost:3000/dsa-progress/recent-submissions?limit=5" -H "Authorization: Bearer $TOKEN"
```

### 2️⃣6️⃣ GET QUESTION PROGRESS
```bash
curl -X GET http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN"
```

### 2️⃣7️⃣ GET SUBMISSION HISTORY
```bash
curl -X GET http://localhost:3000/dsa-progress/two-sum/submissions -H "Authorization: Bearer $TOKEN"
```

### 2️⃣8️⃣ BOOKMARK QUESTION
```bash
curl -X PATCH http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"isBookmarked\":true}"
```

### 2️⃣9️⃣ ADD NOTES TO QUESTION
```bash
curl -X PATCH http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"userNotes\":\"Use hash map for O(n) solution\"}"
```

### 3️⃣0️⃣ RATE QUESTION
```bash
curl -X PATCH http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"userRating\":85}"
```

### 3️⃣1️⃣ UPDATE MULTIPLE FIELDS
```bash
curl -X PATCH http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"isBookmarked\":true,\"userNotes\":\"Great problem\",\"userRating\":90}"
```

### 3️⃣2️⃣ LIKE QUESTION (USER)
```bash
curl -X POST http://localhost:3000/dsa-progress/two-sum/like -H "Authorization: Bearer $TOKEN"
```

### 3️⃣3️⃣ DISLIKE QUESTION (USER)
```bash
curl -X POST http://localhost:3000/dsa-progress/two-sum/dislike -H "Authorization: Bearer $TOKEN"
```

### 3️⃣4️⃣ RECORD HINT USAGE
```bash
curl -X POST http://localhost:3000/dsa-progress/two-sum/hint -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"hintContent\":\"Try using a hash map\"}"
```

### 3️⃣5️⃣ RESET QUESTION PROGRESS
```bash
curl -X DELETE http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN"
```

### 3️⃣6️⃣ DELETE ALL PROGRESS (⚠️ WARNING)
```bash
curl -X DELETE http://localhost:3000/dsa-progress/all -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 COMPLETE USER WORKFLOW (Execute in Order)

```bash
# Step 1: Get statistics
curl -X GET http://localhost:3000/dsa-progress/statistics -H "Authorization: Bearer $TOKEN"

# Step 2: Get random easy question
curl -X GET "http://localhost:3000/dsa-questions/random?difficulty=Easy"

# Step 3: Get question details
curl -X GET http://localhost:3000/dsa-questions/two-sum

# Step 4: Check previous attempts
curl -X GET http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN"

# Step 5: Reveal hint
curl -X POST http://localhost:3000/dsa-progress/two-sum/hint -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"hintContent\":\"Use hash map\"}"

# Step 6: Bookmark question
curl -X PATCH http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"isBookmarked\":true}"

# Step 7: Submit failed attempt
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum() { return []; }\",\"status\":\"Failed\",\"testCasesPassed\":2,\"totalTestCases\":5,\"executionTime\":50,\"timeSpent\":600}"

# Step 8: Submit successful solution
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\",\"status\":\"Solved\",\"testCasesPassed\":5,\"totalTestCases\":5,\"executionTime\":42,\"timeSpent\":1800}"

# Step 9: Update global stats
curl -X POST http://localhost:3000/dsa-questions/two-sum/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"isAccepted\":true}"

# Step 10: Like question
curl -X POST http://localhost:3000/dsa-progress/two-sum/like -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:3000/dsa-questions/two-sum/like -H "Authorization: Bearer $TOKEN"

# Step 11: Add notes
curl -X PATCH http://localhost:3000/dsa-progress/two-sum -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"userNotes\":\"Hash map O(n) solution\",\"userRating\":95}"

# Step 12: View history
curl -X GET http://localhost:3000/dsa-progress/two-sum/submissions -H "Authorization: Bearer $TOKEN"

# Step 13: Check updated stats
curl -X GET http://localhost:3000/dsa-progress/statistics -H "Authorization: Bearer $TOKEN"
```

---

## 📋 QUICK TEST COMMANDS

### Test Question Creation
```bash
curl -X POST http://localhost:3000/dsa-questions -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"questionId\":\"test-q\",\"title\":\"Test Q\",\"description\":\"Test\",\"difficulty\":\"Easy\",\"categories\":[\"Array\"],\"tags\":[\"test\"],\"testCases\":[{\"input\":\"[1,2]\",\"expectedOutput\":\"3\",\"isHidden\":false}],\"functionSignatures\":[{\"language\":\"javascript\",\"signature\":\"function test(arr)\",\"returnType\":\"number\"}],\"constraints\":{\"timeComplexity\":\"O(n)\",\"spaceComplexity\":\"O(1)\",\"timeLimit\":1000,\"memoryLimit\":128},\"hints\":[{\"order\":1,\"content\":\"Test hint\"}],\"examples\":[{\"input\":\"[1,2]\",\"output\":\"3\",\"explanation\":\"Test\"}]}"
```

### Test Submission
```bash
curl -X POST http://localhost:3000/dsa-progress/test-q/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function test(arr) { return arr.reduce((a,b) => a+b, 0); }\",\"status\":\"Solved\",\"testCasesPassed\":1,\"totalTestCases\":1,\"executionTime\":10,\"timeSpent\":60}"
```

### Verify Test
```bash
curl -X GET http://localhost:3000/dsa-progress/test-q -H "Authorization: Bearer $TOKEN"
```

### Cleanup Test
```bash
curl -X DELETE http://localhost:3000/dsa-progress/test-q -H "Authorization: Bearer $TOKEN"
curl -X DELETE http://localhost:3000/dsa-questions/test-q/hard -H "Authorization: Bearer $TOKEN"
```

---

## 🎨 FILTER & SEARCH EXAMPLES

```bash
# Get Medium difficulty questions
curl -X GET "http://localhost:3000/dsa-questions?difficulty=Medium"

# Get Hard difficulty questions
curl -X GET "http://localhost:3000/dsa-questions?difficulty=Hard"

# Get Array category questions
curl -X GET "http://localhost:3000/dsa-questions?category=Array"

# Get Tree category questions
curl -X GET "http://localhost:3000/dsa-questions?category=Tree"

# Get multiple categories
curl -X GET "http://localhost:3000/dsa-questions?category=Array&category=HashTable"

# Search by keyword
curl -X GET "http://localhost:3000/dsa-questions?search=sum"

# Filter by tags
curl -X GET "http://localhost:3000/dsa-questions?tags=array&tags=hash-table"

# Sort by difficulty
curl -X GET "http://localhost:3000/dsa-questions?sortBy=difficulty&sortOrder=asc"

# Sort by likes
curl -X GET "http://localhost:3000/dsa-questions?sortBy=likes&sortOrder=desc"

# Sort by acceptance rate
curl -X GET "http://localhost:3000/dsa-questions?sortBy=acceptanceRate&sortOrder=desc"

# Pagination
curl -X GET "http://localhost:3000/dsa-questions?page=1&limit=20"
curl -X GET "http://localhost:3000/dsa-questions?page=2&limit=20"

# Combined filters
curl -X GET "http://localhost:3000/dsa-questions?difficulty=Easy&category=Array&sortBy=likes&sortOrder=desc&page=1&limit=10"
```

---

## 📊 DASHBOARD DATA (All at Once)

```bash
# Get all dashboard data
curl -X GET http://localhost:3000/dsa-progress/statistics -H "Authorization: Bearer $TOKEN"
curl -X GET "http://localhost:3000/dsa-progress/recent-submissions?limit=5" -H "Authorization: Bearer $TOKEN"
curl -X GET "http://localhost:3000/dsa-progress/my-progress?status=Solved" -H "Authorization: Bearer $TOKEN"
curl -X GET "http://localhost:3000/dsa-progress/my-progress?isBookmarked=true" -H "Authorization: Bearer $TOKEN"
curl -X GET http://localhost:3000/dsa-questions/statistics
```

---

## 🔢 SUMMARY

**Total Endpoints: 24**
- Questions API: 12 endpoints
- Progress API: 12 endpoints

**Endpoint Breakdown:**
1. Create Question
2. Get All Questions (with filters)
3. Get Question Statistics
4. Get Random Question
5. Get Single Question
6. Update Question
7. Soft Delete Question
8. Hard Delete Question
9. Like Question (Global)
10. Dislike Question (Global)
11. Submit Solution (Global)
12. Increment Submission

13. Submit Code (Progress)
14. Get All Progress
15. Get Statistics (User)
16. Get Recent Submissions
17. Get Question Progress
18. Get Submission History
19. Update Progress Metadata
20. Like Question (User)
21. Dislike Question (User)
22. Record Hint Usage
23. Reset Question Progress
24. Delete All Progress

---

## 💡 POWERSHELL VERSION (Windows)

```powershell
# Set token
$TOKEN = "your_jwt_token_here"
$BASE = "http://localhost:3000"

# Get statistics
Invoke-RestMethod -Uri "$BASE/dsa-progress/statistics" -Headers @{Authorization="Bearer $TOKEN"}

# Get questions
Invoke-RestMethod -Uri "$BASE/dsa-questions"

# Submit solution
$body = @{
    language = "javascript"
    code = "function twoSum() { }"
    status = "Solved"
    testCasesPassed = 5
    totalTestCases = 5
    executionTime = 42
    timeSpent = 1800
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE/dsa-progress/two-sum/submit" -Method Post -Headers @{Authorization="Bearer $TOKEN"; "Content-Type"="application/json"} -Body $body
```

---

## 🚀 Ready to Use!

1. Replace `$TOKEN` with your JWT token
2. Ensure server is running: `npm run start:dev`
3. Copy and paste any command above
4. Check Swagger docs: http://localhost:3000/docs
