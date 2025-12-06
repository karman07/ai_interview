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
import { AiInterviewApiService } from '../services/ai-interview-api.service';
import { AllWsExceptionsFilter } from 'src/common/filters/ws-exception.filter';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';

@WebSocketGateway({ namespace: '/technical', cors: true })
@UseFilters(AllWsExceptionsFilter)
@UseGuards(WsJwtGuard)
export class TechnicalGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TechnicalGateway.name);
  private readonly MAX_QUESTIONS = 10;
  private sessionMap = new Map<string, string>(); // userId -> sessionId

  constructor(
    private interviewService: InterviewService,
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
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Start technical interview for user: ${data.userId}`);
      client.join(data.userId);

      // Reset local interview session
      await this.interviewService.resetRound(data.userId, 'technical');

      // Generate unique session ID
      const sessionId = `tech-${data.userId}-${Date.now()}`;
      this.sessionMap.set(data.userId, sessionId);

      // Start interview session via AI API
      const aiResponse = await this.aiInterviewApi.startInterview({
        user_id: data.userId,
        session_id: sessionId,
        role_title: data.role || 'Software Engineer',
        company_name: data.company || 'Tech Company',
        industry: 'Software',
        jd: data.jobDescription || 'Technical role requiring strong programming skills',
        cv: data.cv || data.experience || 'Experienced developer',
        round_type: 'technical',
      });

      // Save context locally
      await this.interviewService.startWithContext({
        userId: data.userId,
        round: 'technical',
        role: data.role,
        company: data.company,
        jobDescription: data.jobDescription,
        experience: data.experience,
      });

      // Create local record with first question from AI
      const record = await this.interviewService.create(
        data.userId,
        'technical',
        aiResponse.question || aiResponse.current_question || 'What is your approach to solving technical problems?',
      );

      this.server.to(data.userId).emit('question', {
        id: record._id,
        question: record.question,
        sessionId: sessionId,
        aiSessionInfo: aiResponse,
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
    @MessageBody() data: { id: string; userId: string; answer: string },
  ) {
    try {
      this.logger.log(
        `Answer received for record ${data.id} from user ${data.userId}`,
      );

      const interview = await this.interviewService.findById(data.id);
      if (!interview) throw new WsException('Interview record not found');

      const sessionId = this.sessionMap.get(data.userId);
      if (!sessionId) throw new WsException('No active session found');

      // Submit answer to AI API
      const aiResponse = await this.aiInterviewApi.submitAnswer({
        user_id: data.userId,
        session_id: sessionId,
        answer: data.answer,
      });

      // Update local record with feedback
      const record = await this.interviewService.submitAnswer(
        data.id,
        data.answer,
        aiResponse.feedback || aiResponse.evaluation || 'Answer recorded',
      );

      // Send feedback
      this.server.to(data.userId).emit('feedback', {
        id: record._id,
        feedback: record.feedback,
        score: aiResponse.score,
        aiResponse: aiResponse,
      });

      // Check if there's a next question from AI
      if (aiResponse.next_question || aiResponse.question) {
        const nextQuestion = aiResponse.next_question || aiResponse.question;
        
        const nextRecord = await this.interviewService.create(
          data.userId,
          'technical',
          nextQuestion,
        );

        this.server.to(data.userId).emit('question', {
          id: nextRecord._id,
          question: nextRecord.question,
        });
      } else {
        // Interview might be complete, get final report
        try {
          const finalReport = await this.aiInterviewApi.getInterviewReport(
            data.userId,
            sessionId,
          );
          
          this.server.to(data.userId).emit('finalReport', {
            ...finalReport,
            round: 'technical',
          });
          
          this.sessionMap.delete(data.userId);
        } catch (reportErr) {
          this.logger.warn('Could not fetch final report:', reportErr);
          // Fallback to local results
          const results = await this.interviewService.getResultsForRound(
            data.userId,
            'technical',
          );
          this.server.to(data.userId).emit('finalReport', results);
        }
      }
    } catch (err) {
      this.logger.error('Answer Submission Error:', err);
      throw new WsException(
        err instanceof Error ? err.message : 'Unknown WebSocket error',
      );
    }
  }
}
