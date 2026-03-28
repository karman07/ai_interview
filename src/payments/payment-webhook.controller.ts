import { Controller, Post, Body, Headers, BadRequestException, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentStatus } from './schemas/payment.schema';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Controller('payments/webhook')
export class PaymentWebhookController {
    private readonly logger = new Logger(PaymentWebhookController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly usersService: UsersService,
        private readonly emailService: EmailService,
    ) { }

    @Post()
    async handleWebhook(@Body() payload: any, @Headers('x-razorpay-signature') signature: string) {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(payload));
        const digest = shasum.digest('hex');

        if (digest !== signature) {
            this.logger.error('Invalid Razorpay webhook signature');
            throw new BadRequestException('Invalid signature');
        }

        const event = payload.event;
        this.logger.log(`Received Razorpay webhook event: ${event}`);

        switch (event) {
            case 'subscription.cancelled':
            case 'subscription.halted':
            case 'subscription.expired':
                await this.handleSubscriptionTermination(payload.payload.subscription.entity);
                break;

            case 'subscription.charged':
                await this.handleSubscriptionCharged(payload.payload);
                break;
        }

        return { status: 'ok' };
    }

    private async handleSubscriptionTermination(subscriptionEntity: any) {
        const razorpaySubscriptionId = subscriptionEntity.id;
        this.logger.log(`Terminating local subscription for Razorpay ID: ${razorpaySubscriptionId}`);

        const user = await this.usersService.findByRazorpaySubscriptionId(razorpaySubscriptionId);
        if (user) {
            await this.usersService.updateProfile(user._id.toString(), {
                subscriptionStatus: 'expired'
            });

            await this.emailService.sendSubscriptionCancelledEmail(user.email);
            this.logger.log(`Subscription terminated and email sent for user: ${user.email}`);
        } else {
            this.logger.warn(`No user found for subscription ID: ${razorpaySubscriptionId}`);
        }
    }

    private async handleSubscriptionCharged(payload: any) {
        const subEntity = payload.subscription.entity;
        const paymentEntity = payload.payment.entity;
        const razorpaySubscriptionId = subEntity.id;
        const isPayg = subEntity.notes?.type === 'payg';

        this.logger.log(`Subscription charge success for Razorpay ID: ${razorpaySubscriptionId} (PAYG: ${isPayg})`);

        const user = await this.usersService.findByRazorpaySubscriptionId(razorpaySubscriptionId);
        if (!user) {
            this.logger.warn(`No user found for charged subscription ID: ${razorpaySubscriptionId}`);
            return;
        }

        // Record the payment regardless of plan type
        await this.paymentService.recordWebhookPayment({
            userId: user._id.toString(),
            subscriptionId: user.subscriptionPlan?.toString(),
            razorpaySubscriptionId,
            razorpayPaymentId: paymentEntity.id,
            amount: paymentEntity.amount,
            currency: paymentEntity.currency,
            status: PaymentStatus.PAID,
            method: paymentEntity.method,
            description: paymentEntity.description,
        });

        if (isPayg) {
            // PAYG renewal: reset monthly usage limits
            await this.usersService.resetPaygCycle(user._id.toString());
            this.logger.log(`PAYG cycle reset for user: ${user.email} — new month begins`);
        } else {
            // Regular subscription renewal: push expiry by one billing period
            const sub = user.subscriptionPlan as any;
            if (sub) {
                const newExpiry = new Date();
                if (sub.type === 'monthly') newExpiry.setMonth(newExpiry.getMonth() + 1);
                else if (sub.type === 'yearly') newExpiry.setFullYear(newExpiry.getFullYear() + 1);
                else newExpiry.setDate(newExpiry.getDate() + 30);

                await this.usersService.updateProfile(user._id.toString(), {
                    subscriptionStatus: 'active',
                    subscriptionExpiry: newExpiry,
                    // ✅ Reset monthly usage on each billing renewal
                    resumeCount: 0,
                    interviewCount: 0,
                } as any);
            }
            this.logger.log(`Recurring payment recorded, user expiry updated, usage reset for: ${user.email}`);
        }
    }
}
