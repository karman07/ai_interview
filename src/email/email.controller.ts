import {
  Controller, Post, Get, Body, Param, UseGuards, Query, Put,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailSubscription, EmailSubscriptionDocument } from './schemas/email-subscription.schema';
import { EmailLog, EmailLogDocument } from './schemas/email-log.schema';
import { MailConfig, MailConfigDocument } from './schemas/mail-config.schema';
import { EmailSchedulerService } from './email-scheduler.service';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as crypto from 'crypto';

@Controller('email')
export class EmailController {
  constructor(
    @InjectModel(EmailSubscription.name) private subscriptionModel: Model<EmailSubscriptionDocument>,
    @InjectModel(EmailLog.name) private emailLogModel: Model<EmailLogDocument>,
    @InjectModel(MailConfig.name) private mailConfigModel: Model<MailConfigDocument>,
    private schedulerService: EmailSchedulerService,
    private emailService: EmailService,
  ) { }

  // ─────────────────────────── PUBLIC ROUTES ───────────────────────────

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
      { upsert: true, new: true },
    );

    // Send welcome email (non-blocking)
    this.emailService.sendWelcomeEmail(subscription.email).catch(() => {});

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
      { isSubscribed: false },
    );
    return { success: true, message: 'Successfully unsubscribed from daily updates' };
  }

  @Get('subscription-status/:email')
  async getSubscriptionStatus(@Param('email') email: string) {
    const subscription = await this.subscriptionModel.findOne({ email: email.toLowerCase() });
    return {
      isSubscribed: subscription?.isSubscribed || false,
      email: email.toLowerCase(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-subscription')
  async getMySubscription(@CurrentUser() user: any) {
    const subscription = await this.subscriptionModel.findOne({ userId: user.sub });
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
    const count = await this.subscriptionModel.countDocuments({ isSubscribed: true });
    return { count };
  }

  @Post('trigger-job-update')
  async triggerJobUpdate() {
    await this.schedulerService.triggerDailyEmail();
    return { success: true, message: 'Job update email triggered' };
  }

  // ─────────────────────────── ADMIN ROUTES ────────────────────────────

  /** GET /email/admin/analytics — delivery stats + subscriber breakdown */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/analytics')
  async getAdminAnalytics() {
    const [
      totalSubscribers,
      activeSubscribers,
      totalSent,
      totalFailed,
      recentLogs,
      dailyStats,
    ] = await Promise.all([
      this.subscriptionModel.countDocuments({}),
      this.subscriptionModel.countDocuments({ isSubscribed: true }),
      this.emailLogModel.countDocuments({ status: 'sent' }),
      this.emailLogModel.countDocuments({ status: 'failed' }),
      this.emailLogModel.find({}).sort({ sentAt: -1 }).limit(10).lean(),
      this.emailLogModel.aggregate([
        {
          $match: {
            sentAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$sentAt' } },
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),
    ]);

    const dayMap: Record<string, { date: string; sent: number; failed: number }> = {};
    for (const row of dailyStats) {
      const { date, status } = row._id;
      if (!dayMap[date]) dayMap[date] = { date, sent: 0, failed: 0 };
      dayMap[date][status as 'sent' | 'failed'] = row.count;
    }

    return {
      totalSubscribers,
      activeSubscribers,
      inactiveSubscribers: totalSubscribers - activeSubscribers,
      totalSent,
      totalFailed,
      deliveryRate: totalSent + totalFailed > 0
        ? Math.round((totalSent / (totalSent + totalFailed)) * 100)
        : 0,
      recentLogs,
      dailyStats: Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  /** GET /email/admin/subscribers — paginated subscriber list */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/subscribers')
  async getAdminSubscribers(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('status') status?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, parseInt(limit, 10));
    const filter: any = {};
    if (status === 'active') filter.isSubscribed = true;
    if (status === 'inactive') filter.isSubscribed = false;

    const [subscribers, total] = await Promise.all([
      this.subscriptionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-unsubscribeToken')
        .lean(),
      this.subscriptionModel.countDocuments(filter),
    ]);

    return { subscribers, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) };
  }

  /** GET /email/admin/logs — recent email send logs */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/logs')
  async getAdminLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, parseInt(limit, 10));
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [logs, total] = await Promise.all([
      this.emailLogModel
        .find(filter)
        .sort({ sentAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      this.emailLogModel.countDocuments(filter),
    ]);

    return { logs, total, page: pageNum, limit: limitNum };
  }

  /** GET /email/admin/config — returns current mail config (key masked) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/config')
  async getAdminConfig() {
    const config = await this.mailConfigModel.findOne().sort({ updatedAt: -1 }).lean();
    if (!config) {
      return {
        mailgunApiKey: '',
        mailgunApiUrl: process.env.MAILGUN_API_URL || '',
        mailgunFrom: process.env.MAILGUN_FROM || 'AIForJob.ai <postmaster@aiforjob.ai>',
        isActive: true,
        source: 'env',
      };
    }
    return {
      mailgunApiKey: config.mailgunApiKey ? '••••••••' + config.mailgunApiKey.slice(-4) : '',
      mailgunApiUrl: config.mailgunApiUrl,
      mailgunFrom: config.mailgunFrom,
      isActive: config.isActive,
      source: 'db',
    };
  }

  /** PUT /email/admin/config — save/update mail config */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put('admin/config')
  async updateAdminConfig(
    @Body() body: {
      mailgunApiKey?: string;
      mailgunApiUrl?: string;
      mailgunFrom?: string;
      isActive?: boolean;
    },
  ) {
    const existing = await this.mailConfigModel.findOne().sort({ updatedAt: -1 });

    const update: any = {};
    if (body.mailgunApiUrl !== undefined) update.mailgunApiUrl = body.mailgunApiUrl;
    if (body.mailgunFrom !== undefined) update.mailgunFrom = body.mailgunFrom;
    if (body.isActive !== undefined) update.isActive = body.isActive;
    // Only update the key if a real value (not the masked placeholder) is provided
    if (body.mailgunApiKey && !body.mailgunApiKey.startsWith('••')) {
      update.mailgunApiKey = body.mailgunApiKey;
    }

    if (existing) {
      await this.mailConfigModel.findByIdAndUpdate(existing._id, update);
    } else {
      await this.mailConfigModel.create({ ...update, mailgunApiKey: body.mailgunApiKey || '' });
    }

    return { success: true, message: 'Mail configuration saved' };
  }

  /** POST /email/admin/send-test — send a test email */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/send-test')
  async sendTestEmail(@Body() body: { to: string }) {
    const result = await this.emailService.sendWelcomeEmail(body.to);
    return { success: result, message: result ? 'Test email sent successfully' : 'Failed to send — check your config' };
  }
}