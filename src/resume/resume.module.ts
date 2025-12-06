import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { AiCvController } from './ai-cv.controller';
import { Resume, ResumeSchema } from './resume.schema';
import { HttpModule } from '@nestjs/axios';
import { AiCvApiService } from './ai-cv-api.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema }]),
    HttpModule, // For calling Python API
  ],
  controllers: [ResumeController, AiCvController],
  providers: [ResumeService, AiCvApiService],
  exports: [AiCvApiService],
})
export class ResumeModule {}
