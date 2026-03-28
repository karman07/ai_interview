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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import {
  CreateOrderDto,
  CreateSubscriptionRequestDto,
  VerifyPaymentDto,
  VerifySubscriptionDto,
  PaymentResponseDto,
  OrderResponseDto,
} from './dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('create-order')
  async createOrder(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const userId = user.sub;
    return this.paymentService.createOrder(userId, createOrderDto);
  }

  @Post('create-subscription')
  async createSubscription(
    @CurrentUser() user: any,
    @Body() createSubscriptionDto: CreateSubscriptionRequestDto,
  ) {
    const userId = user.sub;
    return this.paymentService.createSubscription(userId, createSubscriptionDto);
  }

  @Post('create-payg-subscription')
  async createPaygSubscription(
    @CurrentUser() user: any,
    @Body() body: { budgetRupees: number },
  ) {
    return this.paymentService.createPaygSubscription(user.sub, body.budgetRupees);
  }

  @Post('verify-payg-subscription')
  async verifyPaygSubscription(
    @CurrentUser() user: any,
    @Body() body: {
      razorpaySubscriptionId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      budgetRupees: number;
    },
  ) {
    return this.paymentService.verifyPaygSubscription(user.sub, body);
  }

  @Post('verify-subscription')
  async verifySubscription(
    @CurrentUser() user: any,
    @Body() verifySubscriptionDto: VerifySubscriptionDto,
  ) {
    const userId = user.sub;
    return this.paymentService.verifySubscription(userId, verifySubscriptionDto);
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

  @Get('stats/summary')
  async getPaymentStats(@CurrentUser() user: any) {
    const userId = user.sub;
    return this.paymentService.getPaymentStats(userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllPaymentsAdmin(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.paymentService.getAllPaymentsAdmin(
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('admin/analytics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminAnalytics() {
    return this.paymentService.getAdminAnalytics();
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

  @Get(':paymentId')
  async getPaymentById(
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById(paymentId);
  }
}