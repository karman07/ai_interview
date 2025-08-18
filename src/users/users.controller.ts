import {
  Controller, Get, Param, Patch, UseGuards,
  UploadedFile, UseInterceptors, Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserDocument } from './schemas/user.schema';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    const me: UserDocument = await this.usersService.findById(user.sub);
    const { passwordHash, refreshTokenHash, ...safe } = me.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', required: true })
  @Get(':id')
  async getById(@Param('id') id: string) {
    const u: UserDocument = await this.usersService.findById(id);
    const { passwordHash, refreshTokenHash, ...safe } = u.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    const updated: UserDocument = await this.usersService.updateProfile(user.sub, dto);
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/resume')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('resume', {
    storage: diskStorage({
      destination: process.env.UPLOAD_DIR ?? 'uploads/resumes',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  @ApiBody({ schema: { type: 'object', properties: { resume: { type: 'string', format: 'binary' } } } })
  async uploadResume(@CurrentUser() user: any, @UploadedFile() file?: Express.Multer.File) {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const resumeUrl = `${appUrl}/uploads/resumes/${file?.filename}`;
    const updated: UserDocument = await this.usersService.updateProfile(user.sub, { resumeUrl });
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile-image')
  @ApiConsumes('multipart/form-data')
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
  @ApiBody({ schema: { type: 'object', properties: { profileImage: { type: 'string', format: 'binary' } } } })
  async uploadProfileImage(@CurrentUser() user: any, @UploadedFile() file?: Express.Multer.File) {
    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const profileImageUrl = `${appUrl}/uploads/profile-images/${file?.filename}`;
    const updated: UserDocument = await this.usersService.updateProfile(user.sub, { profileImageUrl });
    const { passwordHash, refreshTokenHash, ...safe } = updated.toObject();
    return safe;
  }
}
