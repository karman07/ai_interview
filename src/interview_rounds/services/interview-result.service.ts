import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InterviewResult, InterviewResultDocument } from '../schemas/interview-result.schema';

@Injectable()
export class InterviewResultService {
  private readonly logger = new Logger(InterviewResultService.name);

  constructor(
    @InjectModel(InterviewResult.name)
    private interviewResultModel: Model<InterviewResultDocument>,
  ) {}

  /**
   * Save complete interview results when interview is completed
   */
  async saveInterviewResult(userId: string, response: any): Promise<InterviewResultDocument> {
    try {
      this.logger.log('🎯 ===== SAVING COMPLETE INTERVIEW RESULT =====');
      this.logger.log(`📊 User ID: ${userId}`);
      this.logger.log(`📋 Session ID: ${response.state?.session_id}`);
      this.logger.log(`🎬 Round Type: ${response.state?.round_type}`);
      this.logger.log(`✅ Status: ${response.state?.status}`);
      
      // Log complete response for debugging
      this.logger.log('📦 Complete AI Response:');
      this.logger.log(JSON.stringify(response, null, 2));

      const interviewResult = new this.interviewResultModel({
        userId: new Types.ObjectId(userId),
        sessionId: response.state?.session_id || 'unknown',
        roundType: response.state?.round_type || 'unknown',
        evaluation: response.evaluation || {},
        next_question: response.next_question || null,
        state: response.state || {},
        video_analysis: response.video_analysis || {},
        analytics: response.analytics || {},
        rawResponse: response, // Store complete raw response
        completedAt: new Date(),
      });

      const saved = await interviewResult.save();
      
      this.logger.log('✅ ===== INTERVIEW RESULT SAVED SUCCESSFULLY =====');
      this.logger.log(`💾 Saved ID: ${saved._id}`);
      this.logger.log(`📊 Total Questions in History: ${response.state?.history?.length || 0}`);
      this.logger.log(`🎯 Overall Score: ${response.analytics?.scores?.overall || 0}`);
      this.logger.log(`🎤 Communication Score: ${response.analytics?.scores?.communication || 0}`);
      this.logger.log(`💻 Technical Score: ${response.analytics?.scores?.technical || 0}`);
      this.logger.log(`🎭 Behavioral Score: ${response.analytics?.scores?.behavioral || 0}`);
      this.logger.log(`🧩 Problem Solving Score: ${response.analytics?.scores?.problemSolving || 0}`);
      this.logger.log(`📹 Video Behavior Score: ${response.video_analysis?.overall_behavior_score?.score || 0}`);
      this.logger.log(`🚨 Cheating Risk: ${response.video_analysis?.cheating_detection?.risk_level || 'UNKNOWN'}`);
      this.logger.log('==============================================\n');

      return saved;
    } catch (error) {
      this.logger.error('💥 Failed to save interview result:', error.message);
      this.logger.error(error.stack);
      throw error;
    }
  }

  /**
   * Get all interview results for a user
   */
  async getUserInterviewResults(userId: string): Promise<InterviewResultDocument[]> {
    try {
      const results = await this.interviewResultModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ completedAt: -1 })
        .exec();

      this.logger.log(`📊 Found ${results.length} interview results for user ${userId}`);
      return results;
    } catch (error) {
      this.logger.error('Failed to get user interview results:', error.message);
      throw error;
    }
  }

  /**
   * Get specific interview result by session ID
   */
  async getInterviewResultBySessionId(sessionId: string): Promise<InterviewResultDocument> {
    try {
      const result = await this.interviewResultModel
        .findOne({ sessionId })
        .exec();

      if (!result) {
        this.logger.warn(`No interview result found for session ${sessionId}`);
        return null;
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to get interview result:', error.message);
      throw error;
    }
  }

  /**
   * Get interview results by round type
   */
  async getUserInterviewResultsByRound(
    userId: string, 
    roundType: string
  ): Promise<InterviewResultDocument[]> {
    try {
      const results = await this.interviewResultModel
        .find({ 
          userId: new Types.ObjectId(userId),
          roundType 
        })
        .sort({ completedAt: -1 })
        .exec();

      this.logger.log(`📊 Found ${results.length} ${roundType} interview results for user ${userId}`);
      return results;
    } catch (error) {
      this.logger.error('Failed to get interview results by round:', error.message);
      throw error;
    }
  }

  /**
   * Delete interview result
   */
  async deleteInterviewResult(resultId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.interviewResultModel.findOneAndDelete({
        _id: new Types.ObjectId(resultId),
        userId: new Types.ObjectId(userId),
      });

      if (!result) {
        this.logger.warn(`No interview result found to delete: ${resultId}`);
        return false;
      }

      this.logger.log(`✅ Deleted interview result: ${resultId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to delete interview result:', error.message);
      throw error;
    }
  }

  /**
   * Get statistics for user's interview results
   */
  async getUserInterviewStatistics(userId: string): Promise<any> {
    try {
      const results = await this.getUserInterviewResults(userId);

      const stats = {
        totalInterviews: results.length,
        byRoundType: {},
        averageScores: {
          overall: 0,
          communication: 0,
          technical: 0,
          behavioral: 0,
          problemSolving: 0,
        },
        latestInterview: results[0] || null,
      };

      // Calculate statistics
      if (results.length > 0) {
        const roundTypeCounts = {};
        let totalOverall = 0;
        let totalCommunication = 0;
        let totalTechnical = 0;
        let totalBehavioral = 0;
        let totalProblemSolving = 0;

        results.forEach(result => {
          // Count by round type
          const roundType = result.roundType || 'unknown';
          roundTypeCounts[roundType] = (roundTypeCounts[roundType] || 0) + 1;

          // Sum scores
          totalOverall += result.analytics?.scores?.overall || 0;
          totalCommunication += result.analytics?.scores?.communication || 0;
          totalTechnical += result.analytics?.scores?.technical || 0;
          totalBehavioral += result.analytics?.scores?.behavioral || 0;
          totalProblemSolving += result.analytics?.scores?.problemSolving || 0;
        });

        stats.byRoundType = roundTypeCounts;
        stats.averageScores = {
          overall: totalOverall / results.length,
          communication: totalCommunication / results.length,
          technical: totalTechnical / results.length,
          behavioral: totalBehavioral / results.length,
          problemSolving: totalProblemSolving / results.length,
        };
      }

      return stats;
    } catch (error) {
      this.logger.error('Failed to get user interview statistics:', error.message);
      throw error;
    }
  }
}
