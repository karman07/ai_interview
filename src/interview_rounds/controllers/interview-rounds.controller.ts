import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { InterviewService } from '../services/interview.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('interviews')
@UseGuards(JwtAuthGuard) 
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

 
  @Post('start')
  async startInterview(
    @Body()
    body: {
      userId: string;
      round: string;
      role?: string;
      company?: string;
      jobDescription?: string;
      experience?: string;
    },
  ) {
    return this.interviewService.startWithContext(body);
  }


  @Get('history/:userId')
  async getHistory(@Param('userId') userId: string) {
    return this.interviewService.getHistory(userId);
  }

  @Get('results/:userId')
  async getResults(@Param('userId') userId: string) {
    return this.interviewService.getResults(userId);
  }
}
