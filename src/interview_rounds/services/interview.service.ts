import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Interview, InterviewDocument } from '../schemas/interview.schema';
import Redis from 'ioredis';
import { DeleteResult } from 'mongodb'; // 👈 Import DeleteResult

@Injectable()
export class InterviewService {
  constructor(
    @InjectModel(Interview.name)
    private interviewModel: Model<InterviewDocument>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(
    userId: string,
    round: string,
    question: string,
    context?: {
      role?: string;
      company?: string;
      jobDescription?: string;
      experience?: string;
    },
  ): Promise<InterviewDocument> {
    const payload: Partial<Interview> = {
      userId,
      round,
      question,
      status: 'pending',
    };

    if (context) {
      payload.role = context.role;
      payload.company = context.company;
      payload.jobDescription = context.jobDescription;
      payload.experience = context.experience;
    }

    const interview = new this.interviewModel(payload);
    const saved = await interview.save();
    await this.redis.publish('interview_events', JSON.stringify(saved));
    return saved;
  }

  async startWithContext(data: {
    userId: string;
    round: string;
    role?: string;
    company?: string;
    jobDescription?: string;
    experience?: string;
  }): Promise<InterviewDocument> {
    const rec = await this.interviewModel.create({
      userId: data.userId,
      round: data.round,
      role: data.role,
      company: data.company,
      jobDescription: data.jobDescription,
      experience: data.experience,
      question: null,
      answer: null,
      feedback: null,
      status: 'pending',
    });
    await this.redis.publish('interview_events', JSON.stringify(rec));
    return rec;
  }

  async submitAnswer(
    id: string,
    answer: string,
    feedback: string,
  ): Promise<InterviewDocument | null> {
    const updated = await this.interviewModel.findByIdAndUpdate(
      id,
      { answer, feedback, status: 'completed' },
      { new: true },
    );
    if (updated) {
      await this.redis.publish('interview_events', JSON.stringify(updated));
    }
    return updated;
  }

  async findById(id: string): Promise<InterviewDocument | null> {
    return this.interviewModel.findById(id).exec();
  }

  async getHistory(userId: string): Promise<InterviewDocument[]> {
    return this.interviewModel
      .find({ userId })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getResults(userId: string) {
    const interviews = await this.interviewModel.find({ userId }).exec();
    return this.buildResults(interviews);
  }

  // 👉 Round-specific methods
  async resetRound(userId: string, round: string): Promise<DeleteResult> {
    return this.interviewModel
      .deleteMany({ userId, round, status: { $ne: 'completed' } })
      .exec();
  }

  async getHistoryForRound(
    userId: string,
    round: string,
  ): Promise<InterviewDocument[]> {
    return this.interviewModel
      .find({ userId, round })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getResultsForRound(userId: string, round: string) {
    const interviews = await this.interviewModel
      .find({ userId, round })
      .exec();
    return this.buildResults(interviews);
  }

  private buildResults(interviews: InterviewDocument[]) {
    const scored = interviews
      .map((i) => {
        const match = i.feedback?.match(/(\d+)\/10/);
        return { ...i.toObject(), score: match ? parseInt(match[1], 10) : null };
      })
      .filter((i) => i.score !== null);

    const avgScore =
      (scored.reduce((acc, cur) => acc + (cur.score || 0), 0) /
        (scored.length || 1)) || 0;

    return {
      totalRounds: interviews.length,
      completed: interviews.filter((i) => i.status === 'completed').length,
      averageScore: Number.isFinite(avgScore) ? avgScore.toFixed(2) : '0.00',
      details: scored,
    };
  }
}
