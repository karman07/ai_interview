import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument, ReviewFlag } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  /* ─────────────────────── USER ACTIONS ─────────────────────────── */

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const review = new this.reviewModel({
      userId: new Types.ObjectId(userId),
      rating: dto.rating,
      comment: dto.comment?.trim() ?? '',
      sessionId: dto.sessionId ?? undefined,
      interviewType: dto.interviewType ?? undefined,
    });
    return review.save();
  }

  async getMyReviews(userId: string) {
    return this.reviewModel
      .find({ userId: new Types.ObjectId(userId), flag: { $ne: ReviewFlag.HIDDEN } })
      .sort({ createdAt: -1 })
      .exec();
  }

  /* ─────────────────────── ADMIN ACTIONS ─────────────────────────── */

  async adminGetAll(opts: {
    page?: number;
    limit?: number;
    rating?: number;
    flag?: ReviewFlag;
    search?: string;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 20);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (opts.rating)                filter.rating = opts.rating;
    if (opts.flag)                  filter.flag   = opts.flag;
    if (opts.search)                filter.$or = [
      { comment:       { $regex: opts.search, $options: 'i' } },
      { interviewType: { $regex: opts.search, $options: 'i' } },
    ];

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('userId', 'name email profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter),
    ]);

    return { reviews, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async adminGetStats() {
    const [totalResult, ratingDist, recentResult, fiveStarResult] = await Promise.all([
      this.reviewModel.aggregate([
        { $group: { _id: null, total: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      ]),
      this.reviewModel.aggregate([
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      this.reviewModel.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email'),
      this.reviewModel.countDocuments({ rating: 5 }),
    ]);

    const total = totalResult[0]?.total ?? 0;
    const avgRating = totalResult[0]?.avgRating ?? 0;
    const flaggedCount = await this.reviewModel.countDocuments({ flag: ReviewFlag.FLAGGED });

    // Build distribution map 1→5
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of ratingDist) dist[d._id] = d.count;

    return {
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      fiveStarCount: fiveStarResult,
      fiveStarPct: total > 0 ? Math.round((fiveStarResult / total) * 100) : 0,
      flaggedCount,
      ratingDistribution: dist,
      recentReviews: recentResult,
    };
  }

  async adminFlag(id: string, flag: ReviewFlag) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Review not found');
    const updated = await this.reviewModel.findByIdAndUpdate(
      id,
      { flag },
      { new: true },
    ).populate('userId', 'name email');
    if (!updated) throw new NotFoundException('Review not found');
    return updated;
  }

  async adminPin(id: string, isPinned: boolean) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Review not found');
    const updated = await this.reviewModel.findByIdAndUpdate(
      id,
      { isPinned },
      { new: true },
    ).populate('userId', 'name email');
    if (!updated) throw new NotFoundException('Review not found');
    return updated;
  }

  async adminDelete(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Review not found');
    const del = await this.reviewModel.findByIdAndDelete(id);
    if (!del) throw new NotFoundException('Review not found');
    return { deleted: true };
  }

  /** Public — only clean, non-hidden reviews for embedding on landing pages */
  async getPublic(limit = 9) {
    return this.reviewModel
      .find({ flag: ReviewFlag.CLEAN, rating: { $gte: 4 } })
      .populate('userId', 'name profilePhoto')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
