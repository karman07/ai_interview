import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AlertsService } from './alerts.service';
import { UpdateAlertDto } from './dto/alert.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.UNIVERSITY_TEACHER, UserRole.ADMIN)
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @Get()
  async findAll(@Req() req: Request & { user: any }) {
    return this.service.findAllForTeacher(req.user.sub);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request & { user: any }) {
    const count = await this.service.getUnreadCount(req.user.sub);
    return { count };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request & { user: any }) {
    return this.service.markAllAsRead(req.user.sub);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Body() dto: UpdateAlertDto,
    @Req() req: Request & { user: any },
  ) {
    return this.service.markAsRead(id, req.user.sub, dto);
  }

  @Post('trigger-checks')
  async triggerChecks(@Req() req: Request & { user: any }) {
    return this.service.runAllChecks(req.user.sub);
  }
}
