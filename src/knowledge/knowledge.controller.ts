import { Controller, Get, Post, Body, Param, UploadedFile, UseInterceptors, Delete, Query, UseGuards, Res, Patch, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('topics')
  @UseGuards(JwtAuthGuard)
  async getTopics(@Req() req: Request) {
    const user = (req as any).user;
    // Admins see all topics, others only published ones
    const onlyPublished = user?.role !== UserRole.ADMIN;
    return this.knowledgeService.getTopics(onlyPublished);
  }

  @Get('topics/find-by-name')
  async findByName(@Query('name') name: string, @Query('all') all: string) {
    // Only published by default, unless explicitly requested for internal use (AI service lookup)
    const onlyPublished = all !== 'true';
    return this.knowledgeService.findByName(name, onlyPublished);
  }

  @Post('topics')
  @UseGuards(JwtAuthGuard)
  async createTopic(@Body() data: { name: string; description?: string; category?: string; tags?: string[] }) {
    return this.knowledgeService.createTopic(data.name, data.description, data.category, data.tags);
  }

  @Patch('topics/:id')
  @UseGuards(JwtAuthGuard)
  async updateTopic(@Param('id') id: string, @Body() data: { name?: string; description?: string; category?: string; tags?: string[] }) {
    return this.knowledgeService.updateTopic(id, data);
  }

  @Delete('topics/:id')
  @UseGuards(JwtAuthGuard)
  async deleteTopic(@Param('id') id: string) {
    return this.knowledgeService.deleteTopic(id);
  }

  @Get('topics/:id/documents')
  @UseGuards(JwtAuthGuard)
  async getTopicDocuments(@Param('id') id: string) {
    return this.knowledgeService.getTopicDocuments(id);
  }

  @Post('topics/:id/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path = './uploads/knowledge';
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|txt)$/i)) {
          return cb(new Error('Only PDF and TXT files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(
    @Param('id') topicId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.knowledgeService.addDocument(topicId, file);
  }

  @Post('topics/:id/jd')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path = './uploads/knowledge';
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `jd-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|txt)$/i)) {
          return cb(new Error('Only PDF and TXT files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadJdDocument(
    @Param('id') topicId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.knowledgeService.addJdDocument(topicId, file);
  }

  @Post('topics/:id/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path = './uploads/logos';
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Only JPG/PNG images are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const logoUrl = `/uploads/logos/${file.filename}`;
    return this.knowledgeService.updateLogo(id, logoUrl);
  }

  @Delete('documents/:id')
  @UseGuards(JwtAuthGuard)
  async deleteDocument(@Param('id') id: string) {
    return this.knowledgeService.deleteDocument(id);
  }

  @Get('documents/:id/view')
  async viewDocument(@Param('id') id: string, @Res() res) {
    const doc = await this.knowledgeService.getDocument(id);
    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).send('File not found');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
    const stream = fs.createReadStream(doc.filePath);
    stream.pipe(res);
  }

  @Get('query')
  @UseGuards(JwtAuthGuard)
  async queryKnowledge(
    @Query('topic_id') topicId: string,
    @Query('query') query: string,
  ) {
    return this.knowledgeService.queryKnowledge(topicId, query);
  }
}
