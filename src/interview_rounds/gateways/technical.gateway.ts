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
    private interviewQuestionService: InterviewQuestionService,
    private interviewResultService: InterviewResultService,
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
        cv: data.cv || data.experience || 'default_cv_id',
        jd: data.jobDescription || 'default_jd_id',
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
    @MessageBody() data: { 
      id: string; 
      userId: string; 
      answer: string;
      audioFilePath?: string; // Path to uploaded audio file
    },
  ) {
    try {
      this.logger.log(
        `Answer received for record ${data.id} from user ${data.userId}`,
      );
      console.log(`🎤 Technical Gateway - answer received with audio: ${data.audioFilePath ? 'Yes' : 'No'}`);

      const interview = await this.interviewService.findById(data.id);
      if (!interview) throw new WsException('Interview record not found');

      const sessionId = this.sessionMap.get(data.userId);
      if (!sessionId) throw new WsException('No active session found');

      let aiResponse;
      
      // Submit answer to AI API - prefer audio if available
      if (data.audioFilePath) {
        console.log(`🎤 Submitting audio answer: ${data.audioFilePath}`);
        aiResponse = await this.aiInterviewApi.submitVoiceAnswer({
          user_id: data.userId,
          session_id: sessionId,
          audio_file_path: data.audioFilePath,
        });
      } else {
        console.log(`📝 Submitting text answer: ${data.answer}`);
        aiResponse = await this.aiInterviewApi.submitAnswer({
          user_id: data.userId,
          session_id: sessionId,
          answer: data.answer,
        });
      }

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

      // 💾 SAVE EACH QUESTION IMMEDIATELY TO DATABASE
      this.logger.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      this.logger.log('📥 ANSWER RECEIVED - TRIGGERING MONGODB SAVE (TECHNICAL ROUND)');
      this.logger.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // 🔍 DEBUG: Log full AI response structure
      this.logger.log(`\n🔍 AI RESPONSE STRUCTURE:`);
      this.logger.log(`   Has state: ${!!aiResponse.state}`);
      this.logger.log(`   Has history: ${!!aiResponse.state?.history}`);
      this.logger.log(`   History length: ${aiResponse.state?.history?.length || 0}`);
      this.logger.log(`   Next question: ${aiResponse.next_question !== null && aiResponse.next_question !== undefined ? 'EXISTS' : 'NULL'}`);
      
      if (aiResponse.state && aiResponse.state.history && aiResponse.state.history.length > 0) {
        const latestQuestion = aiResponse.state.history[aiResponse.state.history.length - 1];
        const questionNumber = aiResponse.state.history.length;
        
        this.logger.log(`\n🔍 LATEST QUESTION DATA INSPECTION:`);
        this.logger.log(`   Question Number: ${questionNumber}`);
        this.logger.log(`   Has question field: ${!!latestQuestion.question}`);
        this.logger.log(`   Has answer field: ${!!latestQuestion.answer}`);
        this.logger.log(`   Has evaluation: ${!!latestQuestion.evaluation}`);
        this.logger.log(`   Has technical_evaluation: ${!!latestQuestion.technical_evaluation}`);
        this.logger.log(`   Has communication_evaluation: ${!!latestQuestion.communication_evaluation}`);
        this.logger.log(`   Has transcribed_text: ${!!latestQuestion.transcribed_text}`);
        
        this.logger.log(`\n📋 QUESTION DATA PREVIEW:`);
        this.logger.log(`   Question: ${latestQuestion.question?.substring(0, 80) || 'MISSING'}...`);
        this.logger.log(`   Answer: ${latestQuestion.answer?.substring(0, 80) || 'MISSING'}...`);
        this.logger.log(`   Total Score: ${latestQuestion.evaluation?.total_score || 'MISSING'}`);
        this.logger.log(`   Feedback: ${latestQuestion.evaluation?.feedback?.substring(0, 60) || 'MISSING'}...`);
        
        this.logger.log(`\n🔽 Calling InterviewQuestionService.saveQuestion()...\n`);
        
        try {
          const savedDoc = await this.interviewQuestionService.saveQuestion(
            data.userId,
            sessionId,
            latestQuestion,
            questionNumber,
            'technical',
            {
              roleTitle: aiResponse.state.role_title,
              companyName: aiResponse.state.company_name,
              industry: aiResponse.state.industry,
            }
          );
          
          if (savedDoc) {
            this.logger.log(`✅ Gateway confirmed: Question ${questionNumber} saved to MongoDB!`);
            this.logger.log(`   Document ID: ${savedDoc._id}`);
            this.logger.log(`   Has Answer: ${!!savedDoc.answerText}`);
            this.logger.log(`   Has Scores: ${!!savedDoc.scores}`);
            this.logger.log(`   Overall Score: ${savedDoc.scores?.overall || 0}\n`);
          } else {
            this.logger.warn(`⚠️ Gateway warning: saveQuestion returned null (validation failed or duplicate)\n`);
          }
        } catch (saveError) {
          this.logger.error(`❌ Gateway error: Failed to save question ${questionNumber}`);
          this.logger.error(`❌ Error message: ${saveError.message}`);
          this.logger.error(`❌ Stack: ${saveError.stack}\n`);
        }
      } else {
        this.logger.warn('⚠️ No question history found in AI response - skipping save');
        this.logger.warn(`   aiResponse.state exists: ${!!aiResponse.state}`);
        this.logger.warn(`   aiResponse.state.history exists: ${!!aiResponse.state?.history}`);
        this.logger.warn(`   aiResponse.state.history.length: ${aiResponse.state?.history?.length || 0}\n`);
      }

      // Check if there's a next question from AI
      // Check if interview is complete (next_question is null or undefined)
      if (aiResponse.next_question !== null && aiResponse.next_question !== undefined) {
        const nextQuestion = aiResponse.next_question;
        
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
        // Interview is complete - save complete results to MongoDB
        this.logger.log('🎉 Interview completed! Saving complete results...');
        
        try {
          // Save complete interview result
          await this.interviewResultService.saveInterviewResult(
            data.userId,
            aiResponse
          );
          
          this.logger.log('✅ Complete interview results saved to MongoDB');
        } catch (saveError) {
          this.logger.error('💥 Failed to save complete interview results:', saveError.message);
          // Continue with final report even if save fails
        }
        
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
