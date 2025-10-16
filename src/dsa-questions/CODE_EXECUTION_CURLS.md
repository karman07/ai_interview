# Code Execution API - cURL Commands

## 🔑 Setup Token
```bash
# Windows PowerShell
$TOKEN = "your_jwt_token_here"

# Linux/Mac Bash
export TOKEN="your_jwt_token_here"
```

---

## 🚀 CODE EXECUTION ENDPOINTS (6 New Endpoints)

### 3️⃣7️⃣ RUN CODE AGAINST TEST CASES
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\",\"includeHiddenTests\":false,\"analyzeComplexity\":true}"
```

### 3️⃣8️⃣ RUN SPECIFIC TEST CASES ONLY
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\",\"testCaseIndices\":[0,1,2]}"
```

### 3️⃣9️⃣ RUN WITH HIDDEN TESTS
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\",\"includeHiddenTests\":true}"
```

### 4️⃣0️⃣ VALIDATE SOLUTION (ALL TESTS INCLUDING HIDDEN)
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/validate -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\"}"
```

### 4️⃣1️⃣ RUN CUSTOM TEST CASES
```bash
curl -X POST http://localhost:3000/code-execution/run-custom -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\",\"testCases\":[{\"input\":\"[1,2,3,4], 7\",\"expectedOutput\":\"[2,3]\"},{\"input\":\"[5,5], 10\",\"expectedOutput\":\"[0,1]\"}]}"
```

### 4️⃣2️⃣ GET COMPLEXITY REQUIREMENTS
```bash
curl -X GET http://localhost:3000/code-execution/two-sum/complexity -H "Authorization: Bearer $TOKEN"
```

### 4️⃣3️⃣ GET EXECUTION HISTORY
```bash
curl -X GET http://localhost:3000/code-execution/history -H "Authorization: Bearer $TOKEN"
```

### 4️⃣4️⃣ GET EXECUTION HISTORY FOR SPECIFIC QUESTION
```bash
curl -X GET "http://localhost:3000/code-execution/history?questionId=two-sum" -H "Authorization: Bearer $TOKEN"
```

### 4️⃣5️⃣ GET EXECUTION HISTORY WITH LIMIT
```bash
curl -X GET "http://localhost:3000/code-execution/history?limit=5" -H "Authorization: Bearer $TOKEN"
```

### 4️⃣6️⃣ GET SPECIFIC EXECUTION RESULT
```bash
curl -X GET http://localhost:3000/code-execution/result/EXECUTION_ID_HERE -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 PYTHON EXAMPLES

### 4️⃣7️⃣ RUN PYTHON CODE
```bash
curl -X POST http://localhost:3000/code-execution/reverse-linked-list/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"python\",\"code\":\"def reverseList(head):\\n    prev = None\\n    curr = head\\n    while curr:\\n        next_temp = curr.next\\n        curr.next = prev\\n        prev = curr\\n        curr = next_temp\\n    return prev\"}"
```

### 4️⃣8️⃣ VALIDATE PYTHON SOLUTION
```bash
curl -X POST http://localhost:3000/code-execution/reverse-linked-list/validate -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"python\",\"code\":\"def reverseList(head):\\n    prev = None\\n    curr = head\\n    while curr:\\n        next_temp = curr.next\\n        curr.next = prev\\n        prev = curr\\n        curr = next_temp\\n    return prev\"}"
```

### 4️⃣9️⃣ PYTHON CUSTOM TESTS
```bash
curl -X POST http://localhost:3000/code-execution/run-custom -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"python\",\"code\":\"def sum_array(arr):\\n    return sum(arr)\",\"testCases\":[{\"input\":\"[1,2,3]\",\"expectedOutput\":\"6\"},{\"input\":\"[10,20,30]\",\"expectedOutput\":\"60\"}]}"
```

---

## 🎨 MULTI-LANGUAGE EXAMPLES

### 5️⃣0️⃣ JAVA EXECUTION
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"java\",\"code\":\"public int[] twoSum(int[] nums, int target) { Map<Integer, Integer> map = new HashMap<>(); for (int i = 0; i < nums.length; i++) { int complement = target - nums[i]; if (map.containsKey(complement)) { return new int[] { map.get(complement), i }; } map.put(nums[i], i); } return new int[] {}; }\"}"
```

### 5️⃣1️⃣ C++ EXECUTION
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"cpp\",\"code\":\"vector<int> twoSum(vector<int>& nums, int target) { unordered_map<int, int> map; for (int i = 0; i < nums.size(); i++) { int complement = target - nums[i]; if (map.find(complement) != map.end()) { return {map[complement], i}; } map[nums[i]] = i; } return {}; }\"}"
```

### 5️⃣2️⃣ TYPESCRIPT EXECUTION
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"typescript\",\"code\":\"function twoSum(nums: number[], target: number): number[] { const map = new Map<number, number>(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) { return [map.get(complement)!, i]; } map.set(nums[i], i); } return []; }\"}"
```

### 5️⃣3️⃣ GO EXECUTION
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"go\",\"code\":\"func twoSum(nums []int, target int) []int { m := make(map[int]int) for i, num := range nums { complement := target - num if j, ok := m[complement]; ok { return []int{j, i} } m[num] = i } return []int{} }\"}"
```

---

## 🔬 DEBUG & TEST WORKFLOW

### Step 1: Start with Custom Test
```bash
curl -X POST http://localhost:3000/code-execution/run-custom -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { return [0, 1]; }\",\"testCases\":[{\"input\":\"[2,7], 9\",\"expectedOutput\":\"[0,1]\"}]}"
```

### Step 2: Run Against Public Tests
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\",\"includeHiddenTests\":false}"
```

### Step 3: Check Complexity Requirements
```bash
curl -X GET http://localhost:3000/code-execution/two-sum/complexity -H "Authorization: Bearer $TOKEN"
```

### Step 4: Final Validation
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/validate -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\"}"
```

### Step 5: View Execution History
```bash
curl -X GET "http://localhost:3000/code-execution/history?questionId=two-sum&limit=5" -H "Authorization: Bearer $TOKEN"
```

---

## 📊 EXPECTED RESPONSES

### Successful Execution
```json
{
  "questionId": "two-sum",
  "userId": "user123",
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
      "memoryUsed": 15.5
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

### Failed Test Case
```json
{
  "questionId": "two-sum",
  "status": "Failed",
  "testResults": [
    {
      "testCaseIndex": 0,
      "input": "[2,7,11,15], 9",
      "expectedOutput": "[0,1]",
      "actualOutput": "[1,0]",
      "passed": false,
      "errorMessage": "Output mismatch"
    }
  ],
  "allTestsPassed": false
}
```

### Compilation Error
```json
{
  "questionId": "two-sum",
  "status": "CompilationError",
  "compilationError": "SyntaxError: Unexpected token '}'"
}
```

### Runtime Error
```json
{
  "questionId": "two-sum",
  "status": "RuntimeError",
  "runtimeError": "TypeError: Cannot read property 'length' of undefined",
  "testResults": [
    {
      "testCaseIndex": 0,
      "passed": false,
      "errorMessage": "Runtime Error: TypeError..."
    }
  ]
}
```

### Time Limit Exceeded
```json
{
  "questionId": "two-sum",
  "status": "TimeLimitExceeded",
  "testResults": [
    {
      "testCaseIndex": 2,
      "passed": false,
      "executionTime": 5002,
      "errorMessage": "Time Limit Exceeded"
    }
  ]
}
```

### Complexity Requirements
```json
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)"
}
```

---

## 🎯 INTEGRATION WITH PROGRESS TRACKING

### Complete Submission Flow
```bash
# 1. Validate solution
RESULT=$(curl -X POST http://localhost:3000/code-execution/two-sum/validate -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\"}")

# 2. If successful, record progress
curl -X POST http://localhost:3000/dsa-progress/two-sum/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"code\":\"function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }\",\"status\":\"Solved\",\"testCasesPassed\":5,\"totalTestCases\":5,\"executionTime\":42,\"timeSpent\":1800}"

# 3. Update global question stats
curl -X POST http://localhost:3000/dsa-questions/two-sum/submit -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"language\":\"javascript\",\"isAccepted\":true}"
```

---

## 🔢 SUMMARY

**New Endpoints: 6**
37. Run code against test cases
38. Run specific test cases only
39. Run with hidden tests
40. Validate solution (all tests)
41. Run custom test cases
42. Get complexity requirements
43. Get execution history (all)
44. Get execution history (filtered)
45. Get execution history (limited)
46. Get specific execution result

**Plus 7 multi-language examples (47-53)**

**Total System: 53 Endpoints!**
- Questions: 12 endpoints
- Progress: 12 endpoints
- Code Execution: 6 endpoints
- Multi-language examples: 7 variants
- Debug workflow: 5 steps
- Integration: 3 combined flows

---

## 💡 TIPS

1. **Start with custom tests** for quick debugging
2. **Run public tests** during development
3. **Use validation** for final submission
4. **Check complexity** to understand requirements
5. **Review history** to track improvement
6. **Test multiple languages** to find optimal solution

---

## 🚀 Ready to Execute!

All commands are single-line and ready to copy-paste. The code execution system provides real compiler API integration for a complete LeetCode-like experience! 🎉
