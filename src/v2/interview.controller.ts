import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  UseInterceptors, 
  Req, 
  Res, 
  HttpStatus,
  StreamableFile,
  Header
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { InterviewService } from './interview.service';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import {
  StartInterviewDto,
  StartWithIdsDto,
  StartSessionResponseDto,
  AnswerResponseDto,
  SessionStateResponseDto,
  PerformanceMetricsResponseDto,
  CompleteInterviewResponseDto,
  GlobalMetricsResponseDto,
  MetricsResetResponseDto,
  ErrorResponseDto,
  StreamChunkDto
} from './dto/interview.dto';

@Controller('interview/v2')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  /**
   * Start a new interview session with direct CV/JD text
   */
  @Post('start')
  async startInterview(@Body() dto: StartInterviewDto, @Res() res: Response) {
    try {
      const result = await this.interviewService.startInterview(dto);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  /**
   * Start interview using MongoDB IDs (recommended for caching)
   */
  @Post('start-with-ids')
  @UseInterceptors(AnyFilesInterceptor({
    storage: memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
      files: 5,
    },
  }))
  async startInterviewWithIds(@Req() req, @Res() res: Response) {
    try {
      const result = await this.interviewService.startInterviewWithIds(req);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  /**
   * Submit answer with optional audio/video files
   */
  @Post('answer')
  @UseInterceptors(AnyFilesInterceptor({
    storage: memoryStorage(),
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB max for audio/video
      files: 3,
    },
  }))
  async submitAnswer(@Req() req, @Res() res: Response) {
    try {
      const result = await this.interviewService.submitAnswer(req);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  /**
   * Stream next question generation in real-time (Server-Sent Events)
   */
  @Get('stream/:session_id')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async streamQuestion(@Param('session_id') sessionId: string, @Res() res: Response) {
    try {
      await this.interviewService.streamQuestion(sessionId, res);
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
      res.end();
    }
  }

  /**
   * Get current session state and conversation history
   */
  @Get('state/:session_id')
  async getSessionState(@Param('session_id') sessionId: string, @Res() res: Response) {
    try {
      const result = await this.interviewService.getSessionState(sessionId);
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({ detail: 'Session not found' });
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  /**
   * Get performance metrics for a specific session
   */
  @Get('performance/:session_id')
  async getPerformanceMetrics(@Param('session_id') sessionId: string, @Res() res: Response) {
    try {
      const result = await this.interviewService.getPerformanceMetrics(sessionId);
      if (!result) {
        return res.status(HttpStatus.NOT_FOUND).json({ detail: 'Session not found' });
      }
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  /**
   * Complete interview and generate comprehensive evaluation
   */
  @Post('complete/:session_id')
  async completeInterview(@Param('session_id') sessionId: string, @Body() body: any, @Res() res: Response) {
    try {
      const result = await this.interviewService.completeInterview(sessionId, body);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      if (err.status === 404) {
        return res.status(HttpStatus.NOT_FOUND).json({ detail: err.message });
      }
      if (err.status) {
        return res.status(err.status).json({ detail: err.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  /**
   * Get global performance metrics across all sessions
   */
  @Get('metrics/global')
  async getGlobalMetrics(@Res() res: Response) {
    try {
      const result = await this.interviewService.getGlobalMetrics();
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }

  /**
   * Reset all performance metrics (admin/testing only)
   */
  @Post('metrics/reset')
  async resetMetrics(@Res() res: Response) {
    try {
      const result = await this.interviewService.resetMetrics();
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ detail: err.message || 'Internal error' });
    }
  }
}
