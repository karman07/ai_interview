import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Result, ResultSchema } from '../results/schemas/result.schema';
import { Resume, ResumeSchema } from '../resume/resume.schema';

@Module({
  imports: [
    HttpModule.register({ timeout: 30000, maxRedirects: 5 }),
    MongooseModule.forFeature([
      { name: Result.name, schema: ResultSchema },
      { name: Resume.name, schema: ResumeSchema }
    ]),
  ],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
