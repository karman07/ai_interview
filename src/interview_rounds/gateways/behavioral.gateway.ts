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

@WebSocketGateway({ namespace: '/behavioral', cors: true })
@UseFilters(AllWsExceptionsFilter)
@UseGuards(WsJwtGuard)
export class BehaviorGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(BehaviorGateway.name);
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
      this.logger.log(`Start behavioral interview for user: ${data.userId}`);
      client.join(data.userId);

      // Reset current behavioral session
      await this.interviewService.resetRound(data.userId, 'behavioral');

      // Save context info
      if (data.role || data.company || data.jobDescription || data.experience) {
        await this.interviewService.startWithContext({
          userId: data.userId,
          round: 'behavioral',
          role: data.role,
          company: data.company,
          jobDescription: data.jobDescription,
          experience: data.experience,
        });
      }

      // First question
      const question = await this.llmService.generateQuestion(
        'behavioral',
        data.userId,
      );

      const record = await this.interviewService.create(
        data.userId,
        'behavioral',
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
      this.logger.log(`Answer received for ${data.id} from ${data.userId}`);

      const interview = await this.interviewService.findById(data.id);
      if (!interview) throw new WsException('Interview record not found');

      // Evaluate
      const feedback = await this.llmService.evaluateAnswer(
        interview.question || '',
        data.answer,
      );

      const record = await this.interviewService.submitAnswer(
        data.id,
        data.answer,
        feedback,
      );

      // Feedback (client keeps hidden until final report)
      this.server.to(data.userId).emit('feedback', {
        id: record._id,
        feedback: record.feedback,
      });

      // Count answered in current behavioral round
      const history = await this.interviewService.getHistoryForRound(
        data.userId,
        'behavioral',
      );
      const questionCount = history.length;

      if (questionCount >= this.MAX_QUESTIONS) {
        // Build responses (latest 10)
        const lastTen = history.slice(-this.MAX_QUESTIONS).map((h) => ({
          _id: h._id,
          question: h.question || '',
          answer: h.answer || '',
          feedback: h.feedback || '',
        }));

        const results = await this.interviewService.getResultsForRound(
          data.userId,
          'behavioral',
        );

        const overallFeedback = `Average Score: ${results.averageScore}. Completed ${questionCount}/${this.MAX_QUESTIONS} behavioral questions.`;

        this.server.to(data.userId).emit('finalReport', {
          responses: lastTen,
          overallFeedback,
          results,
        });

        this.logger.log(`Interview finished for ${data.userId}`);
        return;
      }

      // Next Q
      const nextQuestion = await this.llmService.generateQuestion(
        'behavioral',
        data.userId,
      );
      const nextRecord = await this.interviewService.create(
        data.userId,
        'behavioral',
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
