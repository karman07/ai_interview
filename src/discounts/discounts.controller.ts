import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { DiscountsService } from './discounts.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { CouponType } from './schemas/coupon.schema';

@Controller('discounts')
@UseGuards(JwtAuthGuard)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  // ═══════════════════════════════════════════════════════════
  // ADMIN ROUTES
  // ═══════════════════════════════════════════════════════════

  @Post('admin/coupons')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCoupon(@CurrentUser() user: any, @Body() dto: CreateCouponDto) {
    return this.discountsService.createCoupon(user.sub, dto);
  }

  @Post('admin/coupons/generate-referral')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async generateReferral(
    @CurrentUser() user: any,
    @Body() body: { referrerId: string; discountValue: number; discountType?: any; referrerRewardAmount?: number },
  ) {
    return this.discountsService.generateReferralCodeForUser(
      user.sub,
      body.referrerId,
      body.discountValue,
      body.discountType,
      body.referrerRewardAmount,
    );
  }

  @Get('admin/coupons')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllCoupons(@Query('type') type?: CouponType, @Query('isActive') isActive?: string) {
    const filter: any = {};
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    return this.discountsService.getAllCoupons(filter);
  }

  @Get('admin/analytics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAnalytics() {
    return this.discountsService.getCouponAnalytics();
  }

  @Get('admin/coupons/:id/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCouponStats(@Param('id') id: string) {
    return this.discountsService.getCouponStats(id);
  }

  @Patch('admin/coupons/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCoupon(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.discountsService.updateCoupon(id, dto);
  }

  @Patch('admin/coupons/:id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleCoupon(@Param('id') id: string) {
    return this.discountsService.toggleCoupon(id);
  }

  @Delete('admin/coupons/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCoupon(@Param('id') id: string) {
    await this.discountsService.deleteCoupon(id);
    return { message: 'Coupon deleted successfully' };
  }

  // ═══════════════════════════════════════════════════════════
  // USER ROUTES
  // ═══════════════════════════════════════════════════════════

  @Post('validate')
  async validateCoupon(@CurrentUser() user: any, @Body() dto: ValidateCouponDto) {
    return this.discountsService.validateCoupon(user.sub, dto);
  }

  @Get('my-referral')
  async getMyReferralCode(@CurrentUser() user: any) {
    return this.discountsService.getOrCreateUserReferralCode(user.sub);
  }

  @Get('my-referral/stats')
  async getMyReferralStats(@CurrentUser() user: any) {
    return this.discountsService.getUserReferralStats(user.sub);
  }
}
