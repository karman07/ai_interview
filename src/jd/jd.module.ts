import { Module } from '@nestjs/common';
import { JdController } from './jd.controller';

@Module({
  controllers: [JdController],
})
export class JdModule {}