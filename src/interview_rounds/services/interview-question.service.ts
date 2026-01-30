import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InterviewQuestion, InterviewQuestionDocument } from '../schemas/interview-question.schema';

@Injectable()
export class InterviewQuestionService {
  private readonly logger = new Logger(InterviewQuestionService.name);

  constructor(
    @InjectModel(InterviewQuestion.name)
    private interviewQuestionModel: Model<InterviewQuestionDocument>,
  ) {}

  /**
   * Save individual question with full logging
   */
  async saveQuestion(
    userId: string,
    sessionId: string,
    questionData: any,
    questionNumber: number,
    roundType: string,
    context?: { roleTitle?: string; companyName?: string; industry?: string }
  ): Promise<InterviewQuestionDocument> {
    try {
      this.logger.log('\n╔═══════════════════════════════════════════════════════════════════╗');
      this.logger.log('║           💾 SAVING QUESTION TO MONGODB DATABASE                 ║');
      this.logger.log('╚═══════════════════════════════════════════════════════════════════╝');
      
      // ⚠️ VALIDATION: Ensure we have answer data before saving
      if (!questionData.answer || questionData.answer.trim() === '') {
        this.logger.warn('⚠️ SKIPPING SAVE - No answer provided in questionData');
        this.logger.warn(`   Question: ${questionData.question?.substring(0, 80)}`);
        this.logger.warn(`   Reason: Answer is empty or missing\n`);
        return null;
      }

      // 🔍 Check for duplicate before saving
      const existingQuestion = await this.interviewQuestionModel.findOne({
        sessionId: new Types.ObjectId(sessionId),
        questionNumber: questionNumber
      });

      if (existingQuestion) {
        this.logger.warn('⚠️ DUPLICATE DETECTED - Question already exists!');
        this.logger.warn(`   Session: ${sessionId}`);
        this.logger.warn(`   Question Number: ${questionNumber}`);
        this.logger.warn(`   Existing Doc ID: ${existingQuestion._id}`);
        this.logger.warn(`   Skipping duplicate save\n`);
        return existingQuestion;
      }

      this.logger.log(`👤 User ID: ${userId}`);
      this.logger.log(`🔑 Session ID: ${sessionId}`);
      this.logger.log(`🎯 Round Type: ${roundType.toUpperCase()}`);
      this.logger.log(`❓ Question Number: ${questionNumber}`);
      this.logger.log(`📝 Question Text: ${questionData.question?.substring(0, 150) || 'N/A'}...`);
      this.logger.log(`💬 Answer Text: ${questionData.answer?.substring(0, 150) || 'N/A'}...`);
      this.logger.log(`🎤 Transcribed Text: ${questionData.transcribed_text?.substring(0, 100) || 'N/A'}...`);
      this.logger.log(`\n📊 SCORES:`);
      this.logger.log(`   ├─ Total Score: ${questionData.evaluation?.total_score || 0}`);
      this.logger.log(`   ├─ Technical Depth: ${questionData.technical_evaluation?.technical_depth || 0}`);
      this.logger.log(`   ├─ Clarity: ${questionData.technical_evaluation?.clarity || 0}`);
      this.logger.log(`   ├─ Confidence: ${questionData.technical_evaluation?.confidence || 0}`);
      this.logger.log(`   └─ Voice Clarity: ${questionData.communication_evaluation?.voice_scores?.clarity || 0}`);
      this.logger.log(`\n🏢 CONTEXT:`);
      this.logger.log(`   ├─ Company: ${context?.companyName || 'N/A'}`);
      this.logger.log(`   ├─ Role: ${context?.roleTitle || 'N/A'}`);
      this.logger.log(`   └─ Industry: ${context?.industry || 'N/A'}`);
      this.logger.log(`\n⏳ Creating MongoDB document...`);
      
      const questionDoc = new this.interviewQuestionModel({
        userId: new Types.ObjectId(userId),
        sessionId: new Types.ObjectId(sessionId),
        questionNumber: questionNumber,
        questionText: questionData.question,
        questionType: roundType,
        answerText: questionData.answer,
        scores: {
          overall: questionData.evaluation?.total_score || 0,
          technical: questionData.technical_evaluation?.technical_depth || 0,
          clarity: questionData.technical_evaluation?.clarity || 0,
          confidence: questionData.technical_evaluation?.confidence || 0,
          communication: questionData.communication_evaluation?.voice_scores?.clarity || 0,
        },
        audioAnalysis: {
          transcription: questionData.transcribed_text,
          speechClarity: questionData.communication_evaluation?.voice_scores?.clarity || 0,
          paceScore: questionData.communication_evaluation?.voice_scores?.pace || 0,
          confidenceLevel: questionData.communication_evaluation?.voice_scores?.confidence || 0,
        },
        feedback: questionData.evaluation?.feedback,
        strengths: questionData.evaluation?.strengths || [],
        improvements: questionData.evaluation?.suggestions || [],
        aiResponse: {
          state: {
            role_title: context?.roleTitle,
            company_name: context?.companyName,
            industry: context?.industry,
          },
          evaluation: questionData.evaluation,
          technical_evaluation: questionData.technical_evaluation,
          communication_evaluation: questionData.communication_evaluation,
        },
      });

      this.logger.log(`\n💽 Saving to MongoDB...`);
      const saved = await questionDoc.save();
      
      this.logger.log('\n╔═══════════════════════════════════════════════════════════════════╗');
      this.logger.log('║              ✅ MONGODB SAVE SUCCESSFUL!                         ║');
      this.logger.log('╚═══════════════════════════════════════════════════════════════════╝');
      this.logger.log(`💾 MongoDB Document ID: ${saved._id}`);
      this.logger.log(`⏰ Saved At: ${saved.createdAt}`);
      this.logger.log(`📍 Collection: interview_questions`);
      this.logger.log(`🔢 Question Number: ${saved.questionNumber}`);
      this.logger.log(`👤 User: ${userId}`);
      this.logger.log(`🎯 Round: ${roundType}`);
      this.logger.log(`📊 Overall Score: ${saved.scores?.overall || 0}`);
      this.logger.log(`💬 Answer Length: ${saved.answerText?.length || 0} chars`);
      this.logger.log(`✅ Has Feedback: ${saved.feedback ? 'Yes' : 'No'}`);
      this.logger.log('╚═══════════════════════════════════════════════════════════════════╝\n');

      return saved;
    } catch (error) {
      // Handle duplicate key error gracefully
      if (error.code === 11000) {
        this.logger.warn('\n⚠️ DUPLICATE KEY ERROR - Question already exists (MongoDB unique index)');
        this.logger.warn(`   Session: ${sessionId}`);
        this.logger.warn(`   Question Number: ${questionNumber}`);
        this.logger.warn(`   This is normal - question was already saved\n`);
        
        // Return existing document instead of throwing error
        const existing = await this.interviewQuestionModel.findOne({
          sessionId: new Types.ObjectId(sessionId),
          questionNumber: questionNumber
        });
        return existing;
      }

      this.logger.error('\n╔═══════════════════════════════════════════════════════════════════╗');
      this.logger.error('║              ❌ MONGODB SAVE FAILED!                             ║');
      this.logger.error('╚═══════════════════════════════════════════════════════════════════╝');
      this.logger.error(`❌ Error Type: ${error.name}`);
      this.logger.error(`❌ Error Message: ${error.message}`);
      this.logger.error(`❌ User ID: ${userId}`);
      this.logger.error(`❌ Session ID: ${sessionId}`);
      this.logger.error(`❌ Question Number: ${questionNumber}`);
      this.logger.error(`❌ Round Type: ${roundType}`);
      this.logger.error(`\n❌ Full Stack Trace:\n${error.stack}`);
      this.logger.error('╚═══════════════════════════════════════════════════════════════════╝\n');
      throw error;
    }
  }

  /**
   * Get all questions for a session
   */
  async getSessionQuestions(sessionId: string): Promise<InterviewQuestionDocument[]> {
    this.logger.log(`🔍 Fetching questions for session: ${sessionId}`);
    const questions = await this.interviewQuestionModel
      .find({ sessionId: new Types.ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .exec();
    
    this.logger.log(`📊 Found ${questions.length} questions for session ${sessionId}`);
    return questions;
  }

  /**
   * Get all questions for a user
   */
  async getUserQuestions(userId: string): Promise<InterviewQuestionDocument[]> {
    this.logger.log(`🔍 Fetching all questions for user: ${userId}`);
    const questions = await this.interviewQuestionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
    
    this.logger.log(`📊 Found ${questions.length} total questions for user ${userId}`);
    return questions;
  }

  /**
   * Get analytics for a session
   */
  async getSessionAnalytics(sessionId: string): Promise<any> {
    this.logger.log(`📊 Computing analytics for session: ${sessionId}`);
    
    const questions = await this.getSessionQuestions(sessionId);
    
    if (questions.length === 0) {
      this.logger.warn(`⚠️ No questions found for session ${sessionId}`);
      return null;
    }

    const totalQuestions = questions.length;
    const avgTotalScore = questions.reduce((sum, q) => sum + (q.scores?.overall || 0), 0) / totalQuestions;
    const avgTechnicalDepth = questions.reduce((sum, q) => sum + (q.scores?.technical || 0), 0) / totalQuestions;
    const avgClarity = questions.reduce((sum, q) => sum + (q.scores?.clarity || 0), 0) / totalQuestions;
    const avgConfidence = questions.reduce((sum, q) => sum + (q.scores?.confidence || 0), 0) / totalQuestions;
    const avgVoiceClarity = questions.reduce((sum, q) => sum + (q.audioAnalysis?.speechClarity || 0), 0) / totalQuestions;
    const avgVoiceConfidence = questions.reduce((sum, q) => sum + (q.audioAnalysis?.confidenceLevel || 0), 0) / totalQuestions;
    const avgPace = questions.reduce((sum, q) => sum + (q.audioAnalysis?.paceScore || 0), 0) / totalQuestions;

    const analytics = {
      sessionId,
      userId: questions[0].userId,
      roundType: questions[0].questionType,
      totalQuestions,
      scores: {
        overall: avgTotalScore,
        technical: avgTechnicalDepth,
        clarity: avgClarity,
        confidence: avgConfidence,
        communication: avgVoiceClarity,
      },
      voiceMetrics: {
        avgClarity: avgVoiceClarity,
        avgConfidence: avgVoiceConfidence,
        avgPace,
      },
      questions: questions.map((q, index) => ({
        questionNumber: index + 1,
        question: q.questionText,
        answer: q.answerText,
        totalScore: q.scores?.overall || 0,
        technicalDepth: q.scores?.technical || 0,
        clarity: q.scores?.clarity || 0,
        feedback: q.feedback,
        suggestions: q.improvements || [],
      })),
      roleTitle: questions[0].aiResponse?.state?.role_title || 'N/A',
      companyName: questions[0].aiResponse?.state?.company_name || 'N/A',
      industry: questions[0].aiResponse?.state?.industry || 'N/A',
    };

    this.logger.log(`✅ Analytics computed for session ${sessionId}:`);
    this.logger.log(`   Total Questions: ${totalQuestions}`);
    this.logger.log(`   Overall Score: ${avgTotalScore.toFixed(2)}`);
    this.logger.log(`   Technical Score: ${avgTechnicalDepth.toFixed(2)}`);
    this.logger.log(`   Communication Score: ${avgVoiceClarity.toFixed(2)}`);

    return analytics;
  }

  /**
   * Get user's interview sessions with analytics
   */
  async getUserInterviewSessions(userId: string): Promise<any[]> {
    this.logger.log(`📊 Fetching interview sessions for user: ${userId}`);
    
    const questions = await this.getUserQuestions(userId);
    
    // Group by session
    const sessionMap = new Map<string, InterviewQuestionDocument[]>();
    questions.forEach(q => {
      const sessionIdStr = q.sessionId.toString();
      if (!sessionMap.has(sessionIdStr)) {
        sessionMap.set(sessionIdStr, []);
      }
      sessionMap.get(sessionIdStr).push(q);
    });

    const sessions = [];
    for (const [sessionId, sessionQuestions] of sessionMap.entries()) {
      const analytics = await this.getSessionAnalytics(sessionId);
      sessions.push({
        ...analytics,
        completedAt: sessionQuestions[sessionQuestions.length - 1]?.createdAt,
      });
    }

    this.logger.log(`✅ Found ${sessions.length} interview sessions for user ${userId}`);
    return sessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  /**
   * Delete all questions for a session
   */
  async deleteSessionQuestions(sessionId: string): Promise<number> {
    this.logger.log(`🗑️ Deleting questions for session: ${sessionId}`);
    const result = await this.interviewQuestionModel.deleteMany({ sessionId }).exec();
    this.logger.log(`✅ Deleted ${result.deletedCount} questions for session ${sessionId}`);
    return result.deletedCount;
  }
}
