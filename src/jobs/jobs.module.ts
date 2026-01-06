import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JobsController } from './jobs.controller';
import { EnhancedJobController } from './enhanced-job.controller';
import { ChatController } from './chat.controller';
import { JobsService } from './jobs.service';
import { EnhancedJobService } from './enhanced-job.service';
import { ChatService } from './chat.service';
import { Job, JobSchema } from './schemas/job.schema';
import { JobApplication, JobApplicationSchema } from './schemas/job-application.schema';
import { EmployerRequest, EmployerRequestSchema } from './schemas/employer-request.schema';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Resume, ResumeSchema } from '../resume/resume.schema';
import { AiMatcherService } from '../common/services/ai-matcher.service';
import { InterviewRoundsModule } from '../interview_rounds/interview.module';
import { EnhancedInterviewService } from '../interview_rounds/services/enhanced-interview.service';
import { InterviewSession, InterviewSessionSchema } from '../interview_rounds/schemas/interview-session.schema';
import { UserInterviewAnalytics, UserInterviewAnalyticsSchema } from '../interview_rounds/schemas/user-interview-analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: EmployerRequest.name, schema: EmployerRequestSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema },
      { name: Resume.name, schema: ResumeSchema },
      { name: InterviewSession.name, schema: InterviewSessionSchema },
      { name: UserInterviewAnalytics.name, schema: UserInterviewAnalyticsSchema },
    ]),
    HttpModule,
    InterviewRoundsModule,
  ],
  controllers: [JobsController, EnhancedJobController, ChatController],
  providers: [JobsService, EnhancedJobService, ChatService, AiMatcherService],
  exports: [JobsService, EnhancedJobService, ChatService],
})
export class JobsModule {}