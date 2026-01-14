import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { InterviewSession, InterviewSessionSchema } from './schemas/interview-session.schema';
import { EnhancedInterviewSession, EnhancedInterviewSessionSchema } from './schemas/enhanced-interview-session.schema';
import { InterviewQuestion, InterviewQuestionSchema } from './schemas/interview-question.schema';
import { UserInterviewAnalytics, UserInterviewAnalyticsSchema } from './schemas/user-interview-analytics.schema';
import { Resume, ResumeSchema } from '../resume/resume.schema';
import { JobDescription, JobDescriptionSchema } from '../job-description/job-description.schema';
import { InterviewService } from './services/interview.service';
import { EnhancedInterviewService } from './services/enhanced-interview.service';
import { EnhancedInterviewAnalyticsService } from './services/enhanced-interview-analytics.service';
import { AiInterviewApiService } from './services/ai-interview-api.service';
import { InterviewSessionService } from './services/interview-session.service';
import { JwtModule } from '@nestjs/jwt';
import { AiInterviewController, AiInterviewLegacyController } from './controllers/ai-interview.controller';
import { EnhancedAiInterviewController } from './controllers/enhanced-ai-interview.controller';
import { EnhancedInterviewController } from './controllers/enhanced-interview.controller';
import { InterviewController } from './controllers/interview-rounds.controller';
import { InterviewAnalyticsService } from './services/interview-analytics.service';
import { BehaviorGateway } from './gateways/behavioral.gateway';
import { TechnicalGateway } from './gateways/technical.gateway';
import { HrGateway } from './gateways/hr.gateway';
import { ProblemSolvingGateway } from './gateways/problemsolving.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
      { name: InterviewSession.name, schema: InterviewSessionSchema },
      { name: EnhancedInterviewSession.name, schema: EnhancedInterviewSessionSchema },
      { name: InterviewQuestion.name, schema: InterviewQuestionSchema },
      { name: UserInterviewAnalytics.name, schema: UserInterviewAnalyticsSchema },
      { name: Resume.name, schema: ResumeSchema },
      { name: JobDescription.name, schema: JobDescriptionSchema },
    ]),
  ],
  providers: [
    InterviewService,
    EnhancedInterviewService,
    EnhancedInterviewAnalyticsService,
    AiInterviewApiService,
    InterviewAnalyticsService,
    InterviewSessionService,
    BehaviorGateway,
    TechnicalGateway,
    HrGateway,
    ProblemSolvingGateway,
  ],
  controllers: [
    AiInterviewController,
    AiInterviewLegacyController,
    EnhancedAiInterviewController,
    EnhancedInterviewController,
    InterviewController,
  ],
  exports: [
    InterviewService,
    EnhancedInterviewService,
    EnhancedInterviewAnalyticsService,
    AiInterviewApiService,
    InterviewAnalyticsService,
    InterviewSessionService,
  ],
})
export class InterviewRoundsModule {}