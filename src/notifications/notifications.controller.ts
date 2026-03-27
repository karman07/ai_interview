import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post('send-all')
  async sendToAll(@Body() body: { title: string; body: string; data?: any }) {
    return this.notificationsService.sendToAll(body.title, body.body, body.data);
  }

  @Post('send-user/:userId')
  async sendToUser(
    @Param('userId') userId: string,
    @Body() body: { title: string; body: string; data?: any }
  ) {
    return this.notificationsService.sendToUser(userId, body.title, body.body, body.data);
  }
}
