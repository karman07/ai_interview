import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const uploadDir = './uploads/resources';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('resources')
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'thumbnail', maxCount: 1 },
            { name: 'resourceFile', maxCount: 1 },
        ], {
            storage: diskStorage({
                destination: uploadDir,
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
        }),
    )
    create(
        @Body() createResourceDto: CreateResourceDto,
        @UploadedFiles() files?: { thumbnail?: Express.Multer.File[], resourceFile?: Express.Multer.File[] },
    ) {
        return this.resourcesService.create(createResourceDto, files);
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    findAllAdmin() {
        return this.resourcesService.findAllAdmin();
    }

    @Get()
    findAllPublished(@Query() query: any) {
        return this.resourcesService.findAllPublished(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.resourcesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'thumbnail', maxCount: 1 },
            { name: 'resourceFile', maxCount: 1 },
        ], {
            storage: diskStorage({
                destination: uploadDir,
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
        }),
    )
    update(
        @Param('id') id: string,
        @Body() updateResourceDto: UpdateResourceDto,
        @UploadedFiles() files?: { thumbnail?: Express.Multer.File[], resourceFile?: Express.Multer.File[] },
    ) {
        return this.resourcesService.update(id, updateResourceDto, files);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.resourcesService.remove(id);
    }

    @Post(':id/download')
    incrementDownloads(@Param('id') id: string) {
        return this.resourcesService.incrementDownloads(id);
    }
}
