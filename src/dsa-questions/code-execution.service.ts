import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ExecutionResult,
  ExecutionResultDocument,
  ExecutionStatus,
  TestCaseResult,
  ComplexityAnalysis,
} from './schemas/execution-result.schema';
import { DsaQuestion } from './schemas/dsa-question.schema';

interface PistonExecutionResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

@Injectable()
export class CodeExecutionService {
  private readonly logger = new Logger(CodeExecutionService.name);
  private readonly pistonApiUrl = 'https://emkc.org/api/v2/piston';

  // Language version mappings for Piston API
  private readonly languageMap = {
    javascript: { name: 'javascript', version: '18.15.0' },
    python: { name: 'python', version: '3.10.0' },
    java: { name: 'java', version: '15.0.2' },
    cpp: { name: 'cpp', version: '10.2.0' },
    typescript: { name: 'typescript', version: '5.0.3' },
    go: { name: 'go', version: '1.16.2' },
    rust: { name: 'rust', version: '1.68.2' },
    csharp: { name: 'csharp', version: '6.12.0' },
  };

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(ExecutionResult.name)
    private executionResultModel: Model<ExecutionResultDocument>,
  ) {}

  /**
   * Execute code with test cases from a question
   */
  async executeCodeForQuestion(
    questionId: string,
    userId: string,
    language: string,
    code: string,
    testCaseIndices?: number[],
    includeHiddenTests: boolean = false,
    analyzeComplexity: boolean = true,
  ): Promise<ExecutionResult> {
    this.logger.log(`Executing code for question ${questionId} by user ${userId}`);

    // This would normally fetch from database
    // For now, we'll return a structured result
    const startTime = Date.now();

    const executionResult = new this.executionResultModel({
      questionId,
      userId,
      language,
      code,
      status: ExecutionStatus.SUCCESS,
      testResults: [],
      totalTestCases: 0,
      passedTestCases: 0,
      failedTestCases: 0,
      submittedAt: new Date(),
    });

    try {
      // Validate language
      if (!this.languageMap[language]) {
        throw new BadRequestException(`Unsupported language: ${language}`);
      }

      // Here you would fetch the question and its test cases
      // For now, we'll simulate the execution
      const testResults: TestCaseResult[] = [];
      let totalExecutionTime = 0;
      let maxMemoryUsed = 0;

      // Simulate test case execution
      // In production, this would call the actual execution API
      executionResult.testResults = testResults;
      executionResult.totalTestCases = testResults.length;
      executionResult.passedTestCases = testResults.filter((t) => t.passed).length;
      executionResult.failedTestCases = testResults.filter((t) => !t.passed).length;
      executionResult.totalExecutionTime = totalExecutionTime;
      executionResult.averageExecutionTime = testResults.length > 0 ? totalExecutionTime / testResults.length : 0;
      executionResult.maxMemoryUsed = maxMemoryUsed;
      executionResult.allTestsPassed = executionResult.passedTestCases === executionResult.totalTestCases;

      // Analyze complexity if requested
      if (analyzeComplexity) {
        executionResult.complexityAnalysis = await this.analyzeComplexity(code, language);
      }

      // Save result
      await executionResult.save();

      return executionResult;
    } catch (error) {
      this.logger.error(`Execution failed: ${error.message}`, error.stack);
      executionResult.status = ExecutionStatus.FAILED;
      executionResult.runtimeError = error.message;
      await executionResult.save();
      throw error;
    }
  }

  /**
   * Execute a single test case using Piston API
   */
  async executeSingleTest(
    language: string,
    code: string,
    input: string,
    expectedOutput: string,
    timeLimit: number = 5000,
  ): Promise<TestCaseResult> {
    const startTime = Date.now();

    try {
      const langConfig = this.languageMap[language];
      if (!langConfig) {
        throw new BadRequestException(`Unsupported language: ${language}`);
      }

      // Wrap code to handle test case input/output
      const wrappedCode = this.wrapCodeForExecution(code, input, language);

      const payload = {
        language: langConfig.name,
        version: langConfig.version,
        files: [
          {
            name: `solution.${this.getFileExtension(language)}`,
            content: wrappedCode,
          },
        ],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: timeLimit,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      };

      this.logger.debug(`Executing test case with Piston API`);
      
      const response = await firstValueFrom(
        this.httpService.post<PistonExecutionResult>(
          `${this.pistonApiUrl}/execute`,
          payload,
          {
            timeout: timeLimit + 2000,
          },
        ),
      );

      const executionTime = Date.now() - startTime;
      const result = response.data;

      // Check for compilation errors
      if (result.compile && result.compile.code !== 0) {
        return {
          testCaseIndex: 0,
          input,
          expectedOutput,
          actualOutput: '',
          passed: false,
          executionTime,
          memoryUsed: 0,
          errorMessage: `Compilation Error: ${result.compile.stderr || result.compile.output}`,
        };
      }

      // Check for runtime errors
      if (result.run.code !== 0 && result.run.signal) {
        return {
          testCaseIndex: 0,
          input,
          expectedOutput,
          actualOutput: '',
          passed: false,
          executionTime,
          memoryUsed: 0,
          errorMessage: `Runtime Error: ${result.run.stderr || result.run.signal}`,
        };
      }

      const actualOutput = (result.run.stdout || result.run.output).trim();
      const passed = this.compareOutputs(actualOutput, expectedOutput.trim());

      return {
        testCaseIndex: 0,
        input,
        expectedOutput,
        actualOutput,
        passed,
        executionTime,
        memoryUsed: 0, // Piston API doesn't provide memory info
        errorMessage: passed ? undefined : 'Output mismatch',
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      if (error.code === 'ETIMEDOUT' || executionTime >= timeLimit) {
        return {
          testCaseIndex: 0,
          input,
          expectedOutput,
          actualOutput: '',
          passed: false,
          executionTime,
          memoryUsed: 0,
          errorMessage: 'Time Limit Exceeded',
        };
      }

      return {
        testCaseIndex: 0,
        input,
        expectedOutput,
        actualOutput: '',
        passed: false,
        executionTime,
        memoryUsed: 0,
        errorMessage: `Execution Error: ${error.message}`,
      };
    }
  }

  /**
   * Wrap user code with test case execution logic
   */
  private wrapCodeForExecution(code: string, input: string, language: string): string {
    const parsedInput = this.parseInput(input);
    const functionName = this.extractFunctionName(code, language);

    this.logger.debug(`Parsed input: ${JSON.stringify(parsedInput)}`);
    this.logger.debug(`Function name: ${functionName}`);

    switch (language) {
      case 'javascript':
      case 'typescript':
        const wrappedCode = `
${code}

// Test case execution
const input = ${JSON.stringify(parsedInput)};
const result = ${this.generateFunctionCall(parsedInput, language, functionName)};
console.log(JSON.stringify(result));
`;
        this.logger.debug(`Wrapped JavaScript code:\n${wrappedCode}`);
        return wrappedCode;

      case 'python':
        return `
${code}

# Test case execution
import json
input_data = ${this.convertToPythonLiteral(parsedInput)}
result = ${this.generateFunctionCall(parsedInput, language, functionName)}
print(json.dumps(result))
`;

      case 'java':
        return `
import java.util.*;
import com.google.gson.Gson;

public class Solution {
${code}

    public static void main(String[] args) {
        Solution solution = new Solution();
        // Test case execution
        Object result = solution.${this.generateFunctionCall(parsedInput, language, functionName)};
        Gson gson = new Gson();
        System.out.println(gson.toJson(result));
    }
}
`;

      case 'cpp':
        return `
#include <iostream>
#include <vector>
#include <string>
using namespace std;

${code}

int main() {
    // Test case execution
    auto result = ${this.generateFunctionCall(parsedInput, language, functionName)};
    // Output result (simplified)
    cout << result << endl;
    return 0;
}
`;

      default:
        return code;
    }
  }

  /**
   * Parse input string into structured data
   */
  private parseInput(input: string): any[] {
    const result: any[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';

    // Parse character by character, respecting nested structures
    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      // Handle string quotes
      if ((char === '"' || char === "'") && (i === 0 || input[i - 1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        current += char;
        continue;
      }

      // If we're inside a string, just add the character
      if (inString) {
        current += char;
        continue;
      }

      // Track depth of brackets
      if (char === '[' || char === '{' || char === '(') {
        depth++;
        current += char;
      } else if (char === ']' || char === '}' || char === ')') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        // Top-level comma - split here
        const trimmed = current.trim();
        if (trimmed) {
          result.push(this.parseValue(trimmed));
        }
        current = '';
      } else {
        current += char;
      }
    }

    // Add the last value
    const trimmed = current.trim();
    if (trimmed) {
      result.push(this.parseValue(trimmed));
    }

    return result;
  }

  /**
   * Parse a single value (number, string, array, etc.)
   */
  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      // If not valid JSON, try removing quotes
      const withoutQuotes = value.replace(/^['"]|['"]$/g, '');
      
      // Try parsing as number
      const num = Number(withoutQuotes);
      if (!isNaN(num) && withoutQuotes !== '') {
        return num;
      }
      
      // Return as string
      return withoutQuotes;
    }
  }

  /**
   * Extract function name from code
   */
  private extractFunctionName(code: string, language: string): string {
    switch (language) {
      case 'javascript':
      case 'typescript':
        // Match: function name(...) or const name = function(...) or const name = (...) =>
        const jsMatch = code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(|const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/);
        return jsMatch ? (jsMatch[1] || jsMatch[2]) : 'solution';
      
      case 'python':
        // Match: def name(...)
        const pyMatch = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        return pyMatch ? pyMatch[1] : 'solution';
      
      case 'java':
      case 'cpp':
      case 'csharp':
        // Match: returnType name(...)
        const match = code.match(/\b(public|private|protected)?\s*\w+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        return match ? match[2] : 'solution';
      
      default:
        return 'solution';
    }
  }

  /**
   * Generate function call based on parsed inputs
   */
  private generateFunctionCall(parsedInput: any[], language: string, functionName?: string): string {
    const args = parsedInput.map((arg) => JSON.stringify(arg)).join(', ');
    return `${functionName || 'solution'}(${args})`;
  }

  /**
   * Convert JavaScript object to Python literal
   */
  private convertToPythonLiteral(data: any): string {
    return JSON.stringify(data).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None');
  }

  /**
   * Compare actual output with expected output
   */
  private compareOutputs(actual: string, expected: string): boolean {
    try {
      // Try to parse both as JSON and compare
      const actualParsed = JSON.parse(actual);
      const expectedParsed = JSON.parse(expected);
      return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
    } catch {
      // If not JSON, compare as strings
      return actual.trim() === expected.trim();
    }
  }

  /**
   * Get file extension for language
   */
  private getFileExtension(language: string): string {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      typescript: 'ts',
      go: 'go',
      rust: 'rs',
      csharp: 'cs',
    };
    return extensions[language] || 'txt';
  }

  /**
   * Analyze time and space complexity (AI-based or heuristic)
   */
  private async analyzeComplexity(code: string, language: string): Promise<ComplexityAnalysis> {
    // This is a simplified heuristic-based analysis
    // In production, you might use AI (GPT-4) or static analysis tools

    let timeComplexity = 'O(n)';
    let spaceComplexity = 'O(1)';
    let analysis = '';

    // Simple heuristics
    const hasNestedLoops = /for.*for|while.*while|for.*while|while.*for/s.test(code);
    const hasSingleLoop = /for|while/.test(code) && !hasNestedLoops;
    const hasRecursion = /function\s+(\w+)\([^)]*\)\s*{[^}]*\1\(/.test(code);
    const hasHashMap = /Map|Set|HashMap|HashSet|dict|set/.test(code);
    const hasArray = /\[\]|Array|Vector|List/.test(code);

    if (hasNestedLoops) {
      timeComplexity = 'O(n²)';
      analysis += 'Nested loops detected. ';
    } else if (hasSingleLoop) {
      timeComplexity = 'O(n)';
      analysis += 'Single loop detected. ';
    } else if (hasRecursion) {
      timeComplexity = 'O(2^n)';
      analysis += 'Recursion detected. ';
    } else {
      timeComplexity = 'O(1)';
      analysis += 'Constant time operations. ';
    }

    if (hasHashMap || hasArray) {
      spaceComplexity = 'O(n)';
      analysis += 'Additional data structures used.';
    } else {
      spaceComplexity = 'O(1)';
      analysis += 'Constant space.';
    }

    return {
      estimatedTimeComplexity: timeComplexity,
      estimatedSpaceComplexity: spaceComplexity,
      meetsRequirements: true, // Would compare with question requirements
      analysis,
    };
  }

  /**
   * Get execution history for a user
   */
  async getExecutionHistory(userId: string, questionId?: string, limit: number = 10): Promise<ExecutionResult[]> {
    const query: any = { userId };
    if (questionId) {
      query.questionId = questionId;
    }

    return await this.executionResultModel
      .find(query)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get execution result by ID
   */
  async getExecutionResult(executionId: string): Promise<ExecutionResult> {
    return await this.executionResultModel.findById(executionId).exec();
  }
}
