import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { InterviewService } from './services/interview.service';
import { AiInterviewApiService } from './services/ai-interview-api.service';
import { JwtModule } from '@nestjs/jwt';
import { AiInterviewController } from './controllers/ai-interview.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([{ name: Interview.name, schema: InterviewSchema }]),
  ],
  providers: [
    InterviewService,
    AiInterviewApiService,
  ],
  controllers: [AiInterviewController],
  exports: [InterviewService, AiInterviewApiService],
})
export class InterviewRoundsModule {}
