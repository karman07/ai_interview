import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/current-user.decorator';
import {
  TrackPageViewDto,
  TrackVisitorDto,
  StartSessionDto,
  EndSessionDto,
  AnalyticsStatsDto,
  TopPagesDto,
  RealTimeStatsDto,
  AnalyticsDashboardDto,
  TimeSeriesDataDto,
  UserVisitorsResponseDto,
  UserVisitorStatsResponseDto,
} from './dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);
  
  constructor(
    private readonly analyticsService: AnalyticsService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private getRequestIp(req: any): string {
    return (
      req.ip ||
      req.headers['x-forwarded-for']?.split(',')?.[0] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  private formatReqLog(req: any, payload?: any) {
    const ip = this.getRequestIp(req);
    const visitorId = payload?.visitorId || req.body?.visitorId || req.query?.visitorId || 'unknown';
    const sessionId = payload?.sessionId || req.body?.sessionId || req.query?.sessionId || 'unknown';
    const userId = payload?.userId || req.body?.userId || req.query?.userId || 'unknown';
    return `ip=${ip} visitor=${visitorId} session=${sessionId} user=${userId} time=${new Date().toISOString()}`;
  }

  @Post('visitors')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a visitor' })
  @ApiResponse({ status: 201, description: 'Visitor tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async trackVisitor(@Body(ValidationPipe) trackVisitorDto: TrackVisitorDto) {
    try {
      const visitor = await this.analyticsService.trackVisitor(trackVisitorDto);
      this.logger.debug(`HTTP trackVisitor: ${this.formatReqLog(null, trackVisitorDto)}`);
      return {
        success: true,
        message: 'Visitor tracked successfully',
        data: {
          visitorId: visitor.visitorId,
          sessionId: visitor.sessionId,
          isReturning: visitor.isReturning,
          sessionCount: visitor.sessionCount,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to track visitor: ${error.message}`);
    }
  }

  @Post('sessions/start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a new session' })
  @ApiResponse({ status: 201, description: 'Session started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async startSession(@Body(ValidationPipe) startSessionDto: StartSessionDto) {
    try {
      const session = await this.analyticsService.startSession(startSessionDto);
      this.logger.log(`HTTP startSession: ${this.formatReqLog(null, startSessionDto)}`);
      return {
        success: true,
        message: 'Session started successfully',
        data: {
          sessionId: session.sessionId,
          startTime: session.startTime,
          entryPage: session.entryPage,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to start session: ${error.message}`);
    }
  }

  @Post('sessions/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End a session' })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async endSession(@Body(ValidationPipe) endSessionDto: EndSessionDto) {
    try {
      this.logger.log(`HTTP endSession request: ${this.formatReqLog(null, endSessionDto)}`);
      const result = await this.analyticsService.endSession(endSessionDto);

      if (!result.session) {
        return {
          success: false,
          message: 'Session not found',
          data: {
            sessionId: endSessionDto.sessionId,
            found: false,
          },
        };
      }

      if (result.alreadyEnded) {
        return {
          success: true,
          message: 'Session was already ended',
          data: {
            sessionId: result.session.sessionId,
            duration: result.session.duration,
            pageViews: result.session.pageViews,
            endTime: result.session.endTime,
          },
        };
      }

      return {
        success: true,
        message: 'Session ended successfully',
        data: {
          sessionId: result.session.sessionId,
          duration: result.session.duration,
          pageViews: result.session.pageViews,
          endTime: result.session.endTime,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to end session: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to end session: ${error.message}`);
    }
  }

  @Post('pageviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a page view' })
  @ApiResponse({ status: 201, description: 'Page view tracked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async trackPageView(@Body(ValidationPipe) trackPageViewDto: TrackPageViewDto) {
    try {
      const pageView = await this.analyticsService.trackPageView(trackPageViewDto);
      this.logger.debug(`HTTP trackPageView: ${this.formatReqLog(null, trackPageViewDto)}`);
      return {
        success: true,
        message: 'Page view tracked successfully',
        data: {
          path: pageView.path,
          timestamp: pageView.timestamp,
          sessionId: pageView.sessionId,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to track page view: ${error.message}`);
    }
  }

  @Post('pageviews/:sessionId/:path/time-spent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update time spent on a page' })
  @ApiResponse({ status: 200, description: 'Time spent updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateTimeSpent(
    @Param('sessionId') sessionId: string,
    @Param('path') path: string,
    @Body('timeSpent') timeSpent: number,
  ) {
    try {
      if (!timeSpent || timeSpent < 0) {
        throw new BadRequestException('Time spent must be a positive number');
      }

  await this.analyticsService.updatePageViewTimeSpent(sessionId, decodeURIComponent(path), timeSpent);
  this.logger.debug(`HTTP updateTimeSpent: ip=unknown session=${sessionId} path=${decodeURIComponent(path)} timeSpent=${timeSpent}`);
      return {
        success: true,
        message: 'Time spent updated successfully',
        data: {
          sessionId,
          path: decodeURIComponent(path),
          timeSpent,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to update time spent: ${error.message}`);
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics statistics for a date range' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Analytics statistics retrieved successfully', type: AnalyticsStatsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @User() user: any,
  ): Promise<{ success: boolean; data: AnalyticsStatsDto }> {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException('Start date and end date are required');
      }

      // Validate date format
      if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      const stats = await this.analyticsService.getAnalyticsStats(startDate, endDate);
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get analytics stats: ${error.message}`);
    }
  }

  @Get('pages/top')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get top pages by views' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiQuery({ name: 'limit', description: 'Number of pages to return', example: 10, required: false })
  @ApiResponse({ status: 200, description: 'Top pages retrieved successfully', type: [TopPagesDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTopPages(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit: string = '10',
    @User() user: any,
  ): Promise<{ success: boolean; data: TopPagesDto[] }> {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException('Start date and end date are required');
      }

      if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      const limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('Limit must be a number between 1 and 100');
      }

      const topPages = await this.analyticsService.getTopPages(startDate, endDate, limitNum);
      return {
        success: true,
        data: topPages,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get top pages: ${error.message}`);
    }
  }

  @Get('realtime')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get real-time analytics statistics' })
  @ApiResponse({ status: 200, description: 'Real-time statistics retrieved successfully', type: RealTimeStatsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRealTimeStats(@User() user: any): Promise<{ success: boolean; data: RealTimeStatsDto }> {
    try {
      const stats = await this.analyticsService.getRealTimeStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get real-time stats: ${error.message}`);
    }
  }

  // HTTP connect/disconnect/heartbeat endpoints to replace websocket lifecycle events
  @Post('connect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a client connect event (HTTP fallback)' })
  async httpConnect(@Req() req: any, @Body(ValidationPipe) payload: any) {
    try {
      this.logger.log(`[HTTP CONNECT] ${this.formatReqLog(req, payload)}`);
      // Optionally track visitor on connect
      if (payload?.visitorId && payload?.sessionId) {
        await this.analyticsService.trackVisitor({
          visitorId: payload.visitorId,
          sessionId: payload.sessionId,
          userId: payload.userId,
          userAgent: req.headers['user-agent'],
          country: payload.country,
          device: payload.device,
        });
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`HTTP connect failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to register connect: ${error.message}`);
    }
  }

  @Post('disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a client disconnect event (HTTP fallback)' })
  async httpDisconnect(@Req() req: any, @Body(ValidationPipe) payload: any) {
    try {
      this.logger.log(`[HTTP DISCONNECT] ${this.formatReqLog(req, payload)}`);

      // End session if provided
      if (payload?.sessionId) {
        // Try to fetch session to compute duration/pageViews if missing
        const existing = await this.analyticsService.getSessionById(payload.sessionId);
        if (!existing) {
          this.logger.warn(`[HTTP DISCONNECT] session not found: ${payload.sessionId}`);
        } else {
          const duration = Math.floor((new Date().getTime() - (existing.startTime?.getTime?.() || new Date().getTime())) / 1000);
          const endDto: any = {
            sessionId: payload.sessionId,
            exitPage: payload?.exitPage || existing.exitPage || existing.entryPage,
            duration,
            pageViews: existing.pageViews || 0,
            interactions: existing.interactions || 0,
          };

          const result = await this.analyticsService.endSession(endDto as EndSessionDto);
          this.logger.log(`[HTTP DISCONNECT] endSession result for ${payload.sessionId}: ${result.session ? 'ended' : 'not_found'} alreadyEnded=${result.alreadyEnded}`);
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`HTTP disconnect failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to register disconnect: ${error.message}`);
    }
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Heartbeat from client to keep session alive (HTTP fallback)' })
  async httpHeartbeat(@Req() req: any, @Body(ValidationPipe) payload: { sessionId: string; visitorId?: string }) {
    try {
      this.logger.debug(`[HTTP HEARTBEAT] ${this.formatReqLog(req, payload)}`);
      // Update last activity via service (optional: could be a lightweight touch)
      if (payload?.sessionId) {
        await this.analyticsService.touchSession(payload.sessionId);
      }
      return { success: true, timestamp: new Date() };
    } catch (error) {
      this.logger.error(`HTTP heartbeat failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to heartbeat: ${error.message}`);
    }
  }

  // Read endpoints for sessions and pageviews
  @Get('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get session by sessionId' })
  async getSessionById(@Param('sessionId') sessionId: string, @User() user: any) {
    const session = await this.analyticsService.getSessionById(sessionId);
    if (!session) throw new BadRequestException('Session not found');
    return { success: true, data: session };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List sessions for current user' })
  async listUserSessions(@Query('limit') limit = '50', @Query('offset') offset = '0', @User() user: any) {
    const limitNum = parseInt(limit as string, 10) || 50;
    const offsetNum = parseInt(offset as string, 10) || 0;
    const sessions = await this.analyticsService.getSessionsForUser(user.sub, limitNum, offsetNum);
    return { success: true, data: sessions };
  }

  @Get('sessions/:sessionId/pageviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pageviews for a session' })
  async getPageviewsForSession(@Param('sessionId') sessionId: string, @User() user: any) {
    const pageviews = await this.analyticsService.getPageViewsForSession(sessionId);
    return { success: true, data: pageviews };
  }

  @Get('timeseries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get time series data for analytics' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiQuery({ name: 'interval', description: 'Time interval', enum: ['hour', 'day'], example: 'day', required: false })
  @ApiResponse({ status: 200, description: 'Time series data retrieved successfully', type: [TimeSeriesDataDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTimeSeriesData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval') interval: 'hour' | 'day' = 'day',
    @User() user: any,
  ): Promise<{ success: boolean; data: TimeSeriesDataDto[] }> {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException('Start date and end date are required');
      }

      if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      if (!['hour', 'day'].includes(interval)) {
        throw new BadRequestException('Interval must be either "hour" or "day"');
      }

      const timeSeries = await this.analyticsService.getTimeSeriesData(startDate, endDate, interval);
      return {
        success: true,
        data: timeSeries,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get time series data: ${error.message}`);
    }
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get complete analytics dashboard data' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully', type: AnalyticsDashboardDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboard(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @User() user: any,
  ): Promise<{ success: boolean; data: AnalyticsDashboardDto }> {
    try {
      if (!startDate || !endDate) {
        throw new BadRequestException('Start date and end date are required');
      }

      if (!this.isValidDate(startDate) || !this.isValidDate(endDate)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      const dashboard = await this.analyticsService.getDashboard(startDate, endDate);
      return {
        success: true,
        data: dashboard,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get dashboard data: ${error.message}`);
    }
  }

  @Get('visitors/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get visitors for the authenticated user' })
  @ApiQuery({ name: 'limit', description: 'Number of visitors to return', example: 50, required: false })
  @ApiQuery({ name: 'offset', description: 'Number of visitors to skip', example: 0, required: false })
  @ApiResponse({ status: 200, description: 'User visitors retrieved successfully', type: UserVisitorsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserVisitors(
    @User() user: any,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ): Promise<UserVisitorsResponseDto> {
    try {
      const userId = user.sub;
      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 200) {
        throw new BadRequestException('Limit must be a number between 1 and 200');
      }

      if (isNaN(offsetNum) || offsetNum < 0) {
        throw new BadRequestException('Offset must be a non-negative number');
      }

      const visitors = await this.analyticsService.getUserVisitors(userId, limitNum, offsetNum);
      
      return {
        success: true,
        data: {
          visitors: visitors.map(visitor => ({
            visitorId: visitor.visitorId,
            sessionId: visitor.sessionId,
            isReturning: visitor.isReturning,
            sessionCount: visitor.sessionCount,
            firstVisit: visitor.firstVisit,
            lastVisit: visitor.lastVisit,
            country: visitor.country,
            device: visitor.device,
            userAgent: visitor.userAgent,
            totalTimeSpent: visitor.totalTimeSpent,
            totalPageViews: visitor.totalPageViews,
          })),
          pagination: {
            limit: limitNum,
            offset: offsetNum,
            total: visitors.length,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get user visitors: ${error.message}`);
    }
  }

  @Get('visitors/me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get visitor statistics for the authenticated user' })
  @ApiResponse({ status: 200, description: 'User visitor statistics retrieved successfully', type: UserVisitorStatsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserVisitorStats(@User() user: any): Promise<UserVisitorStatsResponseDto> {
    try {
      const userId = user.sub;
      const stats = await this.analyticsService.getUserVisitorStats(userId);
      
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get user visitor stats: ${error.message}`);
    }
  }

  // Health check endpoint for analytics tracking
  @Get('health')
  @ApiOperation({ summary: 'Analytics service health check' })
  @ApiResponse({ status: 200, description: 'Analytics service is healthy' })
  async healthCheck() {
    return {
      success: true,
      message: 'Analytics service is healthy',
      timestamp: new Date(),
    };
  }

  // Diagnostic endpoint to inspect mongoose connection and collections
  @Get('db-check')
  @ApiOperation({ summary: 'Diagnostics: report mongoose connection state and collections' })
  async dbCheck() {
    try {
      const state = this.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      const collections = await this.connection.db.listCollections().toArray();
      const names = collections.map((c: any) => c.name);
      return { success: true, state, collections: names };
    } catch (error) {
      this.logger.error(`DB check failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}