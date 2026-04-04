import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateCompanyRoundDto } from './dto/create-company-round.dto';
import { UpdateCompanyRoundDto } from './dto/update-company-round.dto';
import { CompanyRoundsService } from './company-rounds.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@Controller('company-rounds')
export class CompanyRoundsController {
  constructor(private readonly companyRoundsService: CompanyRoundsService) {}

  @Get()
  findAllPublic() {
    return this.companyRoundsService.findAllPublic();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllAdmin() {
    return this.companyRoundsService.findAllAdmin();
  }

  @Post('admin/migrate-from-knowledge')
  @UseGuards(JwtAuthGuard)
  migrateFromKnowledge() {
    return this.companyRoundsService.migrateFromKnowledge();
  }

  @Post(':id/logo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const path = './uploads/company-round-logos';
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `company-round-${uniqueSuffix}${extname(file.originalname)}`);
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
  uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const logoUrl = `/uploads/company-round-logos/${file.filename}`;
    return this.companyRoundsService.updateLogo(id, logoUrl);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateCompanyRoundDto) {
    return this.companyRoundsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCompanyRoundDto) {
    return this.companyRoundsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.companyRoundsService.remove(id);
  }
}
