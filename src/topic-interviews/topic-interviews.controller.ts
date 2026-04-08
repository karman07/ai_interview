import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { TopicInterviewsService } from './topic-interviews.service';
import {
  CreateTopicInterviewDto,
  UpdateTopicInterviewDto,
} from './dto/topic-interview.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('topic-interviews')
export class TopicInterviewsController {
  constructor(private readonly topicInterviewsService: TopicInterviewsService) {}

  // Public list endpoint used by FastAPI/frontend.
  @Get()
  async findAllPublic() {
    return this.topicInterviewsService.findAllPublic();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllAdmin() {
    return this.topicInterviewsService.findAllAdmin();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.topicInterviewsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(201)
  async create(@Body() dto: CreateTopicInterviewDto) {
    return this.topicInterviewsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTopicInterviewDto,
  ) {
    return this.topicInterviewsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    await this.topicInterviewsService.remove(id);
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path = './uploads/topic-logos';
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `topic-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const logoUrl = `/uploads/topic-logos/${file.filename}`;
    return this.topicInterviewsService.updateLogo(id, logoUrl);
  }
}
