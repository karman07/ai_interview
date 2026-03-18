import {
  Controller, Get, Param, Patch, Post, UseGuards, Body, Req,
  UploadedFile, UseInterceptors,
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
  @Patch('me/verify-status')
  async updateVerificationStatus(@CurrentUser() user: any, @Body() data: { field: 'email'; status: boolean }) {
    const update = { isEmailVerified: data.status };
    const updated: UserDocument = await this.usersService.updateProfile(user.sub, update as any);
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile-image')
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
  async uploadProfileImage(@CurrentUser() user: any, @UploadedFile() file?: Express.Multer.File) {
    const appUrl = process.env.APP_URL ?? 'http://api.aiforjob.ai';
    const profileImageUrl = `${appUrl}/uploads/profile-images/${file?.filename}`;
    const updated: UserDocument = await this.usersService.updateProfile(user.sub, { profileImageUrl });
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }
}
