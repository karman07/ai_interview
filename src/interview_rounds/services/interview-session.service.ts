import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EnhancedInterviewSession, EnhancedInterviewSessionDocument, InterviewStatus, RoundType } from '../schemas/enhanced-interview-session.schema';
import { UserInterviewAnalytics, UserInterviewAnalyticsDocument } from '../schemas/user-interview-analytics.schema';
import { InterviewQuestion, InterviewQuestionDocument } from '../schemas/interview-question.schema';

@Injectable()
export class InterviewSessionService {
  constructor(
    @InjectModel(EnhancedInterviewSession.name) private sessionModel: Model<EnhancedInterviewSessionDocument>,
    @InjectModel(UserInterviewAnalytics.name) private analyticsModel: Model<UserInterviewAnalyticsDocument>,
    @InjectModel(InterviewQuestion.name) private questionModel: Model<InterviewQuestionDocument>,
  ) {}

  async getSession(sessionId: string) {
    return await this.sessionModel.findOne({ sessionId });
  }

  async clearSessionQuestions(sessionMongoId: any) {
    await this.questionModel.deleteMany({ sessionId: sessionMongoId });
  }

  async getSessionQuestions(sessionMongoId: any) {
    return await this.questionModel.find({ sessionId: sessionMongoId });
  }

  async saveSession(data: any) {
    console.log('💾 === SAVING SESSION TO DB ===');
    console.log('📋 Session data:', JSON.stringify(data, null, 2));
    
    const updateData: any = {
      userId: new Types.ObjectId(data.user_id),
      sessionId: data.session_id,
      roundType: data.round_type,
      status: data.status || InterviewStatus.ACTIVE,
      jobContext: {
        roleTitle: data.role_title,
        companyName: data.company_name,
        industry: data.industry,
      },
      metrics: {
        totalQuestions: data.total_questions || 0,
        answeredQuestions: data.answered_questions || 0,
      },
      startedAt: data.created_at,
      completedAt: data.status === 'completed' ? new Date() : undefined,
    };
    
    // Only set scores if avg_scores exists
    if (data.avg_scores) {
      updateData.scores = {
        overall: data.avg_scores.overall || 0,
        communication: data.avg_scores.communication || 0,
        technical: data.avg_scores.technical || 0,
      };
    }
    
    const session = await this.sessionModel.findOneAndUpdate(
      { sessionId: data.session_id },
      updateData,
      { upsert: true, new: true }
    );
    
    console.log('✅ Session saved to DB:', session.sessionId);
    console.log('📊 Session status:', session.status);
    console.log('📈 Session scores:', session.scores);
    
    await this.updateAnalytics(data.user_id, session);
    return session;
  }

  async saveQuestionAnswer(data: {
    user_id: string;
    session_id: string;
    question: string;
    answer_text?: string;
    transcription?: string;
    evaluation?: any;
    voice_metrics?: any;
  }) {
    console.log('💾 === SAVING QUESTION/ANSWER TO DB ===');
    console.log('📋 Q&A data:', JSON.stringify(data, null, 2));
    
    const session = await this.sessionModel.findOne({ sessionId: data.session_id });
    if (!session) {
      console.log('❌ Session not found:', data.session_id);
      return;
    }

    const question = await this.questionModel.create({
      sessionId: session._id,
      userId: new Types.ObjectId(data.user_id),
      questionText: data.question,
      answerText: data.answer_text || data.transcription,
      audioAnalysis: data.voice_metrics ? {
        transcription: data.transcription,
        speechClarity: data.voice_metrics.clarity || data.evaluation?.communication_evaluation?.voice_scores?.clarity || 0,
        paceScore: data.voice_metrics.pace || data.evaluation?.communication_evaluation?.voice_scores?.pace || 0,
        confidenceLevel: data.voice_metrics.confidence || data.evaluation?.communication_evaluation?.voice_scores?.confidence || 0,
        duration: data.voice_metrics.duration || data.evaluation?.communication_evaluation?.voice_metrics?.duration || 0,
      } : undefined,
      scores: data.evaluation ? {
        overall: data.evaluation.total_score || 0,
        communication: data.evaluation.communication_evaluation?.voice_scores?.total || 0,
        technical: data.evaluation.technical_evaluation?.technical_depth || 0,
      } : undefined,
      feedback: data.evaluation?.feedback,
      strengths: [],
      improvements: data.evaluation?.suggestions || [],
      answerSubmittedAt: new Date(),
      aiResponse: data.evaluation,
    });

    console.log('✅ Question saved to DB:', question._id);
    console.log('📈 Question scores:', question.scores);

    session.questions.push(question._id);
    session.metrics.answeredQuestions = session.questions.length;
    await session.save();
    
    console.log('🔄 Session updated with new question count:', session.metrics.answeredQuestions);
  }

  async updateAnalytics(userId: string, session: EnhancedInterviewSessionDocument) {
    console.log('📊 === UPDATING ANALYTICS ===');
    console.log('👤 User ID:', userId);
    console.log('📊 Session status:', session.status);
    console.log('📈 Session scores:', session.scores);
    
    const analytics = await this.analyticsModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId) } },
      { upsert: true, new: true }
    );

    const roundKey = session.roundType === RoundType.PROBLEM_SOLVING ? 'problemSolving' : session.roundType;
    
    // Always update total sessions count
    analytics.overall.totalInterviews++;
    analytics[roundKey].totalSessions++;
    
    if (session.status === InterviewStatus.COMPLETED) {
      console.log('✅ Session completed - updating analytics');
      analytics.overall.completedInterviews++;
      analytics[roundKey].completedSessions++;
      
      const score = session.scores?.overall || 0;
      console.log('📈 Overall score:', score);
      
      if (score > 0) {
        analytics[roundKey].averageScore = 
          (analytics[roundKey].averageScore * (analytics[roundKey].completedSessions - 1) + score) / 
          analytics[roundKey].completedSessions;
        
        if (score > analytics[roundKey].bestScore) {
          analytics[roundKey].bestScore = score;
        }
        
        analytics.overall.overallAverageScore = 
          (analytics.overall.overallAverageScore * (analytics.overall.completedInterviews - 1) + score) / 
          analytics.overall.completedInterviews;
        
        if (score > analytics.overall.bestOverallScore) {
          analytics.overall.bestOverallScore = score;
        }
      }
    } else {
      // For active sessions, still track the score if available
      const score = session.scores?.overall || 0;
      if (score > 0) {
        console.log('📊 Active session with score:', score);
        // Update latest score for active sessions
        analytics[roundKey].latestScore = score;
        if (score > analytics[roundKey].bestScore) {
          analytics[roundKey].bestScore = score;
        }
      }
    }
    
    await analytics.save();
    console.log('✅ Analytics saved:', {
      totalInterviews: analytics.overall.totalInterviews,
      completedInterviews: analytics.overall.completedInterviews,
      averageScore: analytics.overall.overallAverageScore
    });
  }

  async getDashboard(userId: string) {
    console.log('📊 === FETCHING DASHBOARD ===');
    console.log('👤 User ID:', userId);
    
    const analytics = await this.analyticsModel.findOne({ userId: new Types.ObjectId(userId) });
    const sessions = await this.sessionModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(5);
    
    console.log('📊 Analytics found:', !!analytics);
    console.log('📊 Sessions found:', sessions.length);
    
    if (analytics) {
      console.log('📈 Analytics data:', {
        totalInterviews: analytics.overall.totalInterviews,
        completedInterviews: analytics.overall.completedInterviews,
        averageScore: analytics.overall.overallAverageScore
      });
    }
    
    // If no analytics, create from existing sessions
    if (!analytics && sessions.length === 0) {
      return {
        totalInterviews: 0,
        completedInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0,
        recentSessions: [],
        roundStats: {
          technical: { averageScore: 0, totalSessions: 0, bestScore: 0 },
          behavioral: { averageScore: 0, totalSessions: 0, bestScore: 0 },
          problemSolving: { averageScore: 0, totalSessions: 0, bestScore: 0 },
          hr: { averageScore: 0, totalSessions: 0, bestScore: 0 }
        }
      };
    }

    // Calculate stats from sessions if analytics is missing or incomplete
    const completedSessions = sessions.filter(s => s.status === InterviewStatus.COMPLETED);
    const allScores = sessions.map(s => s.scores?.overall || 0).filter(score => score > 0);
    const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
    const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
    
    // Calculate round stats
    const roundStats = {
      technical: this.calculateRoundStats(sessions, RoundType.TECHNICAL),
      behavioral: this.calculateRoundStats(sessions, RoundType.BEHAVIORAL),
      problemSolving: this.calculateRoundStats(sessions, RoundType.PROBLEM_SOLVING),
      hr: this.calculateRoundStats(sessions, RoundType.HR)
    };

    return {
      totalInterviews: analytics?.overall.totalInterviews || sessions.length,
      completedInterviews: analytics?.overall.completedInterviews || completedSessions.length,
      averageScore: Number((analytics?.overall.overallAverageScore || avgScore).toFixed(2)),
      bestScore: analytics?.overall.bestOverallScore || bestScore,
      currentStreak: analytics?.overall.currentStreak || 0,
      longestStreak: analytics?.overall.longestStreak || 0,
      totalTimeSpent: analytics?.overall.totalTimeSpent || 0,
      recentSessions: sessions.map(s => ({
        session_id: s.sessionId,
        role_title: s.jobContext.roleTitle,
        company_name: s.jobContext.companyName,
        status: s.status,
        round_type: s.roundType,
        overall_score: s.scores?.overall || 0,
        created_at: s.createdAt,
        question_count: s.metrics.answeredQuestions || 0
      })),
      roundStats
    };
  }

  private calculateRoundStats(sessions: EnhancedInterviewSessionDocument[], roundType: RoundType) {
    const roundSessions = sessions.filter(s => s.roundType === roundType);
    const completedRoundSessions = roundSessions.filter(s => s.status === InterviewStatus.COMPLETED);
    const scores = roundSessions.map(s => s.scores?.overall || 0).filter(score => score > 0);
    
    return {
      averageScore: scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0,
      totalSessions: roundSessions.length,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0
    };
  }

  async getHistory(userId: string) {
    const sessions = await this.sessionModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('questions');
    
    return sessions.map(session => ({
      sessionId: session.sessionId,
      roleTitle: session.jobContext.roleTitle,
      companyName: session.jobContext.companyName,
      industry: session.jobContext.industry,
      roundType: session.roundType,
      status: session.status,
      overallScore: session.scores?.overall || 0,
      totalQuestions: session.metrics.totalQuestions,
      answeredQuestions: session.metrics.answeredQuestions,
      createdAt: session.createdAt,
      completedAt: session.completedAt
    }));
  }
}
