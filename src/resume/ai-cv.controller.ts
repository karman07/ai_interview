import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiCvApiService } from './ai-cv-api.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('ai-cv')
@UseGuards(JwtAuthGuard)
export class AiCvController {
  constructor(private readonly aiCvApi: AiCvApiService) {}

  @Post('score')
  async scoreCv(@Body() payload: { cv_text: string }) {
    return this.aiCvApi.scoreCv(payload.cv_text);
  }

  @Post('fit-index')
  async calculateFitIndex(
    @Body() payload: { cv_text: string; jd_text: string },
  ) {
    return this.aiCvApi.calculateFitIndex(payload.cv_text, payload.jd_text);
  }

  @Post('improvement')
  async getImprovements(
    @Body() payload: { cv_text: string; jd_text: string },
  ) {
    return this.aiCvApi.getImprovementSuggestions(
      payload.cv_text,
      payload.jd_text,
    );
  }

  @Post('evaluate-vs-jd')
  async evaluateCvVsJd(
    @Body() payload: { cv_text: string; jd_text: string },
  ) {
    return this.aiCvApi.evaluateCvVsJd(payload.cv_text, payload.jd_text);
  }
}
