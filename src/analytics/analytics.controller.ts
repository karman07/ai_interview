import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackVisitorDto } from './dto/track-visitor.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { TrackPageViewDto } from './dto/track-pageview.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('visitors')
  async trackVisitor(@Body() dto: TrackVisitorDto) {
    return this.analyticsService.trackVisitor(dto);
  }

  @Post('sessions/start')
  async startSession(@Body() dto: StartSessionDto) {
    return this.analyticsService.startSession(dto);
  }

  @Post('sessions/:sessionId/end')
  async endSession(
    @Param('sessionId') sessionId: string,
    @Body('exitPage') exitPage?: string,
  ) {
    return this.analyticsService.endSession(sessionId, exitPage);
  }

  @Post('pageviews')
  async trackPageView(@Body() dto: TrackPageViewDto) {
    return this.analyticsService.trackPageView(dto);
  }

  @Post('connect')
  async connect(@Body() data: { visitorId: string; sessionId: string; userId?: string }) {
    return this.analyticsService.connect(data);
  }

  @Get('visitors')
  async getAllVisitors() {
    return this.analyticsService.getAllVisitors();
  }

  @Get('visitors/:visitorId')
  async getVisitorStats(@Param('visitorId') visitorId: string) {
    return this.analyticsService.getVisitorStats(visitorId);
  }

  @Get('sessions')
  async getAllSessions(@Query('limit') limit?: number) {
    return this.analyticsService.getAllSessions(limit);
  }

  @Get('sessions/:sessionId')
  async getSessionDetails(@Param('sessionId') sessionId: string) {
    return this.analyticsService.getSessionDetails(sessionId);
  }

  @Get('pageviews')
  async getAllPageViews(@Query('limit') limit?: number) {
    return this.analyticsService.getAllPageViews(limit);
  }

  @Get('summary')
  async getAnalyticsSummary() {
    return this.analyticsService.getAnalyticsSummary();
  }

  @Post('heartbeat')
  async heartbeat(@Body() data: { sessionId: string; visitorId: string; path?: string }) {
    return this.analyticsService.heartbeat(data);
  }
}
