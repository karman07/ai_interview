import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('interview')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  constructor(private readonly service: InterviewService) {}

  // Generate interview questions
  @Post('generate')
  async generate(@Req() req, @Body() dto: CreateInterviewDto) {
    const userId = req.user.sub;
    // console.log('Generating interview for user:', userId);
    return this.service.generate(userId, dto);
  }

  // Run interview with answers and save results
  @Post('run')
  async run(@Req() req, @Body() dto: CreateInterviewDto) {
    const userId = req.user.sub;
    return this.service.run(userId, dto);
  }
}
