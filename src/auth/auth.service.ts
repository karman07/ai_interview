import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDocument, UserRole } from '../users/schemas/user.schema';
import { FirebaseService } from '../common/firebase/firebase.service';
import { EmailService } from '../email/email.service';
import { UniversitiesService } from '../universities/universities.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private firebase: FirebaseService,
    private email: EmailService,
    private universities: UniversitiesService,
  ) { }

  async signup(dto: CreateUserDto) {
    const uni = await this.getUniversityInfo(dto.email);
    // Use passed role or default to 'user'
    const userData: any = {
      ...dto,
      role: uni ? UserRole.STUDENT : (dto.role || UserRole.USER),
      universityId: uni ? uni._id.toString() : dto.universityId,
      isEmailVerified: false,
    };

    // If university detected, stamp its limits
    if (uni) {
      userData.interviewLimit = uni.interviewLimit;
      userData.resumeLimit = uni.resumeLimit;
    }
    const user = await this.usersService.create(userData);

    // Tokens are not issued upon signup; user must verify email first.
    const { passwordHash, refreshTokenHash, ...safe } = user.toObject();

    return {
      message: 'Account created! Please check your email and verify your address to log in.',
      user: safe
    };
  }

  async login(email: string, password: string) {
    // Validate input
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Account not found');

    // Check if user has verified their email
    if (!user.isEmailVerified) {
      // Check Firebase to see if they recently verified
      try {
        const firebaseUser = await this.firebase.getUserByEmail(email);
        if (firebaseUser && firebaseUser.emailVerified) {
          user.isEmailVerified = true;
          await user.save();
        } else {
          throw new UnauthorizedException('Please verify your email to log in.');
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Please verify your email to log in.');
      }
    }

    // Check if user has a password (not a Google-only user)
    if (!user.passwordHash) {
      throw new UnauthorizedException('This account uses Google Sign-In. Please login with Google.');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const userId = user._id.toString();

    // Upgrade existing user to student if they match a university domain
    const uni = await this.getUniversityInfo(user.email);
    if (uni && user.role === UserRole.USER) {
      user.role = UserRole.STUDENT;
      user.universityId = uni._id.toString();
      user.interviewLimit = uni.interviewLimit;
      user.resumeLimit = uni.resumeLimit;
      await user.save();
    }

    const tokens = await this.issueTokens(userId, user.email, user.role, user.universityId);
    await this.saveRefresh(userId, tokens.refreshToken);
    return this.safeResponse(user, tokens);
  }

  async googleLogin(idToken: string) {
    const decoded = await this.firebase.verifyGoogleToken(idToken);
    let user = await this.usersService.findByGoogleId(decoded.uid);

    if (!user) {
      user = await this.usersService.findByEmail(decoded.email);
      const uni = await this.getUniversityInfo(decoded.email);
      if (!user) {
        user = await this.usersService.createGoogleUser({
          name: decoded.name ?? 'Google User',
          email: decoded.email,
          googleId: decoded.uid,
          profileImageUrl: decoded.picture,
          isEmailVerified: true,
          role: uni ? UserRole.STUDENT : UserRole.USER,
          universityId: uni ? uni._id.toString() : undefined,
          interviewLimit: uni ? uni.interviewLimit : undefined,
          resumeLimit: uni ? uni.resumeLimit : undefined,
        } as any);

        // New user from Google, send welcome email
        await this.email.sendWelcomeEmail(user.email);
      } else {
        user.googleId = decoded.uid;
        user.isEmailVerified = true;
        // Upgrade existing user to student if they match a university domain
        if (uni && user.role === UserRole.USER) {
          user.role = UserRole.STUDENT;
          user.universityId = uni._id.toString();
          user.interviewLimit = uni.interviewLimit;
          user.resumeLimit = uni.resumeLimit;
        }
        await user.save();
      }
    }

    const userId = user._id.toString();
    const tokens = await this.issueTokens(userId, user.email, user.role, user.universityId);
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
          throw new UnauthorizedException('Please verify your email to continue.');
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Please verify your email to continue.');
      }
    }

    // Upgrade existing user to student if they match a university domain
    const uni = await this.getUniversityInfo(user.email);
    if (uni && user.role === UserRole.USER) {
      user.role = UserRole.STUDENT;
      user.universityId = uni._id.toString();
      user.interviewLimit = uni.interviewLimit;
      user.resumeLimit = uni.resumeLimit;
      await user.save();
    }

    const tokens = await this.issueTokens(userId, email, user.role, user.universityId);
    await this.saveRefresh(userId, tokens.refreshToken);
    return tokens;
  }

  async findUserByPhone(phoneNumber: string) {
    return this.usersService.findByPhoneNumber(phoneNumber);
  }

  async studentRegister(email: string, password: string, rollNumber?: string) {
    if (!email || !password) throw new UnauthorizedException('Email and password are required');

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) throw new UnauthorizedException('Invalid email address');

    const university = await this.universities.findByDomain(domain);
    if (!university) {
      throw new UnauthorizedException('Your email domain is not associated with any registered university.');
    }

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        name: email.split('@')[0],
        email,
        password,
        role: UserRole.STUDENT,
        isEmailVerified: false, // Must verify via Firebase first to login
        universityId: university._id.toString(),
        rollNumber: rollNumber || undefined,
        interviewLimit: university.interviewLimit,
        resumeLimit: university.resumeLimit,
        resumeCount: 0,
        interviewCount: 0,
      });
    }
    return { success: true };
  }

  async studentLogin(email: string, password: string, rollNumber?: string) {
    if (!email || !password) throw new UnauthorizedException('Email and password are required');

    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) throw new UnauthorizedException('Invalid email address');

    const university = await this.universities.findByDomain(domain);
    if (!university) {
      throw new UnauthorizedException('Your email domain is not associated with any registered university.');
    }

    // Find or auto-create the student account
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      // Auto-register as student with that university's limits
      user = await this.usersService.create({
        name: email.split('@')[0],
        email,
        password,
        role: UserRole.STUDENT,
        isEmailVerified: true, // university email implicitly trusted
        universityId: university._id.toString(),
        rollNumber: rollNumber || undefined,
        interviewLimit: university.interviewLimit,
        resumeLimit: university.resumeLimit,
        resumeCount: 0,
        interviewCount: 0,
      });
    } else {
      // Existing user: verify password
      if (!user.passwordHash) throw new UnauthorizedException('Please use Google login or reset your password');
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Wrong password');
      if (user.role !== UserRole.STUDENT || !user.universityId || (rollNumber && user.rollNumber !== rollNumber) || !user.isEmailVerified) {
        user.role = UserRole.STUDENT;
        user.universityId = university._id.toString();
        user.isEmailVerified = true; // They passed Firebase validation to reach here
        user.interviewLimit = university.interviewLimit;
        user.resumeLimit = university.resumeLimit;
        if (rollNumber) user.rollNumber = rollNumber;
        await user.save();
      }
    }

    const tokens = await this.issueTokens(user._id.toString(), user.email, user.role, user.universityId);
    await this.saveRefresh(user._id.toString(), tokens.refreshToken);

    const { passwordHash, refreshTokenHash, ...safe } = user.toObject();
    return { user: { ...safe, university }, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async studentGoogleLogin(idToken: string, universityId: string, rollNumber?: string) {
    const decoded = await this.firebase.verifyGoogleToken(idToken);

    const emailDomain = decoded.email?.split('@')[1]?.toLowerCase();
    if (!emailDomain) throw new UnauthorizedException('Invalid email in Google token');

    // Verify the Google email domain matches the selected university
    const university = await this.universities.findById(universityId);
    if (!university) throw new UnauthorizedException('University not found.');
    if (emailDomain !== university.domain.toLowerCase()) {
      throw new UnauthorizedException(
        `Your Google account email must use the @${university.domain} domain to sign in as a student of this university.`,
      );
    }

    let user = await this.usersService.findByGoogleId(decoded.uid);
    if (!user) {
      user = await this.usersService.findByEmail(decoded.email);
      if (!user) {
        user = await this.usersService.createGoogleUser({
          name: decoded.name ?? decoded.email.split('@')[0],
          email: decoded.email,
          googleId: decoded.uid,
          profileImageUrl: decoded.picture,
          isEmailVerified: true,
          role: UserRole.STUDENT,
          universityId: university._id.toString(),
          rollNumber: rollNumber || undefined,
          interviewLimit: university.interviewLimit,
          resumeLimit: university.resumeLimit,
        } as any);
        await this.email.sendWelcomeEmail(user.email);
      } else {
        user.googleId = decoded.uid;
        user.isEmailVerified = true;
        user.role = UserRole.STUDENT;
        user.universityId = university._id.toString();
        user.interviewLimit = university.interviewLimit;
        user.resumeLimit = university.resumeLimit;
        if (rollNumber) user.rollNumber = rollNumber;
        await user.save();
      }
    } else {
      // Existing google user — ensure student fields are set
      if (user.role !== UserRole.STUDENT || !user.universityId || (rollNumber && user.rollNumber !== rollNumber)) {
        user.role = UserRole.STUDENT;
        user.universityId = university._id.toString();
        user.interviewLimit = university.interviewLimit;
        user.resumeLimit = university.resumeLimit;
        if (rollNumber) user.rollNumber = rollNumber;
        await user.save();
      }
    }

    const tokens = await this.issueTokens(user._id.toString(), user.email, user.role, user.universityId);
    await this.saveRefresh(user._id.toString(), tokens.refreshToken);

    const { passwordHash, refreshTokenHash, ...safe } = user.toObject();
    return { user: { ...safe, university }, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async verifyPhone(userId: string, firebaseIdToken: string) {
    const decoded = await this.firebase.verifyIdToken(firebaseIdToken);
    const phoneNumber = (decoded as any).phone_number as string | undefined;

    if (!phoneNumber) {
      throw new UnauthorizedException('Token does not contain a verified phone number');
    }

    // Ensure phone not already used by another account
    const existing = await this.usersService.findByPhoneNumber(phoneNumber);
    if (existing && existing._id.toString() !== userId) {
      throw new ConflictException(
        'This phone number is already associated with another account. Please use a different number.',
      );
    }

    await this.usersService.updateProfile(userId, {
      phoneNumber,
      isPhoneVerified: true,
    } as any);

    return { success: true, phoneNumber };
  }

  async logout(userId: string) {
    await this.usersService.setRefreshToken(userId, null);
    return { success: true };
  }
  
  private async getUniversityInfo(email: string) {
    const domain = email?.split('@')[1]?.toLowerCase();
    if (!domain) return null;
    return this.universities.findByDomain(domain);
  }

  private async issueTokens(sub: string, email: string, role: string, universityId?: string) {
    const payload = { sub, email, role, universityId };
    const accessToken = await this.jwt.signAsync(
      payload,
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_EXPIRES || '1h' },
    );
    const refreshToken = await this.jwt.signAsync(
      payload,
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
