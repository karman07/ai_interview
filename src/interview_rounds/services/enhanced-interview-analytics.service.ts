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
  VideoAnalysis,
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
  videoAnalysis?: VideoAnalysis;
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

    try {
      // Find the session
      const session = await this.sessionModel.findOne({ sessionId: data.sessionId });
      if (!session) {
        throw new Error(`Session not found: ${data.sessionId}`);
      }

      // Check if this question already exists (by question text to avoid duplicates)
      const existingQuestion = await this.questionModel.findOne({
        sessionId: session._id,
        questionText: data.questionText
      });

      if (existingQuestion) {
        this.logger.log(`⚠️ Question already exists: ${existingQuestion._id}`);
        return existingQuestion;
      }

      // Determine question number
      const existingCount = await this.questionModel.countDocuments({ sessionId: session._id });
      const questionNumber = existingCount + 1;

      const question = new this.questionModel({
        sessionId: session._id,
        userId: new Types.ObjectId(data.userId),
        questionNumber,
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

      this.logger.log(`✅ Question #${questionNumber} recorded: ${question._id}`);
      return question;
    } catch (error) {
      // Handle duplicate key error from MongoDB unique index
      if (error.code === 11000) {
        this.logger.warn(`⚠️ Duplicate key error - Question already exists in database`);
        
        // Try to find and return the existing question
        const session = await this.sessionModel.findOne({ sessionId: data.sessionId });
        if (session) {
          // First try by question text
          let existing = await this.questionModel.findOne({
            sessionId: session._id,
            questionText: data.questionText
          });
          
          // If not found by text, try to extract question number from error and find by that
          if (!existing) {
            const match = error.message.match(/questionNumber: (\d+)/);
            if (match) {
              const questionNumber = parseInt(match[1]);
              existing = await this.questionModel.findOne({
                sessionId: session._id,
                questionNumber
              });
            }
          }
          
          if (existing) {
            this.logger.log(`✅ Returning existing question: ${existing._id}`);
            return existing;
          }
        }
      }
      
      throw error;
    }
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
      
      // Determine question number from history or existing questions
      let questionNumber = 1;
      if (data.aiResponse?.state?.history) {
        questionNumber = data.aiResponse.state.history.length;
      } else {
        // Count existing questions for this session
        const existingCount = await this.questionModel.countDocuments({ sessionId: session._id });
        questionNumber = existingCount + 1;
      }
      
      this.logger.log(`📝 Creating placeholder question #${questionNumber}`);
      
      question = new this.questionModel({
        sessionId: session._id,
        userId: new Types.ObjectId(data.userId),
        questionNumber,
        questionText,
        questionType: data.aiResponse?.state?.round_type || 'unknown',
        questionAskedAt: new Date()
      });
      
      await question.save();
      
      this.logger.log(`✅ Placeholder question saved with ID: ${question._id}`);
      
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
   * Get average analytics across all user interviews
   */
  async getAverageAnalytics(userId: string): Promise<any> {
    const sessions = await this.sessionModel.find({ 
      userId: new Types.ObjectId(userId),
      status: InterviewStatus.COMPLETED 
    });

    if (!sessions.length) {
      return { message: 'No completed interviews found' };
    }

    const totalSessions = sessions.length;
    const avgScores = {
      overall: 0,
      communication: 0,
      technical: 0,
      behavioral: 0,
      problemSolving: 0,
      clarity: 0,
      confidence: 0
    };

    let totalDuration = 0;
    let totalQuestions = 0;
    let totalResponseTime = 0;

    sessions.forEach(session => {
      if (session.scores) {
        avgScores.overall += session.scores.overall || 0;
        avgScores.communication += session.scores.communication || 0;
        avgScores.technical += session.scores.technical || 0;
        avgScores.behavioral += session.scores.behavioral || 0;
        avgScores.problemSolving += session.scores.problemSolving || 0;
        avgScores.clarity += session.scores.clarity || 0;
        avgScores.confidence += session.scores.confidence || 0;
      }
      totalDuration += session.metrics?.totalDuration || 0;
      totalQuestions += session.metrics?.totalQuestions || 0;
      totalResponseTime += session.metrics?.averageResponseTime || 0;
    });

    Object.keys(avgScores).forEach(key => {
      avgScores[key] = avgScores[key] / totalSessions;
    });

    return {
      totalInterviews: totalSessions,
      averageScores: avgScores,
      averageDuration: totalDuration / totalSessions,
      averageQuestions: totalQuestions / totalSessions,
      averageResponseTime: totalResponseTime / totalSessions
    };
  }

  /**
   * Get complete analytics for a specific session
   */
  async getSessionAnalytics(sessionId: string, userId: string): Promise<any> {
    const session = await this.sessionModel.findOne({ sessionId })
      .populate('questions');

    if (!session || session.userId.toString() !== userId) {
      throw new Error('Session not found or access denied');
    }

    const questions = await this.questionModel.find({ sessionId: session._id })
      .sort({ createdAt: 1 });

    const questionAnalytics = questions.map(q => ({
      question: q.questionText,
      answer: q.answerText,
      scores: q.scores,
      audioAnalysis: q.audioAnalysis,
      videoAnalysis: q.videoAnalysis || undefined,
      feedback: q.feedback,
      strengths: q.strengths,
      improvements: q.improvements,
      responseTime: q.responseTime,
      timestamp: q.questionAskedAt
    }));

    return {
      session: {
        sessionId: session.sessionId,
        roundType: session.roundType,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        jobContext: session.jobContext,
        scores: session.scores,
        metrics: session.metrics,
        strengths: session.strengths,
        areasForImprovement: session.areasForImprovement,
        recommendations: session.recommendations
      },
      questions: questionAnalytics,
      summary: {
        totalQuestions: questions.length,
        answeredQuestions: questions.filter(q => q.answerText).length,
        averageScore: session.scores?.overall || 0,
        totalDuration: session.metrics?.totalDuration || 0
      }
    };
  }
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