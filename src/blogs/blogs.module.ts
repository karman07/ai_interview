import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { BlogsGeneratorService } from './blogs.generator';

@Module({
  providers: [BlogsService, BlogsGeneratorService],
  controllers: [BlogsController],
  exports: [BlogsService],
})
export class BlogsModule {}
