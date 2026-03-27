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
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto, EnrollStudentsDto } from './dto/class.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UniversityGuard } from '../common/guards/university.guard';

@Controller('classes')
@UseGuards(JwtAuthGuard, UniversityGuard)
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  // ── Teacher CRUD ──────────────────────────────────────────────────────────

  @Post()
  async create(
    @Body() dto: CreateClassDto,
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
  async findStudentClasses(@Req() req: Request & { user: any }) {
    return this.service.findAllByStudent(req.user.sub);
  }

  @Get('student/:id')
  async findStudentClass(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('join/:code')
  async findByCode(@Param('code') code: string) {
    try {
      const cls = await this.service.findByCode(code);
      // Return limited info for the join preview
      return {
        _id: cls._id,
        name: cls.name,
        department: cls.department,
        semester: cls.semester,
        studentCount: cls.students?.length || 0,
      };
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status ?? HttpStatus.NOT_FOUND,
      );
    }
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
    @Body() dto: UpdateClassDto,
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

  // ── Enrollment (teacher adds students) ────────────────────────────────────

  @Post(':id/enroll')
  async enrollStudents(
    @Param('id') id: string,
    @Body() dto: EnrollStudentsDto,
    @Req() req: Request & { user: any },
  ) {
    try {
      return await this.service.enrollStudents(id, req.user.sub, dto.studentIds);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id/students/:studentId')
  async removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Req() req: Request & { user: any },
  ) {
    try {
      await this.service.removeStudent(id, req.user.sub, studentId);
      return { success: true };
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status ?? HttpStatus.NOT_FOUND,
      );
    }
  }

  // ── Student self-enrollment via code ──────────────────────────────────────

  @Post('join/:code')
  async joinByCode(
    @Param('code') code: string,
    @Req() req: Request & { user: any },
  ) {
    try {
      return await this.service.joinByCode(code, req.user.sub);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status ?? HttpStatus.BAD_REQUEST,
      );
    }
  }
}
