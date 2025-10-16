import { Controller, Post, Body, UseGuards, Get, Param, Delete } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateLessonProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly svc: ProgressService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Update lesson progress' })
  update(@CurrentUser() user: any, @Body() dto: UpdateLessonProgressDto) {
    return this.svc.update(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findByUser(@CurrentUser() user: any) {
    return this.svc.findByUser(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':lessonId')
  findByUserAndLesson(@CurrentUser() user: any, @Param('lessonId') lessonId: string) {
    return this.svc.findByUserAndLesson(user.sub, lessonId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':lessonId')
  remove(@CurrentUser() user: any, @Param('lessonId') lessonId: string) {
    return this.svc.remove(user.sub, lessonId);
  }

  // For admins
  @UseGuards(JwtAuthGuard)
  @Get('all/admin')
  findAll() {
    return this.svc.findAll();
  }
}
