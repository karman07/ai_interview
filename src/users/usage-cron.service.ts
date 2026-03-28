import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsageCronService {
    private readonly logger = new Logger(UsageCronService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    // Run ONCE a day at midnight. Reset users whose joining anniversary is today.
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async resetDailyUsage() {
        this.logger.log('🔄 Starting daily usage reset sweep...');

        try {
            const today = new Date();
            const currentDay = today.getDate();
            const year = today.getFullYear();
            const month = today.getMonth();
            
            // Check if today is the LAST day of the current month
            const isLastDayOfMonth = new Date(year, month + 1, 0).getDate() === currentDay;

            // If it is the last day, catch everyone whose start date day is >= today
            // Otherwise, we only catch people whose start date day == today exactly.
            const matchCondition = isLastDayOfMonth 
                ? { $expr: { $gte: [{ $dayOfMonth: "$createdAt" }, currentDay] } }
                : { $expr: { $eq: [{ $dayOfMonth: "$createdAt" }, currentDay] } };

            const result = await this.userModel.updateMany(
                {
                    // Paid active plans get reset automatically by the Razorpay webhook on payment
                    // This cron job is only for free users
                    $or: [
                        { subscriptionStatus: 'free' },
                        { subscriptionStatus: { $exists: false } }
                    ],
                    ...matchCondition
                },
                {
                    $set: {
                        resumeCount: 0,
                        interviewCount: 0,
                    },
                },
            );

            this.logger.log(`✅ Successfully reset usage limits for ${result.modifiedCount} users whose anniversary is today.`);
        } catch (error) {
            this.logger.error(`❌ Failed to reset daily usage limits: ${error.message}`);
        }
    }

    // Optional: A helper to manually trigger reset (for testing or debugging)
    async manualReset() {
        return this.resetDailyUsage();
    }
}
