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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionResponseDto,
} from './dto';
import { SubscriptionStatus } from './schemas/subscription.schema';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  async findAll(@Query('status') status?: SubscriptionStatus): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.findAll(status);
  }

  @Get('active')
  async findActive(): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.findActive();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.subscriptionService.getStats();
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findByName(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
    async activate(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
    async deactivate(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionService.remove(id);
  }
}