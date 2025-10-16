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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaymentService } from './payment.service';
import {
  CreateOrderDto,
  VerifyPaymentDto,
  PaymentResponseDto,
  OrderResponseDto,
} from './dto';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a new payment order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data or order creation failed',
  })
  async createOrder(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    const userId = user.sub;
    return this.paymentService.createOrder(userId, createOrderDto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment after successful transaction' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment verified successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment verification failed',
  })
  async verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.verifyPayment(verifyPaymentDto);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment details by order ID' })
  @ApiParam({
    name: 'orderId',
    description: 'Razorpay order ID',
    example: 'order_abc123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment details retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async getPaymentByOrderId(
    @Param('orderId') orderId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentByOrderId(orderId);
  }

  @Get(':paymentId')
  @ApiOperation({ summary: 'Get payment details by payment ID' })
  @ApiParam({
    name: 'paymentId',
    description: 'Database payment ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment details retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async getPaymentById(
    @Param('paymentId') paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentService.getPaymentById(paymentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of payments to retrieve',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of payments to skip',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment history retrieved successfully',
    type: [PaymentResponseDto],
  })
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
  @ApiOperation({ summary: 'Get payment statistics for user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment statistics retrieved successfully',
  })
  async getPaymentStats(@CurrentUser() user: any) {
    const userId = user.sub;
    return this.paymentService.getPaymentStats(userId);
  }
}