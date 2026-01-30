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
import { InterviewResultService } from '../services/interview-result.service';
import { InterviewQuestionService } from '../services/interview-question.service';
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
    private interviewResultService: InterviewResultService,
    private interviewQuestionService: InterviewQuestionService,
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
        cv: data.cv || data.experience || 'default_cv_id',
        jd: data.jobDescription || 'default_jd_id',
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

      // 💾 SAVE EACH QUESTION IMMEDIATELY TO DATABASE
      this.logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.log('📥 ANSWER RECEIVED - TRIGGERING MONGODB SAVE (PROBLEM-SOLVING ROUND)');
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (aiResponse.state && aiResponse.state.history && aiResponse.state.history.length > 0) {
        const latestQuestion = aiResponse.state.history[aiResponse.state.history.length - 1];
        const questionNumber = aiResponse.state.history.length;
        
        this.logger.log(`🔍 Extracted question ${questionNumber} from AI response history`);
        this.logger.log(`💬 Question preview: ${latestQuestion.question?.substring(0, 80)}...`);
        this.logger.log(`🗨️ Answer preview: ${latestQuestion.answer?.substring(0, 80)}...`);
        this.logger.log(`🔽 Calling InterviewQuestionService.saveQuestion()...\n`);
        
        try {
          await this.interviewQuestionService.saveQuestion(
            data.userId,
            sessionId,
            latestQuestion,
            questionNumber,
            'problem-solving',
            {
              roleTitle: aiResponse.state.role_title,
              companyName: aiResponse.state.company_name,
              industry: aiResponse.state.industry,
            }
          );
          
          this.logger.log(`✅ Gateway confirmed: Question ${questionNumber} saved to MongoDB successfully!\n`);
        } catch (saveError) {
          this.logger.error(`❌ Gateway error: Failed to save question ${questionNumber}`);
          this.logger.error(`❌ Error message: ${saveError.message}`);
          this.logger.error(`❌ Stack: ${saveError.stack}\n`);
        }
      } else {
        this.logger.warn('⚠️ No question history found in AI response - skipping save');
      }

      // Check if interview is complete (next_question is null or undefined)
      if (aiResponse.next_question !== null && aiResponse.next_question !== undefined) {
        const nextQuestion = aiResponse.next_question;
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
