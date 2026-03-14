import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@Controller(['results', 'enhanced-interview'])
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly service: ResultsService) { }

  // ── Admin: all interview results ──────────────────────────────────────────
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllResults(
    @Query('page')      page?: number,
    @Query('limit')     limit?: number,
    @Query('roundType') roundType?: string,
    @Query('search')    search?: string,
  ) {
    return this.service.getAllResults({ page: +page || 1, limit: +limit || 50, roundType, search });
  }

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
    @Body() body: SubmitFeedbackDto,
  ) {
    const userId = req.user.sub;
    console.log('Feedback submission:', {
      userId,
      sessionId,
      body,
    });
    
    return this.service.submitFeedback(
      userId,
      sessionId,
      body.experienceRating,
      body.resultRating,
      body.comment || '',
    );
  }
}
