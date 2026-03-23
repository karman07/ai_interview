import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, HttpException, HttpStatus, ForbiddenException, Req,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto, UpdateUniversityDto, CreateTeacherDto } from './dto/university.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly service: UniversitiesService) {}

  /** Public — used by frontend login to validate domain */
  @Get('check-domain/:domain')
  async checkDomain(@Param('domain') domain: string) {
    const uni = await this.service.findByDomain(domain);
    return { valid: !!uni, university: uni ?? null };
  }

  /** Public — lists all active universities for the student login page */
  @Get('public/list')
  async listPublic() {
    const all = await this.service.findAll();
    // Only return safe, minimal fields for public display
    return all
      .filter((u: any) => u.isActive)
      .map((u: any) => ({ _id: u._id, name: u.name, domain: u.domain, logoUrl: u.logoUrl ?? null }));
  }

  /** Authenticated — student/user fetches their own university info for limits */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findById(id);
    } catch (err) {
      throw new HttpException(err.message, err.status ?? HttpStatus.NOT_FOUND);
    }
  }

  /** Admin-only CRUD */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/universities',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(@Body() dto: CreateUniversityDto, @UploadedFile() file?: Express.Multer.File) {
    try {
      if (file) {
        dto.logoUrl = `/uploads/universities/${file.filename}`;
      }
      return await this.service.create(dto);
    } catch (err) {
      throw new HttpException(err.message, err.status ?? HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/universities',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUniversityDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      if (file) {
        dto.logoUrl = `/uploads/universities/${file.filename}`;
      }
      return await this.service.update(id, dto);
    } catch (err) {
      throw new HttpException(err.message, err.status ?? HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.service.remove(id);
      return { success: true };
    } catch (err) {
      throw new HttpException(err.message, err.status ?? HttpStatus.NOT_FOUND);
    }
  }

  // ── Teacher management (admin-only write, admin+teacher read) ─────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/teachers')
  async createTeacher(@Param('id') id: string, @Body() dto: CreateTeacherDto) {
    try {
      const teacher = await this.service.createTeacher(id, dto);
      const { passwordHash, refreshTokenHash, ...safe } = (teacher as any).toObject();
      return safe;
    } catch (err) {
      throw new HttpException(err.message, err.status ?? HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/teachers')
  async getTeachers(@Param('id') id: string, @Req() req: Request & { user: any }) {
    const allowed = await this.service.checkTeacherAccess(req.user.sub, id);
    if (!allowed) throw new ForbiddenException('Access denied');
    return this.service.getTeachers(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id/teachers/:teacherId')
  async removeTeacher(@Param('id') id: string, @Param('teacherId') teacherId: string) {
    try {
      await this.service.removeTeacher(id, teacherId);
      return { success: true };
    } catch (err) {
      throw new HttpException(err.message, err.status ?? HttpStatus.NOT_FOUND);
    }
  }

  // ── University analytics (admin + teacher of that university) ────────────────

  @UseGuards(JwtAuthGuard)
  @Get(':id/students')
  async getStudents(@Param('id') id: string, @Req() req: Request & { user: any }) {
    const allowed = await this.service.checkTeacherAccess(req.user.sub, id);
    if (!allowed) throw new ForbiddenException('Access denied');
    return this.service.getUniversityStudents(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/analytics')
  async getAnalytics(@Param('id') id: string, @Req() req: Request & { user: any }) {
    const allowed = await this.service.checkTeacherAccess(req.user.sub, id);
    if (!allowed) throw new ForbiddenException('Access denied');
    return this.service.getUniversityAnalytics(id);
  }
}
