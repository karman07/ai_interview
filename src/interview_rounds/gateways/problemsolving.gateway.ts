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

@WebSocketGateway({ namespace: '/problem', cors: true })
@UseFilters(AllWsExceptionsFilter)
@UseGuards(WsJwtGuard)
export class ProblemSolvingGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ProblemSolvingGateway.name);
  private readonly MAX_QUESTIONS = 7;
  private sessionMap = new Map<string, string>();

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
      this.logger.log(`Start Problem-Solving interview for user: ${data.userId}`);
      client.join(data.userId);

      await this.interviewService.resetRound(data.userId, 'problem-solving');

      const sessionId = `problem-${data.userId}-${Date.now()}`;
      this.sessionMap.set(data.userId, sessionId);

      const aiResponse = await this.aiInterviewApi.startInterview({
        user_id: data.userId,
        session_id: sessionId,
        role_title: data.role || 'Problem Solver',
        company_name: data.company || 'Tech Company',
        industry: 'Software',
        jd: data.jobDescription || 'Role requiring strong problem-solving skills',
        cv: data.cv || data.experience || 'Experienced problem solver',
        round_type: 'full',
      });

      await this.interviewService.startWithContext({
        userId: data.userId,
        round: 'problem-solving',
        role: data.role,
        company: data.company,
        jobDescription: data.jobDescription,
        experience: data.experience,
      });

      const record = await this.interviewService.create(
        data.userId,
        'problem-solving',
        aiResponse.question || aiResponse.current_question || 'How would you approach a complex algorithmic problem?',
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
    @MessageBody() data: { id: string; userId: string; answer: string },
  ) {
    try {
      this.logger.log(
        `Problem-Solving Answer received for record ${data.id} from user ${data.userId}`,
      );

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

      this.server.to(data.userId).emit('feedback', {
        id: record._id,
        feedback: record.feedback,
        aiResponse: aiResponse,
      });

      if (aiResponse.next_question || aiResponse.question) {
        const nextQuestion = aiResponse.next_question || aiResponse.question;
        const nextRecord = await this.interviewService.create(
          data.userId,
          'problem-solving',
          nextQuestion,
        );

        this.server.to(data.userId).emit('question', {
          id: nextRecord._id,
          question: nextRecord.question,
        });
      } else {
        try {
          const finalReport = await this.aiInterviewApi.getInterviewReport(
            data.userId,
            sessionId,
          );
          this.server.to(data.userId).emit('finalReport', {
            ...finalReport,
            round: 'problem-solving',
          });
          this.sessionMap.delete(data.userId);
        } catch (reportErr) {
          const results = await this.interviewService.getResultsForRound(
            data.userId,
            'problem-solving',
          );
          this.server.to(data.userId).emit('finalReport', results);
        }
      }
    } catch (err) {
      this.logger.error('Problem-Solving Answer Error:', err);
      throw new WsException(
        err instanceof Error ? err.message : 'Unknown WebSocket error',
      );
    }
  }
}
