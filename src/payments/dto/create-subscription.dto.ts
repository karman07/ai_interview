import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSubscriptionRequestDto {
    @IsNotEmpty()
    @IsString()
    subscriptionId: string; // This is the local MongoDB Subscription ID

    @IsOptional()
    notes?: Record<string, any>;

    @IsOptional()
    @IsString()
    couponCode?: string; // Discount or referral code
}
