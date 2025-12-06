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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TestRunnerService } from './test-runner.service';
import { CodeExecutionService } from './code-execution.service';
import {
  ExecuteCodeDto,
  RunCustomTestDto,
  ValidateSolutionDto,
} from './dto/execute-code.dto';

@Controller('code-execution')
@UseGuards(JwtAuthGuard)
export class CodeExecutionController {
  constructor(
    private readonly testRunnerService: TestRunnerService,
    private readonly codeExecutionService: CodeExecutionService,
  ) {}

  @Post(':questionId/run')
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
  async getComplexityRequirements(@Param('questionId') questionId: string) {
    return await this.testRunnerService.getComplexityRequirements(questionId);
  }

  @Get('history')
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
  async getExecutionResult(@Param('executionId') executionId: string) {
    return await this.codeExecutionService.getExecutionResult(executionId);
  }
}
