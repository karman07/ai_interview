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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  async findAll(
    @Query('status') status?: SubscriptionStatus,
    @Query('country') country?: string,
  ): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.findAll(status, country);
  }

  @Get('active')
  async findActive(@Query('country') country?: string): Promise<SubscriptionResponseDto[]> {
    return this.subscriptionService.findActive(country);
  }

  @Post('seed/:country')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async seed(@Param('country') country: string) {
    return this.subscriptionService.seedCountryPlans(country);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    // Note: Stats logic was removed from service during refactor, returning empty for now
    return {};
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async activate(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deactivate(@Param('id') id: string): Promise<SubscriptionResponseDto> {
    return this.subscriptionService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.subscriptionService.remove(id);
  }
}