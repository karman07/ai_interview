import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { AiCvController } from './ai-cv.controller';
import { Resume, ResumeSchema } from './resume.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { HttpModule } from '@nestjs/axios';
import { AiCvApiService } from './ai-cv-api.service';
import { AiMatcherService } from '../common/services/ai-matcher.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
      { name: User.name, schema: UserSchema },
    ]),
    HttpModule, // For calling Python API
  ],
  controllers: [ResumeController, AiCvController],
  providers: [ResumeService, AiCvApiService, AiMatcherService],
  exports: [AiCvApiService],
})
export class ResumeModule {}