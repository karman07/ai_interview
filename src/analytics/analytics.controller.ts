import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TrackVisitorDto } from './dto/track-visitor.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { TrackPageViewDto } from './dto/track-pageview.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('visitors')
  @ApiOperation({ summary: 'Track visitor' })
  async trackVisitor(@Body() dto: TrackVisitorDto) {
    return this.analyticsService.trackVisitor(dto);
  }

  @Post('sessions/start')
  @ApiOperation({ summary: 'Start session' })
  async startSession(@Body() dto: StartSessionDto) {
    return this.analyticsService.startSession(dto);
  }

  @Post('sessions/:sessionId/end')
  @ApiOperation({ summary: 'End session' })
  async endSession(
    @Param('sessionId') sessionId: string,
    @Body('exitPage') exitPage?: string,
  ) {
    return this.analyticsService.endSession(sessionId, exitPage);
  }

  @Post('pageviews')
  @ApiOperation({ summary: 'Track page view' })
  async trackPageView(@Body() dto: TrackPageViewDto) {
    return this.analyticsService.trackPageView(dto);
  }

  @Post('connect')
  @ApiOperation({ summary: 'WebSocket connection handshake' })
  async connect(@Body() data: { visitorId: string; sessionId: string; userId?: string }) {
    return this.analyticsService.connect(data);
  }

  @Get('visitors')
  @ApiOperation({ summary: 'Get all visitors' })
  async getAllVisitors() {
    return this.analyticsService.getAllVisitors();
  }

  @Get('visitors/:visitorId')
  @ApiOperation({ summary: 'Get visitor stats' })
  async getVisitorStats(@Param('visitorId') visitorId: string) {
    return this.analyticsService.getVisitorStats(visitorId);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all sessions' })
  async getAllSessions(@Query('limit') limit?: number) {
    return this.analyticsService.getAllSessions(limit);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get session details' })
  async getSessionDetails(@Param('sessionId') sessionId: string) {
    return this.analyticsService.getSessionDetails(sessionId);
  }

  @Get('pageviews')
  @ApiOperation({ summary: 'Get all page views' })
  async getAllPageViews(@Query('limit') limit?: number) {
    return this.analyticsService.getAllPageViews(limit);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get analytics summary' })
  async getAnalyticsSummary() {
    return this.analyticsService.getAnalyticsSummary();
  }

  @Post('heartbeat')
  @ApiOperation({ summary: 'Session heartbeat (keep-alive)' })
  async heartbeat(@Body() data: { sessionId: string; visitorId: string; path?: string }) {
    return this.analyticsService.heartbeat(data);
  }
}
