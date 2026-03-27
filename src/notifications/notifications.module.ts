import { Module, Global } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UsersModule } from '../users/users.module';
import { FirebaseModule } from '../common/firebase/firebase.module';

@Global()
@Module({
  imports: [UsersModule, FirebaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
