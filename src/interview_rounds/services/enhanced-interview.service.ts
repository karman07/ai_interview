import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InterviewSession, InterviewSessionDocument, InterviewRound, SessionStatus } from '../schemas/interview-session.schema';
import { UserInterviewAnalytics, UserInterviewAnalyticsDocument } from '../schemas/user-interview-analytics.schema';
import { Resume, ResumeDocument } from '../../resume/resume.schema';
import * as fs from 'fs';

@Injectable()
export class EnhancedInterviewService {
  constructor(
    @InjectModel(InterviewSession.name) private sessionModel: Model<InterviewSessionDocument>,
    @InjectModel(UserInterviewAnalytics.name) private analyticsModel: Model<UserInterviewAnalyticsDocument>,
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) {}

  // Get user's best CV based on highest overall score
  private async getBestUserCV(userId: string): Promise<{ path: string; filename: string } | null> {
    try {
      const resumes = await this.resumeModel.find({ user: userId }).sort({ createdAt: -1 });
      
      if (!resumes.length) return null;
      
      // Find resume with highest overall score
      let bestResume = resumes[0];
      let highestScore = 0;
      
      for (const resume of resumes) {
        const overallScore = resume.stats?.overall_score || resume.stats?.score || 0;
        if (overallScore > highestScore) {
          highestScore = overallScore;
          bestResume = resume;
        }
      }
      
      // Check if file exists
      if (fs.existsSync(bestResume.path)) {
        return {
          path: bestResume.path,
          filename: bestResume.filename
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting best CV:', error);
      return null;
    }
  }

  async startSession(data: {
    userId: string;
    round: InterviewRound;
    role?: string;
    company?: string;
    jobDescription?: string;
    experience?: string;
    industry?: string;
  }): Promise<InterviewSessionDocument> {
    console.log(`🚀 Interview Rounds API started - startSession called for user: ${data.userId}`);
    const bestCV = await this.getBestUserCV(data.userId);
    
    const sessionId = `${data.round}-${data.userId}-${Date.now()}`;
    
    const session = new this.sessionModel({
      userId: new Types.ObjectId(data.userId),
      sessionId,
      round: data.round,
      role: data.role,
      company: data.company,
      jobDescription: data.jobDescription,
      experience: data.experience,
      industry: data.industry,
      startedAt: new Date(),
      status: SessionStatus.ACTIVE,
    });

    const savedSession = await session.save();
    await this.updateAnalytics(data.userId, 'session_started', { round: data.round });
    
    return {
      ...savedSession.toObject(),
      bestCV: bestCV ? {
        filename: bestCV.filename,
        path: bestCV.path
      } : null
    } as any;
  }

  async addQuestionAnswer(
    sessionId: string,
    question: string,
    answer?: string,
    audioUrl?: string,
    videoUrl?: string,
    responseDuration?: number,
    feedback?: string,
    score?: number
  ): Promise<InterviewSessionDocument> {
    const session = await this.sessionModel.findOne({ sessionId });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const questionAnswer = {
      question,
      answer,
      audioUrl,
      videoUrl,
      responseDuration,
      feedback,
      score,
      answeredAt: answer ? new Date() : undefined,
    };

    session.questionsAnswers.push(questionAnswer);
    
    // Update metrics
    session.metrics.totalQuestions = session.questionsAnswers.length;
    session.metrics.answeredQuestions = session.questionsAnswers.filter(qa => qa.answer).length;
    
    if (responseDuration && session.metrics.answeredQuestions > 0) {
      const totalResponseTime = session.questionsAnswers
        .filter(qa => qa.responseDuration)
        .reduce((sum, qa) => sum + (qa.responseDuration || 0), 0);
      session.metrics.averageResponseTime = totalResponseTime / session.metrics.answeredQuestions;
    }

    if (score) {
      const scores = session.questionsAnswers.filter(qa => qa.score).map(qa => qa.score!);
      session.metrics.overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    }

    return session.save();
  }

  async completeSession(
    sessionId: string,
    finalReport?: any,
    finalScores?: {
      overall?: number;
      communication?: number;
      technical?: number;
      problemSolving?: number;
      behavioral?: number;
    }
  ): Promise<InterviewSessionDocument> {
    const session = await this.sessionModel.findOne({ sessionId });
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.status = SessionStatus.COMPLETED;
    session.completedAt = new Date();
    session.finalReport = finalReport;

    if (finalScores) {
      Object.assign(session.metrics, finalScores);
    }

    // Calculate total duration
    if (session.startedAt) {
      session.metrics.totalDuration = Math.floor(
        (session.completedAt.getTime() - session.startedAt.getTime()) / 1000
      );
    }

    const savedSession = await session.save();
    
    await this.updateAnalytics(session.userId.toString(), 'session_completed', {
      round: session.round,
      score: session.metrics.overallScore,
      duration: session.metrics.totalDuration,
      sessionId: session.sessionId,
    });

    return savedSession;
  }

  async getUserSessions(
    userId: string,
    round?: InterviewRound,
    limit = 20,
    offset = 0
  ): Promise<InterviewSessionDocument[]> {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (round) query.round = round;

    return this.sessionModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
  }

  async getSessionById(sessionId: string): Promise<InterviewSessionDocument> {
    const session = await this.sessionModel.findOne({ sessionId });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async getUserAnalytics(userId: string): Promise<UserInterviewAnalyticsDocument> {
    let analytics = await this.analyticsModel.findOne({ userId: new Types.ObjectId(userId) });
    
    if (!analytics) {
      try {
        analytics = new this.analyticsModel({
          userId: new Types.ObjectId(userId),
        });
        await analytics.save();
      } catch (error) {
        // If duplicate key error, try to find existing record
        if (error.code === 11000) {
          analytics = await this.analyticsModel.findOne({ userId: new Types.ObjectId(userId) });
          if (!analytics) {
            throw new BadRequestException('Failed to create or find analytics record');
          }
        } else {
          throw error;
        }
      }
    }

    return analytics;
  }

  async getLeaderboard(round?: InterviewRound, limit = 10): Promise<any[]> {
    const pipeline: any[] = [
      { $match: {} },
      {
        $addFields: {
          relevantScore: round 
            ? `$${round.replace('-', '')}.averageScore`
            : '$overall.overallAverageScore'
        }
      },
      { $match: { relevantScore: { $gt: 0 } } },
      { $sort: { relevantScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          userName: '$user.name',
          score: '$relevantScore',
          totalInterviews: '$overall.totalInterviews',
          round: round || 'overall'
        }
      }
    ];

    return this.analyticsModel.aggregate(pipeline);
  }

  private async updateAnalytics(
    userId: string,
    event: 'session_started' | 'session_completed',
    data: any
  ): Promise<void> {
    let analytics = await this.analyticsModel.findOne({ userId: new Types.ObjectId(userId) });
    
    if (!analytics) {
      try {
        analytics = new this.analyticsModel({
          userId: new Types.ObjectId(userId),
        });
      } catch (error) {
        // If duplicate key error, try to find existing record
        if (error.code === 11000) {
          analytics = await this.analyticsModel.findOne({ userId: new Types.ObjectId(userId) });
          if (!analytics) {
            throw new BadRequestException('Failed to create or find analytics record');
          }
        } else {
          throw error;
        }
      }
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (event === 'session_started') {
      // Update round stats
      const roundKey = data.round.replace('-', '') as keyof UserInterviewAnalyticsDocument;
      if (analytics[roundKey]) {
        (analytics[roundKey] as any).totalSessions += 1;
        (analytics[roundKey] as any).lastAttemptDate = now;
      }

      analytics.overall.totalInterviews += 1;
      analytics.overall.lastInterviewDate = now;

    } else if (event === 'session_completed') {
      const roundKey = data.round.replace('-', '') as keyof UserInterviewAnalyticsDocument;
      const roundStats = analytics[roundKey] as any;
      
      if (roundStats) {
        roundStats.completedSessions += 1;
        roundStats.totalTimeSpent += data.duration || 0;
        roundStats.latestScore = data.score || 0;
        roundStats.latestSessionId = data.sessionId;

        if (data.score > roundStats.bestScore) {
          roundStats.bestScore = data.score;
          roundStats.bestSessionId = data.sessionId;
        }

        // Recalculate average score
        if (roundStats.completedSessions > 0) {
          const sessions = await this.sessionModel.find({
            userId: new Types.ObjectId(userId),
            round: data.round,
            status: SessionStatus.COMPLETED
          });
          
          const totalScore = sessions.reduce((sum, s) => sum + (s.metrics.overallScore || 0), 0);
          roundStats.averageScore = totalScore / sessions.length;
        }
      }

      analytics.overall.completedInterviews += 1;
      
      // Update monthly progress
      let monthlyProgress = analytics.monthlyProgress.find(mp => mp.month === monthKey);
      if (!monthlyProgress) {
        monthlyProgress = { month: monthKey, sessionsCount: 0, averageScore: 0, timeSpent: 0 };
        analytics.monthlyProgress.push(monthlyProgress);
      }
      
      monthlyProgress.sessionsCount += 1;
      monthlyProgress.timeSpent += data.duration || 0;
      
      // Update recent sessions
      analytics.recentSessions.unshift(new Types.ObjectId(data.sessionId));
      if (analytics.recentSessions.length > 10) {
        analytics.recentSessions = analytics.recentSessions.slice(0, 10);
      }
    }

    analytics.lastUpdated = now;
    await analytics.save();
  }

  async getPerformanceInsights(userId: string): Promise<any> {
    const analytics = await this.getUserAnalytics(userId);
    const recentSessions = await this.sessionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    return {
      analytics: analytics.toObject(),
      recentPerformance: recentSessions.map(s => ({
        round: s.round,
        score: s.metrics.overallScore,
        date: s.completedAt,
        duration: s.metrics.totalDuration,
      })),
      insights: this.generateInsights(analytics, recentSessions),
    };
  }

  private generateInsights(
    analytics: UserInterviewAnalyticsDocument,
    recentSessions: InterviewSessionDocument[]
  ): string[] {
    const insights: string[] = [];

    // Performance trends
    if (recentSessions.length >= 2) {
      const latest = recentSessions[0].metrics.overallScore || 0;
      const previous = recentSessions[1].metrics.overallScore || 0;
      
      if (latest > previous) {
        insights.push('Your performance is improving! Keep up the good work.');
      } else if (latest < previous) {
        insights.push('Consider reviewing your recent interviews to identify areas for improvement.');
      }
    }

    // Round-specific insights
    const rounds = ['technical', 'behavioral', 'problemSolving', 'hr'] as const;
    const bestRound = rounds.reduce((best, current) => {
      const currentScore = (analytics[current] as any)?.averageScore || 0;
      const bestScore = (analytics[best] as any)?.averageScore || 0;
      return currentScore > bestScore ? current : best;
    });

    insights.push(`Your strongest area is ${bestRound.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);

    // Consistency insights
    if (analytics.overall.currentStreak > 3) {
      insights.push(`Great consistency! You've completed ${analytics.overall.currentStreak} interviews in a row.`);
    }

    return insights;
  }
}