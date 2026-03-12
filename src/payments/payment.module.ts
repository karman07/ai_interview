import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { RazorpaySubscriptionController } from './razorpay-subscription.controller';
import { PaymentService } from './payment.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { UsersModule } from '../users/users.module';
import { SubscriptionModule } from '../subscriptions/subscription.module';
import { EmailModule } from '../email/email.module';
import { DiscountsModule } from '../discounts/discounts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    ConfigModule,
    UsersModule,
    SubscriptionModule,
    EmailModule,
    DiscountsModule,
  ],
  controllers: [PaymentController, PaymentWebhookController, RazorpaySubscriptionController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule { }