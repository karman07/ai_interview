import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../common/firebase/firebase.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) { }

  async sendToAll(title: string, body: string, data?: any) {
    this.logger.log(`Sending global notification: ${title}`);
    const tokens = await this.usersService.getAllFcmTokens();
    if (tokens.length === 0) return { ok: true, sent: 0 };
    await this.firebaseService.sendMulticastNotification(tokens, title, body, data);
    return { ok: true, sent: tokens.length };
  }

  async sendToUser(userId: string, title: string, body: string, data?: any) {
    const user = await this.usersService.findById(userId);
    if (!user || (user.fcmTokens || []).length === 0) return { ok: false, message: 'No tokens found' };
    await this.firebaseService.sendMulticastNotification(user.fcmTokens, title, body, data);
    return { ok: true, sent: user.fcmTokens.length };
  }
}
