import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { DsaQuestionsService } from './dsa-questions.service';
import { DsaQuestionsController } from './dsa-questions.controller';
import { DsaQuestion, DsaQuestionSchema } from './schemas/dsa-question.schema';
import { DsaProgressService } from './dsa-progress.service';
import { DsaProgressController } from './dsa-progress.controller';
import { DsaProgress, DsaProgressSchema } from './schemas/dsa-progress.schema';
import { CodeExecutionService } from './code-execution.service';
import { TestRunnerService } from './test-runner.service';
import { CodeExecutionController } from './code-execution.controller';
import { ExecutionResult, ExecutionResultSchema } from './schemas/execution-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DsaQuestion.name, schema: DsaQuestionSchema },
      { name: DsaProgress.name, schema: DsaProgressSchema },
      { name: ExecutionResult.name, schema: ExecutionResultSchema },
    ]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [DsaQuestionsController, DsaProgressController, CodeExecutionController],
  providers: [DsaQuestionsService, DsaProgressService, CodeExecutionService, TestRunnerService],
  exports: [DsaQuestionsService, DsaProgressService, CodeExecutionService, TestRunnerService],
})
export class DsaQuestionsModule {}
