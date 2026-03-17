import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DocsService } from './docs.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('docs')
@UseGuards(JwtAuthGuard) // Require Authentication for ALL doc endpoints
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get('tree')
  getDocsTree() {
    return this.docsService.getDocsTree();
  }

  @Get(':topic/:subtopicSlug')
  getDocContent(@Param('topic') topic: string, @Param('subtopicSlug') subtopicSlug: string) {
    return this.docsService.getDocContent(topic, subtopicSlug);
  }
}
