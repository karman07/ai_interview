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

@WebSocketGateway({ namespace: '/hr', cors: true })
@UseFilters(AllWsExceptionsFilter)
@UseGuards(WsJwtGuard)
export class HrGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(HrGateway.name);
  private readonly MAX_QUESTIONS = 5; // HR rounds usually shorter

  constructor(
    private interviewService: InterviewService,
    private llmService: LlmService,
  ) {}

  @SubscribeMessage('start')
  async handleStart(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Start HR interview for user: ${data.userId}`);
      client.join(data.userId);

      // First HR question
      const question = await this.llmService.generateQuestion(
        'HR/final',
        data.userId,
      );

      const record = await this.interviewService.create(
        data.userId,
        'HR',
        question,
      );

      this.server
        .to(data.userId)
        .emit('question', { id: record._id, question: record.question });
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
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(
        `HR Answer received for record ${data.id} from user ${data.userId}`,
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
      this.server
        .to(data.userId)
        .emit('feedback', { id: record._id, feedback: record.feedback });

      // Count total HR questions asked
      const history = await this.interviewService.getHistory(data.userId);
      const questionCount = history.filter(
        (h) => h.round === 'HR' && h.question,
      ).length;

      if (questionCount >= this.MAX_QUESTIONS) {
        // End interview and send final report
        const results = await this.interviewService.getResults(data.userId);
        this.server.to(data.userId).emit('finalReport', results);
        this.logger.log(
          `HR interview ended for user ${data.userId}. Sent final report.`,
        );
        return;
      }

      // Generate next HR question
      const nextQuestion = await this.llmService.generateQuestion(
        'HR/final',
        data.userId,
      );
      const nextRecord = await this.interviewService.create(
        data.userId,
        'HR',
        nextQuestion,
      );

      this.server
        .to(data.userId)
        .emit('question', { id: nextRecord._id, question: nextRecord.question });
    } catch (err) {
      this.logger.error('HR Answer Error:', err);
      throw new WsException(
        err instanceof Error ? err.message : 'Unknown WebSocket error',
      );
    }
  }
}
