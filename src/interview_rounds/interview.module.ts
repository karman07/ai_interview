import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { LlmService } from './services/llm.service';
import { InterviewService } from './services/interview.service';
import { TechnicalGateway } from './gateways/technical.gateway';
import { BehaviorGateway } from './gateways/behavioral.gateway';
import { ProblemSolvingGateway } from './gateways/problemsolving.gateway';
import { HrGateway } from './gateways/hr.gateway';
import { RedisModule } from '../redis/redis.module';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { InterviewController } from './controllers/interview-rounds.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET, // make sure env is loaded
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([{ name: Interview.name, schema: InterviewSchema }]),
    RedisModule,
  ],
  providers: [
    LlmService,
    InterviewService,
    TechnicalGateway,
    BehaviorGateway,
    ProblemSolvingGateway,
    HrGateway,
    WsJwtGuard
  ],
  controllers: [InterviewController],
  exports: [WsJwtGuard, InterviewService],
})
export class InterviewRoundsModule {}
