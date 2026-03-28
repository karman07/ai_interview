import {
  Controller, Get, Param, Patch, Post, Delete, UseGuards, Body, Req,
  UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserDocument, UserRole } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/plan')
  async adminUpdatePlan(
    @Param('id') id: string,
    @Body() body: { planId?: string; status: string; expiryDays?: number },
  ) {
    const updated = await this.usersService.adminUpdateUserPlan(
      id,
      body.planId ?? null,
      body.status,
      body.expiryDays,
    );
    const { passwordHash, refreshTokenHash, ...safe } = (updated as any).toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/limits')
  async adminUpdateLimits(
    @Param('id') id: string,
    @Body() body: { interviewLimit?: number; resumeLimit?: number },
  ) {
    const updated = await this.usersService.adminUpdateUserLimits(id, body.interviewLimit, body.resumeLimit);
    const { passwordHash, refreshTokenHash, ...safe } = (updated as any).toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/verify')
  async adminVerifyUser(
    @Param('id') id: string,
    @Body() body: { isEmailVerified?: boolean; isPhoneVerified?: boolean },
  ) {
    const updated = await this.usersService.adminVerifyUser(
      id,
      body.isEmailVerified,
      body.isPhoneVerified,
    );
    const { passwordHash, refreshTokenHash, ...safe } = (updated as any).toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('admin/:id/role')
  async adminSetRole(
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    const updated = await this.usersService.adminSetRole(id, body.role);
    const { passwordHash, refreshTokenHash, ...safe } = (updated as any).toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/:id')
  async adminDeleteUser(@Param('id') id: string) {
    await this.usersService.adminDeleteUser(id);
    return { ok: true, message: 'User deleted successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    const me: UserDocument = await this.usersService.findById(user.sub);
    const { passwordHash, refreshTokenHash, ...safe } = me.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const me: UserDocument = await this.usersService.findById(user.sub);
    const { passwordHash, refreshTokenHash, ...safe } = me.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Param('id') id: string) {
    const u: UserDocument = await this.usersService.findById(id);
    const { passwordHash, refreshTokenHash, ...safe } = u.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('profileImage', {
    storage: diskStorage({
      destination: 'uploads/profile-images',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const updateData = { ...dto };
    if (file) {
      const appUrl = process.env.APP_URL ?? 'http://api.aiforjob.ai';
      updateData.profileImageUrl = `${appUrl}/uploads/profile-images/${file.filename}`;
    }
    const updated: UserDocument = await this.usersService.updateProfile(user.sub, updateData);
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const updated: UserDocument = await this.usersService.updateProfile(user.sub, dto);
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/track-interview')
  async trackInterviewStart(@CurrentUser() user: any) {
    await this.usersService.incrementInterviewCount(user.sub);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/fcm-token')
  async updateFcmToken(@CurrentUser() user: any, @Body() body: { token: string }) {
    await this.usersService.saveFcmToken(user.sub, body.token);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/fcm-token')
  async deleteFcmTokens(@CurrentUser() user: any) {
    await this.usersService.deleteFcmTokens(user.sub);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/verify-status')
  async updateVerificationStatus(@CurrentUser() user: any, @Body() data: { field: 'email'; status: boolean }) {
    const update = { isEmailVerified: data.status };
    const updated: UserDocument = await this.usersService.updateProfile(user.sub, update as any);
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/payg/setup')
  async setupPayg(
    @CurrentUser() user: any,
    @Body() body: { monthlyBudget: number },
  ) {
    if (!body.monthlyBudget || body.monthlyBudget <= 0) {
      throw new BadRequestException('monthlyBudget must be a positive number (in ₹)');
    }
    const updated = await this.usersService.setupPayg(user.sub, body.monthlyBudget);
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return { success: true, user: safe };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/payg/status')
  async getPaygStatus(@CurrentUser() user: any) {
    return this.usersService.getPaygStatus(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/payg/cancel')
  async cancelPayg(@CurrentUser() user: any) {
    const updated = await this.usersService.updateProfile(user.sub, {
      subscriptionStatus: 'free',
      paygMonthlyBudget:  undefined,
      paygInterviewsLimit: undefined,
      paygResumesLimit: undefined,
      paygInterviewsUsed: 0,
      paygResumesUsed: 0,
    } as any);
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return { success: true, user: safe };
  }
}
