import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  EnhancedInterviewSession, 
  EnhancedInterviewSessionDocument,
  InterviewStatus,
  RoundType,
  JobContext
} from '../schemas/enhanced-interview-session.schema';
import { 
  InterviewQuestion, 
  InterviewQuestionDocument,
  AudioAnalysis,
  QuestionScores
} from '../schemas/interview-question.schema';
import { 
  UserInterviewAnalytics, 
  UserInterviewAnalyticsDocument 
} from '../schemas/user-interview-analytics.schema';

export interface StartSessionData {
  userId: string;
  sessionId: string;
  roundType: RoundType;
  jobContext: JobContext;
  aiSessionId?: string;
}

export interface QuestionData {
  sessionId: string;
  userId: string;
  questionText: string;
  questionType?: string;
  competency?: string;
  difficulty?: string;
  questionAskedAt?: Date;
}

export interface AnswerData {
  sessionId: string;
  userId: string;
  answerText?: string;
  audioFilePath?: string;
  audioUrl?: string;
  videoFilePath?: string;
  videoUrl?: string;
  audioAnalysis?: AudioAnalysis;
  videoAnalysis?: any;
  scores?: QuestionScores;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  responseTime?: number;
  aiResponse?: any;
}

@Injectable()
export class EnhancedInterviewAnalyticsService {
  private readonly logger = new Logger(EnhancedInterviewAnalyticsService.name);

  constructor(
    @InjectModel(EnhancedInterviewSession.name) 
    private sessionModel: Model<EnhancedInterviewSessionDocument>,
    @InjectModel(InterviewQuestion.name) 
    private questionModel: Model<InterviewQuestionDocument>,
    @InjectModel(UserInterviewAnalytics.name) 
    private analyticsModel: Model<UserInterviewAnalyticsDocument>,
  ) {}

  /**
   * Start a new interview session
   */
  async startSession(data: StartSessionData): Promise<EnhancedInterviewSessionDocument> {
    this.logger.log(`📊 Starting new interview session: ${data.sessionId}`);

    const session = new this.sessionModel({
      userId: new Types.ObjectId(data.userId),
      sessionId: data.sessionId,
      roundType: data.roundType,
      jobContext: data.jobContext,
      status: InterviewStatus.ACTIVE,
      startedAt: new Date(),
      aiSessionId: data.aiSessionId,
      metrics: {
        totalQuestions: 0,
        answeredQuestions: 0,
        averageResponseTime: 0,
        totalDuration: 0,
        pauseCount: 0,
        fillerWordsTotal: 0,
        averageSpeechClarity: 0,
        averageConfidenceLevel: 0
      }
    });

    await session.save();
    this.logger.log(`✅ Session created: ${session._id}`);
    return session;
  }

  /**
   * Record a question asked during the interview
   */
  async recordQuestion(data: QuestionData): Promise<InterviewQuestionDocument> {
    this.logger.log(`❓ Recording question for session: ${data.sessionId}`);

    // Find the session
    const session = await this.sessionModel.findOne({ sessionId: data.sessionId });
    if (!session) {
      throw new Error(`Session not found: ${data.sessionId}`);
    }

    const question = new this.questionModel({
      sessionId: session._id,
      userId: new Types.ObjectId(data.userId),
      questionText: data.questionText,
      questionType: data.questionType,
      competency: data.competency,
      difficulty: data.difficulty,
      questionAskedAt: data.questionAskedAt || new Date()
    });

    await question.save();

    // Update session metrics
    await this.sessionModel.findByIdAndUpdate(session._id, {
      $push: { questions: question._id },
      $inc: { 'metrics.totalQuestions': 1 }
    });

    this.logger.log(`✅ Question recorded: ${question._id}`);
    return question;
  }

  /**
   * Record an answer with comprehensive analysis
   */
  async recordAnswer(data: AnswerData): Promise<InterviewQuestionDocument> {
    this.logger.log(`💬 Recording answer for session: ${data.sessionId}`);

    // Find the session
    const session = await this.sessionModel.findOne({ sessionId: data.sessionId });
    if (!session) {
      throw new Error(`Session not found: ${data.sessionId}`);
    }

    // Find the latest unanswered question OR create one if none exists
    let question = await this.questionModel.findOne({
      sessionId: session._id,
      answerText: { $exists: false }
    }).sort({ createdAt: -1 });

    // If no unanswered question found, create a placeholder question
    if (!question) {
      this.logger.log(`No unanswered question found, creating placeholder for session: ${data.sessionId}`);
      
      // Extract question from AI response if available
      const questionText = data.aiResponse?.state?.history?.slice(-2, -1)?.[0]?.question || 'Question not recorded';
      
      question = new this.questionModel({
        sessionId: session._id,
        userId: new Types.ObjectId(data.userId),
        questionText,
        questionType: data.aiResponse?.state?.round_type || 'unknown',
        questionAskedAt: new Date()
      });
      
      await question.save();
      
      // Update session metrics
      await this.sessionModel.findByIdAndUpdate(session._id, {
        $push: { questions: question._id },
        $inc: { 'metrics.totalQuestions': 1 }
      });
    }

    // Update question with answer data
    const updateData: any = {
      answerText: data.answerText,
      audioFilePath: data.audioFilePath,
      audioUrl: data.audioUrl,
      videoFilePath: data.videoFilePath,
      videoUrl: data.videoUrl,
      audioAnalysis: data.audioAnalysis,
      videoAnalysis: data.videoAnalysis,
      scores: data.scores,
      feedback: data.feedback,
      strengths: data.strengths || [],
      improvements: data.improvements || [],
      responseTime: data.responseTime,
      answerSubmittedAt: new Date(),
      aiResponse: data.aiResponse
    };

    await this.questionModel.findByIdAndUpdate(question._id, updateData);

    // Update session metrics
    const updateMetrics: any = {
      $inc: { 'metrics.answeredQuestions': 1 }
    };

    if (data.responseTime) {
      // Calculate new average response time
      const currentAvg = session.metrics.averageResponseTime || 0;
      const answeredCount = session.metrics.answeredQuestions + 1;
      const newAvg = ((currentAvg * (answeredCount - 1)) + data.responseTime) / answeredCount;
      updateMetrics['metrics.averageResponseTime'] = newAvg;
    }

    if (data.audioAnalysis) {
      // Update audio metrics
      if (data.audioAnalysis.fillerWords) {
        updateMetrics.$inc['metrics.fillerWordsTotal'] = data.audioAnalysis.fillerWords;
      }
      if (data.audioAnalysis.pauseCount) {
        updateMetrics.$inc['metrics.pauseCount'] = data.audioAnalysis.pauseCount;
      }
    }

    await this.sessionModel.findByIdAndUpdate(session._id, updateMetrics);

    this.logger.log(`✅ Answer recorded for question: ${question._id}`);
    return await this.questionModel.findById(question._id);
  }

  /**
   * Complete an interview session with final scores
   */
  async completeSession(
    sessionId: string, 
    finalScores: any, 
    finalReport: any
  ): Promise<EnhancedInterviewSessionDocument> {
    this.logger.log(`🏁 Completing interview session: ${sessionId}`);

    const session = await this.sessionModel.findOne({ sessionId });
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Calculate session duration
    const duration = session.startedAt ? 
      Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000) : 0;

    // Extract strengths, improvements, and recommendations from final report
    const strengths = finalReport?.strengths || [];
    const areasForImprovement = finalReport?.areas_for_improvement || [];
    const recommendations = finalReport?.recommendations || [];

    const updateData = {
      status: InterviewStatus.COMPLETED,
      completedAt: new Date(),
      scores: finalScores,
      finalReport,
      strengths,
      areasForImprovement,
      recommendations,
      'metrics.totalDuration': duration
    };

    const updatedSession = await this.sessionModel.findByIdAndUpdate(
      session._id, 
      updateData, 
      { new: true }
    );

    // Update user analytics
    await this.updateUserAnalytics(session.userId.toString(), updatedSession);

    this.logger.log(`✅ Session completed: ${session._id}`);
    return updatedSession;
  }

  /**
   * Update user analytics after session completion
   */
  private async updateUserAnalytics(
    userId: string, 
    session: EnhancedInterviewSessionDocument
  ): Promise<void> {
    this.logger.log(`📈 Updating analytics for user: ${userId}`);

    let analytics = await this.analyticsModel.findOne({ userId: new Types.ObjectId(userId) });
    
    if (!analytics) {
      analytics = new this.analyticsModel({
        userId: new Types.ObjectId(userId),
        technical: {},
        behavioral: {},
        problemSolving: {},
        hr: {},
        overall: {},
        monthlyProgress: [],
        recentSessions: []
      });
    }

    // Update round-specific stats
    const roundKey = session.roundType === RoundType.PROBLEM_SOLVING ? 'problemSolving' : session.roundType;
    const roundStats = analytics[roundKey] || {};
    
    roundStats.totalSessions = (roundStats.totalSessions || 0) + 1;
    if (session.status === InterviewStatus.COMPLETED) {
      roundStats.completedSessions = (roundStats.completedSessions || 0) + 1;
    }

    if (session.scores?.overall) {
      const currentAvg = roundStats.averageScore || 0;
      const totalCompleted = roundStats.completedSessions || 1;
      roundStats.averageScore = ((currentAvg * (totalCompleted - 1)) + session.scores.overall) / totalCompleted;
      
      if (!roundStats.bestScore || session.scores.overall > roundStats.bestScore) {
        roundStats.bestScore = session.scores.overall;
        roundStats.bestSessionId = session.sessionId;
      }
      
      roundStats.latestScore = session.scores.overall;
      roundStats.latestSessionId = session.sessionId;
    }

    roundStats.totalTimeSpent = (roundStats.totalTimeSpent || 0) + (session.metrics.totalDuration || 0);
    roundStats.averageResponseTime = session.metrics.averageResponseTime || 0;
    roundStats.lastAttemptDate = new Date();

    analytics[roundKey] = roundStats;

    // Update overall stats
    analytics.overall.totalInterviews = (analytics.overall.totalInterviews || 0) + 1;
    if (session.status === InterviewStatus.COMPLETED) {
      analytics.overall.completedInterviews = (analytics.overall.completedInterviews || 0) + 1;
    }

    if (session.scores?.overall) {
      const currentOverallAvg = analytics.overall.overallAverageScore || 0;
      const totalCompleted = analytics.overall.completedInterviews || 1;
      analytics.overall.overallAverageScore = 
        ((currentOverallAvg * (totalCompleted - 1)) + session.scores.overall) / totalCompleted;

      if (!analytics.overall.bestOverallScore || session.scores.overall > analytics.overall.bestOverallScore) {
        analytics.overall.bestOverallScore = session.scores.overall;
        analytics.overall.bestSessionId = session.sessionId;
      }
    }

    analytics.overall.totalTimeSpent = (analytics.overall.totalTimeSpent || 0) + (session.metrics.totalDuration || 0);
    analytics.overall.strengths = [...new Set([...analytics.overall.strengths || [], ...session.strengths || []])];
    analytics.overall.areasForImprovement = [...new Set([...analytics.overall.areasForImprovement || [], ...session.areasForImprovement || []])];
    analytics.overall.lastInterviewDate = new Date();

    // Update monthly progress
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    let monthlyProgress = analytics.monthlyProgress.find(mp => mp.month === currentMonth);
    
    if (!monthlyProgress) {
      monthlyProgress = {
        month: currentMonth,
        sessionsCount: 0,
        averageScore: 0,
        timeSpent: 0
      };
      analytics.monthlyProgress.push(monthlyProgress);
    }

    monthlyProgress.sessionsCount += 1;
    monthlyProgress.timeSpent += session.metrics.totalDuration || 0;
    if (session.scores?.overall) {
      const currentMonthlyAvg = monthlyProgress.averageScore || 0;
      monthlyProgress.averageScore = 
        ((currentMonthlyAvg * (monthlyProgress.sessionsCount - 1)) + session.scores.overall) / monthlyProgress.sessionsCount;
    }

    // Update recent sessions (keep last 10)
    analytics.recentSessions.unshift(session._id);
    if (analytics.recentSessions.length > 10) {
      analytics.recentSessions = analytics.recentSessions.slice(0, 10);
    }

    analytics.lastUpdated = new Date();

    await analytics.save();
    this.logger.log(`✅ Analytics updated for user: ${userId}`);
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<UserInterviewAnalyticsDocument | null> {
    return await this.analyticsModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  /**
   * Get session details with questions
   */
  async getSessionDetails(sessionId: string): Promise<any> {
    const session = await this.sessionModel.findOne({ sessionId })
      .populate('questions')
      .populate('jobContext.resumeId')
      .populate('jobContext.jobDescriptionId');

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const questions = await this.questionModel.find({ sessionId: session._id })
      .sort({ createdAt: 1 });

    return {
      ...session.toObject(),
      questions
    };
  }

  /**
   * Get user sessions with pagination
   */
  async getUserSessions(
    userId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{ sessions: any[], total: number, page: number, totalPages: number }> {
    const skip = (page - 1) * limit;
    
    const [sessions, total] = await Promise.all([
      this.sessionModel.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('jobContext.resumeId')
        .populate('jobContext.jobDescriptionId'),
      this.sessionModel.countDocuments({ userId: new Types.ObjectId(userId) })
    ]);

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalyticsDashboard(userId: string): Promise<any> {
    const analytics = await this.getUserAnalytics(userId);
    const recentSessions = await this.sessionModel.find({ 
      userId: new Types.ObjectId(userId) 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('jobContext.resumeId')
    .populate('jobContext.jobDescriptionId');

    return {
      analytics: analytics || {},
      recentSessions,
      summary: {
        totalInterviews: analytics?.overall.totalInterviews || 0,
        completedInterviews: analytics?.overall.completedInterviews || 0,
        averageScore: analytics?.overall.overallAverageScore || 0,
        bestScore: analytics?.overall.bestOverallScore || 0,
        totalTimeSpent: analytics?.overall.totalTimeSpent || 0,
        currentStreak: analytics?.overall.currentStreak || 0
      }
    };
  }
}