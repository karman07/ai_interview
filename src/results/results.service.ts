import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Result, ResultDocument } from './schemas/result.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AIUsage, AIUsageDocument } from '../analytics/schemas/ai-usage.schema';

export interface AdminResultsFilters {
  search?: string;   // filter by user email/name
  roundType?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AIUsage.name) private aiUsageModel: Model<AIUsageDocument>,
  ) { }

  // Admin: get ALL results with user details (paginated)
  async getAllResults(filters: AdminResultsFilters = {}) {
    const page  = Math.max(1, filters.page  ?? 1);
    const limit = Math.min(100, filters.limit ?? 50);
    const skip  = (page - 1) * limit;

    const pipeline: any[] = [
      { $sort: { createdAt: -1 } },
      // join user
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: '_user',
        },
      },
      { $addFields: { user: { $arrayElemAt: ['$_user', 0] } } },
      { $project: { _user: 0, 'user.passwordHash': 0, 'user.refreshTokenHash': 0, 'user.tokens': 0 } },
    ];

    // optional filters
    if (filters.roundType) {
      pipeline.splice(1, 0, { $match: { roundType: filters.roundType } });
    }
    if (filters.search) {
      const re = { $regex: filters.search, $options: 'i' };
      pipeline.splice(1, 0, {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: '_searchUser',
        },
      },
      {
        $match: {
          $or: [
            { role: re },
            { 'jobDescription': re },
            { '_searchUser.email': re },
            { '_searchUser.name': re },
          ],
        },
      },
      { $project: { _searchUser: 0 } });
    }

    // count total before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const paginatedPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

    const [results, countResult] = await Promise.all([
      this.resultModel.aggregate(paginatedPipeline),
      this.resultModel.aggregate(countPipeline),
    ]);

    return {
      results,
      total: countResult[0]?.total ?? 0,
      page,
      limit,
      pages: Math.ceil((countResult[0]?.total ?? 0) / limit),
    };
  }

  // Get all results for logged-in user
  async getMyResults(userId: string) {
    return this.resultModel
      .find({ owner: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get single result (only if belongs to user)
  async getResultById(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Result not found');
    }
    const result = await this.resultModel.findById(id).exec();
    if (!result) throw new NotFoundException('Result not found');
    if (result.owner.toString() !== userId.toString()) {
      throw new NotFoundException('Result not found for this user');
    }
    return result;
  }

  // Create enhanced result from external data
  async createEnhancedResult(userId: string, data: any) {
    let tokenUsage = undefined;

    if (data.session_id) {
      const usageDoc = await this.aiUsageModel.findOne({ sessionId: data.session_id }).exec();
      if (usageDoc) {
        tokenUsage = {
          inputTokens: usageDoc.inputTokens,
          outputTokens: usageDoc.outputTokens,
          totalTokens: usageDoc.totalTokens,
          costUsd: usageDoc.costUsd,
        };
      }
    }

    const newResult = new this.resultModel({
      owner: new Types.ObjectId(userId),
      sessionId: data.session_id,
      role: data.role,
      roundType: data.round,
      jobDescription: data.company || 'N/A', // Using company as placeholder if JD text not sent
      questions: data.question_wise_analysis?.map((q: any) => q.question) || [],
      difficulty: data.summary?.seniority_assessment || 'intermediate',
      items: data.question_wise_analysis?.map((q: any) => ({
        question: q.question,
        answer: q.user_answer_summary,
        isCorrect: q.score >= 5,
        explanation: q.evaluation?.ideal_answer_outline?.join(', '),
        score: q.score,
      })) || [],
      summary: data.summary,
      dimension_scores: data.dimension_scores,
      question_wise_analysis: data.question_wise_analysis,
      skill_gap_analysis: data.skill_gap_analysis,
      behavioral_insights: data.behavioral_insights,
      improvement_plan: data.improvement_plan,
      verdict: data.verdict,
      tokenUsage,
      rawOutput: JSON.stringify(data),
    });

    const savedResult = await newResult.save();

    // Increment user interview count
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { interviewCount: 1 }
    });

    return savedResult;
  }

  async submitFeedback(
    userId: string,
    sessionId: string,
    experienceRating: number,
    resultRating: number,
    comment: string,
  ) {
    try {
      let result = await this.resultModel
        .findOne({ sessionId, owner: new Types.ObjectId(userId) })
        .exec();

      if (!result) {
        // Try finding without owner check (e.g. sessionId not yet linked)
        result = await this.resultModel.findOne({ sessionId }).exec();
        if (!result) {
          throw new Error(`Session result not found for sessionId: ${sessionId}`);
        }
      }

      result.feedback = {
        experienceRating,
        resultRating,
        comment: comment?.trim() || '',
        submittedAt: new Date(),
      };
      
      const saved = await result.save();
      return saved;
    } catch (error) {
      console.error('Error in submitFeedback:', {
        userId,
        sessionId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
