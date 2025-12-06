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
import { DsaQuestionsService } from './dsa-questions.service';
import { CreateDsaQuestionDto } from './dto/create-dsa-question.dto';
import { UpdateDsaQuestionDto } from './dto/update-dsa-question.dto';
import { FilterDsaQuestionsDto } from './dto/filter-dsa-questions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('dsa-questions')
export class DsaQuestionsController {
  constructor(private readonly dsaQuestionsService: DsaQuestionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
    create(@Body() createDto: CreateDsaQuestionDto, @Request() req) {
    return this.dsaQuestionsService.create(createDto, req.user.sub);
  }

  @Get()
  findAll(@Query() filterDto: FilterDsaQuestionsDto) {
    return this.dsaQuestionsService.findAll(filterDto);
  }

  @Get('statistics')
  getStatistics() {
    return this.dsaQuestionsService.getStatistics();
  }

  @Get('random')
  getRandomQuestion(@Query('difficulty') difficulty?: string) {
    return this.dsaQuestionsService.getRandomQuestion(difficulty);
  }

  @Get(':questionId')
  findOne(
    @Param('questionId') questionId: string,
    @Query('includeSolutions') includeSolutions?: string,
  ) {
    const showSolutions = includeSolutions === 'true';
    return this.dsaQuestionsService.findOne(questionId, showSolutions);
  }

  @Patch(':questionId')
  @UseGuards(JwtAuthGuard)
    update(
    @Param('questionId') questionId: string,
    @Body() updateDto: UpdateDsaQuestionDto,
  ) {
    return this.dsaQuestionsService.update(questionId, updateDto);
  }

  @Delete(':questionId')
  @UseGuards(JwtAuthGuard)
    remove(@Param('questionId') questionId: string) {
    return this.dsaQuestionsService.remove(questionId);
  }

  @Delete(':questionId/hard')
  @UseGuards(JwtAuthGuard)
    hardDelete(@Param('questionId') questionId: string) {
    return this.dsaQuestionsService.hardDelete(questionId);
  }

  @Post(':questionId/like')
  @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
  likeQuestion(@Param('questionId') questionId: string) {
    return this.dsaQuestionsService.likeQuestion(questionId);
  }

  @Post(':questionId/dislike')
  @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
  dislikeQuestion(@Param('questionId') questionId: string) {
    return this.dsaQuestionsService.dislikeQuestion(questionId);
  }

  @Post(':questionId/submit')
  @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
  async submitSolution(
    @Param('questionId') questionId: string,
    @Body() body: { isSuccess: boolean },
  ) {
    await this.dsaQuestionsService.incrementSubmission(questionId, body.isSuccess);
    return { message: 'Submission recorded successfully' };
  }
}
