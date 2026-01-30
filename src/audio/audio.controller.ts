import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('v1/audio')
export class AudioController {
  private readonly logger = new Logger(AudioController.name);

  @Post(':session_id/answer')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'audio_file', maxCount: 1 },
    { name: 'video_file', maxCount: 1 }
  ]))
  async submitAudioAnswer(
    @Param('session_id') sessionId: string,
    @UploadedFiles() files: { audio_file?: Express.Multer.File[], video_file?: Express.Multer.File[] }
  ) {
    this.logger.log(`🎤 Submit audio answer API called: ${sessionId}`);
    
    const audioFile = files.audio_file?.[0];
    const videoFile = files.video_file?.[0];

    if (!audioFile && !videoFile) {
      throw new HttpException('No audio or video file uploaded', HttpStatus.BAD_REQUEST);
    }

    return {
      transcription: 'Sample transcription...',
      audio_analysis: audioFile ? {
        speech_clarity: 8.5,
        pace_score: 7.0,
        confidence_level: 8.0,
        duration: 45
      } : null,
      video_analysis: videoFile ? {
        face_presence_percentage: 95,
        eye_contact_score: 8.2,
        behavior_score: 8.0
      } : null,
      evaluation: {
        overall_score: 8.0
      }
    };
  }

  @Post('analyze')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'audio_file', maxCount: 1 },
    { name: 'video_file', maxCount: 1 }
  ]))
  async analyzeAudioOnly(
    @UploadedFiles() files: { audio_file?: Express.Multer.File[], video_file?: Express.Multer.File[] }
  ) {
    this.logger.log('🔍 Analyze audio only API called');
    
    const audioFile = files.audio_file?.[0];
    const videoFile = files.video_file?.[0];

    if (!audioFile && !videoFile) {
      throw new HttpException('No audio or video file uploaded', HttpStatus.BAD_REQUEST);
    }

    return {
      transcription: 'Sample transcription...',
      audio_analysis: audioFile ? {
        speech_clarity: 8.5,
        pace_score: 7.0,
        confidence_level: 8.0,
        duration: 45,
        pause_count: 3,
        filler_words: 2
      } : null,
      video_analysis: videoFile ? {
        duration_seconds: 45,
        face_presence_percentage: 95,
        eye_contact_score: 8.2,
        head_stability_score: 7.8,
        behavior_score: 8.0
      } : null
    };
  }
}