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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AssignmentsService } from './assignments.service';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from './dto/assignment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  @Post()
  async create(
    @Body() dto: CreateAssignmentDto,
    @Req() req: Request & { user: any },
  ) {
    try {
      const { sub: teacherId, universityId } = req.user;
      return await this.service.create(teacherId, universityId, dto);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(@Req() req: Request & { user: any }) {
    if (req.user.role === 'university_teacher') {
      return this.service.findAllByTeacher(req.user.sub);
    }
    return this.service.findAllByStudent(req.user.sub);
  }

  @Get('student')
  async findStudentAssignments(@Req() req: Request & { user: any }) {
    return this.service.findAllByStudent(req.user.sub);
  }

  @Get('student/:id')
  async findStudentAssignment(
    @Param('id') id: string,
    @Req() req: Request & { user: any },
  ) {
    return this.service.findByStudentAssignmentId(id, req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findById(id);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status ?? HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssignmentDto,
    @Req() req: Request & { user: any },
  ) {
    try {
      return await this.service.update(id, req.user.sub, dto);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request & { user: any },
  ) {
    try {
      await this.service.remove(id, req.user.sub);
      return { success: true };
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status ?? HttpStatus.NOT_FOUND,
      );
    }
  }
}
