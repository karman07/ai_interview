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

    // Run on the 1st day of every month at midnight
    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async resetMonthlyUsage() {
        this.logger.log('🔄 Starting monthly usage reset for all users...');

        try {
            const result = await this.userModel.updateMany(
                {},
                {
                    $set: {
                        resumeCount: 0,
                        interviewCount: 0,
                    },
                },
            );

            this.logger.log(`✅ Successfully reset usage for ${result.modifiedCount} users.`);
        } catch (error) {
            this.logger.error(`❌ Failed to reset monthly usage: ${error.message}`);
        }
    }

    // Optional: A helper to manually trigger reset (for testing or debugging)
    async manualReset() {
        return this.resetMonthlyUsage();
    }
}
