import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly svc: QuizzesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateQuizDto) {
    return this.svc.create(dto);
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId') lessonId: string) {
    return this.svc.findByLesson(lessonId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post(':id/check')
  check(@Param('id') id: string, @Body() body: { answer: string }) {
    return this.svc.checkAnswer(id, body.answer);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
