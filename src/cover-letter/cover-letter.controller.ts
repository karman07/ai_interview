import {
  Controller,
  Post,
  Get,
  UseGuards,
  Req,
  Body,
  BadRequestException,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { UniversitiesService } from '../universities/universities.service';

@Controller('cover-letters')
export class CoverLetterController {
  private readonly logger = new Logger(CoverLetterController.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly universitiesService: UniversitiesService,
  ) {}

  /**
   * GET /cover-letters/usage
   * Returns the current cover letter usage for the authenticated user.
   */
  @Get('usage')
  @UseGuards(JwtAuthGuard)
  async getUsage(@Req() req) {
    const userId = req.user.sub;
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new BadRequestException('User not found');

    let limit = user.coverLetterLimit ?? 0;

    if (user.role === UserRole.STUDENT && user.universityId) {
      try {
        const uni = await this.universitiesService.findById(user.universityId);
        if (uni) limit = (uni as any).coverLetterLimit ?? limit;
      } catch {}
    }

    return {
      used: user.coverLetterCount ?? 0,
      limit,
      remaining: Math.max(0, limit - (user.coverLetterCount ?? 0)),
    };
  }

  /**
   * POST /cover-letters/check-and-use
   * Called by the AI server before generating a cover letter.
   * Checks the user's limit and atomically increments the counter.
   * Returns 400 if limit exceeded.
   */
  @Post('check-and-use')
  @UseGuards(JwtAuthGuard)
  async checkAndUse(@Req() req) {
    const userId = req.user.sub;
    const user = await this.userModel.findById(userId).populate('subscriptionPlan').exec();
    if (!user) throw new BadRequestException('User not found');

    const currentUsage = user.coverLetterCount ?? 0;
    let limit = user.coverLetterLimit ?? 0;

    // Override for students: use university limits if linked
    if (user.role === UserRole.STUDENT && user.universityId) {
      try {
        const uni = await this.universitiesService.findById(user.universityId);
        if (uni) {
          limit = (uni as any).coverLetterLimit ?? limit;
          this.logger.log(`🎓 Applying university cover letter limit for student: ${limit}`);
        }
      } catch (err: any) {
        this.logger.error(`Failed to fetch university ${user.universityId}: ${err?.message}`);
      }
    }

    if (currentUsage >= limit) {
      this.logger.warn(`🚫 User ${userId} reached monthly cover letter limit of ${limit} (used: ${currentUsage})`);
      throw new BadRequestException(
        limit === 0
          ? 'You need an access code to use this feature. Please enter a valid access code to start your free trial.'
          : `You have reached your monthly limit of ${limit} cover letter${limit !== 1 ? 's' : ''}. ` +
            `Upgrade your plan or wait for your limit to reset on the 1st of next month.`,
      );
    }

    await this.userModel.findByIdAndUpdate(userId, { $inc: { coverLetterCount: 1 } });

    this.logger.log(`✅ Cover letter generated for user ${userId} (${currentUsage + 1}/${limit})`);

    return {
      allowed: true,
      used: currentUsage + 1,
      limit,
      remaining: Math.max(0, limit - currentUsage - 1),
    };
  }

  /**
   * POST /cover-letters/check-and-use-internal
   * Called internally by the AI server (no JWT required — caller is trusted
   * service-to-service, matching the analytics/ai-usage pattern).
   * Accepts { userId } in the request body.
   */
  @Post('check-and-use-internal')
  @HttpCode(200)
  async checkAndUseInternal(@Body() body: { userId: string }) {
    const { userId } = body;
    if (!userId) throw new BadRequestException('userId is required');

    const user = await this.userModel.findById(userId).populate('subscriptionPlan').exec();
    if (!user) throw new BadRequestException('User not found');

    const currentUsage = user.coverLetterCount ?? 0;
    let limit = user.coverLetterLimit ?? 0;

    if (user.role === UserRole.STUDENT && user.universityId) {
      try {
        const uni = await this.universitiesService.findById(user.universityId);
        if (uni) {
          limit = (uni as any).coverLetterLimit ?? limit;
          this.logger.log(`🎓 Applying university cover letter limit for student: ${limit}`);
        }
      } catch (err: any) {
        this.logger.error(`Failed to fetch university ${user.universityId}: ${err?.message}`);
      }
    }

    if (currentUsage >= limit) {
      this.logger.warn(`🚫 User ${userId} reached monthly cover letter limit of ${limit} (used: ${currentUsage})`);
      throw new BadRequestException(
        limit === 0
          ? 'You need an access code to use this feature. Please enter a valid access code to start your free trial.'
          : `You have reached your monthly limit of ${limit} cover letter${limit !== 1 ? 's' : ''}. ` +
            `Upgrade your plan or wait for your limit to reset on the 1st of next month.`,
      );
    }

    await this.userModel.findByIdAndUpdate(userId, { $inc: { coverLetterCount: 1 } });

    this.logger.log(`✅ Cover letter generated for user ${userId} (${currentUsage + 1}/${limit})`);

    return {
      allowed: true,
      used: currentUsage + 1,
      limit,
      remaining: Math.max(0, limit - currentUsage - 1),
    };
  }
}
