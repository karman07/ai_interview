import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { FirebaseService } from '../common/firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private firebase: FirebaseService,
  ) {}

  async signup(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const userId = user._id.toString();
    const tokens = await this.issueTokens(userId, user.email);
    await this.saveRefresh(userId, tokens.refreshToken);
    return this.safeResponse(user, tokens);
  }

  async login(email: string, password: string) {
    // Validate input
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Check if user has a password (not a Google-only user)
    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses Google Sign-In. Please login with Google.');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const userId = user._id.toString();
    const tokens = await this.issueTokens(userId, user.email);
    await this.saveRefresh(userId, tokens.refreshToken);
    return this.safeResponse(user, tokens);
  }

async googleLogin(idToken: string) {
  const decoded = await this.firebase.verifyGoogleToken(idToken);
  let user = await this.usersService.findByGoogleId(decoded.uid);

  if (!user) {
    user = await this.usersService.findByEmail(decoded.email);
    if (!user) {
      user = await this.usersService.createGoogleUser({
        name: decoded.name ?? 'Google User',
        email: decoded.email,
        googleId: decoded.uid,
        profileImageUrl: decoded.picture,
      });
    } else {

      user.googleId = decoded.uid;
      await user.save();
    }
  }

  const userId = user._id.toString();
  const tokens = await this.issueTokens(userId, user.email);
  await this.saveRefresh(userId, tokens.refreshToken);

  return this.safeResponse(user, tokens);
}



  async refresh(userId: string, email: string) {
    const tokens = await this.issueTokens(userId, email);
    await this.saveRefresh(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(userId, null);
    return { success: true };
  }

  private async issueTokens(sub: string, email: string) {
    const accessToken = await this.jwt.signAsync(
      { sub, email },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub, email },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' },
    );
    return { accessToken, refreshToken };
  }

  private async saveRefresh(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshToken(userId, hash);
  }

  private safeResponse(user: UserDocument, tokens: { accessToken: string; refreshToken: string }) {
    const { passwordHash, refreshTokenHash, ...safe } = user.toObject();
    return { user: safe, ...tokens };
  }
}
