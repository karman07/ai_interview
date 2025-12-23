import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { UseGuards, Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { InterviewService } from '../services/interview.service';
import { EnhancedInterviewService } from '../services/enhanced-interview.service';
import { AiInterviewApiService } from '../services/ai-interview-api.service';
import { AllWsExceptionsFilter } from 'src/common/filters/ws-exception.filter';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';
import { InterviewRound } from '../schemas/interview-session.schema';

@WebSocketGateway({ namespace: '/behavioral', cors: true })
@UseFilters(AllWsExceptionsFilter)
@UseGuards(WsJwtGuard)
export class BehaviorGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(BehaviorGateway.name);
  private readonly MAX_QUESTIONS = 10;
  private sessionMap = new Map<string, string>();

  constructor(
    private interviewService: InterviewService,
    private enhancedInterviewService: EnhancedInterviewService,
    private aiInterviewApi: AiInterviewApiService,
  ) {}

  @SubscribeMessage('start')
  async handleStart(
    @MessageBody()
    data: {
      userId: string;
      role?: string;
      company?: string;
      jobDescription?: string;
      experience?: string;
      cv?: string;
      industry?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Start behavioral interview for user: ${data.userId}`);
      client.join(data.userId);

      // Start enhanced session tracking
      const session = await this.enhancedInterviewService.startSession({
        userId: data.userId,
        round: InterviewRound.BEHAVIORAL,
        role: data.role,
        company: data.company,
        jobDescription: data.jobDescription,
        experience: data.experience,
        industry: data.industry,
      });

      await this.interviewService.resetRound(data.userId, 'behavioral');

      const sessionId = session.sessionId;
      this.sessionMap.set(data.userId, sessionId);

      const aiResponse = await this.aiInterviewApi.startInterview({
        user_id: data.userId,
        session_id: sessionId,
        role_title: data.role || 'Software Engineer',
        company_name: data.company || 'Tech Company',
        industry: data.industry || 'Software',
        jd: data.jobDescription || 'Role requiring strong behavioral competencies',
        cv: data.cv || data.experience || 'Experienced professional',
        round_type: 'behavioral',
      });

      await this.interviewService.startWithContext({
        userId: data.userId,
        round: 'behavioral',
        role: data.role,
        company: data.company,
        jobDescription: data.jobDescription,
        experience: data.experience,
      });

      const record = await this.interviewService.create(
        data.userId,
        'behavioral',
        aiResponse.question || aiResponse.current_question || 'Tell me about a time when you faced a challenge at work.',
      );

      // Add question to enhanced session
      await this.enhancedInterviewService.addQuestionAnswer(
        sessionId,
        record.question!,
      );

      this.server.to(data.userId).emit('question', {
        id: record._id,
        question: record.question,
        sessionId: sessionId,
      });
    } catch (err) {
      this.logger.error('Start Interview Error:', err);
      throw new WsException(
        err instanceof Error ? err.message : 'Unknown WebSocket error',
      );
    }
  }

  @SubscribeMessage('answer')
  async handleAnswer(
    @MessageBody() data: { 
      id: string; 
      userId: string; 
      answer: string;
      audioUrl?: string;
      videoUrl?: string;
      responseDuration?: number;
    },
  ) {
    try {
      this.logger.log(`Answer received for ${data.id} from ${data.userId}`);

      const interview = await this.interviewService.findById(data.id);
      if (!interview) throw new WsException('Interview record not found');

      const sessionId = this.sessionMap.get(data.userId);
      if (!sessionId) throw new WsException('No active session found');

      const aiResponse = await this.aiInterviewApi.submitAnswer({
        user_id: data.userId,
        session_id: sessionId,
        answer: data.answer,
      });

      const record = await this.interviewService.submitAnswer(
        data.id,
        data.answer,
        aiResponse.feedback || aiResponse.evaluation || 'Answer recorded',
      );

      // Extract score from AI response (assuming it's provided)
      const score = aiResponse.score || this.extractScoreFromFeedback(aiResponse.feedback);

      // Update enhanced session with answer and feedback
      await this.enhancedInterviewService.addQuestionAnswer(
        sessionId,
        record.question!,
        data.answer,
        data.audioUrl,
        data.videoUrl,
        data.responseDuration,
        record.feedback,
        score,
      );

      this.server.to(data.userId).emit('feedback', {
        id: record._id,
        feedback: record.feedback,
        score: score,
        aiResponse: aiResponse,
      });

      if (aiResponse.next_question || aiResponse.question) {
        const nextQuestion = aiResponse.next_question || aiResponse.question;
        const nextRecord = await this.interviewService.create(
          data.userId,
          'behavioral',
          nextQuestion,
        );

        // Add next question to enhanced session
        await this.enhancedInterviewService.addQuestionAnswer(
          sessionId,
          nextQuestion,
        );

        this.server.to(data.userId).emit('question', {
          id: nextRecord._id,
          question: nextRecord.question,
        });
      } else {
        // Interview completed
        try {
          const finalReport = await this.aiInterviewApi.getInterviewReport(
            data.userId,
            sessionId,
          );

          // Complete enhanced session with final scores
          await this.enhancedInterviewService.completeSession(
            sessionId,
            finalReport,
            {
              overall: finalReport.overall_score || score,
              communication: finalReport.communication_score,
              behavioral: finalReport.behavioral_score,
            }
          );

          this.server.to(data.userId).emit('finalReport', {
            ...finalReport,
            round: 'behavioral',
            sessionId: sessionId,
          });
          
          this.sessionMap.delete(data.userId);
        } catch (reportErr) {
          const results = await this.interviewService.getResultsForRound(
            data.userId,
            'behavioral',
          );

          // Complete session with basic results
          await this.enhancedInterviewService.completeSession(
            sessionId,
            results,
            { overall: score || 5 }
          );

          this.server.to(data.userId).emit('finalReport', results);
          this.sessionMap.delete(data.userId);
        }
      }
    } catch (err) {
      this.logger.error('Answer Error:', err);
      throw new WsException(
        err instanceof Error ? err.message : 'Unknown WebSocket error',
      );
    }
  }

  @SubscribeMessage('pause')
  async handlePause(
    @MessageBody() data: { userId: string },
  ) {
    const sessionId = this.sessionMap.get(data.userId);
    if (sessionId) {
      // Update session status to paused
      const session = await this.enhancedInterviewService.getSessionById(sessionId);
      session.status = 'paused' as any;
      session.pausedAt = new Date();
      await session.save();
      
      this.server.to(data.userId).emit('paused', { sessionId });
    }
  }

  @SubscribeMessage('resume')
  async handleResume(
    @MessageBody() data: { userId: string },
  ) {
    const sessionId = this.sessionMap.get(data.userId);
    if (sessionId) {
      const session = await this.enhancedInterviewService.getSessionById(sessionId);
      session.status = 'active' as any;
      session.pausedAt = undefined;
      await session.save();
      
      this.server.to(data.userId).emit('resumed', { sessionId });
    }
  }

  private extractScoreFromFeedback(feedback?: string): number {
    if (!feedback) return 5; // Default score
    
    // Try to extract numerical score from feedback
    const scoreMatch = feedback.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*10|out\s+of\s+10)/i);
    if (scoreMatch) {
      return Math.min(10, Math.max(0, parseFloat(scoreMatch[1])));
    }
    
    // Fallback to keyword-based scoring
    const lowerFeedback = feedback.toLowerCase();
    if (lowerFeedback.includes('excellent') || lowerFeedback.includes('outstanding')) return 9;
    if (lowerFeedback.includes('good') || lowerFeedback.includes('well')) return 7;
    if (lowerFeedback.includes('average') || lowerFeedback.includes('okay')) return 5;
    if (lowerFeedback.includes('poor') || lowerFeedback.includes('needs improvement')) return 3;
    
    return 5; // Default neutral score
  }
}
