import { IsNotEmpty, IsString } from 'class-validator';

export class VerifySubscriptionDto {
    @IsNotEmpty()
    @IsString()
    razorpaySubscriptionId: string;

    @IsNotEmpty()
    @IsString()
    razorpayPaymentId: string;

    @IsNotEmpty()
    @IsString()
    razorpaySignature: string;
}
