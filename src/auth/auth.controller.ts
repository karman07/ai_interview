import { Body, Controller, Post, Res, UseGuards, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private auth: AuthService) { }

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    try {
      const result = await this.auth.signup(dto);
      // Tokens are no longer issued on signup. User must verify email first.
      return { message: result.message, user: result.user };
    } catch (error) {
      this.logger.error('Signup failed:', error.message);
      throw new HttpException(error.message || 'Signup failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    try {
      const result = await this.auth.signup(dto);
      // Tokens are no longer issued on signup. User must verify email first.
      return { message: result.message, user: result.user };
    } catch (error) {
      this.logger.error('Registration failed:', error.message);
      throw new HttpException(error.message || 'Registration failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.auth.login(dto.email, dto.password);
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
      return { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken };
    } catch (error) {
      this.logger.error('Login failed:', error.message);
      throw new HttpException(error.message || 'Login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('google')
  async googleLogin(@Body() body: { idToken: string }, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.auth.googleLogin(body.idToken);
      res.cookie('refresh_token', result.refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
      return { user: result.user, accessToken: result.accessToken };
    } catch (error) {
      this.logger.error('Google login failed:', error.message);
      throw new HttpException(error.message || 'Google login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    try {
      await this.auth.logout(user.sub);
      res.clearCookie('refresh_token', { path: '/' });
      return { success: true };
    } catch (error) {
      this.logger.error('Logout failed:', error.message);
      throw new HttpException(error.message || 'Logout failed', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logoutPost(@CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    try {
      await this.auth.logout(user.sub);
      res.clearCookie('refresh_token', { path: '/' });
      return { success: true };
    } catch (error) {
      this.logger.error('Logout failed:', error.message);
      throw new HttpException(error.message || 'Logout failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('refresh')
  async refresh(@Body() body: { userId: string; email: string }, @Res({ passthrough: true }) res: Response) {
    try {
      const tokens = await this.auth.refresh(body.userId, body.email);
      res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
      return { accessToken: tokens.accessToken };
    } catch (error) {
      this.logger.error('Token refresh failed:', error.message);
      throw new HttpException(error.message || 'Token refresh failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
