import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { InterviewSession, InterviewSessionSchema } from './schemas/interview-session.schema';
import { UserInterviewAnalytics, UserInterviewAnalyticsSchema } from './schemas/user-interview-analytics.schema';
import { InterviewService } from './services/interview.service';
import { EnhancedInterviewService } from './services/enhanced-interview.service';
import { AiInterviewApiService } from './services/ai-interview-api.service';
import { JwtModule } from '@nestjs/jwt';
import { AiInterviewController } from './controllers/ai-interview.controller';
import { EnhancedInterviewController } from './controllers/enhanced-interview.controller';
import { InterviewController } from './controllers/interview-rounds.controller';
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
      { name: UserInterviewAnalytics.name, schema: UserInterviewAnalyticsSchema },
    ]),
  ],
  providers: [
    InterviewService,
    EnhancedInterviewService,
    AiInterviewApiService,
    BehaviorGateway,
    TechnicalGateway,
    HrGateway,
    ProblemSolvingGateway,
  ],
  controllers: [
    AiInterviewController,
    EnhancedInterviewController,
    InterviewController,
  ],
  exports: [
    InterviewService,
    EnhancedInterviewService,
    AiInterviewApiService,
  ],
})
export class InterviewRoundsModule {}
