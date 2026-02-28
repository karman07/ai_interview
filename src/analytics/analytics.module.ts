import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsGateway } from './gateways/analytics.gateway';
import { Visitor, VisitorSchema } from './schemas/visitor.schema';
import { Session, SessionSchema } from './schemas/session.schema';
import { PageView, PageViewSchema } from './schemas/pageview.schema';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Result, ResultSchema } from '../results/schemas/result.schema';
import { Payment, PaymentSchema } from '../payments/schemas/payment.schema';
import { Resume, ResumeSchema } from '../resume/resume.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Visitor.name, schema: VisitorSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PageView.name, schema: PageViewSchema },
      { name: User.name, schema: UserSchema },
      { name: Result.name, schema: ResultSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Resume.name, schema: ResumeSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsGateway],
  exports: [AnalyticsService],
})
export class AnalyticsModule { }
