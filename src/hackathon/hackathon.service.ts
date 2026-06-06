import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HackathonEmail, HackathonEmailDocument } from './schemas/hackathon-email.schema';
import { HackathonConfig, HackathonConfigDocument } from './schemas/hackathon-config.schema';
import { HackathonResult, HackathonResultDocument } from './schemas/hackathon-result.schema';
import { HackathonForm, HackathonFormDocument } from './schemas/hackathon-form.schema';
import { Result, ResultDocument } from '../results/schemas/result.schema';

@Injectable()
export class HackathonService {
  constructor(
    @InjectModel(HackathonEmail.name) private emailModel: Model<HackathonEmailDocument>,
    @InjectModel(HackathonConfig.name) private configModel: Model<HackathonConfigDocument>,
    @InjectModel(HackathonResult.name) private resultModel: Model<HackathonResultDocument>,
    @InjectModel(HackathonForm.name) private formModel: Model<HackathonFormDocument>,
    @InjectModel(Result.name) private interviewResultModel: Model<ResultDocument>,
  ) {}

  // ── Config ────────────────────────────────────────────────────────────────

  async getConfig() {
    let config = await this.configModel.findOne({ key: 'default' });
    if (!config) {
      config = await this.configModel.create({ key: 'default' });
    }
    return config;
  }

  async updateConfig(data: Partial<{ isActive: boolean; title: string; description: string; jdText: string; difficulty: string }>) {
    const config = await this.configModel.findOneAndUpdate(
      { key: 'default' },
      { $set: data },
      { upsert: true, new: true },
    );
    return config;
  }

  // ── Email list management ─────────────────────────────────────────────────

  async uploadEmails(emails: string[]) {
    const cleaned = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(e => e.includes('@')))];
    if (cleaned.length === 0) throw new BadRequestException('No valid emails found in the file');

    // Upsert each email (don't reset interviewTaken if already set)
    const ops = cleaned.map(email => ({
      updateOne: {
        filter: { email },
        update: { $setOnInsert: { email, interviewTaken: false, formSubmitted: false } },
        upsert: true,
      },
    }));
    await this.emailModel.bulkWrite(ops);
    return { added: cleaned.length, emails: cleaned };
  }

  async getAllEmails(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [emails, total] = await Promise.all([
      this.emailModel.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.emailModel.countDocuments(),
    ]);
    return { emails, total, page, pages: Math.ceil(total / limit) };
  }

  async removeEmail(email: string) {
    await this.emailModel.deleteOne({ email: email.toLowerCase() });
    return { success: true };
  }

  async clearAllEmails() {
    await this.emailModel.deleteMany({});
    return { success: true };
  }

  // ── Eligibility check ─────────────────────────────────────────────────────

  async checkEligibility(email: string) {
    const [config, entry] = await Promise.all([
      this.getConfig(),
      this.emailModel.findOne({ email: email.toLowerCase() }),
    ]);

    if (!entry) {
      return { eligible: false, reason: 'Email not in hackathon list', config: null };
    }

    // User is registered — always eligible; isActive tells the frontend if it's live
    return {
      eligible: true,
      isActive: config.isActive,
      interviewTaken: entry.interviewTaken,
      formSubmitted: entry.formSubmitted,
      config: {
        isActive: config.isActive,
        title: config.title,
        description: config.description,
        jdText: config.jdText,
        difficulty: config.difficulty,
      },
    };
  }

  // ── Mark interview as taken ───────────────────────────────────────────────

  async markInterviewTaken(email: string) {
    const entry = await this.emailModel.findOne({ email: email.toLowerCase() });
    if (!entry) throw new NotFoundException('Email not found in hackathon list');
    if (entry.interviewTaken) throw new BadRequestException('Interview already taken');
    entry.interviewTaken = true;
    await entry.save();
    return { success: true };
  }

  async resetInterview(email: string) {
    const entry = await this.emailModel.findOne({ email: email.toLowerCase() });
    if (!entry) throw new NotFoundException('Email not found in hackathon list');
    entry.interviewTaken = false;
    entry.formSubmitted = false;
    await entry.save();
    // Also delete any broken/old result for this email
    await this.resultModel.deleteMany({ userEmail: email.toLowerCase() });
    return { success: true };
  }

  // ── Results ───────────────────────────────────────────────────────────────

  async saveResult(data: {
    userId: string;
    userName: string;
    userEmail: string;
    userImage?: string;
    overallScore: number;
    metrics?: Record<string, number>;
    sessionId?: string;
    cvVerified?: boolean;
    rawData?: Record<string, any>;
  }) {
    // Find by userId OR email so old broken records (null userId) get patched
    const existing = await this.resultModel.findOne({
      $or: [{ userId: data.userId }, { userEmail: data.userEmail.toLowerCase() }],
    });
    if (existing) {
      Object.assign(existing, data);
      return existing.save();
    }
    return this.resultModel.create(data);
  }

  async getLeaderboard(limit = 50) {
    return this.resultModel
      .find({ userId: { $exists: true, $ne: null }, userName: { $exists: true, $ne: null } })
      .sort({ overallScore: -1 })
      .limit(limit)
      .select('userName userEmail userImage overallScore metrics formFilled createdAt');
  }

  async forceSyncResult(userId: string, userName: string, userEmail: string, userImage?: string) {
    // Find their most recent interview session with a valid score
    const session = await this.interviewResultModel
      .findOne({ owner: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    if (!session) throw new NotFoundException('No interview session found for this user');

    const overallScore: number =
      (session as any)?.summary?.overall_score ??
      (session as any)?.overall_score ??
      (session as any)?.score ?? 0;

    const metrics = {
      technicalAccuracy: (session as any)?.summary?.technical_score,
      communicationClarity: (session as any)?.summary?.communication_score,
      problemSolving: (session as any)?.summary?.problem_solving_score,
    };

    return this.saveResult({
      userId,
      userName,
      userEmail,
      userImage,
      overallScore: Math.round(overallScore),
      metrics,
      sessionId: (session as any)?.sessionId || session._id?.toString(),
      rawData: (session as any)?.summary || {},
    });
  }

  // ── Post-interview form ───────────────────────────────────────────────────

  async submitForm(data: {
    userId: string;
    userEmail: string;
    userName: string;
    userImage?: string;
    experience: string;
    feedback: string;
    collegeName: string;
    yearOfStudy: string;
    branch: string;
    linkedinUrl?: string;
    githubUrl?: string;
    lookingForOpportunities?: boolean;
  }) {
    const existing = await this.formModel.findOne({ userId: data.userId });
    if (existing) throw new BadRequestException('Form already submitted');

    const form = await this.formModel.create(data);

    // Mark form as submitted in email list & result
    await this.emailModel.updateOne({ email: data.userEmail.toLowerCase() }, { $set: { formSubmitted: true } });
    await this.resultModel.updateOne({ userId: data.userId }, { $set: { formFilled: true } });

    return form;
  }

  async getAllForms(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [forms, total] = await Promise.all([
      this.formModel.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.formModel.countDocuments(),
    ]);
    return { forms, total, page, pages: Math.ceil(total / limit) };
  }
}
