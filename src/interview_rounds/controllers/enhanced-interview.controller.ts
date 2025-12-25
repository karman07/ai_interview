import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EnhancedInterviewService } from '../services/enhanced-interview.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InterviewRound } from '../schemas/interview-session.schema';

@Controller('interviews')
@UseGuards(JwtAuthGuard)
export class EnhancedInterviewController {
  constructor(private readonly interviewService: EnhancedInterviewService) {}

  @Post('start')
  async startInterview(
    @Body() body: {
      round: InterviewRound;
      role?: string;
      company?: string;
      jobDescription?: string;
      experience?: string;
      industry?: string;
    },
    @CurrentUser() user: any
  ) {
    console.log(`🚀 Interview Rounds API started - start endpoint called for user: ${user.sub}`);
    console.log('📋 Request data:', JSON.stringify(body, null, 2));
    return this.interviewService.startSession({
      userId: user.sub,
      ...body,
    });
  }

  @Post(':sessionId/complete')
  async completeInterview(
    @Param('sessionId') sessionId: string,
    @Body() body: {
      finalReport?: any;
      finalScores?: {
        overall?: number;
        communication?: number;
        technical?: number;
        problemSolving?: number;
        behavioral?: number;
      };
    }
  ) {
    return this.interviewService.completeSession(
      sessionId,
      body.finalReport,
      body.finalScores
    );
  }

  @Get('my-sessions')
  async getMySessions(
    @CurrentUser() user: any,
    @Query('round') round?: InterviewRound,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0
  ) {
    return this.interviewService.getUserSessions(
      user.sub,
      round,
      Number(limit),
      Number(offset)
    );
  }

  @Get('session/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return this.interviewService.getSessionById(sessionId);
  }

  @Get('analytics')
  async getMyAnalytics(@CurrentUser() user: any) {
    return this.interviewService.getUserAnalytics(user.sub);
  }

  @Get('performance-insights')
  async getPerformanceInsights(@CurrentUser() user: any) {
    return this.interviewService.getPerformanceInsights(user.sub);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('round') round?: InterviewRound,
    @Query('limit') limit = 10
  ) {
    return this.interviewService.getLeaderboard(round, Number(limit));
  }

  @Get('dashboard-stats')
  async getDashboardStats(@CurrentUser() user: any) {
    const analytics = await this.interviewService.getUserAnalytics(user.sub);
    const recentSessions = await this.interviewService.getUserSessions(user.sub, undefined, 5);
    
    return {
      totalInterviews: analytics.overall.totalInterviews,
      completedInterviews: analytics.overall.completedInterviews,
      averageScore: analytics.overall.overallAverageScore,
      bestScore: analytics.overall.bestOverallScore,
      currentStreak: analytics.overall.currentStreak,
      longestStreak: analytics.overall.longestStreak,
      totalTimeSpent: analytics.overall.totalTimeSpent,
      recentSessions: recentSessions.slice(0, 3).map(session => ({
        id: session.sessionId,
        round: session.round,
        score: session.metrics.overallScore,
        date: session.completedAt || session.createdAt,
        status: session.status,
      })),
      roundStats: {
        technical: {
          averageScore: analytics.technical.averageScore,
          totalSessions: analytics.technical.totalSessions,
          bestScore: analytics.technical.bestScore,
        },
        behavioral: {
          averageScore: analytics.behavioral.averageScore,
          totalSessions: analytics.behavioral.totalSessions,
          bestScore: analytics.behavioral.bestScore,
        },
        problemSolving: {
          averageScore: analytics.problemSolving.averageScore,
          totalSessions: analytics.problemSolving.totalSessions,
          bestScore: analytics.problemSolving.bestScore,
        },
        hr: {
          averageScore: analytics.hr.averageScore,
          totalSessions: analytics.hr.totalSessions,
          bestScore: analytics.hr.bestScore,
        },
      },
    };
  }

  @Get('monthly-progress')
  async getMonthlyProgress(@CurrentUser() user: any) {
    const analytics = await this.interviewService.getUserAnalytics(user.sub);
    return {
      monthlyProgress: analytics.monthlyProgress.slice(-12), // Last 12 months
    };
  }

  @Get('round-comparison')
  async getRoundComparison(@CurrentUser() user: any) {
    const analytics = await this.interviewService.getUserAnalytics(user.sub);
    
    return {
      technical: {
        averageScore: analytics.technical.averageScore,
        completedSessions: analytics.technical.completedSessions,
        improvementTrend: analytics.technical.improvementTrend,
      },
      behavioral: {
        averageScore: analytics.behavioral.averageScore,
        completedSessions: analytics.behavioral.completedSessions,
        improvementTrend: analytics.behavioral.improvementTrend,
      },
      problemSolving: {
        averageScore: analytics.problemSolving.averageScore,
        completedSessions: analytics.problemSolving.completedSessions,
        improvementTrend: analytics.problemSolving.improvementTrend,
      },
      hr: {
        averageScore: analytics.hr.averageScore,
        completedSessions: analytics.hr.completedSessions,
        improvementTrend: analytics.hr.improvementTrend,
      },
    };
  }
}