import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DsaQuestion, DsaQuestionDocument } from './schemas/dsa-question.schema';
import { ExecutionResult, ExecutionStatus, TestCaseResult } from './schemas/execution-result.schema';
import { CodeExecutionService } from './code-execution.service';

@Injectable()
export class TestRunnerService {
  private readonly logger = new Logger(TestRunnerService.name);

  constructor(
    @InjectModel(DsaQuestion.name)
    private dsaQuestionModel: Model<DsaQuestionDocument>,
    private readonly codeExecutionService: CodeExecutionService,
  ) {}

  /**
   * Run all test cases for a question
   */
  async runAllTests(
    questionId: string,
    userId: string,
    language: string,
    code: string,
    includeHiddenTests: boolean = false,
    testCaseIndices?: number[],
  ): Promise<ExecutionResult> {
    this.logger.log(`Running tests for question ${questionId}`);

    // Fetch question
    const question = await this.dsaQuestionModel.findOne({ questionId, isActive: true }).exec();
    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }

    // Filter test cases
    let testCasesToRun = question.testCases;
    
    if (!includeHiddenTests) {
      testCasesToRun = testCasesToRun.filter((tc) => !tc.isHidden);
    }

    if (testCaseIndices && testCaseIndices.length > 0) {
      testCasesToRun = testCasesToRun.filter((tc, index) => testCaseIndices.includes(index));
    }

    if (testCasesToRun.length === 0) {
      throw new NotFoundException('No test cases available to run');
    }

    const timeLimit = question.constraints?.timeLimit || 5000;
    const testResults: TestCaseResult[] = [];
    let totalExecutionTime = 0;
    let maxMemoryUsed = 0;
    let compilationError: string | undefined;
    let runtimeError: string | undefined;
    let status = ExecutionStatus.SUCCESS;

    // Run each test case
    for (let i = 0; i < testCasesToRun.length; i++) {
      const testCase = testCasesToRun[i];
      
      try {
        this.logger.debug(`Running test case ${i + 1}/${testCasesToRun.length}`);
        
        const result = await this.codeExecutionService.executeSingleTest(
          language,
          code,
          testCase.input,
          testCase.expectedOutput,
          timeLimit,
        );

        result.testCaseIndex = i;
        testResults.push(result);
        totalExecutionTime += result.executionTime;
        maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed || 0);

        // Check for errors
        if (result.errorMessage) {
          if (result.errorMessage.includes('Compilation Error')) {
            compilationError = result.errorMessage;
            status = ExecutionStatus.COMPILATION_ERROR;
            break; // Stop on compilation error
          } else if (result.errorMessage.includes('Runtime Error')) {
            runtimeError = result.errorMessage;
            status = ExecutionStatus.RUNTIME_ERROR;
          } else if (result.errorMessage.includes('Time Limit')) {
            status = ExecutionStatus.TIME_LIMIT_EXCEEDED;
            break; // Stop on timeout
          }
        }

        // Stop if a test fails (optional behavior)
        // if (!result.passed) break;

      } catch (error) {
        this.logger.error(`Test case ${i} failed: ${error.message}`);
        testResults.push({
          testCaseIndex: i,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          passed: false,
          executionTime: 0,
          memoryUsed: 0,
          errorMessage: error.message,
        });
        status = ExecutionStatus.FAILED;
      }
    }

    const passedCount = testResults.filter((r) => r.passed).length;
    const failedCount = testResults.filter((r) => !r.passed).length;
    const allPassed = passedCount === testResults.length && status === ExecutionStatus.SUCCESS;

    if (allPassed) {
      status = ExecutionStatus.SUCCESS;
    } else if (status === ExecutionStatus.SUCCESS && failedCount > 0) {
      status = ExecutionStatus.FAILED;
    }

    // Analyze complexity if all tests passed
    let complexityAnalysis;
    if (allPassed) {
      complexityAnalysis = await this.codeExecutionService['analyzeComplexity'](code, language);
      
      // Check if meets complexity requirements from solutions
      if (question.solutions && question.solutions.length > 0) {
        const bestSolution = question.solutions[0]; // Assuming first solution is the optimal one
        if (bestSolution.timeComplexity) {
          complexityAnalysis.meetsRequirements = this.checkComplexityRequirements(
            complexityAnalysis.estimatedTimeComplexity,
            bestSolution.timeComplexity,
          );
        }
      }
    }

    // Create execution result
    const executionResult: Partial<ExecutionResult> = {
      questionId,
      userId,
      language,
      code,
      status,
      testResults,
      totalTestCases: testResults.length,
      passedTestCases: passedCount,
      failedTestCases: failedCount,
      totalExecutionTime,
      averageExecutionTime: testResults.length > 0 ? totalExecutionTime / testResults.length : 0,
      maxMemoryUsed,
      compilationError,
      runtimeError,
      complexityAnalysis,
      allTestsPassed: allPassed,
      submittedAt: new Date(),
    };

    return executionResult as ExecutionResult;
  }

  /**
   * Run custom test cases (user-provided)
   */
  async runCustomTests(
    userId: string,
    language: string,
    code: string,
    customTestCases: Array<{ input: string; expectedOutput: string }>,
  ): Promise<ExecutionResult> {
    this.logger.log(`Running custom tests for user ${userId}`);

    const testResults: TestCaseResult[] = [];
    let totalExecutionTime = 0;
    let maxMemoryUsed = 0;
    let status = ExecutionStatus.SUCCESS;

    for (let i = 0; i < customTestCases.length; i++) {
      const testCase = customTestCases[i];
      
      try {
        const result = await this.codeExecutionService.executeSingleTest(
          language,
          code,
          testCase.input,
          testCase.expectedOutput,
          5000, // Default timeout
        );

        result.testCaseIndex = i;
        testResults.push(result);
        totalExecutionTime += result.executionTime;
        maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed || 0);

        if (result.errorMessage) {
          if (result.errorMessage.includes('Compilation Error')) {
            status = ExecutionStatus.COMPILATION_ERROR;
            break;
          } else if (result.errorMessage.includes('Runtime Error')) {
            status = ExecutionStatus.RUNTIME_ERROR;
          } else if (result.errorMessage.includes('Time Limit')) {
            status = ExecutionStatus.TIME_LIMIT_EXCEEDED;
            break;
          }
        }
      } catch (error) {
        testResults.push({
          testCaseIndex: i,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          passed: false,
          executionTime: 0,
          memoryUsed: 0,
          errorMessage: error.message,
        });
        status = ExecutionStatus.FAILED;
      }
    }

    const passedCount = testResults.filter((r) => r.passed).length;
    const failedCount = testResults.filter((r) => !r.passed).length;

    return {
      questionId: 'custom',
      userId,
      language,
      code,
      status,
      testResults,
      totalTestCases: testResults.length,
      passedTestCases: passedCount,
      failedTestCases: failedCount,
      totalExecutionTime,
      averageExecutionTime: testResults.length > 0 ? totalExecutionTime / testResults.length : 0,
      maxMemoryUsed,
      allTestsPassed: passedCount === testResults.length && status === ExecutionStatus.SUCCESS,
      submittedAt: new Date(),
    } as ExecutionResult;
  }

  /**
   * Validate solution - run all tests including hidden ones
   */
  async validateSolution(
    questionId: string,
    userId: string,
    language: string,
    code: string,
  ): Promise<ExecutionResult> {
    return await this.runAllTests(
      questionId,
      userId,
      language,
      code,
      true, // Include hidden tests
    );
  }

  /**
   * Check if estimated complexity meets requirements
   */
  private checkComplexityRequirements(estimated: string, required: string): boolean {
    const complexityOrder = [
      'O(1)',
      'O(log n)',
      'O(n)',
      'O(n log n)',
      'O(n²)',
      'O(n³)',
      'O(2^n)',
      'O(n!)',
    ];

    const estimatedIndex = complexityOrder.findIndex((c) => estimated.includes(c.replace(/[()]/g, '')));
    const requiredIndex = complexityOrder.findIndex((c) => required.includes(c.replace(/[()]/g, '')));

    if (estimatedIndex === -1 || requiredIndex === -1) {
      return true; // Cannot determine, assume OK
    }

    return estimatedIndex <= requiredIndex;
  }

  /**
   * Get question's expected complexity for user reference
   */
  async getComplexityRequirements(questionId: string): Promise<{
    timeComplexity?: string;
    spaceComplexity?: string;
  }> {
    const question = await this.dsaQuestionModel.findOne({ questionId }).exec();
    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }

    // Get complexity from the optimal solution
    const optimalSolution = question.solutions?.[0];
    
    return {
      timeComplexity: optimalSolution?.timeComplexity,
      spaceComplexity: optimalSolution?.spaceComplexity,
    };
  }
}
