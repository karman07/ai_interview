import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DsaProgress,
  DsaProgressDocument,
  SubmissionStatus,
  Submission,
} from './schemas/dsa-progress.schema';
import { RecordSubmissionDto, UpdateProgressDto, AddHintDto } from './dto/progress.dto';

@Injectable()
export class DsaProgressService {
  constructor(
    @InjectModel(DsaProgress.name)
    private dsaProgressModel: Model<DsaProgressDocument>,
  ) {}

  /**
   * Record a new submission for a user
   */
  async recordSubmission(
    userId: string,
    questionId: string,
    submissionDto: RecordSubmissionDto,
  ): Promise<DsaProgress> {
    const isAccepted =
      submissionDto.status === SubmissionStatus.SOLVED &&
      submissionDto.testCasesPassed === submissionDto.totalTestCases;

    const submission: Submission = {
      submittedAt: new Date(),
      language: submissionDto.language,
      code: submissionDto.code,
      status: submissionDto.status,
      testCasesPassed: submissionDto.testCasesPassed,
      totalTestCases: submissionDto.totalTestCases,
      executionTime: submissionDto.executionTime,
      memoryUsed: submissionDto.memoryUsed,
      errorMessage: submissionDto.errorMessage,
      isAccepted,
    };

    // Find or create progress document
    let progress = await this.dsaProgressModel.findOne({ userId, questionId });

    if (!progress) {
      progress = new this.dsaProgressModel({
        userId,
        questionId,
        status: submissionDto.status,
        totalAttempts: 1,
        successfulAttempts: isAccepted ? 1 : 0,
        firstAttemptDate: new Date(),
        lastAttemptDate: new Date(),
        solvedDate: isAccepted ? new Date() : undefined,
        totalTimeSpent: submissionDto.timeSpent || 0,
        bestExecutionTime: submissionDto.executionTime,
        submissions: [submission],
        languagesAttempted: [submissionDto.language],
      });
    } else {
      // Update existing progress
      progress.totalAttempts += 1;
      progress.lastAttemptDate = new Date();
      
      if (isAccepted) {
        progress.successfulAttempts += 1;
        if (!progress.solvedDate) {
          progress.solvedDate = new Date();
        }
        progress.status = SubmissionStatus.SOLVED;
      } else if (progress.status !== SubmissionStatus.SOLVED) {
        progress.status = submissionDto.status;
      }

      // Update time tracking
      if (submissionDto.timeSpent) {
        progress.totalTimeSpent += submissionDto.timeSpent;
      }

      // Update best execution time
      if (
        submissionDto.executionTime &&
        (!progress.bestExecutionTime ||
          submissionDto.executionTime < progress.bestExecutionTime)
      ) {
        progress.bestExecutionTime = submissionDto.executionTime;
      }

      // Add submission to history
      progress.submissions.push(submission);

      // Track language
      if (!progress.languagesAttempted.includes(submissionDto.language)) {
        progress.languagesAttempted.push(submissionDto.language);
      }
    }

    return await progress.save();
  }

  /**
   * Get user's progress for a specific question
   */
  async getQuestionProgress(
    userId: string,
    questionId: string,
  ): Promise<DsaProgress | null> {
    return await this.dsaProgressModel.findOne({ userId, questionId }).exec();
  }

  /**
   * Get all progress for a user with optional filters
   */
  async getUserProgress(
    userId: string,
    filters?: {
      status?: SubmissionStatus;
      isBookmarked?: boolean;
      isSolved?: boolean;
    },
  ): Promise<DsaProgress[]> {
    const query: any = { userId };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.isBookmarked !== undefined) {
      query.isBookmarked = filters.isBookmarked;
    }

    if (filters?.isSolved) {
      query.solvedDate = { $exists: true };
    }

    return await this.dsaProgressModel
      .find(query)
      .populate('questionRef')
      .sort({ lastAttemptDate: -1 })
      .exec();
  }

  /**
   * Update progress metadata (bookmarks, notes, rating)
   */
  async updateProgress(
    userId: string,
    questionId: string,
    updateDto: UpdateProgressDto,
  ): Promise<DsaProgress> {
    const progress = await this.dsaProgressModel.findOne({ userId, questionId });

    if (!progress) {
      throw new NotFoundException(
        `No progress found for question ${questionId}`,
      );
    }

    if (updateDto.isBookmarked !== undefined) {
      progress.isBookmarked = updateDto.isBookmarked;
    }

    if (updateDto.userNotes !== undefined) {
      progress.userNotes = updateDto.userNotes;
    }

    if (updateDto.userRating !== undefined) {
      progress.userRating = updateDto.userRating;
    }

    return await progress.save();
  }

  /**
   * Toggle like status for a question
   */
  async toggleLike(userId: string, questionId: string): Promise<DsaProgress> {
    let progress = await this.dsaProgressModel.findOne({ userId, questionId });

    if (!progress) {
      progress = new this.dsaProgressModel({
        userId,
        questionId,
        status: SubmissionStatus.ATTEMPTED,
        isLiked: true,
        isDisliked: false,
      });
    } else {
      progress.isLiked = !progress.isLiked;
      if (progress.isLiked) {
        progress.isDisliked = false;
      }
    }

    return await progress.save();
  }

  /**
   * Toggle dislike status for a question
   */
  async toggleDislike(
    userId: string,
    questionId: string,
  ): Promise<DsaProgress> {
    let progress = await this.dsaProgressModel.findOne({ userId, questionId });

    if (!progress) {
      progress = new this.dsaProgressModel({
        userId,
        questionId,
        status: SubmissionStatus.ATTEMPTED,
        isDisliked: true,
        isLiked: false,
      });
    } else {
      progress.isDisliked = !progress.isDisliked;
      if (progress.isDisliked) {
        progress.isLiked = false;
      }
    }

    return await progress.save();
  }

  /**
   * Record when user reveals a hint
   */
  async addHintUsed(
    userId: string,
    questionId: string,
    hintDto: AddHintDto,
  ): Promise<DsaProgress> {
    let progress = await this.dsaProgressModel.findOne({ userId, questionId });

    if (!progress) {
      progress = new this.dsaProgressModel({
        userId,
        questionId,
        status: SubmissionStatus.ATTEMPTED,
        hintsUsed: [hintDto.hintContent],
      });
    } else {
      if (!progress.hintsUsed.includes(hintDto.hintContent)) {
        progress.hintsUsed.push(hintDto.hintContent);
      }
    }

    return await progress.save();
  }

  /**
   * Get user's overall statistics
   */
  async getUserStatistics(userId: string) {
    const allProgress = await this.dsaProgressModel.find({ userId }).exec();

    const totalQuestions = allProgress.length;
    const solvedQuestions = allProgress.filter((p) => p.solvedDate).length;
    const attemptedQuestions = allProgress.filter(
      (p) => p.totalAttempts > 0 && !p.solvedDate,
    ).length;

    const totalSubmissions = allProgress.reduce(
      (sum, p) => sum + p.totalAttempts,
      0,
    );
    const successfulSubmissions = allProgress.reduce(
      (sum, p) => sum + p.successfulAttempts,
      0,
    );

    const totalTimeSpent = allProgress.reduce(
      (sum, p) => sum + p.totalTimeSpent,
      0,
    );

    // Languages used
    const languagesUsed = new Set<string>();
    allProgress.forEach((p) => {
      p.languagesAttempted.forEach((lang) => languagesUsed.add(lang));
    });

    // Solve rate by difficulty (requires population or additional query)
    const bookmarkedCount = allProgress.filter((p) => p.isBookmarked).length;

    return {
      totalQuestions,
      solvedQuestions,
      attemptedQuestions,
      totalSubmissions,
      successfulSubmissions,
      acceptanceRate:
        totalSubmissions > 0
          ? ((successfulSubmissions / totalSubmissions) * 100).toFixed(2)
          : '0.00',
      totalTimeSpent, // in seconds
      averageTimePerQuestion:
        totalQuestions > 0
          ? Math.round(totalTimeSpent / totalQuestions)
          : 0,
      languagesUsed: Array.from(languagesUsed),
      bookmarkedCount,
    };
  }

  /**
   * Get user's recent submissions
   */
  async getRecentSubmissions(
    userId: string,
    limit: number = 10,
  ): Promise<any[]> {
    const progressDocs = await this.dsaProgressModel
      .find({ userId })
      .sort({ lastAttemptDate: -1 })
      .limit(limit)
      .populate('questionRef')
      .exec();

    return progressDocs.map((progress) => {
      const latestSubmission =
        progress.submissions[progress.submissions.length - 1];
      return {
        questionId: progress.questionId,
        question: progress.questionRef,
        lastAttempt: progress.lastAttemptDate,
        status: progress.status,
        latestSubmission,
        totalAttempts: progress.totalAttempts,
      };
    });
  }

  /**
   * Get submission history for a specific question
   */
  async getSubmissionHistory(
    userId: string,
    questionId: string,
  ): Promise<Submission[]> {
    const progress = await this.dsaProgressModel.findOne({
      userId,
      questionId,
    });

    if (!progress) {
      throw new NotFoundException(
        `No progress found for question ${questionId}`,
      );
    }

    return progress.submissions;
  }

  /**
   * Delete all progress for a user (admin/cleanup)
   */
  async deleteUserProgress(userId: string): Promise<void> {
    await this.dsaProgressModel.deleteMany({ userId }).exec();
  }

  /**
   * Reset progress for a specific question
   */
  async resetQuestionProgress(
    userId: string,
    questionId: string,
  ): Promise<void> {
    await this.dsaProgressModel
      .deleteOne({ userId, questionId })
      .exec();
  }
}
