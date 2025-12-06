import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentService } from './payment.service';
import {
  CreateOrderDto,
  VerifyPaymentDto,
  PaymentResponseDto,
  OrderResponseDto,
} from './dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  async createOrder(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const userId = user.sub;
    return this.paymentService.createOrder(userId, createOrderDto);
  }

  @Post('verify')
  async verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.verifyPayment(verifyPaymentDto);
  }

  @Get('order/:orderId')
  async getPaymentByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentByOrderId(orderId);
  }

  @Get(':paymentId')
  async getPaymentById(
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById(paymentId);
  }

  @Get()
  async getUserPayments(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PaymentResponseDto[]> {
    const userId = user.sub;
    return this.paymentService.getUserPayments(
      userId,
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );
  }

  @Get('stats/summary')
  async getPaymentStats(@CurrentUser() user: any) {
    const userId = user.sub;
    return this.paymentService.getPaymentStats(userId);
  }
}