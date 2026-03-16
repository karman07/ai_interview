import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewFlag } from './schemas/review.schema';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /* ════════  PUBLIC  ════════ */

  /** GET /reviews/public — curated feed for landing page widgets */
  @Get('public')
  getPublic(@Query('limit') limit?: string) {
    return this.reviewsService.getPublic(limit ? parseInt(limit, 10) : 9);
  }

  /* ════════  USER  ════════ */

  /** POST /reviews — submit a review after an interview */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    const fs = require('fs');
    const logPath = '/Users/karmansingh/Desktop/work/ai_interview/backend/reviews_debug.log';
    const log = (msg: string) => fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);

    log(`POST /reviews hit - User: ${user.sub} - Body: ${JSON.stringify(dto)}`);

    try {
      const res = await this.reviewsService.create(user.sub, dto);
      log(`POST /reviews SUCCESS - Result: ${JSON.stringify(res)}`);
      return res;
    } catch (err: any) {
      log(`POST /reviews ERROR: ${err.message || err}`);
      throw err;
    }
  }

  /** GET /reviews/my — logged-in user's own reviews */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyReviews(@CurrentUser() user: any) {
    return this.reviewsService.getMyReviews(user.sub);
  }

  /* ════════  ADMIN  ════════ */

  /** GET /reviews/admin/stats — aggregate stats + rating distribution */
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminStats() {
    return this.reviewsService.adminGetStats();
  }

  /** GET /reviews/admin/all — paginated list with filters */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminGetAll(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('rating') rating?: string,
    @Query('flag')   flag?:   ReviewFlag,
    @Query('search') search?: string,
  ) {
    return this.reviewsService.adminGetAll({
      page:   page   ? parseInt(page,   10) : 1,
      limit:  limit  ? parseInt(limit,  10) : 20,
      rating: rating ? parseInt(rating, 10) : undefined,
      flag,
      search,
    });
  }

  /** PATCH /reviews/admin/:id/flag — moderate a review */
  @Patch('admin/:id/flag')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminFlag(@Param('id') id: string, @Body('flag') flag: ReviewFlag) {
    return this.reviewsService.adminFlag(id, flag);
  }

  /** PATCH /reviews/admin/:id/pin — pin/unpin */
  @Patch('admin/:id/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminPin(@Param('id') id: string, @Body('isPinned') isPinned: boolean) {
    return this.reviewsService.adminPin(id, isPinned);
  }

  /** DELETE /reviews/admin/:id — hard delete */
  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminDelete(@Param('id') id: string) {
    return this.reviewsService.adminDelete(id);
  }
}
