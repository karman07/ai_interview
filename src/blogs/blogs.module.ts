import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { BlogsGeneratorService } from './blogs.generator';
import { AiConfigModule } from '../ai-config/ai-config.module';

@Module({
  imports: [AiConfigModule],
  providers: [BlogsService, BlogsGeneratorService],
  controllers: [BlogsController],
  exports: [BlogsService],
})
export class BlogsModule {}
