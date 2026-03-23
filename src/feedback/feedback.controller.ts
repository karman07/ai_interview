import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Roles(UserRole.UNIVERSITY_TEACHER, UserRole.ADMIN)
  async create(@Req() req, @Body() dto: CreateFeedbackDto) {
    const teacherId = req.user.sub;
    return this.feedbackService.create(teacherId, dto);
  }

  @Get('student')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  async getStudentFeedback(@Req() req) {
    const studentId = req.user.sub;
    return this.feedbackService.findAllByStudent(studentId);
  }

  @Get('teacher')
  @Roles(UserRole.UNIVERSITY_TEACHER, UserRole.ADMIN)
  async getTeacherFeedback(@Req() req) {
    const teacherId = req.user.sub;
    return this.feedbackService.findAllByTeacher(teacherId);
  }

  @Patch(':id')
  @Roles(UserRole.UNIVERSITY_TEACHER, UserRole.ADMIN)
  async update(@Req() req, @Param('id') id: string, @Body() dto: UpdateFeedbackDto) {
    const teacherId = req.user.sub;
    return this.feedbackService.update(id, teacherId, dto);
  }

  @Patch(':id/read')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Req() req, @Param('id') id: string) {
    const studentId = req.user.sub;
    return this.feedbackService.markAsRead(id, studentId);
  }

  @Delete(':id')
  @Roles(UserRole.UNIVERSITY_TEACHER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req, @Param('id') id: string) {
    const teacherId = req.user.sub;
    return this.feedbackService.remove(id, teacherId);
  }
}
