import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AiConfigService } from './ai-config.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('ai-config')
export class AiConfigController {
  constructor(private readonly aiConfigService: AiConfigService) {}

  /**
   * Internal-only endpoint — returns raw active keys for the AI Python backend.
   * Access is restricted to requests from localhost / private network only.
   */
  @Get('keys/internal')
  async getInternalKeys(@Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || '';
    const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    if (!isLocal) {
      return { error: 'Forbidden' };
    }
    const gemini      = await this.aiConfigService.getActiveKey('gemini');
    const groq        = await this.aiConfigService.getActiveKey('groq');
    const geminiModel = await this.aiConfigService.getActiveModel('gemini');
    const groqModel   = await this.aiConfigService.getActiveModel('groq');
    return { gemini, groq, geminiModel, groqModel };
  }

  // ── Admin-only routes (JWT + role required) ──────────────────────────────

  @Get('keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllKeys() {
    return this.aiConfigService.getAllKeys();
  }

  @Post('keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  addKey(
    @Body() body: { provider: 'gemini' | 'groq'; label: string; value: string },
  ) {
    return this.aiConfigService.addKey(body.provider, body.label, body.value);
  }

  @Patch('keys/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  setActive(@Param('id') id: string) {
    return this.aiConfigService.setActive(id);
  }

  @Delete('keys/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteKey(@Param('id') id: string) {
    return this.aiConfigService.deleteKey(id);
  }

  // ── Model management ──────────────────────────────────────────────────────

  @Get('models')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getModels() {
    return this.aiConfigService.getModels();
  }

  @Patch('models/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  setActiveModel(@Body() body: { provider: 'gemini' | 'groq'; modelId: string }) {
    return this.aiConfigService.setActiveModel(body.provider, body.modelId);
  }
}
