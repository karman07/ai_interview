import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsGateway } from './gateways/analytics.gateway';
import { Visitor, VisitorSchema } from './schemas/visitor.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { PageView, PageViewSchema } from './schemas/pageview.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Visitor.name, schema: VisitorSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PageView.name, schema: PageViewSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsGateway],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
