import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly service: BlogsService) { }

  /** Public list */
  @Get()
  async getAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.service.getAll({ category: category || undefined, search: search || undefined });
  }

  /** Public Detail */
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.service.getBySlug(slug);
  }

  /** Admin Create */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Req() req, @Body() body: { title: string; slug: string; category: string; content: string; excerpt: string; coverImage?: string }) {
    const author = req.user.email || 'Admin';
    return this.service.create(body, author);
  }
}
