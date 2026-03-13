import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller(['results', 'enhanced-interview'])
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly service: ResultsService) { }

  @Get('mine')
  async getMyResults(@Req() req) {
    const userId = req.user.sub;
    return this.service.getMyResults(userId);
  }

  @Get(':id')
  async getResultById(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.service.getResultById(userId, id);
  }

  @Post('external-analytics')
  async storeExternalAnalytics(@Req() req, @Body() data: any) {
    const userId = req.user.sub;
    return this.service.createEnhancedResult(userId, data);
  }

  @Post(':sessionId/feedback')
  async submitFeedback(
    @Req() req,
    @Param('sessionId') sessionId: string,
    @Body() body: {
      experienceRating: number;
      resultRating: number;
      comment?: string;
    },
  ) {
    const userId = req.user.sub;
    return this.service.submitFeedback(
      userId,
      sessionId,
      body.experienceRating,
      body.resultRating,
      body.comment || '',
    );
  }
}
