import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { AiCvApiService } from '../resume/ai-cv-api.service';

@Module({
  controllers: [CvController],
  providers: [AiCvApiService],
})
export class CvModule {}