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
import { LlmService } from '../services/llm.service';
import { AllWsExceptionsFilter } from 'src/common/filters/ws-exception.filter';
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';

@WebSocketGateway({ namespace: '/technical', cors: true })
@UseFilters(AllWsExceptionsFilter)
@UseGuards(WsJwtGuard)
export class TechnicalGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TechnicalGateway.name);
  private readonly MAX_QUESTIONS = 10;

  constructor(
    private interviewService: InterviewService,
    private llmService: LlmService,
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
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Start technical interview for user: ${data.userId}`);
      client.join(data.userId);

      // 🚀 Reset interview session for this round
      await this.interviewService.resetRound(data.userId, 'technical');

      // Save interview context if provided
      if (data.role || data.company || data.jobDescription || data.experience) {
        await this.interviewService.startWithContext({
          userId: data.userId,
          round: 'technical',
          role: data.role,
          company: data.company,
          jobDescription: data.jobDescription,
          experience: data.experience,
        });
      }

      // First question
      const question = await this.llmService.generateQuestion(
        'technical',
        data.userId,
      );

      const record = await this.interviewService.create(
        data.userId,
        'technical',
        question,
      );

      this.server.to(data.userId).emit('question', {
        id: record._id,
        question: record.question,
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

      // Evaluate answer
      const feedback = await this.llmService.evaluateAnswer(
        interview.question || '',
        data.answer,
      );

      const record = await this.interviewService.submitAnswer(
        data.id,
        data.answer,
        feedback,
      );

      // Send feedback
      this.server.to(data.userId).emit('feedback', {
        id: record._id,
        feedback: record.feedback,
      });

      // Count questions for this round only
      const history = await this.interviewService.getHistoryForRound(
        data.userId,
        'technical',
      );
      const questionCount = history.length;

      if (questionCount >= this.MAX_QUESTIONS) {
        const allHistory = history.map((h) => ({
          question: h.question || '',
          answer: h.answer || '',
          feedback: h.feedback || '',
          _id: h._id,
        }));

        const results = await this.interviewService.getResultsForRound(
          data.userId,
          'technical',
        );

        const overallFeedback = `Average Score: ${results.averageScore}. Completed ${questionCount}/${this.MAX_QUESTIONS} questions.`;

        this.server.to(data.userId).emit('finalReport', {
          responses: allHistory,
          overallFeedback,
          results,
        });

        this.logger.log(`Technical interview finished for ${data.userId}`);
        return;
      }

      // Generate next question
      const nextQuestion = await this.llmService.generateQuestion(
        'technical',
        data.userId,
      );
      const nextRecord = await this.interviewService.create(
        data.userId,
        'technical',
        nextQuestion,
      );

      this.server.to(data.userId).emit('question', {
        id: nextRecord._id,
        question: nextRecord.question,
      });
    } catch (err) {
      this.logger.error('Answer Error:', err);
      throw new WsException(
        err instanceof Error ? err.message : 'Unknown WebSocket error',
      );
    }
  }
}
