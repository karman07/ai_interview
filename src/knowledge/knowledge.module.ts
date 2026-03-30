import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeTopic, KnowledgeTopicSchema } from './schemas/topic.schema';
import { KnowledgeDocument, KnowledgeDocumentSchema } from './schemas/document.schema';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeTopic.name, schema: KnowledgeTopicSchema },
      { name: KnowledgeDocument.name, schema: KnowledgeDocumentSchema },
    ]),
    MulterModule.register({
      dest: './uploads/knowledge',
    }),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
