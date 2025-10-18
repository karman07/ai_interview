# Code Execution API - Implementation Guide

## 🚀 Overview

The code execution feature allows users to run their code against test cases in real-time, receive detailed feedback, and analyze the performance and complexity of their solutions.

## 📋 API Endpoints Implemented

### 1. **Run Code** - `POST /code-execution/:questionId/run`
Execute code against question test cases with optional complexity analysis.

**Request:**
```typescript
{
  language: string;          // "javascript" | "python" | "java" | "cpp"
  code: string;             // User's code solution
  includeHiddenTests?: boolean;  // Run hidden test cases (default: false)
  analyzeComplexity?: boolean;   // Perform complexity analysis (default: false)
}
```

**Response:**
```typescript
{
  _id: string;
  userId: string;
  questionId: string;
  language: string;
  code: string;
  status: "completed" | "failed" | "timeout" | "error";
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  testResults: TestCaseResult[];
  totalExecutionTime: number;
  averageExecutionTime: number;
  peakMemoryUsage?: number;
  complexityAnalysis?: ComplexityAnalysis;
  error?: string;
  createdAt: string;
}
```

### 2. **Validate Code** - `POST /code-execution/:questionId/validate`
Validate code syntax without running test cases.

**Request:**
```typescript
{
  language: string;
  code: string;
}
```

**Response:**
```typescript
{
  isValid: boolean;
  errors: string[];
}
```

### 3. **Run Custom Code** - `POST /code-execution/run-custom`
Run code with custom test cases.

**Request:**
```typescript
{
  language: string;
  code: string;
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}
```

### 4. **Get Execution Result** - `GET /code-execution/result/:executionId`
Retrieve a specific execution result by ID.

### 5. **Get Execution History** - `GET /code-execution/history`
Get user's execution history with optional filters.

**Query Parameters:**
- `questionId` - Filter by specific question
- `limit` - Limit number of results

### 6. **Get Complexity Analysis** - `GET /code-execution/:questionId/complexity`
Get complexity analysis for a specific question.

**Response:**
```typescript
{
  timeComplexity: string;    // e.g., "O(n)"
  spaceComplexity: string;   // e.g., "O(1)"
  explanation: string;
}
```

## 🎯 Features

### Real-Time Code Execution
- Execute code in multiple languages (JavaScript, Python, Java, C++)
- Run against public and hidden test cases
- Get immediate feedback

### Detailed Test Results
- Individual test case results
- Input, expected output, and actual output comparison
- Execution time per test case
- Memory usage tracking
- Error messages for failed cases

### Complexity Analysis
- Automatic time complexity detection
- Space complexity analysis
- Detailed explanations
- Comparison with optimal solutions

### Syntax Validation
- Pre-execution syntax checking
- Error detection before running
- Language-specific validation

## 🔧 Implementation Details

### Frontend Components

#### 1. **CodeExecutionContext** (`src/contexts/CodeExecutionContext.tsx`)
State management for code execution:
- `runCode()` - Execute code against test cases
- `validateCode()` - Validate syntax
- `runCustomCode()` - Run with custom tests
- `fetchExecutionHistory()` - Get execution history
- `fetchComplexityAnalysis()` - Get complexity info

#### 2. **Updated DSAQuestionSolvePage**
Enhanced with:
- **Run Code** button - Test without submitting
- **Validate** button - Check syntax
- **Submit Solution** button - Official submission with all test cases
- **Test Results Tab** - View detailed execution results

#### 3. **Test Results Display**
Shows:
- Overall status (passed/failed)
- Test cases passed/failed count
- Average execution time
- Peak memory usage
- Complexity analysis
- Individual test case details
- Error messages

### API Service (`src/api/codeExecution.ts`)
Provides methods for all code execution endpoints with proper TypeScript typing.

### Type Definitions (`src/types/dsa.ts`)
Complete type safety for:
- `CodeExecutionResult`
- `TestCaseResult`
- `ComplexityAnalysis`
- `RunCodeDto`, `ValidateCodeDto`, `RunCustomCodeDto`

## 📖 Usage Examples

### 1. Running Code

```typescript
// In DSAQuestionSolvePage
const handleRunCode = async () => {
  const result = await runCode('two-sum', {
    language: 'javascript',
    code: userCode,
    includeHiddenTests: false,
    analyzeComplexity: true,
  });

  if (result) {
    // Show test results
    setActiveTab('results');
  }
};
```

### 2. Validating Syntax

```typescript
const handleValidateCode = async () => {
  const result = await validateCode('two-sum', {
    language: 'javascript',
    code: userCode,
  });

  if (result?.isValid) {
    alert('✅ Code syntax is valid!');
  } else {
    alert(`❌ Syntax errors:\n${result.errors.join('\n')}`);
  }
};
```

### 3. Submitting Solution

```typescript
const handleSubmit = async () => {
  // Run code with all test cases (including hidden)
  const result = await runCode('two-sum', {
    language: 'javascript',
    code: userCode,
    includeHiddenTests: true,
    analyzeComplexity: true,
  });

  if (result) {
    // Determine status based on results
    const status = result.passedTestCases === result.totalTestCases 
      ? 'Solved' 
      : result.passedTestCases > 0 
      ? 'Attempted' 
      : 'Failed';

    // Submit to progress tracking
    await submitCode('two-sum', {
      language: 'javascript',
      code: userCode,
      status,
      testCasesPassed: result.passedTestCases,
      totalTestCases: result.totalTestCases,
      executionTime: result.averageExecutionTime,
      memoryUsed: result.peakMemoryUsage,
      timeSpent: actualTimeSpent,
    });
  }
};
```

## 🎨 UI Components

### Code Editor Section
```tsx
<CodeEditor value={code} onChange={setCode} language={language} />

<div className="flex items-center gap-2 mt-4">
  {/* Run Code - Test without submission */}
  <button onClick={handleRunCode} disabled={isRunning}>
    {isRunning ? 'Running...' : '▶ Run Code'}
  </button>

  {/* Validate Syntax */}
  <button onClick={handleValidateCode} disabled={isValidating}>
    ✓
  </button>

  {/* Submit Solution - Official submission */}
  <button onClick={handleSubmit} disabled={submitting}>
    {submitting ? 'Submitting...' : '✓ Submit Solution'}
  </button>
</div>
```

### Test Results Display
```tsx
{activeTab === 'results' && currentExecution && (
  <div>
    {/* Summary */}
    <div>Status, Passed/Total, Time, Memory</div>

    {/* Complexity Analysis */}
    {currentExecution.complexityAnalysis && (
      <div>Time/Space Complexity with Explanation</div>
    )}

    {/* Test Case Results */}
    {currentExecution.testResults.map((result, index) => (
      <div key={index}>
        Test Case {index + 1}: 
        - Passed/Failed
        - Input, Expected, Actual
        - Execution Time
        - Error (if any)
      </div>
    ))}
  </div>
)}
```

## 🔐 Security & Performance

### Authentication
- All endpoints require JWT authentication
- User-specific execution results
- Rate limiting applied

### Performance Considerations
- Code execution timeout limits
- Memory usage caps
- Concurrent execution limits
- Result caching for repeated executions

### Error Handling
- Syntax errors caught before execution
- Runtime errors captured and displayed
- Timeout handling
- Memory overflow protection

## 📊 Test Case Results Structure

```typescript
interface TestCaseResult {
  input: string;              // Test input
  expectedOutput: string;     // Expected result
  actualOutput: string;       // User's code output
  passed: boolean;           // Did it pass?
  executionTime: number;     // Time in milliseconds
  memoryUsed?: number;       // Memory in MB
  error?: string;            // Error message if failed
}
```

## 🎯 User Workflow

1. **Write Code** - User writes solution in code editor
2. **Validate** (Optional) - Check syntax before running
3. **Run Code** - Test against public test cases
4. **View Results** - See which tests passed/failed
5. **Iterate** - Fix issues and run again
6. **Submit** - Final submission with all test cases (including hidden)
7. **Track Progress** - Solution recorded in progress tracker

## 🚀 Benefits

### For Users
- ✅ Immediate feedback
- ✅ Detailed error messages
- ✅ Performance metrics
- ✅ Complexity analysis
- ✅ Learn from test case failures
- ✅ Practice without submission pressure

### For Learning
- 📚 Understand why solutions fail
- 📚 Compare actual vs expected output
- 📚 Learn optimal complexity
- 📚 Improve debugging skills
- 📚 Build confidence before submitting

## 🔮 Future Enhancements

- [ ] Multi-language support expansion
- [ ] Custom test case creation
- [ ] Performance comparison with other users
- [ ] Detailed profiling information
- [ ] Code quality analysis
- [ ] Automated hints based on errors
- [ ] Video explanations for failures
- [ ] Community solutions comparison

## 📝 Example cURL Commands

### Run Code (JavaScript)
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { ... }",
    "includeHiddenTests": false,
    "analyzeComplexity": true
  }'
```

### Validate Code
```bash
curl -X POST http://localhost:3000/code-execution/two-sum/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { ... }"
  }'
```

### Get Execution History
```bash
curl -X GET "http://localhost:3000/code-execution/history?questionId=two-sum&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Complexity Analysis
```bash
curl -X GET http://localhost:3000/code-execution/two-sum/complexity \
  -H "Authorization: Bearer $TOKEN"
```

---

**Implementation Complete! 🎉**

All code execution APIs are now fully integrated with the DSA platform, providing users with a comprehensive coding practice experience.
