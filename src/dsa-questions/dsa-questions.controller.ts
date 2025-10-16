import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DsaQuestionsService } from './dsa-questions.service';
import { CreateDsaQuestionDto } from './dto/create-dsa-question.dto';
import { UpdateDsaQuestionDto } from './dto/update-dsa-question.dto';
import { FilterDsaQuestionsDto } from './dto/filter-dsa-questions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('DSA Questions')
@Controller('dsa-questions')
export class DsaQuestionsController {
  constructor(private readonly dsaQuestionsService: DsaQuestionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new DSA question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  @ApiResponse({ status: 409, description: 'Question ID already exists' })
  create(@Body() createDto: CreateDsaQuestionDto, @Request() req) {
    return this.dsaQuestionsService.create(createDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all DSA questions with filters' })
  @ApiResponse({ status: 200, description: 'Questions retrieved successfully' })
  findAll(@Query() filterDto: FilterDsaQuestionsDto) {
    return this.dsaQuestionsService.findAll(filterDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get question statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics() {
    return this.dsaQuestionsService.getStatistics();
  }

  @Get('random')
  @ApiOperation({ summary: 'Get a random question' })
  @ApiQuery({ name: 'difficulty', required: false, enum: ['Easy', 'Medium', 'Hard'] })
  @ApiResponse({ status: 200, description: 'Random question retrieved' })
  getRandomQuestion(@Query('difficulty') difficulty?: string) {
    return this.dsaQuestionsService.getRandomQuestion(difficulty);
  }

  @Get(':questionId')
  @ApiOperation({ summary: 'Get a specific DSA question' })
  @ApiQuery({ name: 'includeSolutions', required: false, type: Boolean, description: 'Include solutions in response' })
  @ApiResponse({ status: 200, description: 'Question retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  findOne(
    @Param('questionId') questionId: string,
    @Query('includeSolutions') includeSolutions?: string,
  ) {
    const showSolutions = includeSolutions === 'true';
    return this.dsaQuestionsService.findOne(questionId, showSolutions);
  }

  @Patch(':questionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a DSA question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  update(
    @Param('questionId') questionId: string,
    @Body() updateDto: UpdateDsaQuestionDto,
  ) {
    return this.dsaQuestionsService.update(questionId, updateDto);
  }

  @Delete(':questionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Soft delete a DSA question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  remove(@Param('questionId') questionId: string) {
    return this.dsaQuestionsService.remove(questionId);
  }

  @Delete(':questionId/hard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Permanently delete a DSA question' })
  @ApiResponse({ status: 200, description: 'Question permanently deleted' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  hardDelete(@Param('questionId') questionId: string) {
    return this.dsaQuestionsService.hardDelete(questionId);
  }

  @Post(':questionId/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a question' })
  @ApiResponse({ status: 200, description: 'Question liked' })
  likeQuestion(@Param('questionId') questionId: string) {
    return this.dsaQuestionsService.likeQuestion(questionId);
  }

  @Post(':questionId/dislike')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dislike a question' })
  @ApiResponse({ status: 200, description: 'Question disliked' })
  dislikeQuestion(@Param('questionId') questionId: string) {
    return this.dsaQuestionsService.dislikeQuestion(questionId);
  }

  @Post(':questionId/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a solution (increments statistics)' })
  @ApiResponse({ status: 200, description: 'Submission recorded' })
  async submitSolution(
    @Param('questionId') questionId: string,
    @Body() body: { isSuccess: boolean },
  ) {
    await this.dsaQuestionsService.incrementSubmission(questionId, body.isSuccess);
    return { message: 'Submission recorded successfully' };
  }
}
