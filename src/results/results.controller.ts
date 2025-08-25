import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly service: ResultsService) {}

  @Get('mine')
  async getMyResults(@Req() req) {
    const userId = req.user.sub; // user info comes from JwtAuthGuard
    // console.log('Fetching my results for user:', userId);
    return this.service.getMyResults(userId);
  }

  @Get(':id')
  async getResultById(@Req() req, @Param('id') id: string) {
    const userId = req.user.sub;
    return this.service.getResultById(userId, id);
  }
}
