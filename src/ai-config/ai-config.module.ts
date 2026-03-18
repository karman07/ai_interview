import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiConfigService } from './ai-config.service';
import { AiConfigController } from './ai-config.controller';
import { ApiKey, ApiKeySchema } from './schemas/api-key.schema';
import { ModelConfig, ModelConfigSchema } from './schemas/model-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApiKey.name,     schema: ApiKeySchema     },
      { name: ModelConfig.name, schema: ModelConfigSchema },
    ]),
  ],
  controllers: [AiConfigController],
  providers: [AiConfigService],
  exports: [AiConfigService],
})
export class AiConfigModule {}
