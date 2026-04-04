import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyRoundsController } from './company-rounds.controller';
import { CompanyRoundsService } from './company-rounds.service';
import { CompanyRound, CompanyRoundSchema } from './schemas/company-round.schema';
import { Schema } from 'mongoose';
import { LEGACY_KNOWLEDGE_TOPIC_MODEL } from './company-rounds.constants';
const LegacyKnowledgeTopicSchema = new Schema({}, { strict: false, collection: 'knowledgetopics' });

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyRound.name, schema: CompanyRoundSchema },
      { name: LEGACY_KNOWLEDGE_TOPIC_MODEL, schema: LegacyKnowledgeTopicSchema },
    ]),
  ],
  controllers: [CompanyRoundsController],
  providers: [CompanyRoundsService],
  exports: [CompanyRoundsService],
})
export class CompanyRoundsModule {}
