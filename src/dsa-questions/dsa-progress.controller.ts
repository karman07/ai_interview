import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DsaProgressService } from './dsa-progress.service';
import {
  RecordSubmissionDto,
  UpdateProgressDto,
  AddHintDto,
} from './dto/progress.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubmissionStatus } from './schemas/dsa-progress.schema';

@Controller('dsa-progress')
@UseGuards(JwtAuthGuard)
export class DsaProgressController {
  constructor(private readonly progressService: DsaProgressService) {}

  @Post(':questionId/submit')
  async recordSubmission(
    @Request() req,
    @Param('questionId') questionId: string,
    @Body() submissionDto: RecordSubmissionDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.recordSubmission(
      userId,
      questionId,
      submissionDto,
    );
  }

  @Get('my-progress')
  async getMyProgress(
    @Request() req,
    @Query('status') status?: SubmissionStatus,
    @Query('isBookmarked') isBookmarked?: boolean,
    @Query('isSolved') isSolved?: boolean,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.getUserProgress(userId, {
      status,
      isBookmarked,
      isSolved,
    });
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getUserStatistics(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.getUserStatistics(userId);
  }

  @Get('recent-submissions')
  async getRecentSubmissions(
    @Request() req,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.getRecentSubmissions(
      userId,
      limit || 10,
    );
  }

  @Get(':questionId')
  @UseGuards(JwtAuthGuard)
  async getQuestionProgress(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.getQuestionProgress(userId, questionId);
  }

  @Get(':questionId/submissions')
  @UseGuards(JwtAuthGuard)
  async getSubmissionHistory(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.getSubmissionHistory(userId, questionId);
  }

  @Patch(':questionId')
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @Request() req,
    @Param('questionId') questionId: string,
    @Body() updateDto: UpdateProgressDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.updateProgress(
      userId,
      questionId,
      updateDto,
    );
  }

  @Post(':questionId/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.toggleLike(userId, questionId);
  }

  @Post(':questionId/dislike')
  @UseGuards(JwtAuthGuard)
  async toggleDislike(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.toggleDislike(userId, questionId);
  }

  @Post(':questionId/hint')
  @UseGuards(JwtAuthGuard)
  async addHintUsed(
    @Request() req,
    @Param('questionId') questionId: string,
    @Body() hintDto: AddHintDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.addHintUsed(userId, questionId, hintDto);
  }

  @Delete(':questionId')
  @UseGuards(JwtAuthGuard)
  async resetProgress(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    await this.progressService.resetQuestionProgress(userId, questionId);
    return { message: 'Progress reset successfully' };
  }

  @Delete('all')
  @UseGuards(JwtAuthGuard)
  async deleteAllProgress(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    await this.progressService.deleteUserProgress(userId);
    return { message: 'All progress deleted successfully' };
  }
}
