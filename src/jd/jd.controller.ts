import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('v1/jd')
export class JdController {
  private readonly logger = new Logger(JdController.name);

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadJd(
    @UploadedFile() file: Express.Multer.File,
    @Query('user_id') userId: string = 'default'
  ) {
    this.logger.log('📤 JD upload API called');
    
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    return {
      id: 'jd_' + Date.now(),
      filename: file.originalname,
      user_id: userId,
      created_at: new Date().toISOString()
    };
  }

  @Get(':jd_id')
  async getJd(@Param('jd_id') jdId: string) {
    this.logger.log(`🔍 Get JD API called: ${jdId}`);
    return {
      id: jdId,
      filename: 'job_description.pdf',
      content: 'Job description content...'
    };
  }

  @Delete(':jd_id')
  async deleteJd(@Param('jd_id') jdId: string) {
    this.logger.log(`🗑️ Delete JD API called: ${jdId}`);
    return { message: 'JD deleted successfully' };
  }

  @Get()
  async listJds(@Query('user_id') userId?: string) {
    this.logger.log('📋 List JDs API called');
    return {
      jds: [],
      user_id: userId || null
    };
  }
}