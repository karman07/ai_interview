# Code Execution System - Quick Start Guide

## ✅ What Was Built

A **complete code execution and validation system** that:
- ✅ Runs real code in 8+ languages using Piston API
- ✅ Validates against test cases
- ✅ Measures execution time & memory
- ✅ Analyzes time/space complexity
- ✅ Provides detailed error messages
- ✅ Tracks execution history

## 📁 New Files Created

1. **schemas/execution-result.schema.ts** - Execution result data model
2. **dto/execute-code.dto.ts** - Request/response DTOs
3. **code-execution.service.ts** - Core execution engine with Piston API
4. **test-runner.service.ts** - Test case runner and validator
5. **code-execution.controller.ts** - 6 API endpoints
6. **CODE_EXECUTION.md** - Complete documentation
7. **CODE_EXECUTION_CURLS.md** - All cURL commands

## 🔌 6 New API Endpoints

| # | Endpoint | Purpose |
|---|----------|---------|
| 1 | `POST /code-execution/:questionId/run` | Run code against test cases |
| 2 | `POST /code-execution/:questionId/validate` | Validate with all tests (incl. hidden) |
| 3 | `POST /code-execution/run-custom` | Run with custom test cases |
| 4 | `GET /code-execution/:questionId/complexity` | Get complexity requirements |
| 5 | `GET /code-execution/history` | Get execution history |
| 6 | `GET /code-execution/result/:id` | Get specific result details |

## 🚀 Quick Test

### 1. Run Code
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }",
    "includeHiddenTests": false
  }'
```

### 2. Validate Solution
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }"
  }'
```

### 3. Custom Test (Debug)
```bash
curl -X POST http://localhost:3000/code-execution/run-custom \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function test(arr) { return arr.reduce((a,b) => a+b, 0); }",
    "testCases": [
      {"input": "[1,2,3]", "expectedOutput": "6"},
      {"input": "[10,20]", "expectedOutput": "30"}
    ]
  }'
```

## 📊 Response Example

```json
{
  "questionId": "two-sum",
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
  "averageExecutionTime": 42,
  "allTestsPassed": true,
  "complexityAnalysis": {
    "estimatedTimeComplexity": "O(n)",
    "estimatedSpaceComplexity": "O(n)",
    "meetsRequirements": true,
    "analysis": "Single loop detected. Additional data structures used."
  }
}
```

## 💻 Supported Languages

- ✅ JavaScript (Node 18.15.0)
- ✅ Python (3.10.0)
- ✅ Java (15.0.2)
- ✅ C++ (10.2.0)
- ✅ TypeScript (5.0.3)
- ✅ Go (1.16.2)
- ✅ Rust (1.68.2)
- ✅ C# (6.12.0)

## 🎯 Execution Statuses

| Status | Meaning |
|--------|---------|
| `Success` | All tests passed ✅ |
| `Failed` | Some tests failed ❌ |
| `RuntimeError` | Code crashed 💥 |
| `CompilationError` | Syntax error 🔴 |
| `TimeLimitExceeded` | Too slow ⏰ |

## 🔄 Complete User Flow

```
1. Write code in editor
2. POST /code-execution/:questionId/run (test)
3. See results, fix issues
4. POST /code-execution/:questionId/validate (final)
5. POST /dsa-progress/:questionId/submit (record)
6. POST /dsa-questions/:questionId/submit (stats)
```

## ⚙️ How It Works

```
User Code → Wrap with Test Logic → Send to Piston API → Execute in Sandbox
  ↓
Parse Output → Compare Results → Measure Performance
  ↓
Analyze Complexity → Store Results → Return to User
```

## 🔒 Security

- ✅ Sandboxed execution (no file system access)
- ✅ Timeout protection (configurable per question)
- ✅ Memory limits
- ✅ No network access from user code
- ✅ JWT authentication required

## 📈 Features

### Code Execution
- Real compiler APIs (Piston)
- 8+ programming languages
- Configurable timeouts
- Memory usage tracking

### Test Validation
- Run all or specific test cases
- Include/exclude hidden tests
- Custom test cases for debugging
- Detailed pass/fail per test

### Complexity Analysis
- Estimates time complexity (O(1), O(n), O(n²), etc.)
- Estimates space complexity
- Checks if meets requirements
- Provides analysis explanation

### Results Tracking
- Store all execution results
- Query execution history
- Track improvements over time
- Detailed error messages

## 🎨 Integration Example

```javascript
// Frontend: Execute and track
const executeAndTrack = async (questionId, code, language) => {
  // 1. Validate solution
  const result = await fetch(`/code-execution/${questionId}/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ language, code })
  }).then(r => r.json());
  
  // 2. If successful, record progress
  if (result.allTestsPassed) {
    await fetch(`/dsa-progress/${questionId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: result.language,
        code: result.code,
        status: 'Solved',
        testCasesPassed: result.passedTestCases,
        totalTestCases: result.totalTestCases,
        executionTime: result.averageExecutionTime,
        timeSpent: getTimeSpent()
      })
    });
    
    // 3. Update global stats
    await fetch(`/dsa-questions/${questionId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language,
        isAccepted: true
      })
    });
  }
  
  return result;
};
```

## 🐛 Error Handling

### Compilation Error
```json
{
  "status": "CompilationError",
  "compilationError": "SyntaxError: Unexpected token '}'"
}
```

### Runtime Error
```json
{
  "status": "RuntimeError",
  "runtimeError": "TypeError: Cannot read property 'length' of undefined"
}
```

### Wrong Answer
```json
{
  "status": "Failed",
  "testResults": [{
    "testCaseIndex": 0,
    "expectedOutput": "[0,1]",
    "actualOutput": "[1,0]",
    "passed": false,
    "errorMessage": "Output mismatch"
  }]
}
```

## 📊 Module Integration

Updated `dsa-questions.module.ts`:
- Added HttpModule for API calls
- Added ExecutionResult schema
- Added CodeExecutionService
- Added TestRunnerService
- Added CodeExecutionController

## 🎉 Total System Summary

**Complete Platform Endpoints:**
- **12** DSA Questions endpoints
- **12** Progress Tracking endpoints
- **6** Code Execution endpoints
- **= 30 Total Endpoints!** 🚀

**Complete Feature Set:**
- ✅ Question management (CRUD, search, filter)
- ✅ User progress tracking (submissions, stats, history)
- ✅ **Code execution (run, validate, debug)** ⭐ NEW
- ✅ **Complexity analysis** ⭐ NEW
- ✅ **Multi-language support** ⭐ NEW
- ✅ Test case validation
- ✅ Performance metrics
- ✅ Execution history

## 📚 Documentation Files

1. **CODE_EXECUTION.md** - Complete system documentation
2. **CODE_EXECUTION_CURLS.md** - All cURL commands
3. **PROGRESS_TRACKING.md** - Progress API docs
4. **SYSTEM_OVERVIEW.md** - Full architecture
5. **ALL_CURL_COMMANDS.md** - All 30+ endpoints
6. **QUICKSTART.md** - Getting started guide

## 🚀 Next Steps

1. **Start server**: `npm run start:dev`
2. **Access Swagger**: http://localhost:3000/docs
3. **Test endpoints**: Use cURL commands from docs
4. **Build frontend**: Integrate with your React/Vue app
5. **Monitor usage**: Check execution history

## 💡 Tips

- **Start with custom tests** for quick debugging
- **Use public tests** during development
- **Run validation** before final submission
- **Check complexity** to optimize your solution
- **Review history** to track improvement

---

**You now have a complete LeetCode-style platform with real code execution!** 🎉

The system is production-ready and provides:
- Real compiler API integration (Piston)
- 8+ programming languages
- Complete test validation
- Performance metrics
- Complexity analysis
- Execution tracking
- Detailed error feedback

**All systems integrated and ready to use!** 🚀
