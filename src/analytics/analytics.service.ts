import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Visitor, VisitorDocument } from './schemas/visitor.schema';
import { Session, SessionDocument, SessionStatus } from './schemas/session.schema';
import { PageView, PageViewDocument } from './schemas/pageview.schema';
import { RealTimeStats, RealTimeStatsDocument } from './schemas/realtime-stats.schema';
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
} from './dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(Visitor.name) private visitorModel: Model<VisitorDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(PageView.name) private pageViewModel: Model<PageViewDocument>,
    @InjectModel(RealTimeStats.name) private realTimeStatsModel: Model<RealTimeStatsDocument>,
  ) {}

  async trackVisitor(trackVisitorDto: TrackVisitorDto): Promise<VisitorDocument> {
    try {
      let visitor = await this.visitorModel.findOne({
        visitorId: trackVisitorDto.visitorId,
      });

      if (visitor) {
        // Update existing visitor
        visitor.sessionId = trackVisitorDto.sessionId;
        visitor.lastVisit = new Date();
        visitor.sessionCount += 1;
        visitor.isReturning = true;

        // Update other fields if provided
        if (trackVisitorDto.userId) {
          visitor.userId = new Types.ObjectId(trackVisitorDto.userId);
        }
        
        Object.assign(visitor, {
          ...trackVisitorDto,
          userId: trackVisitorDto.userId ? new Types.ObjectId(trackVisitorDto.userId) : visitor.userId,
        });

        await visitor.save();
      } else {
        // Create new visitor
        visitor = new this.visitorModel({
          ...trackVisitorDto,
          userId: trackVisitorDto.userId ? new Types.ObjectId(trackVisitorDto.userId) : undefined,
          isReturning: false,
          sessionCount: 1,
          firstVisit: new Date(),
          lastVisit: new Date(),
        });

        await visitor.save();
      }

      this.logger.log(`Visitor tracked: ${visitor.visitorId}`);
      return visitor;
    } catch (error) {
      this.logger.error(`Error tracking visitor: ${error.message}`, error.stack);
      throw error;
    }
  }

  async startSession(startSessionDto: StartSessionDto): Promise<SessionDocument> {
    try {
      // Check if session already exists
      const existingSession = await this.sessionModel.findOne({
        sessionId: startSessionDto.sessionId,
      });

      if (existingSession) {
        this.logger.warn(`Session already exists: ${startSessionDto.sessionId}`);
        // Update the existing session instead of creating a new one
        existingSession.startTime = new Date();
        existingSession.status = SessionStatus.ACTIVE;
        existingSession.entryPage = startSessionDto.entryPage;
        existingSession.pagesVisited = [startSessionDto.entryPage];
        await existingSession.save();
        return existingSession;
      }

      const session = new this.sessionModel({
        ...startSessionDto,
        userId: startSessionDto.userId ? new Types.ObjectId(startSessionDto.userId) : undefined,
        startTime: new Date(),
        status: SessionStatus.ACTIVE,
        pageViews: 0,
        interactions: 0,
        pagesVisited: [startSessionDto.entryPage],
      });

      await session.save();

      this.logger.log(`Session started: ${session.sessionId}`);
      return session;
    } catch (error) {
      this.logger.error(`Error starting session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async endSession(endSessionDto: EndSessionDto): Promise<{ session: SessionDocument | null; alreadyEnded: boolean }> {
    try {
      // Atomically set session to ENDED only if it isn't already ended
      const update = {
        endTime: new Date(),
        duration: endSessionDto.duration,
        pageViews: endSessionDto.pageViews,
        interactions: endSessionDto.interactions || 0,
        exitPage: endSessionDto.exitPage,
        status: SessionStatus.ENDED,
        bounceRate: endSessionDto.pageViews === 1 ? 1 : 0,
      } as any;

      const updated = await this.sessionModel.findOneAndUpdate(
        { sessionId: endSessionDto.sessionId, status: { $ne: SessionStatus.ENDED } },
        { $set: update },
        { new: true }
      ).exec();

      if (!updated) {
        // Determine whether session doesn't exist or was already ended
        const existing = await this.sessionModel.findOne({ sessionId: endSessionDto.sessionId }).exec();
        if (!existing) {
          this.logger.warn(`Session not found for ending: ${endSessionDto.sessionId}`);
          return { session: null, alreadyEnded: false };
        }

        // existing found and already ended
        this.logger.warn(`Session already ended (id=${existing.sessionId}), skipping double end.`);
        return { session: existing, alreadyEnded: true };
      }

      // updated is the session after marking ended; update visitor totals once
      await this.visitorModel.updateOne(
        { visitorId: updated.visitorId },
        {
          $inc: {
            totalTimeSpent: endSessionDto.duration,
            totalPageViews: endSessionDto.pageViews,
          },
        }
      ).exec();

      this.logger.log(`Session ended: ${updated.sessionId}`);
      return { session: updated, alreadyEnded: false };
    } catch (error) {
      this.logger.error(`Error ending session: ${error.message}`, error.stack);
      throw error;
    }
  }

  async trackPageView(trackPageViewDto: TrackPageViewDto): Promise<PageViewDocument> {
    try {
      const pageView = new this.pageViewModel({
        ...trackPageViewDto,
        userId: trackPageViewDto.visitorId ? undefined : undefined, // Will be set if user is logged in
        timestamp: new Date(),
      });

      await pageView.save();

      // Update session page count
      await this.sessionModel.updateOne(
        { sessionId: trackPageViewDto.sessionId },
        {
          $inc: { pageViews: 1 },
          $addToSet: { pagesVisited: trackPageViewDto.path },
        }
      );

      // Update real-time stats
      await this.updateRealTimeStats();

      this.logger.log(`Page view tracked: ${trackPageViewDto.path} for visitor ${trackPageViewDto.visitorId}`);
      return pageView;
    } catch (error) {
      this.logger.error(`Error tracking page view: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updatePageViewTimeSpent(sessionId: string, path: string, timeSpent: number): Promise<void> {
    try {
      // Find the most recent page view for this session and path
      const pageView = await this.pageViewModel.findOne(
        { sessionId, path, isExit: { $ne: true } },
        null,
        { sort: { timestamp: -1 } }
      );

      if (pageView) {
        pageView.timeSpent = timeSpent;
        await pageView.save();
      }

      this.logger.log(`Updated time spent: ${timeSpent}s on ${path}`);
    } catch (error) {
      this.logger.error(`Error updating time spent: ${error.message}`, error.stack);
    }
  }

  async getAnalyticsStats(startDate: string, endDate: string): Promise<AnalyticsStatsDto> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const [
        uniqueVisitorsResult,
        totalPageViewsResult,
        totalSessionsResult,
        avgSessionDurationResult,
        bounceRateResult,
        newVisitorsResult,
        returningVisitorsResult,
      ] = await Promise.all([
        this.visitorModel.countDocuments({
          createdAt: { $gte: start, $lte: end },
        }),
        this.pageViewModel.countDocuments({
          timestamp: { $gte: start, $lte: end },
        }),
        this.sessionModel.countDocuments({
          startTime: { $gte: start, $lte: end },
        }),
        this.sessionModel.aggregate([
          { $match: { startTime: { $gte: start, $lte: end }, status: SessionStatus.ENDED } },
          { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
        ]),
        this.sessionModel.aggregate([
          { $match: { startTime: { $gte: start, $lte: end }, status: SessionStatus.ENDED } },
          { $group: { _id: null, bounceRate: { $avg: '$bounceRate' } } },
        ]),
        this.visitorModel.countDocuments({
          createdAt: { $gte: start, $lte: end },
          isReturning: false,
        }),
        this.visitorModel.countDocuments({
          createdAt: { $gte: start, $lte: end },
          isReturning: true,
        }),
      ]);

      const avgSessionDuration = avgSessionDurationResult[0]?.avgDuration || 0;
      const bounceRate = (bounceRateResult[0]?.bounceRate || 0) * 100;
      const pagesPerSession = totalSessionsResult > 0 ? totalPageViewsResult / totalSessionsResult : 0;

      return {
        startDate,
        endDate,
        uniqueVisitors: uniqueVisitorsResult,
        totalPageViews: totalPageViewsResult,
        totalSessions: totalSessionsResult,
        averageSessionDuration: Math.round(avgSessionDuration),
        bounceRate: Math.round(bounceRate * 100) / 100,
        newVisitors: newVisitorsResult,
        returningVisitors: returningVisitorsResult,
        pagesPerSession: Math.round(pagesPerSession * 100) / 100,
      };
    } catch (error) {
      this.logger.error(`Error getting analytics stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTopPages(startDate: string, endDate: string, limit = 10): Promise<TopPagesDto[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const topPages = await this.pageViewModel.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: '$path',
            title: { $first: '$title' },
            views: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            totalTimeSpent: { $sum: '$timeSpent' },
            bounces: { $sum: { $cond: ['$isBounce', 1, 0] } },
          },
        },
        {
          $project: {
            path: '$_id',
            title: 1,
            views: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' },
            averageTimeOnPage: {
              $cond: [
                { $gt: ['$views', 0] },
                { $divide: ['$totalTimeSpent', '$views'] },
                0,
              ],
            },
            bounceRate: {
              $cond: [
                { $gt: ['$views', 0] },
                { $multiply: [{ $divide: ['$bounces', '$views'] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { views: -1 } },
        { $limit: limit },
      ]);

      return topPages.map(page => ({
        path: page.path,
        title: page.title || page.path,
        views: page.views,
        uniqueVisitors: page.uniqueVisitors,
        averageTimeOnPage: Math.round(page.averageTimeOnPage),
        bounceRate: Math.round(page.bounceRate * 100) / 100,
      }));
    } catch (error) {
      this.logger.error(`Error getting top pages: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRealTimeStats(): Promise<RealTimeStatsDto> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const [
        activeUsers,
        pageViewsLastHour,
        newSessionsLastHour,
        topActivePages,
        deviceBreakdown,
        countryBreakdown,
      ] = await Promise.all([
        this.sessionModel.countDocuments({
          status: SessionStatus.ACTIVE,
          startTime: { $gte: fiveMinutesAgo },
        }),
        this.pageViewModel.countDocuments({
          timestamp: { $gte: oneHourAgo },
        }),
        this.sessionModel.countDocuments({
          startTime: { $gte: oneHourAgo },
        }),
        this.getTopPages(oneHourAgo.toISOString().split('T')[0], now.toISOString().split('T')[0], 5),
        this.getDeviceBreakdown(oneHourAgo, now),
        this.getCountryBreakdown(oneHourAgo, now),
      ]);

      return {
        activeUsers,
        pageViewsLastHour,
        newSessionsLastHour,
        topActivePages,
        trafficSources: {}, // TODO: Implement traffic sources
        deviceBreakdown,
        countryBreakdown,
      };
    } catch (error) {
      this.logger.error(`Error getting real-time stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTimeSeriesData(startDate: string, endDate: string, interval: 'hour' | 'day' = 'day'): Promise<TimeSeriesDataDto[]> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const dateFormat = interval === 'hour' 
        ? { $dateToString: { format: '%Y-%m-%dT%H:00:00Z', date: '$timestamp' } }
        : { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } };

      const timeSeries = await this.pageViewModel.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: dateFormat,
            pageViews: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$visitorId' },
            sessions: { $addToSet: '$sessionId' },
          },
        },
        {
          $project: {
            timestamp: '$_id',
            pageViews: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' },
            sessions: { $size: '$sessions' },
          },
        },
        { $sort: { timestamp: 1 } },
      ]);

      return timeSeries;
    } catch (error) {
      this.logger.error(`Error getting time series data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDashboard(startDate: string, endDate: string): Promise<AnalyticsDashboardDto> {
    try {
      const [stats, realTime, topPages, timeSeries] = await Promise.all([
        this.getAnalyticsStats(startDate, endDate),
        this.getRealTimeStats(),
        this.getTopPages(startDate, endDate),
        this.getTimeSeriesData(startDate, endDate),
      ]);

      return {
        stats,
        realTime,
        topPages,
        timeSeries,
      };
    } catch (error) {
      this.logger.error(`Error getting dashboard data: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateRealTimeStats(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // This would typically be done with a background job
      // For now, we'll update basic stats
      const todayStart = new Date(today);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);

      const stats = await this.getAnalyticsStats(today, today);
      
      await this.realTimeStatsModel.updateOne(
        { date: today },
        {
          $set: {
            totalSessions: stats.totalSessions,
            totalPageViews: stats.totalPageViews,
            uniqueVisitors: stats.uniqueVisitors,
            newVisitors: stats.newVisitors,
            returningVisitors: stats.returningVisitors,
            averageSessionDuration: stats.averageSessionDuration,
            bounceRate: stats.bounceRate,
            lastUpdated: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      this.logger.error(`Error updating real-time stats: ${error.message}`, error.stack);
    }
  }

  private async getDeviceBreakdown(start: Date, end: Date): Promise<Record<string, number>> {
    const breakdown = await this.pageViewModel.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ]);

    return breakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  private async getCountryBreakdown(start: Date, end: Date): Promise<Record<string, number>> {
    const breakdown = await this.visitorModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return breakdown.reduce((acc, item) => {
      acc[item._id || 'Unknown'] = item.count;
      return acc;
    }, {});
  }

  async getUserVisitors(userId: string, limit = 50, offset = 0): Promise<VisitorDocument[]> {
    try {
      const visitors = await this.visitorModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ lastVisit: -1 })
        .limit(limit)
        .skip(offset)
        .exec();

      this.logger.log(`Retrieved ${visitors.length} visitors for user: ${userId}`);
      return visitors;
    } catch (error) {
      this.logger.error(`Error getting user visitors: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserVisitorStats(userId: string): Promise<{
    totalVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    totalSessions: number;
    averageSessionsPerVisitor: number;
    totalTimeSpent: number;
    averageTimePerVisitor: number;
  }> {
    try {
      const [totalStats, newVisitors, returningVisitors, sessionStats] = await Promise.all([
        this.visitorModel.aggregate([
          { $match: { userId: new Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalVisitors: { $sum: 1 },
              totalSessions: { $sum: '$sessionCount' },
              totalTimeSpent: { $sum: '$totalTimeSpent' },
            },
          },
        ]),
        this.visitorModel.countDocuments({
          userId: new Types.ObjectId(userId),
          isReturning: false,
        }),
        this.visitorModel.countDocuments({
          userId: new Types.ObjectId(userId),
          isReturning: true,
        }),
        this.sessionModel.countDocuments({
          userId: new Types.ObjectId(userId),
        }),
      ]);

      const stats = totalStats[0] || {
        totalVisitors: 0,
        totalSessions: 0,
        totalTimeSpent: 0,
      };

      const averageSessionsPerVisitor = stats.totalVisitors > 0 
        ? stats.totalSessions / stats.totalVisitors 
        : 0;
      
      const averageTimePerVisitor = stats.totalVisitors > 0 
        ? stats.totalTimeSpent / stats.totalVisitors 
        : 0;

      return {
        totalVisitors: stats.totalVisitors,
        newVisitors,
        returningVisitors,
        totalSessions: sessionStats,
        averageSessionsPerVisitor: Math.round(averageSessionsPerVisitor * 100) / 100,
        totalTimeSpent: stats.totalTimeSpent,
        averageTimePerVisitor: Math.round(averageTimePerVisitor),
      };
    } catch (error) {
      this.logger.error(`Error getting user visitor stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Cleanup method to handle orphaned sessions
  async cleanupOrphanedSessions(): Promise<void> {
    // Only run cleanup if ANALYTICS_CLEANUP_ENABLED=true in env
    if (process.env.ANALYTICS_CLEANUP_ENABLED !== 'true') {
      this.logger.debug('Orphaned session cleanup skipped (ANALYTICS_CLEANUP_ENABLED != true)');
      return;
    }

    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Find active sessions older than 24 hours and mark them as ended
      const orphanedSessions = await this.sessionModel.find({
        status: SessionStatus.ACTIVE,
        startTime: { $lt: oneDayAgo },
      });

      for (const session of orphanedSessions) {
        session.status = SessionStatus.ENDED;
        session.endTime = new Date();
        session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
        await session.save();
      }

      if (orphanedSessions.length > 0) {
        this.logger.log(`Cleaned up ${orphanedSessions.length} orphaned sessions`);
      }
    } catch (error) {
      this.logger.error(`Error cleaning up orphaned sessions: ${error.message}`, error.stack);
    }
  }

  // Read helpers
  async getSessionById(sessionId: string): Promise<SessionDocument | null> {
    return this.sessionModel.findOne({ sessionId }).exec();
  }

  async getSessionsForVisitor(visitorId: string, limit = 50, offset = 0): Promise<SessionDocument[]> {
    return this.sessionModel.find({ visitorId }).sort({ startTime: -1 }).limit(limit).skip(offset).exec();
  }

  async getSessionsForUser(userId: string, limit = 50, offset = 0): Promise<SessionDocument[]> {
    return this.sessionModel.find({ userId: new Types.ObjectId(userId) }).sort({ startTime: -1 }).limit(limit).skip(offset).exec();
  }

  async getPageViewsForSession(sessionId: string): Promise<PageViewDocument[]> {
    return this.pageViewModel.find({ sessionId }).sort({ timestamp: 1 }).exec();
  }

  // Lightweight touch to update session lastActivity (used by HTTP heartbeat)
  async touchSession(sessionId: string): Promise<SessionDocument | null> {
    try {
      const updated = await this.sessionModel.findOneAndUpdate(
        { sessionId },
        { $set: { lastActivity: new Date() } },
        { new: true }
      ).exec();
      return updated;
    } catch (error) {
      this.logger.error(`Error touching session: ${error.message}`, error.stack);
      return null;
    }
  }
}