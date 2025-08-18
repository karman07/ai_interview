import { Body, Controller, Post, Res, UseGuards, Get } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.signup(dto);
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password);
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('google')
  async googleLogin(@Body() body: { idToken: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.googleLogin(body.idToken);
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
    return { user: result.user, accessToken: result.accessToken };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(user.sub);
    res.clearCookie('refresh_token', { path: '/' });
    return { success: true };
  }

  @Post('refresh')
  async refresh(@Body() body: { userId: string; email: string }, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.refresh(body.userId, body.email);
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
    return { accessToken: tokens.accessToken };
  }
}
