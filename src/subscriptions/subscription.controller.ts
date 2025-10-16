import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionResponseDto,
} from './dto';
import { SubscriptionStatus } from './schemas/subscription.schema';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Subscription created successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid subscription data or name already exists',
  })
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiQuery({
    name: 'status',
    enum: SubscriptionStatus,
    required: false,
    description: 'Filter by subscription status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscriptions retrieved successfully',
    type: [SubscriptionResponseDto],
  })
  async findAll(@Query('status') status?: SubscriptionStatus): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.findAll(status);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active subscription plans' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active subscriptions retrieved successfully',
    type: [SubscriptionResponseDto],
  })
  async findActive(): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.findActive();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription statistics retrieved successfully',
  })
  async getStats() {
    return this.subscriptionService.getStats();
  }

  @Get('name/:name')
  @ApiOperation({ summary: 'Get subscription by name' })
  @ApiParam({
    name: 'name',
    description: 'Subscription name',
    example: 'premium-monthly',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription retrieved successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  async findByName(@Param('name') name: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findByName(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  @ApiParam({
    name: 'id',
    description: 'Subscription ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription retrieved successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  async findOne(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'Subscription ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription updated successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'Subscription ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription activated successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  async activate(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'Subscription ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Subscription deactivated successfully',
    type: SubscriptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  async deactivate(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiParam({
    name: 'id',
    description: 'Subscription ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Subscription deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Subscription not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionService.remove(id);
  }
}