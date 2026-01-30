import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AiCvApiService } from '../resume/ai-cv-api.service';

interface CvScoreRequest {
  cv_text: string;
}

interface FitIndexRequest {
  cv_text: string;
  jd_text: string;
  include_constraints?: boolean;
}

interface ImprovementRequest {
  cv_text: string;
  jd_text: string;
}

@Controller('v1/cv')
export class CvController {
  private readonly logger = new Logger(CvController.name);

  constructor(private readonly aiCvApiService: AiCvApiService) {}

  @Post('score')
  async scoreCv(@Body() payload: CvScoreRequest) {
    this.logger.log('🎯 CV Score API called');
    
    try {
      const result = await this.aiCvApiService.scoreCv(payload.cv_text);
      return result;
    } catch (error) {
      this.logger.error('CV scoring failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to score CV',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('fit-index')
  async calculateFitIndex(@Body() payload: FitIndexRequest) {
    this.logger.log('🎯 CV Fit Index API called');
    
    try {
      const result = await this.aiCvApiService.calculateFitIndex(
        payload.cv_text,
        payload.jd_text
      );
      return result;
    } catch (error) {
      this.logger.error('Fit index calculation failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to calculate fit index',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('improvement')
  async improveCv(@Body() payload: ImprovementRequest) {
    this.logger.log('🎯 CV Improvement API called');
    
    try {
      const result = await this.aiCvApiService.getImprovementSuggestions(
        payload.cv_text,
        payload.jd_text
      );
      return result;
    } catch (error) {
      this.logger.error('CV improvement failed:', error.message);
      throw new HttpException(
        error.message || 'Failed to get improvement suggestions',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}