# Code Execution & Test Validation System

## 🎯 Overview

A complete code execution and validation system that:
- **Runs code** against test cases using real compiler APIs (Piston API)
- **Validates solutions** with hidden test cases
- **Measures performance**: execution time, memory usage
- **Analyzes complexity**: estimates time/space complexity
- **Compares results**: validates outputs against expected results
- **Provides detailed feedback**: compilation errors, runtime errors, test failures

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Code Execution System                         │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         CodeExecutionController                            │  │
│  │  • POST /code-execution/:questionId/run                   │  │
│  │  • POST /code-execution/:questionId/validate              │  │
│  │  • POST /code-execution/run-custom                        │  │
│  │  • GET  /code-execution/:questionId/complexity            │  │
│  │  • GET  /code-execution/history                           │  │
│  └────────────────────┬──────────────────────────────────────┘  │
│                       │                                          │
│           ┌───────────┴───────────┐                              │
│           ▼                       ▼                              │
│  ┌──────────────────┐    ┌──────────────────────┐              │
│  │  TestRunnerService│    │ CodeExecutionService │              │
│  │                   │    │                      │              │
│  │ • Run all tests   │    │ • Execute single test│              │
│  │ • Run custom tests│    │ • Call Piston API    │              │
│  │ • Validate solution│   │ • Analyze complexity │              │
│  │ • Check complexity│    │ • Wrap user code     │              │
│  └──────────────────┘    └──────────┬───────────┘              │
│                                      │                           │
│                                      ▼                           │
│                          ┌──────────────────────┐               │
│                          │    Piston API        │               │
│                          │  (emkc.org/api/v2)   │               │
│                          │                      │               │
│                          │ • JavaScript         │               │
│                          │ • Python             │               │
│                          │ • Java               │               │
│                          │ • C++                │               │
│                          │ • TypeScript         │               │
│                          │ • Go, Rust, C#       │               │
│                          └──────────────────────┘               │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              ExecutionResult Schema                        │  │
│  │  • Test case results                                       │  │
│  │  • Execution times                                         │  │
│  │  • Memory usage                                            │  │
│  │  • Complexity analysis                                     │  │
│  │  • Error messages                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## 📋 Features

### ✅ Code Execution
- Execute code in 8+ languages (JavaScript, Python, Java, C++, TypeScript, Go, Rust, C#)
- Run against question test cases
- Run custom test cases for debugging
- Sandbox execution with time/memory limits
- Compilation error detection
- Runtime error detection

### ✅ Test Validation
- Run all public test cases
- Include hidden test cases for validation
- Select specific test cases to run
- Compare outputs (JSON or string)
- Detailed pass/fail results per test case

### ✅ Performance Measurement
- Execution time per test case
- Average execution time
- Total execution time
- Memory usage tracking
- Time limit exceeded detection

### ✅ Complexity Analysis
- Estimates time complexity (O(1), O(n), O(n²), etc.)
- Estimates space complexity
- Checks if meets requirements
- Provides analysis explanation
- Heuristic-based detection

### ✅ Execution History
- Store all execution results
- Query by user and question
- Retrieve detailed results
- Track progress over time

## 🔌 API Endpoints

### 1. Run Code Against Test Cases
```http
POST /code-execution/:questionId/run
Authorization: Bearer TOKEN

{
  "language": "javascript",
  "code": "function twoSum(nums, target) { ... }",
  "testCaseIndices": [0, 1, 2],  // optional
  "includeHiddenTests": false,     // optional
  "analyzeComplexity": true        // optional
}
```

**Response:**
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
    },
    {
      "testCaseIndex": 1,
      "input": "[3,2,4], 6",
      "expectedOutput": "[1,2]",
      "actualOutput": "[1,2]",
      "passed": true,
      "executionTime": 38,
      "memoryUsed": 14.2
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
  },
  "submittedAt": "2025-10-14T10:00:00.000Z"
}
```

### 2. Validate Solution (All Tests)
```http
POST /code-execution/:questionId/validate
Authorization: Bearer TOKEN

{
  "language": "javascript",
  "code": "function twoSum(nums, target) { ... }"
}
```

Runs all test cases including hidden ones for final validation.

### 3. Run Custom Test Cases
```http
POST /code-execution/run-custom
Authorization: Bearer TOKEN

{
  "language": "python",
  "code": "def two_sum(nums, target): ...",
  "testCases": [
    {
      "input": "[1, 2, 3], 5",
      "expectedOutput": "[1, 2]"
    },
    {
      "input": "[4, 5, 6], 10",
      "expectedOutput": "[0, 2]"
    }
  ]
}
```

Useful for debugging with custom inputs.

### 4. Get Complexity Requirements
```http
GET /code-execution/:questionId/complexity
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)"
}
```

### 5. Get Execution History
```http
GET /code-execution/history?questionId=two-sum&limit=10
Authorization: Bearer TOKEN
```

**Response:**
```json
[
  {
    "_id": "...",
    "questionId": "two-sum",
    "language": "javascript",
    "status": "Success",
    "passedTestCases": 5,
    "totalTestCases": 5,
    "allTestsPassed": true,
    "averageExecutionTime": 42,
    "submittedAt": "2025-10-14T10:00:00Z"
  }
]
```

### 6. Get Execution Result Details
```http
GET /code-execution/result/:executionId
Authorization: Bearer TOKEN
```

Returns complete execution details including code and all test results.

## 🎨 Execution Statuses

| Status | Description |
|--------|-------------|
| `Success` | All test cases passed |
| `Failed` | One or more test cases failed |
| `RuntimeError` | Code threw an error during execution |
| `CompilationError` | Code failed to compile |
| `TimeLimitExceeded` | Execution time exceeded limit |
| `MemoryLimitExceeded` | Memory usage exceeded limit |

## 💻 Supported Languages

| Language | Version | Extension |
|----------|---------|-----------|
| JavaScript | 18.15.0 | .js |
| Python | 3.10.0 | .py |
| Java | 15.0.2 | .java |
| C++ | 10.2.0 | .cpp |
| TypeScript | 5.0.3 | .ts |
| Go | 1.16.2 | .go |
| Rust | 1.68.2 | .rs |
| C# | 6.12.0 | .cs |

## 🔧 How It Works

### Code Execution Flow

1. **Receive Request**: User submits code and selects test cases
2. **Fetch Question**: Retrieve question details and test cases
3. **Prepare Code**: Wrap user code with test execution logic
4. **Execute**: Send to Piston API for each test case
5. **Parse Results**: Extract stdout, stderr, execution time
6. **Compare Output**: Validate against expected output
7. **Analyze**: Estimate complexity if all tests pass
8. **Store**: Save execution result to database
9. **Return**: Send detailed results to user

### Code Wrapping Example (JavaScript)

**User Code:**
```javascript
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
```

**Wrapped Code Sent to API:**
```javascript
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test case execution
const input = [[2,7,11,15], 9];
const result = twoSum([2,7,11,15], 9);
console.log(JSON.stringify(result));
```

## 📊 Complexity Analysis

The system uses heuristic-based analysis to estimate complexity:

### Time Complexity Detection
- **O(1)**: No loops or recursion
- **O(log n)**: Binary search patterns
- **O(n)**: Single loop
- **O(n log n)**: Sorting algorithms
- **O(n²)**: Nested loops
- **O(2^n)**: Recursive calls

### Space Complexity Detection
- **O(1)**: No additional data structures
- **O(n)**: Arrays, Maps, Sets created

### Heuristics
- Detects loops: `for`, `while`
- Detects recursion: function calls itself
- Detects data structures: `Map`, `Set`, `Array`, `HashMap`, `List`
- Compares with question requirements

## 🚀 Usage Examples

### Example 1: Run Tests During Development
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }",
    "testCaseIndices": [0, 1],
    "includeHiddenTests": false
  }'
```

### Example 2: Validate Final Solution
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "def twoSum(nums, target):\n    map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in map:\n            return [map[complement], i]\n        map[num] = i\n    return []"
  }'
```

### Example 3: Debug with Custom Test
```bash
curl -X POST http://localhost:3000/code-execution/run-custom \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function sum(arr) { return arr.reduce((a,b) => a+b, 0); }",
    "testCases": [
      {"input": "[1, 2, 3]", "expectedOutput": "6"},
      {"input": "[10, 20]", "expectedOutput": "30"}
    ]
  }'
```

### Example 4: Check Expected Complexity
```bash
curl -X GET http://localhost:3000/code-execution/two-sum/complexity \
  -H "Authorization: Bearer $TOKEN"
```

### Example 5: View Execution History
```bash
curl -X GET "http://localhost:3000/code-execution/history?questionId=two-sum&limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

## 🎯 Integration with Progress Tracking

When code execution succeeds, you can automatically update progress:

```javascript
// 1. Run and validate code
const executionResult = await fetch('/code-execution/two-sum/validate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    language: 'javascript',
    code: userCode
  })
}).then(r => r.json());

// 2. If all tests passed, record submission
if (executionResult.allTestsPassed) {
  await fetch('/dsa-progress/two-sum/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: executionResult.language,
      code: executionResult.code,
      status: 'Solved',
      testCasesPassed: executionResult.passedTestCases,
      totalTestCases: executionResult.totalTestCases,
      executionTime: executionResult.averageExecutionTime,
      timeSpent: getTimeSpent()
    })
  });
}
```

## ⚙️ Configuration

### Piston API
- **URL**: `https://emkc.org/api/v2/piston`
- **Free tier**: Suitable for moderate use
- **Rate limits**: Check Piston documentation
- **Alternative**: Set up your own Piston instance or use Judge0

### Timeouts
- Compilation: 10 seconds
- Execution: Configurable per question (default 5 seconds)
- HTTP timeout: Execution timeout + 2 seconds

### Memory Limits
- Configurable per question
- Default: No limit on Piston free tier

## 🔒 Security Considerations

1. **Sandboxed Execution**: Piston API runs code in isolated containers
2. **Timeout Protection**: Prevents infinite loops
3. **Memory Limits**: Prevents memory exhaustion
4. **No File System Access**: User code cannot access files
5. **No Network Access**: User code cannot make external requests
6. **Authentication Required**: All endpoints protected with JWT

## 🐛 Error Handling

### Compilation Errors
```json
{
  "status": "CompilationError",
  "compilationError": "SyntaxError: Unexpected token '}'"
}
```

### Runtime Errors
```json
{
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

## 📈 Performance Tips

1. **Batch Test Cases**: Run multiple test cases efficiently
2. **Cache Results**: Store execution results for analysis
3. **Progressive Testing**: Run public tests first, hidden tests on validate
4. **Async Execution**: Use background jobs for long-running validations
5. **Rate Limiting**: Implement user rate limits to prevent API abuse

## 🎉 Benefits

✅ **Real Code Execution**: Not simulated - actually runs code  
✅ **Multi-Language Support**: 8+ programming languages  
✅ **Detailed Feedback**: Know exactly what failed and why  
✅ **Performance Metrics**: Understand code efficiency  
✅ **Complexity Analysis**: Learn optimal approaches  
✅ **Execution History**: Track improvement over time  
✅ **Custom Testing**: Debug with your own test cases  
✅ **Production Ready**: Error handling, timeouts, security  

## 🔮 Future Enhancements

- [ ] AI-powered complexity analysis (GPT-4)
- [ ] Code quality metrics (cyclomatic complexity, maintainability)
- [ ] Memory profiling details
- [ ] Step-by-step debugger
- [ ] Compiler optimization suggestions
- [ ] Code similarity detection (plagiarism check)
- [ ] Distributed execution for scale
- [ ] More language support
- [ ] Custom compiler flags
- [ ] Interactive execution (REPL-style)

---

**The system is production-ready and provides everything needed for a complete LeetCode-style code execution experience!** 🚀
