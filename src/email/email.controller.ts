import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailSubscription, EmailSubscriptionDocument } from './schemas/email-subscription.schema';
import { EmailSchedulerService } from './email-scheduler.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as crypto from 'crypto';

@Controller('email')
export class EmailController {
  constructor(
    @InjectModel(EmailSubscription.name) private subscriptionModel: Model<EmailSubscriptionDocument>,
    private schedulerService: EmailSchedulerService,
  ) {}

  @Post('subscribe')
  async subscribe(@Body() body: { email: string; userId?: string }) {
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    
    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { email: body.email.toLowerCase() },
      {
        email: body.email.toLowerCase(),
        userId: body.userId,
        isSubscribed: true,
        unsubscribeToken,
        subscriptionTypes: ['job_updates'],
      },
      { upsert: true, new: true }
    );

    // Send welcome email
    await this.schedulerService['emailService'].sendWelcomeEmail(subscription.email);

    return {
      success: true,
      message: 'Successfully subscribed to daily updates',
      subscription: {
        email: subscription.email,
        isSubscribed: subscription.isSubscribed,
      },
    };
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() body: { email: string }) {
    await this.subscriptionModel.findOneAndUpdate(
      { email: body.email.toLowerCase() },
      { isSubscribed: false }
    );

    return {
      success: true,
      message: 'Successfully unsubscribed from daily updates',
    };
  }

  @Get('subscription-status/:email')
  async getSubscriptionStatus(@Param('email') email: string) {
    const subscription = await this.subscriptionModel.findOne({
      email: email.toLowerCase(),
    });

    return {
      isSubscribed: subscription?.isSubscribed || false,
      email: email.toLowerCase(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscription')
  async getMySubscription(@CurrentUser() user: any) {
    const subscription = await this.subscriptionModel.findOne({
      userId: user.sub,
    });

    return {
      isSubscribed: subscription?.isSubscribed || false,
      email: subscription?.email,
      subscriptionTypes: subscription?.subscriptionTypes || [],
    };
  }

  @Post('trigger-daily-update')
  async triggerDailyUpdate() {
    await this.schedulerService.triggerDailyEmail();
    return { success: true, message: 'Daily update email triggered' };
  }

  @Get('subscribers/count')
  async getSubscriberCount() {
    const count = await this.subscriptionModel.countDocuments({
      isSubscribed: true,
    });

    return { count };
  }
}
