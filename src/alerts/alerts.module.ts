import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Alert, AlertSchema } from './schemas/alert.schema';
import { Class, ClassSchema } from '../classes/schemas/class.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Result, ResultSchema } from '../results/schemas/result.schema';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alert.name, schema: AlertSchema },
      { name: Class.name, schema: ClassSchema },
      { name: User.name, schema: UserSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
