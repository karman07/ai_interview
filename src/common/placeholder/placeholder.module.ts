import { Module } from '@nestjs/common';
import { PlaceholderController } from './placeholder.controller';

@Module({
  controllers: [PlaceholderController],
})
export class PlaceholderModule {}