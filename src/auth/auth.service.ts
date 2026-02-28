import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDocument, UserRole } from '../users/schemas/user.schema';
import { FirebaseService } from '../common/firebase/firebase.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private firebase: FirebaseService,
    private email: EmailService,
  ) { }

  async signup(dto: CreateUserDto) {
    // Use passed role or default to 'user'
    const userData = {
      ...dto,
      role: dto.role || UserRole.USER,
      isEmailVerified: false,
    };
    const user = await this.usersService.create(userData);

    // Tokens are not issued upon signup; user must verify email first.
    const { passwordHash, refreshTokenHash, ...safe } = user.toObject();

    return {
      message: 'User registered successfully. Please verify your email before logging in.',
      user: safe
    };
  }

  async login(email: string, password: string) {
    // Validate input
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Check if user has verified their email
    if (!user.isEmailVerified) {
      // Check Firebase to see if they recently verified
      try {
        const firebaseUser = await this.firebase.getUserByEmail(email);
        if (firebaseUser && firebaseUser.emailVerified) {
          user.isEmailVerified = true;
          await user.save();
        } else {
          throw new UnauthorizedException('Please verify your email address via Firebase before logging in.');
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Please verify your email address via Firebase before logging in.');
      }
    }

    // Check if user has a password (not a Google-only user)
    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses Google Sign-In. Please login with Google.');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const userId = user._id.toString();
    const tokens = await this.issueTokens(userId, user.email, user.role);
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
          isEmailVerified: true,
        } as any);

        // New user from Google, send welcome email
        await this.email.sendWelcomeEmail(user.email);
      } else {
        user.googleId = decoded.uid;
        user.isEmailVerified = true;
        await user.save();
      }
    }

    const userId = user._id.toString();
    const tokens = await this.issueTokens(userId, user.email, user.role);
    await this.saveRefresh(userId, tokens.refreshToken);

    return this.safeResponse(user, tokens);
  }



  async refresh(userId: string, email: string) {
    // Get user to include role in new tokens and verify status
    const user = await this.usersService.findById(userId);

    if (!user.isEmailVerified) {
      try {
        const firebaseUser = await this.firebase.getUserByEmail(email);
        if (firebaseUser && firebaseUser.emailVerified) {
          user.isEmailVerified = true;
          await user.save();
        } else {
          throw new UnauthorizedException('Please verify your email address via Firebase.');
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Please verify your email address via Firebase.');
      }
    }

    const tokens = await this.issueTokens(userId, email, user.role);
    await this.saveRefresh(userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(userId, null);
    return { success: true };
  }

  private async issueTokens(sub: string, email: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub, email, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES || '1h' },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub, email, role },
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
