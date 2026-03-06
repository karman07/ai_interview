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

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Visitor.name) private visitorModel: Model<VisitorDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(PageView.name) private pageViewModel: Model<PageViewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) { }

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
    return this.visitorModel.find().sort({ lastVisit: -1 });
  }

  // Get all sessions
  async getAllSessions(limit = 100) {
    return this.sessionModel.find().sort({ startTime: -1 }).limit(limit);
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

  // Professional Admin Dashboard Stats
  async getAdminDashboardStats(userId?: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Core Summary Metrics
    const [
      totalUsers,
      totalInterviews,
      totalResumes,
      totalRevenueData,
      activeSessions,
      newUsersLast7Days
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.resultModel.countDocuments(),
      this.resumeModel.countDocuments(),
      this.paymentModel.aggregate([
        { $match: { status: PaymentStatus.PAID } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      this.sessionModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    const totalRevenue = totalRevenueData[0]?.total ? totalRevenueData[0].total / 100 : 0; // Convert paisa to INR

    // 2. Recent Activity (Last 7 Days)
    const recentActivity = await this.sessionModel.aggregate([
      { $match: { startTime: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          sessions: { $sum: 1 },
          users: { $addToSet: "$userId" }
        }
      },
      { $project: { date: "$_id", sessions: 1, userCount: { $size: "$users" }, _id: 0 } },
      { $sort: { date: 1 } }
    ]);

    // 3. User Breakdown
    const userBreakdown = await this.userModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // 4. Popular Interview Topics (extracted from jobDescription in Result)
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
      overview: {
        totalUsers,
        totalInterviews,
        totalResumes,
        totalRevenue,
        activeSessions,
        growth: {
          newUsersLast7Days,
          conversionRate: totalUsers > 0 ? (totalRevenueData[0]?.total ? (totalRevenueData[0].total / 100) / totalUsers : 0).toFixed(2) : 0
        }
      },
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
}
