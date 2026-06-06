import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { HackathonService } from './hackathon.service';
import { UsersService } from '../users/users.service';

function parseExcelEmails(buffer: Buffer): string[] {
  // Simple CSV/Excel parser — reads rows and extracts email-looking values
  // Supports both .csv (plain text) and .xlsx (requires xlsx package if available)
  try {
    // Try xlsx parsing first
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const XLSX = require('xlsx');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const emails: string[] = [];
    for (const row of rows) {
      for (const cell of row) {
        const val = String(cell ?? '').trim();
        if (val.includes('@')) emails.push(val);
      }
    }
    return emails;
  } catch {
    // Fallback: treat as CSV / plain text
    const text = buffer.toString('utf-8');
    return text
      .split(/[\n,;\r\t]+/)
      .map(s => s.trim())
      .filter(s => s.includes('@'));
  }
}

@Controller('hackathon')
export class HackathonController {
  constructor(
    private readonly hackathonService: HackathonService,
    private readonly usersService: UsersService,
  ) {}

  // ── Public / user endpoints ───────────────────────────────────────────────

  @Get('config')
  async getConfig() {
    return this.hackathonService.getConfig();
  }

  @Get('check-eligibility')
  @UseGuards(JwtAuthGuard)
  async checkEligibility(@Req() req) {
    return this.hackathonService.checkEligibility(req.user.email);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.hackathonService.getLeaderboard(limit ? parseInt(limit) : 50);
  }

  @Post('mark-interview-taken')
  @UseGuards(JwtAuthGuard)
  async markInterviewTaken(@Req() req) {
    return this.hackathonService.markInterviewTaken(req.user.email);
  }

  @Post('save-result')
  @UseGuards(JwtAuthGuard)
  async saveResult(@Req() req, @Body() body: {
    overallScore: number;
    metrics?: Record<string, number>;
    sessionId?: string;
    cvVerified?: boolean;
    rawData?: Record<string, any>;
  }) {
    const user = await this.usersService.findById(req.user.sub).catch(() => null);
    return this.hackathonService.saveResult({
      userId: req.user.sub,
      userName: user?.name || req.user.email,
      userEmail: req.user.email,
      userImage: user?.profileImageUrl,
      ...body,
    });
  }

  @Post('submit-form')
  @UseGuards(JwtAuthGuard)
  async submitForm(@Req() req, @Body() body: {
    experience: string;
    feedback: string;
    collegeName: string;
    yearOfStudy: string;
    branch: string;
    linkedinUrl?: string;
    githubUrl?: string;
    lookingForOpportunities?: boolean;
  }) {
    const user = await this.usersService.findById(req.user.sub).catch(() => null);
    return this.hackathonService.submitForm({
      userId: req.user.sub,
      userEmail: req.user.email,
      userName: user?.name || req.user.email,
      userImage: user?.profileImageUrl,
      ...body,
    });
  }

  // ── Admin endpoints ───────────────────────────────────────────────────────

  @Post('admin/emails/:email/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async resetInterview(@Param('email') email: string) {
    return this.hackathonService.resetInterview(decodeURIComponent(email));
  }

  @Post('admin/emails/:email/force-sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async forceSyncResult(@Param('email') email: string) {
    const decodedEmail = decodeURIComponent(email);
    const user = await this.usersService.findByEmail(decodedEmail);
    if (!user) throw new BadRequestException('User not found with that email');
    return this.hackathonService.forceSyncResult(
      user._id.toString(),
      user.name || decodedEmail,
      decodedEmail,
      user.profileImageUrl,
    );
  }

  @Post('admin/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateConfig(@Body() body: {
    isActive?: boolean;
    title?: string;
    description?: string;
    jdText?: string;
    difficulty?: string;
  }) {
    return this.hackathonService.updateConfig(body);
  }

  @Post('admin/add-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addSingleEmail(@Body() body: { email: string }) {
    if (!body.email?.includes('@')) throw new BadRequestException('Invalid email address');
    return this.hackathonService.uploadEmails([body.email.trim()]);
  }

  @Post('admin/upload-emails')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadEmails(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const emails = parseExcelEmails(file.buffer);
    return this.hackathonService.uploadEmails(emails);
  }

  @Get('admin/emails')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEmails(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.hackathonService.getAllEmails(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 100,
    );
  }

  @Delete('admin/emails/:email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeEmail(@Param('email') email: string) {
    return this.hackathonService.removeEmail(decodeURIComponent(email));
  }

  @Delete('admin/emails')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async clearEmails() {
    return this.hackathonService.clearAllEmails();
  }

  @Get('admin/leaderboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminLeaderboard(@Query('limit') limit?: string) {
    return this.hackathonService.getLeaderboard(limit ? parseInt(limit) : 200);
  }

  @Get('admin/forms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getForms(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.hackathonService.getAllForms(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
