import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TestRunnerService } from './test-runner.service';
import { CodeExecutionService } from './code-execution.service';
import {
  ExecuteCodeDto,
  RunCustomTestDto,
  ValidateSolutionDto,
} from './dto/execute-code.dto';

@ApiTags('Code Execution')
@Controller('code-execution')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CodeExecutionController {
  constructor(
    private readonly testRunnerService: TestRunnerService,
    private readonly codeExecutionService: CodeExecutionService,
  ) {}

  @Post(':questionId/run')
  @ApiOperation({
    summary: 'Run code against question test cases',
    description: 'Execute user code against the test cases defined for a question. Returns detailed results for each test case including pass/fail status, execution time, and any errors.',
  })
  @ApiParam({ name: 'questionId', description: 'Question ID', example: 'two-sum' })
  @ApiResponse({
    status: 200,
    description: 'Code executed successfully',
    schema: {
      example: {
        questionId: 'two-sum',
        userId: 'user123',
        language: 'javascript',
        status: 'Success',
        testResults: [
          {
            testCaseIndex: 0,
            input: '[2,7,11,15], 9',
            expectedOutput: '[0,1]',
            actualOutput: '[0,1]',
            passed: true,
            executionTime: 42,
            memoryUsed: 15.5,
          },
        ],
        totalTestCases: 5,
        passedTestCases: 5,
        failedTestCases: 0,
        totalExecutionTime: 210,
        averageExecutionTime: 42,
        maxMemoryUsed: 15.5,
        allTestsPassed: true,
        complexityAnalysis: {
          estimatedTimeComplexity: 'O(n)',
          estimatedSpaceComplexity: 'O(n)',
          meetsRequirements: true,
          analysis: 'Single loop detected. Additional data structures used.',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  async runCode(
    @Request() req,
    @Param('questionId') questionId: string,
    @Body() executeCodeDto: ExecuteCodeDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    
    return await this.testRunnerService.runAllTests(
      questionId,
      userId,
      executeCodeDto.language,
      executeCodeDto.code,
      executeCodeDto.includeHiddenTests || false,
      executeCodeDto.testCaseIndices,
    );
  }

  @Post(':questionId/validate')
  @ApiOperation({
    summary: 'Validate solution against all test cases (including hidden)',
    description: 'Validate the complete solution by running against all test cases including hidden ones. This is typically used for final submission.',
  })
  @ApiParam({ name: 'questionId', description: 'Question ID', example: 'two-sum' })
  @ApiResponse({
    status: 200,
    description: 'Solution validated',
    schema: {
      example: {
        questionId: 'two-sum',
        status: 'Success',
        allTestsPassed: true,
        passedTestCases: 10,
        totalTestCases: 10,
        averageExecutionTime: 38,
        complexityAnalysis: {
          estimatedTimeComplexity: 'O(n)',
          meetsRequirements: true,
        },
      },
    },
  })
  async validateSolution(
    @Request() req,
    @Param('questionId') questionId: string,
    @Body() validateDto: ValidateSolutionDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    
    return await this.testRunnerService.validateSolution(
      questionId,
      userId,
      validateDto.language,
      validateDto.code,
    );
  }

  @Post('run-custom')
  @ApiOperation({
    summary: 'Run code with custom test cases',
    description: 'Execute code with user-provided test cases. Useful for debugging and testing with custom inputs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Custom tests executed',
    schema: {
      example: {
        questionId: 'custom',
        status: 'Success',
        testResults: [
          {
            testCaseIndex: 0,
            input: '[1,2,3], 5',
            expectedOutput: '[1,2]',
            actualOutput: '[1,2]',
            passed: true,
            executionTime: 35,
          },
        ],
        allTestsPassed: true,
      },
    },
  })
  async runCustomTests(
    @Request() req,
    @Body() runCustomDto: RunCustomTestDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    
    return await this.testRunnerService.runCustomTests(
      userId,
      runCustomDto.language,
      runCustomDto.code,
      runCustomDto.testCases,
    );
  }

  @Get(':questionId/complexity')
  @ApiOperation({
    summary: 'Get complexity requirements for a question',
    description: 'Retrieve the expected time and space complexity requirements for a question.',
  })
  @ApiParam({ name: 'questionId', description: 'Question ID', example: 'two-sum' })
  @ApiResponse({
    status: 200,
    description: 'Complexity requirements retrieved',
    schema: {
      example: {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    },
  })
  async getComplexityRequirements(@Param('questionId') questionId: string) {
    return await this.testRunnerService.getComplexityRequirements(questionId);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get execution history for current user',
    description: 'Retrieve the execution history showing all previous code runs and their results.',
  })
  @ApiQuery({
    name: 'questionId',
    required: false,
    description: 'Filter by specific question',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Execution history retrieved',
    schema: {
      example: [
        {
          _id: '...',
          questionId: 'two-sum',
          language: 'javascript',
          status: 'Success',
          passedTestCases: 5,
          totalTestCases: 5,
          allTestsPassed: true,
          submittedAt: '2025-10-14T10:00:00Z',
        },
      ],
    },
  })
  async getExecutionHistory(
    @Request() req,
    @Query('questionId') questionId?: string,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.userId || req.user.sub;
    
    return await this.codeExecutionService.getExecutionHistory(
      userId,
      questionId,
      limit || 10,
    );
  }

  @Get('result/:executionId')
  @ApiOperation({
    summary: 'Get detailed execution result by ID',
    description: 'Retrieve complete details of a specific code execution including all test case results.',
  })
  @ApiParam({ name: 'executionId', description: 'Execution result ID' })
  @ApiResponse({
    status: 200,
    description: 'Execution result retrieved',
  })
  async getExecutionResult(@Param('executionId') executionId: string) {
    return await this.codeExecutionService.getExecutionResult(executionId);
  }
}
