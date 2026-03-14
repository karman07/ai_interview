import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visitor, VisitorDocument } from './schemas/visitor.schema';
import { Session, SessionDocument } from './schemas/session.schema';
import { PageView, PageViewDocument } from './schemas/pageview.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Result, ResultDocument } from '../results/schemas/result.schema';
import { Payment, PaymentDocument, PaymentStatus } from '../payments/schemas/payment.schema';
import { Resume, ResumeDocument } from '../resume/resume.schema';
import { TrackVisitorDto } from './dto/track-visitor.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { TrackPageViewDto } from './dto/track-pageview.dto';
import { Subject } from 'rxjs';
import { AIUsage, AIUsageDocument } from './schemas/ai-usage.schema';

@Injectable()
export class AnalyticsService {
  public readonly aiUsageSubject = new Subject<any>();

  constructor(
    @InjectModel(Visitor.name) private visitorModel: Model<VisitorDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(PageView.name) private pageViewModel: Model<PageViewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    @InjectModel(AIUsage.name) private aiUsageModel: Model<AIUsageDocument>,
  ) { }

  // Mark sessions that haven't been active in 30 minutes as inactive
  private async cleanupStaleSessions() {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    await this.sessionModel.updateMany(
      { isActive: true, startTime: { $lt: thirtyMinAgo }, endTime: null },
      { $set: { isActive: false, endTime: thirtyMinAgo } }
    );
  }

  // Track visitor
  async trackVisitor(dto: TrackVisitorDto) {
    const now = new Date();

    const visitor = await this.visitorModel.findOneAndUpdate(
      { visitorId: dto.visitorId },
      {
        $set: {
          userId: dto.userId,
          userAgent: dto.userAgent,
          country: dto.country,
          device: dto.device,
          isAdmin: dto.isAdmin,
          lastVisit: now,
        },
        $setOnInsert: {
          firstVisit: now,
          totalSessions: 0,
          totalPageViews: 0,
        },
      },
      { upsert: true, new: true },
    );

    return visitor;
  }

  // Start session
  async startSession(dto: StartSessionDto) {
    const now = new Date();

    // Check if session already exists
    const existingSession = await this.sessionModel.findOne({ sessionId: dto.sessionId });

    if (existingSession) {
      // Update existing session
      const session = await this.sessionModel.findOneAndUpdate(
        { sessionId: dto.sessionId },
        {
          $set: {
            userId: dto.userId,
            userAgent: dto.userAgent,
            country: dto.country,
            device: dto.device,
            isActive: true,
          },
        },
        { new: true },
      );
      return session;
    }

    // Create new session
    const session = await this.sessionModel.create({
      sessionId: dto.sessionId,
      visitorId: dto.visitorId,
      userId: dto.userId,
      startTime: now,
      landingPage: dto.landingPage,
      referrer: dto.referrer,
      userAgent: dto.userAgent,
      country: dto.country,
      device: dto.device,
      pageCount: 0,
      isActive: true,
    });

    // Increment visitor session count
    await this.visitorModel.findOneAndUpdate(
      { visitorId: dto.visitorId },
      { $inc: { totalSessions: 1 } },
    );

    return session;
  }

  // End session
  async endSession(sessionId: string, exitPage?: string) {
    const session = await this.sessionModel.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          endTime: new Date(),
          exitPage: exitPage,
          isActive: false,
        },
      },
      { new: true },
    );

    return session;
  }

  // Track page view
  async trackPageView(dto: TrackPageViewDto) {
    const now = new Date();

    // Create page view
    const pageView = await this.pageViewModel.create({
      sessionId: dto.sessionId,
      visitorId: dto.visitorId,
      userId: dto.userId,
      path: dto.path,
      title: dto.title,
      referrer: dto.referrer,
      timestamp: now,
      timeOnPage: dto.timeOnPage,
      scrollDepth: dto.scrollDepth,
    });

    // Update session page count
    await this.sessionModel.findOneAndUpdate(
      { sessionId: dto.sessionId },
      {
        $inc: { pageCount: 1 },
        $set: { exitPage: dto.path },
      },
    );

    // Increment visitor page view count
    await this.visitorModel.findOneAndUpdate(
      { visitorId: dto.visitorId },
      { $inc: { totalPageViews: 1 } },
    );

    return pageView;
  }

  // Get visitor stats
  async getVisitorStats(visitorId: string) {
    const visitor = await this.visitorModel.findOne({ visitorId });
    const sessions = await this.sessionModel.find({ visitorId }).sort({ startTime: -1 });
    const pageViews = await this.pageViewModel.find({ visitorId }).sort({ timestamp: -1 });

    return {
      visitor,
      sessions,
      pageViews,
      totalSessions: sessions.length,
      totalPageViews: pageViews.length,
    };
  }

  // Get session details
  async getSessionDetails(sessionId: string) {
    const session = await this.sessionModel.findOne({ sessionId });
    const pageViews = await this.pageViewModel.find({ sessionId }).sort({ timestamp: 1 });

    return {
      session,
      pageViews,
    };
  }

  // Get all visitors
  async getAllVisitors() {
    return this.visitorModel.aggregate([
      { $sort: { lastVisit: -1 } },
      {
        $addFields: {
          userObjectId: {
            $convert: {
              input: '$userId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$userDetails', 0] },
        },
      },
      {
        $project: {
          userDetails: 0,
          userObjectId: 0,
          'user.password': 0,
        },
      },
    ]);
  }

  // Get all sessions
  async getAllSessions(limit = 100) {
    return this.sessionModel.aggregate([
      { $sort: { startTime: -1 } },
      { $limit: limit },
      {
        $addFields: {
          userObjectId: {
            $convert: {
              input: '$userId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjectId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$userDetails', 0] },
        },
      },
      {
        $project: {
          userDetails: 0,
          userObjectId: 0,
          'user.password': 0,
        },
      },
    ]);
  }

  // Get all page views
  async getAllPageViews(limit = 100) {
    return this.pageViewModel.find().sort({ timestamp: -1 }).limit(limit);
  }

  // Get analytics summary
  async getAnalyticsSummary() {
    const totalVisitors = await this.visitorModel.countDocuments();
    const totalSessions = await this.sessionModel.countDocuments();
    const totalPageViews = await this.pageViewModel.countDocuments();
    const activeSessions = await this.sessionModel.countDocuments({ isActive: true });

    // Get popular pages
    const popularPages = await this.pageViewModel.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return {
      totalVisitors,
      totalSessions,
      totalPageViews,
      activeSessions,
      popularPages,
    };
  }

  // Get popular pages breakdown
  async getPopularPages(limit = 10) {
    return this.pageViewModel.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 }, title: { $first: '$title' } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { path: '$_id', count: 1, title: 1, _id: 0 } }
    ]);
  }

  // Connect (for WebSocket handshake)
  async connect(data: { visitorId: string; sessionId: string; userId?: string }) {
    // Update session to active
    await this.sessionModel.findOneAndUpdate(
      { sessionId: data.sessionId },
      { $set: { isActive: true } },
    );

    return {
      success: true,
      message: 'WebSocket connected',
      data,
    };
  }

  // Heartbeat (keep session alive)
  async heartbeat(data: { sessionId: string; visitorId: string; path?: string }) {
    const now = new Date();

    // Update session to show it's still active
    const session = await this.sessionModel.findOneAndUpdate(
      { sessionId: data.sessionId },
      {
        $set: {
          isActive: true,
          exitPage: data.path, // Update exit page to current page
        },
      },
      { new: true },
    );

    // Update visitor's last visit time
    await this.visitorModel.findOneAndUpdate(
      { visitorId: data.visitorId },
      { $set: { lastVisit: now } },
    );

    return {
      success: true,
      message: 'Heartbeat received',
      sessionId: data.sessionId,
      isActive: session?.isActive || false,
    };
  }

  // Get user-specific analytics (for frontend dashboard)
  async getAnalytics(userId: string) {
    const [results, currentUser] = await Promise.all([
      this.resultModel
        .find({ owner: new Types.ObjectId(userId) })
        .sort({ createdAt: 1 })
        .exec(),
      this.userModel.findById(userId).populate('subscriptionPlan').exec()
    ]);

    const plan = {
      name: (currentUser?.subscriptionPlan as any)?.name || 'free_tier_in',
      displayName: (currentUser?.subscriptionPlan as any)?.displayName || 'Free Tier',
      features: (currentUser?.subscriptionPlan as any)?.features || []
    };

    if (!results || results.length === 0) {
      return {
        userId,
        technical: { totalSessions: 0, completedSessions: 0, averageScore: 0, bestScore: 0, improvementTrend: 0 },
        behavioral: { totalSessions: 0, completedSessions: 0, averageScore: 0, bestScore: 0, improvementTrend: 0 },
        problemSolving: { totalSessions: 0, completedSessions: 0, averageScore: 0, bestScore: 0, improvementTrend: 0 },
        hr: { totalSessions: 0, completedSessions: 0, averageScore: 0, bestScore: 0, improvementTrend: 0 },
        overall: {
          totalInterviews: 0,
          completedInterviews: 0,
          overallAverageScore: 0,
          bestOverallScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalTimeSpent: 0,
          strengths: [],
          areasForImprovement: [],
        },
        monthlyProgress: [],
      };
    }

    // Default everything to technical for now as Result schema doesn't have roundType yet
    const technicalResults = results.filter(r => (r as any).roundType === 'technical' || !(r as any).roundType);
    const behavioralResults = results.filter(r => (r as any).roundType === 'behavioral');
    const problemSolvingResults = results.filter(r => (r as any).roundType === 'problem-solving');
    const hrResults = results.filter(r => (r as any).roundType === 'hr');

    const calculateStats = (res: any[]) => {
      const total = res.length;
      if (total === 0) return { totalSessions: 0, completedSessions: 0, averageScore: 0, bestScore: 0, improvementTrend: 0 };
      const avg = res.reduce((sum, r) => sum + (r.summary?.overall_score || 0), 0) / total;
      const best = Math.max(...res.map(r => r.summary?.overall_score || 0));
      return {
        totalSessions: total,
        completedSessions: total,
        averageScore: avg / 10, // Converting 0-100 to 0-10 if frontend expects 0-10 (Reviewing Radar usage)
        bestScore: best / 10,
        improvementTrend: 0,
      };
    };

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    if (results.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let lastDate: Date | null = null;
      let tempStreak = 0;

      for (const res of results) {
        const resDate = new Date(res.createdAt!);
        resDate.setHours(0, 0, 0, 0);

        if (!lastDate) {
          tempStreak = 1;
        } else {
          const diffDays = (resDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            tempStreak = 1;
          }
        }
        lastDate = resDate;
        longestStreak = Math.max(longestStreak, tempStreak);
      }

      const diffFromToday = (today.getTime() - lastDate!.getTime()) / (1000 * 3600 * 24);
      currentStreak = diffFromToday <= 1 ? tempStreak : 0;
    }

    const overallAverageScore = results.reduce((sum, r) => sum + (r.summary?.overall_score || 0), 0) / results.length;
    const bestOverallScore = Math.max(...results.map(r => r.summary?.overall_score || 0));

    // Monthly Progress
    const monthlyGroups = results.reduce((acc, res) => {
      const date = new Date(res.createdAt!);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[key]) acc[key] = { sessionsCount: 0, totalScore: 0 };
      acc[key].sessionsCount++;
      acc[key].totalScore += (res.summary?.overall_score || 0);
      return acc;
    }, {} as Record<string, { sessionsCount: number; totalScore: number }>);

    const monthlyProgress = Object.keys(monthlyGroups).sort().map(month => ({
      month,
      sessionsCount: monthlyGroups[month].sessionsCount,
      averageScore: monthlyGroups[month].totalScore / monthlyGroups[month].sessionsCount / 10,
      timeSpent: monthlyGroups[month].sessionsCount * 30,
    }));

    const lastResult = results[results.length - 1];

    return {
      userId,
      technical: calculateStats(technicalResults),
      behavioral: calculateStats(behavioralResults),
      problemSolving: calculateStats(problemSolvingResults),
      hr: calculateStats(hrResults),
      overall: {
        totalInterviews: results.length,
        completedInterviews: results.length,
        monthlyInterviews: currentUser?.interviewCount || 0,
        overallAverageScore: overallAverageScore / 10,
        bestOverallScore: bestOverallScore / 10,
        currentStreak,
        longestStreak,
        totalTimeSpent: results.length * 30,
        strengths: lastResult?.summary?.key_strengths || [],
        areasForImprovement: lastResult?.summary?.key_areas_for_improvement || [],
      },
      monthlyProgress,
      plan
    };
  }

  // Professional Admin Dashboard Stats
  async getAdminDashboardStats(userId?: string) {
    // Cleanup stale sessions before computing stats
    await this.cleanupStaleSessions();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // 1. Core Summary Metrics
    const [
      totalUsers,
      totalInterviews,
      totalResumes,
      totalRevenueData,
      activeSessions,
      newUsersLast7Days,
      paidUsersCount,
      currentUser
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.resultModel.countDocuments(),
      this.resumeModel.countDocuments(),
      this.paymentModel.aggregate([
        { $match: { status: PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Only count sessions active in the last 5 minutes (real-time active)
      this.sessionModel.countDocuments({
        isActive: true,
        $or: [
          { startTime: { $gte: fiveMinutesAgo } },
          { endTime: null, startTime: { $gte: new Date(now.getTime() - 30 * 60 * 1000) } }
        ]
      }),
      this.userModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      // Count users with active paid subscriptions
      this.userModel.countDocuments({ subscriptionStatus: 'active' }),
      userId ? this.userModel.findById(userId).populate('subscriptionPlan').exec() : Promise.resolve(null)
    ]);

    const totalRevenue = totalRevenueData[0]?.total ? totalRevenueData[0].total / 100 : 0;

    // Conversion rate = paid users / total users * 100 (percentage)
    const conversionRate = totalUsers > 0 ? ((paidUsersCount / totalUsers) * 100).toFixed(2) : '0.00';

    const overview: any = {
      totalUsers,
      totalInterviews,
      totalResumes,
      totalRevenue,
      activeSessions,
      paidUsers: paidUsersCount,
      growth: {
        newUsersLast7Days,
        conversionRate
      }
    };

    if (currentUser) {
      overview.monthlyInterviews = currentUser.interviewCount || 0;
      overview.monthlyResumes = currentUser.resumeCount || 0;
      overview.totalInterviews = await this.resultModel.countDocuments({ owner: new Types.ObjectId(userId) });
      overview.totalResumes = await this.resumeModel.countDocuments({ user: userId });

      overview.plan = {
        name: (currentUser.subscriptionPlan as any)?.name || 'free_tier_in',
        displayName: (currentUser.subscriptionPlan as any)?.displayName || 'Free Tier',
        features: (currentUser.subscriptionPlan as any)?.features || []
      };
    }

    // 2. Recent Activity (Last 7 Days) — filter out null userIds for accurate unique user count
    const recentActivity = await this.sessionModel.aggregate([
      { $match: { startTime: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          sessions: { $sum: 1 },
          visitors: { $addToSet: "$visitorId" }
        }
      },
      { $project: { date: "$_id", sessions: 1, userCount: { $size: "$visitors" }, _id: 0 } },
      { $sort: { date: 1 } }
    ]);

    // 3. User Breakdown
    const userBreakdown = await this.userModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // 4. Popular Interview Topics
    const popularTopics = await this.resultModel.aggregate([
      { $group: { _id: '$jobDescription', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 5. Traffic Sources
    const trafficSources = await this.sessionModel.aggregate([
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 6. Device Breakdown
    const deviceBreakdown = await this.sessionModel.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    let externalAnalytics = [];
    if (userId) {
      const results = await this.resultModel
        .find({ owner: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();

      externalAnalytics = results.map(r => ({
        ...r.toObject(),
        timestamp: r.createdAt,
      }));
    }

    return {
      overview,
      activityChart: recentActivity,
      userMetrics: {
        roles: userBreakdown.reduce((acc, curr) => ({ ...acc, [curr._id || 'unknown']: curr.count }), {}),
      },
      contentMetrics: {
        popularTopics: popularTopics.map(t => ({ topic: t._id, count: t.count })),
        totalResumes
      },
      trafficMetrics: {
        sources: trafficSources.map(s => ({ source: s._id || 'direct', count: s.count })),
        devices: deviceBreakdown.reduce((acc, curr) => ({ ...acc, [curr._id || 'desktop']: curr.count }), {})
      },
      externalAnalytics,
      updatedAt: now
    };
  }

  // AI Usage Statistics for Admin Dashboard
  async getAIUsageStats() {
    const tokensByPlan = await this.aiUsageModel.aggregate([
      {
        $group: {
          _id: '$subscriptionStatus',
          totalTokens: { $sum: '$totalTokens' },
          totalCost: { $sum: '$costUsd' },
          sessions: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          plan: '$_id',
          totalTokens: 1,
          totalCost: 1,
          sessionCount: { $size: '$sessions' },
          _id: 0,
        },
      },
    ]);

    const usageOverTime = await this.aiUsageModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          tokens: { $sum: '$totalTokens' },
          cost: { $sum: '$costUsd' },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
      { $project: { date: '$_id', tokens: 1, cost: 1, _id: 0 } },
    ]);

    const totalRevenueData = await this.paymentModel.aggregate([
      { $match: { status: PaymentStatus.PAID } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalCostData = await this.aiUsageModel.aggregate([
      { $group: { _id: null, total: { $sum: '$costUsd' } } },
    ]);

    return {
      tokensByPlan,
      usageOverTime,
      totalRevenue: (totalRevenueData[0]?.total || 0) / 100, // in INR/USD base unit
      totalAICost: totalCostData[0]?.total || 0,
      timestamp: new Date(),
    };
  }

  // Enhanced AI Usage Statistics for Dedicated Admin Page
  async getAdminAIUsageStats() {
    const baseStats = await this.getAIUsageStats();

    // Get recent session breakdown with user details
    const recentSessions = await this.aiUsageModel.aggregate([
      { $sort: { timestamp: -1 } },
      { $limit: 100 },
      {
        // Convert userId to ObjectId for $lookup — handles both string and ObjectId storage.
        // onError/onNull return null (no match) instead of throwing.
        $addFields: {
          userIdObj: {
            $convert: {
              input: '$userId',
              to: 'objectId',
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userIdObj',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$userDetails', 0] },
        },
      },
      {
        $project: {
          userDetails: 0,
          userIdObj: 0,
          'user.password': 0,
          'user.tokens': 0,
        },
      },
    ]);

    return {
      ...baseStats,
      recentSessions,
    };
  }

  async saveAIUsage(data: Partial<AIUsage> & { source?: string; interviewType?: string; role?: string; company?: string }) {
    // Cast userId to ObjectId so the $lookup in aggregates works correctly
    let userObjectId: Types.ObjectId | null = null;
    if (data.userId) {
      const idStr = data.userId.toString();
      if (idStr && idStr !== 'anonymous' && Types.ObjectId.isValid(idStr)) {
        userObjectId = new Types.ObjectId(idStr);
      }
    }

    // Lookup user's actual subscription status
    let subscriptionStatus = data.subscriptionStatus || 'free';
    if (userObjectId) {
      try {
        const user = await this.userModel.findById(userObjectId).select('subscriptionStatus').lean();
        if (user) {
          subscriptionStatus = (user as any).subscriptionStatus || 'free';
        }
      } catch (err) {
        console.error('Error fetching user for AI usage:', err);
      }
    }

    // Python sends CUMULATIVE running totals (not per-turn deltas), so we always $set
    // the latest values rather than $inc (which would double-count on every turn report).
    const updatePayload: any = {
      model: data.model || 'gemini-2.0-flash',
      subscriptionStatus,
      source: data.source || 'interview',
      interviewType: data.interviewType || '',
      role: data.role || '',
      company: data.company || '',
      inputTokens: data.inputTokens ?? 0,
      outputTokens: data.outputTokens ?? 0,
      totalTokens: data.totalTokens ?? 0,
      costUsd: data.costUsd ?? 0,
      timestamp: data.timestamp || new Date(),
    };

    // Only set userId when it's a real ObjectId (skip anonymous)
    if (userObjectId) {
      updatePayload.userId = userObjectId;
    }

    if (!data.sessionId) {
      console.error('[AI Usage] saveAIUsage called without sessionId — record cannot be upserted, skipping.');
      return null;
    }

    const usage = await this.aiUsageModel.findOneAndUpdate(
      { sessionId: data.sessionId },
      { $set: updatePayload },
      { upsert: true, new: true, runValidators: false },
    );

    console.log(
      `[AI Usage] Saved — session=${data.sessionId} user=${userObjectId ?? 'anon'} ` +
      `plan=${subscriptionStatus} tokens=${updatePayload.totalTokens} cost=$${updatePayload.costUsd.toFixed(6)}`,
    );

    // Broadcast fresh stats over SSE/Socket
    const stats = await this.getAIUsageStats();
    this.aiUsageSubject.next(stats);

    return usage;
  }
}
