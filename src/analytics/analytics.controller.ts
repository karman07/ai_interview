import { Controller, Get, Req, UseGuards, Post, Body, Query, HttpCode, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { TrackVisitorDto } from './dto/track-visitor.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { TrackPageViewDto } from './dto/track-pageview.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Logger } from '@nestjs/common'; // Keep Logger as it's used in the constructor

@Controller(['analytics', 'interviews'])
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly analyticsService: AnalyticsService) {
    this.logger.log('AnalyticsController initialized with routes: /analytics and /interviews');
  }

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getAllVisitors() {
    return this.analyticsService.getAllVisitors();
  }

  @Get('visitors/:visitorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getVisitorStats(@Param('visitorId') visitorId: string) {
    return this.analyticsService.getVisitorStats(visitorId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getAllSessions(@Query('limit') limit?: number) {
    return this.analyticsService.getAllSessions(limit);
  }

  @Get('sessions/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getSessionDetails(@Param('sessionId') sessionId: string) {
    return this.analyticsService.getSessionDetails(sessionId);
  }

  @Get('pageviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getAllPageViews(@Query('limit') limit?: number) {
    return this.analyticsService.getAllPageViews(limit);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getAnalyticsSummary() {
    return this.analyticsService.getAnalyticsSummary();
  }

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getAdminDashboardStats() {
    return this.analyticsService.getAdminDashboardStats();
  }

  @Get('admin/recent-sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getRecentSessions(@Query('limit') limit?: number) {
    return this.analyticsService.getAllSessions(limit);
  }

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard)
  async getInterviewDashboardStats(@Req() req) {
    const userId = req.user?.sub;
    return this.analyticsService.getAdminDashboardStats(userId);
  }

  @Get('teacher-insights')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_TEACHER, UserRole.ADMIN)
  async getTeacherInsights(@Req() req) {
    const teacherId = req.user?.sub;
    return this.analyticsService.getTeacherInsights(teacherId);
  }

  @Get('admin/popular-pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getPopularPages(@Query('limit') limit = 10) {
    return this.analyticsService.getPopularPages(+limit);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  async getUserAnalytics(@Req() req) {
    const userId = req.user?.sub;
    return this.analyticsService.getAnalytics(userId);
  }

  // --- AI USAGE endpoints ---

  @Post('ai-usage')
  @HttpCode(200)
  async recordAIUsage(@Body() usageData: any) {
    return this.analyticsService.saveAIUsage(usageData);
  }

  @Get('admin/ai-usage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY_TEACHER)
  async getAdminAIUsageStats() {
    return this.analyticsService.getAdminAIUsageStats();
  }

  @Post('heartbeat')
  async heartbeat(@Body() data: { sessionId: string; visitorId: string; url?: string; userId?: string }) {
    return this.analyticsService.heartbeat(data);
  }
}
