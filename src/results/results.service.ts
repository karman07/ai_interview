import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Result, ResultDocument } from './schemas/result.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ResultsService {
  constructor(
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

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
    const newResult = new this.resultModel({
      owner: new Types.ObjectId(userId),
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
      rawOutput: JSON.stringify(data),
    });

    const savedResult = await newResult.save();

    // Increment user interview count
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { interviewCount: 1 }
    });

    return savedResult;
  }
}
