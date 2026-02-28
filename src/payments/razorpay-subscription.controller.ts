import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Headers,
    BadRequestException,
    Logger,
    UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api')
export class RazorpaySubscriptionController {
    private readonly logger = new Logger(RazorpaySubscriptionController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly usersService: UsersService,
    ) { }

    /**
     * STEP 2 & 3: User clicks Subscribe
     * Backend creates Razorpay subscription and returns the ID
     */
    @Post('subscription/create')
    @UseGuards(JwtAuthGuard)
    async createSubscription(@Body() body: { userId: string, subscriptionId?: string }) {
        // The user request specified payload { userId: "..." }
        // We use the subscriptionId from the body or default to our known pro plan if not provided
        const planId = body.subscriptionId || '69a101bc784e4791bda5873c';

        this.logger.log(`STEP 2: Received subscription request for user ${body.userId}`);

        // STEP 3: Backend calls Razorpay API
        const razorpaySub = await this.paymentService.createSubscription(body.userId, {
            subscriptionId: planId,
        });

        // Return only the subscription_id to frontend as requested
        return {
            subscriptionId: razorpaySub.id,
        };
    }

    /**
     * STEP 4 & 5: Verification after Frontend Checkout
     */
    @Post('subscription/verify')
    @UseGuards(JwtAuthGuard)
    async verifySubscription(@Body() body: any) {
        this.logger.log(`STEP 4/5: Verifying subscription payload`);

        // Handle variations in field names (snake_case from Razorpay or custom)
        const payload = {
            razorpaySubscriptionId: body.razorpay_subscription_id || body.subscriptionId,
            razorpayPaymentId: body.razorpay_payment_id || body.paymentId,
            razorpaySignature: body.razorpay_signature || body.signature,
        };

        if (!payload.razorpaySubscriptionId || !payload.razorpayPaymentId || !payload.razorpaySignature) {
            throw new BadRequestException('Missing Razorpay verification details');
        }

        const userId = body.userId || (await this.usersService.findByRazorpaySubscriptionId(payload.razorpaySubscriptionId))?._id.toString();

        if (!userId) {
            throw new BadRequestException('User ID not found and could not be inferred from subscription');
        }

        return this.paymentService.verifySubscription(userId, payload);
    }

    /**
     * STEP 5 & 6: Razorpay Webhook
     * This handles activation and monthly automatic charging status updates
     */
    @Post('webhook/razorpay')
    async handleWebhook(@Body() payload: any, @Headers('x-razorpay-signature') signature: string) {
        this.logger.log(`STEP 5/6: Webhook received event: ${payload.event}`);
        await this.paymentService.processWebhook(payload, signature);
        return { status: 'ok' };
    }

    /**
     * STEP 7: Backend checks subscription status
     */
    @Get('subscription/status/:userId')
    @UseGuards(JwtAuthGuard)
    async getStatus(@Param('userId') userId: string) {
        const user = await this.usersService.findById(userId);

        // Logic to determine status based on expiry and database flag
        const isActive = user.subscriptionStatus === 'active' &&
            user.subscriptionExpiry &&
            new Date(user.subscriptionExpiry) > new Date();

        return {
            status: isActive ? 'active' : 'inactive',
            expiry: user.subscriptionExpiry,
            plan: user.subscriptionPlan,
        };
    }
}
