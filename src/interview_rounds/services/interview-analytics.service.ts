import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterviewAnalytics, UserInterviewAnalyticsDocument } from '../schemas/user-interview-analytics.schema';

export interface VoiceMetrics {
  duration: number;
  speech_rate: number;
  avg_pitch: number;
  pitch_variation: number;
  avg_energy: number;
  pause_ratio: number;
  speech_segments: number;
}

export interface EvaluationBreakdown {
  relevance: number;
  depth: number;
  structure: number;
  examples: number;
  technical: number;
  alignment: number;
  fluency: number;
  clarity: number;
  confidence: number;
  pace: number;
}

export interface InterviewAnalyticsData {
  userId: string;
  sessionId: string;
  questionId?: string;
  question: string;
  answer: string;
  transcribedText?: string;
  hasAudio: boolean;
  audioFilePath?: string;
  evaluation: {
    score: number;
    feedback: string;
    suggestions: string[];
    breakdown: EvaluationBreakdown;
    voice_metrics?: VoiceMetrics;
    total_possible: number;
  };
  stage: string;
  roundType: string;
  roleTitle: string;
  companyName: string;
  industry: string;
  timestamp: Date;
}

@Injectable()
export class InterviewAnalyticsService {
  private readonly logger = new Logger(InterviewAnalyticsService.name);

  constructor(
    @InjectModel(UserInterviewAnalytics.name)
    private analyticsModel: Model<UserInterviewAnalyticsDocument>,
  ) {}

  /**
   * Save individual question-answer analytics
   */
  async saveQuestionAnalytics(data: InterviewAnalyticsData): Promise<void> {
    try {
      console.log('📊 Saving question analytics:', {
        userId: data.userId,
        sessionId: data.sessionId,
        question: data.question.substring(0, 50) + '...',
        score: data.evaluation.score
      });

      const analyticsRecord = new this.analyticsModel({
        userId: data.userId,
        sessionId: data.sessionId,
        questionId: data.questionId,
        question: data.question,
        answer: data.answer,
        transcribedText: data.transcribedText,
        hasAudio: data.hasAudio,
        audioFilePath: data.audioFilePath,
        evaluation: data.evaluation,
        stage: data.stage,
        roundType: data.roundType,
        roleTitle: data.roleTitle,
        companyName: data.companyName,
        industry: data.industry,
        timestamp: data.timestamp,
        createdAt: new Date(),
      });

      await analyticsRecord.save();
      this.logger.log(`Analytics saved for question in session ${data.sessionId}`);
    } catch (error) {
      this.logger.error('Failed to save question analytics:', error);
    }
  }

  /**
   * Save session completion analytics
   */
  async saveSessionCompletion(
    userId: string,
    sessionId: string,
    finalReport: any,
    totalQuestions: number,
    duration: number
  ): Promise<void> {
    try {
      console.log('🏁 Saving session completion analytics:', {
        userId,
        sessionId,
        totalQuestions,
        duration,
        overallScore: finalReport.overall_score || finalReport.avg_scores?.overall
      });

      const completionRecord = new this.analyticsModel({
        userId,
        sessionId,
        question: 'SESSION_COMPLETION',
        answer: 'COMPLETED',
        hasAudio: false,
        evaluation: {
          score: finalReport.overall_score || finalReport.avg_scores?.overall || 0,
          feedback: 'Session completed',
          suggestions: finalReport.recommendations || [],
          breakdown: finalReport.avg_scores || {},
          total_possible: 10
        },
        stage: 'completion',
        roundType: finalReport.round_type || 'unknown',
        roleTitle: finalReport.role || 'Unknown',
        companyName: finalReport.company || 'Unknown',
        industry: finalReport.industry || 'Unknown',
        sessionMetadata: {
          totalQuestions,
          duration,
          completedAt: new Date(),
          finalScores: finalReport.avg_scores,
          strengths: finalReport.strengths,
          weaknesses: finalReport.weaknesses,
          recommendations: finalReport.recommendations,
          voiceAnalysisSummary: finalReport.voice_analysis_summary
        },
        timestamp: new Date(),
        createdAt: new Date(),
      });

      await completionRecord.save();
      this.logger.log(`Session completion analytics saved for ${sessionId}`);
    } catch (error) {
      this.logger.error('Failed to save session completion analytics:', error);
    }
  }

  /**
   * Get analytics for a user
   */
  async getUserAnalytics(userId: string): Promise<any[]> {
    try {
      return await this.analyticsModel
        .find({ userId })
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      this.logger.error('Failed to get user analytics:', error);
      return [];
    }
  }

  /**
   * Get analytics for a session
   */
  async getSessionAnalytics(sessionId: string): Promise<any[]> {
    try {
      return await this.analyticsModel
        .find({ sessionId })
        .sort({ timestamp: 1 })
        .exec();
    } catch (error) {
      this.logger.error('Failed to get session analytics:', error);
      return [];
    }
  }

  /**
   * Get aggregated analytics
   */
  async getAggregatedAnalytics(userId?: string): Promise<any> {
    try {
      const matchStage = userId ? { $match: { userId } } : { $match: {} };
      
      const pipeline = [
        matchStage,
        {
          $group: {
            _id: '$userId',
            totalSessions: { $addToSet: '$sessionId' },
            totalQuestions: { $sum: 1 },
            avgScore: { $avg: '$evaluation.score' },
            avgVoiceFluency: { $avg: '$evaluation.voice_metrics.fluency' },
            avgVoiceClarity: { $avg: '$evaluation.voice_metrics.clarity' },
            avgVoiceConfidence: { $avg: '$evaluation.voice_metrics.confidence' },
            commonStages: { $push: '$stage' },
            industries: { $addToSet: '$industry' },
            roles: { $addToSet: '$roleTitle' }
          }
        },
        {
          $project: {
            userId: '$_id',
            totalSessions: { $size: '$totalSessions' },
            totalQuestions: 1,
            avgScore: { $round: ['$avgScore', 2] },
            avgVoiceFluency: { $round: ['$avgVoiceFluency', 2] },
            avgVoiceClarity: { $round: ['$avgVoiceClarity', 2] },
            avgVoiceConfidence: { $round: ['$avgVoiceConfidence', 2] },
            industries: 1,
            roles: 1
          }
        }
      ];

      return await this.analyticsModel.aggregate(pipeline).exec();
    } catch (error) {
      this.logger.error('Failed to get aggregated analytics:', error);
      return [];
    }
  }
}