import { Controller, Post, Body, Get, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly svc: LessonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateLessonDto) {
    return this.svc.create(dto);
  }

  @Get('subject/:subjectId')
  findBySubject(@Param('subjectId') subjectId: string) {
    return this.svc.findBySubject(subjectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: CreateLessonDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
