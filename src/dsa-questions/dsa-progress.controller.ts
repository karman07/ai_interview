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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { DsaProgressService } from './dsa-progress.service';
import {
  RecordSubmissionDto,
  UpdateProgressDto,
  AddHintDto,
} from './dto/progress.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubmissionStatus } from './schemas/dsa-progress.schema';

@ApiTags('DSA Progress')
@Controller('dsa-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DsaProgressController {
  constructor(private readonly progressService: DsaProgressService) {}

  @Post(':questionId/submit')
  @ApiOperation({ summary: 'Record a code submission for a question' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({
    status: 201,
    description: 'Submission recorded successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get all progress for current user' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: SubmissionStatus,
    description: 'Filter by submission status',
  })
  @ApiQuery({
    name: 'isBookmarked',
    required: false,
    type: Boolean,
    description: 'Filter by bookmark status',
  })
  @ApiQuery({
    name: 'isSolved',
    required: false,
    type: Boolean,
    description: 'Filter by solved status',
  })
  @ApiResponse({ status: 200, description: 'User progress retrieved' })
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
  @ApiOperation({ summary: 'Get overall statistics for current user' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved',
    schema: {
      example: {
        totalQuestions: 50,
        solvedQuestions: 25,
        attemptedQuestions: 15,
        totalSubmissions: 120,
        successfulSubmissions: 25,
        acceptanceRate: '20.83',
        totalTimeSpent: 36000,
        averageTimePerQuestion: 720,
        languagesUsed: ['javascript', 'python'],
        bookmarkedCount: 10,
      },
    },
  })
  async getMyStatistics(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.getUserStatistics(userId);
  }

  @Get('recent-submissions')
  @ApiOperation({ summary: 'Get recent submissions for current user' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of submissions to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Recent submissions retrieved' })
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
  @ApiOperation({ summary: 'Get progress for a specific question' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Question progress retrieved' })
  @ApiResponse({ status: 404, description: 'Progress not found' })
  async getQuestionProgress(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.getQuestionProgress(userId, questionId);
  }

  @Get(':questionId/submissions')
  @ApiOperation({ summary: 'Get submission history for a question' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Submission history retrieved' })
  @ApiResponse({ status: 404, description: 'Progress not found' })
  async getSubmissionHistory(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.getSubmissionHistory(userId, questionId);
  }

  @Patch(':questionId')
  @ApiOperation({
    summary: 'Update progress metadata (bookmark, notes, rating)',
  })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Progress updated successfully' })
  @ApiResponse({ status: 404, description: 'Progress not found' })
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
  @ApiOperation({ summary: 'Toggle like status for a question' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Like status toggled' })
  async toggleLike(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.toggleLike(userId, questionId);
  }

  @Post(':questionId/dislike')
  @ApiOperation({ summary: 'Toggle dislike status for a question' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Dislike status toggled' })
  async toggleDislike(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.toggleDislike(userId, questionId);
  }

  @Post(':questionId/hint')
  @ApiOperation({ summary: 'Record that user revealed a hint' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 201, description: 'Hint usage recorded' })
  async addHintUsed(
    @Request() req,
    @Param('questionId') questionId: string,
    @Body() hintDto: AddHintDto,
  ) {
    const userId = req.user.userId || req.user.sub;
    return await this.progressService.addHintUsed(userId, questionId, hintDto);
  }

  @Delete(':questionId')
  @ApiOperation({ summary: 'Reset progress for a specific question' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 200, description: 'Progress reset successfully' })
  async resetProgress(
    @Request() req,
    @Param('questionId') questionId: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    await this.progressService.resetQuestionProgress(userId, questionId);
    return { message: 'Progress reset successfully' };
  }

  @Delete('all')
  @ApiOperation({ summary: 'Delete all progress for current user' })
  @ApiResponse({
    status: 200,
    description: 'All progress deleted successfully',
  })
  async deleteAllProgress(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    await this.progressService.deleteUserProgress(userId);
    return { message: 'All progress deleted successfully' };
  }
}
