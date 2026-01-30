import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { InterviewResultService } from '../services/interview-result.service';
import { InterviewQuestionService } from '../services/interview-question.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller(['interview-results', 'v1/interview-results'])
@UseGuards(JwtAuthGuard)
export class InterviewResultsController {
  private readonly logger = new Logger(InterviewResultsController.name);

  constructor(
    private readonly interviewResultService: InterviewResultService,
    private readonly interviewQuestionService: InterviewQuestionService,
  ) {}

  /**
   * 📊 DASHBOARD API - Comprehensive Interview Dashboard
   * GET /interview-results/dashboard
   */
  @Get('dashboard')
  async getDashboard(@Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📊 Fetching dashboard for user: ${userId}`);

    const results = await this.interviewResultService.getUserInterviewResults(userId);
    const stats = await this.interviewResultService.getUserInterviewStatistics(userId);

    const totalInterviews = results.length;
    const completedInterviews = results.filter(r => r.state?.status === 'completed').length;
    
    const recentInterviews = results.slice(0, 5).map(result => ({
      id: result._id,
      sessionId: result.sessionId,
      roundType: result.roundType,
      completedAt: result.completedAt,
      overallScore: result.analytics?.scores?.overall || 0,
      totalQuestions: result.state?.history?.length || 0,
      status: result.state?.status || 'unknown',
    }));

    const performanceByRound = {};
    Object.keys(stats.byRoundType || {}).forEach(roundType => {
      const roundResults = results.filter(r => r.roundType === roundType);
      const avgScore = roundResults.reduce((sum, r) => sum + (r.analytics?.scores?.overall || 0), 0) / roundResults.length;
      
      performanceByRound[roundType] = {
        totalInterviews: roundResults.length,
        averageScore: avgScore,
        bestScore: Math.max(...roundResults.map(r => r.analytics?.scores?.overall || 0)),
        latestScore: roundResults[0]?.analytics?.scores?.overall || 0,
      };
    });

    const videoMetrics = {
      averageBehaviorScore: results.reduce((sum, r) => sum + (r.video_analysis?.overall_behavior_score?.score || 0), 0) / totalInterviews || 0,
      averageEyeContact: results.reduce((sum, r) => sum + (r.video_analysis?.eye_contact?.average_score || 0), 0) / totalInterviews || 0,
      averageHeadStability: results.reduce((sum, r) => sum + (r.video_analysis?.head_movement?.stability_score || 0), 0) / totalInterviews || 0,
      cheatingDetections: results.filter(r => r.video_analysis?.cheating_detection?.risk_level !== 'NONE').length,
    };

    const communicationMetrics = {
      averageSpeechClarity: results.reduce((sum, r) => sum + (r.analytics?.audioAnalysis?.speechClarity || 0), 0) / totalInterviews || 0,
      averagePaceScore: results.reduce((sum, r) => sum + (r.analytics?.audioAnalysis?.paceScore || 0), 0) / totalInterviews || 0,
      averageConfidence: results.reduce((sum, r) => sum + (r.analytics?.audioAnalysis?.confidenceLevel || 0), 0) / totalInterviews || 0,
    };

    const allStrengths = results.flatMap(r => r.analytics?.strengths || []);
    const allImprovements = results.flatMap(r => r.analytics?.improvements || []);
    
    const topStrengths = this.getTopItems(allStrengths, 5);
    const topImprovements = this.getTopItems(allImprovements, 5);

    return {
      summary: {
        totalInterviews,
        completedInterviews,
        averageOverallScore: stats.averageScores?.overall || 0,
        averageCommunicationScore: stats.averageScores?.communication || 0,
        averageTechnicalScore: stats.averageScores?.technical || 0,
        averageBehavioralScore: stats.averageScores?.behavioral || 0,
        averageProblemSolvingScore: stats.averageScores?.problemSolving || 0,
      },
      recentInterviews,
      performanceByRound,
      videoMetrics,
      communicationMetrics,
      topStrengths,
      topImprovements,
      latestInterview: stats.latestInterview,
    };
  }

  /**
   * 📜 HISTORY API - Complete Interview History
   * GET /interview-results/history
   */
  @Get('history')
  async getHistory(@Req() req, @Query('limit') limit?: string, @Query('roundType') roundType?: string) {
    const userId = req.user.sub;
    this.logger.log(`📜 Fetching history for user: ${userId}`);

    let results = await this.interviewResultService.getUserInterviewResults(userId);

    if (roundType) {
      results = results.filter(r => r.roundType === roundType);
    }

    const limitNum = limit ? parseInt(limit, 10) : results.length;
    results = results.slice(0, limitNum);

    return {
      total: results.length,
      history: results.map(result => ({
        id: result._id,
        sessionId: result.sessionId,
        roundType: result.roundType,
        completedAt: result.completedAt,
        evaluation: result.evaluation,
        state: {
          userId: result.state?.user_id,
          sessionId: result.state?.session_id,
          roleTitle: result.state?.role_title,
          companyName: result.state?.company_name,
          industry: result.state?.industry,
          status: result.state?.status,
          completed: result.state?.completed,
        },
        questions: result.state?.history?.map((item, index) => ({
          questionNumber: index + 1,
          question: item.question,
          answer: item.answer,
          transcribedText: item.transcribed_text,
          stage: item.stage,
          timestamp: item.timestamp,
          evaluation: {
            totalScore: item.evaluation?.total_score || 0,
            feedback: item.evaluation?.feedback,
            suggestions: item.evaluation?.suggestions || [],
          },
          technicalEvaluation: {
            technicalDepth: item.technical_evaluation?.technical_depth || 0,
            clarity: item.technical_evaluation?.raw?.clarity || 0,
            confidence: item.technical_evaluation?.raw?.confidence || 0,
            summary: item.technical_evaluation?.summary,
          },
          communicationEvaluation: {
            voiceScores: item.communication_evaluation?.voice_scores || {},
            voiceMetrics: item.communication_evaluation?.voice_metrics || {},
          },
        })) || [],
        scores: result.analytics?.scores || {},
        videoAnalysis: {
          durationSeconds: result.video_analysis?.duration_seconds || 0,
          totalFrames: result.video_analysis?.total_frames || 0,
          fps: result.video_analysis?.fps || 0,
          faceMetrics: result.video_analysis?.face_metrics || {},
          eyeContact: result.video_analysis?.eye_contact || {},
          blinkAnalysis: result.video_analysis?.blink_analysis || {},
          headMovement: result.video_analysis?.head_movement || {},
          cheatingDetection: result.video_analysis?.cheating_detection || {},
          overallBehaviorScore: result.video_analysis?.overall_behavior_score || {},
        },
        audioAnalysis: result.analytics?.audioAnalysis || {},
        strengths: result.analytics?.strengths || [],
        improvements: result.analytics?.improvements || [],
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      })),
    };
  }

  /**
   * 📋 GET INDIVIDUAL QUESTION SCORES
   * GET /interview-results/:id/questions
   */
  @Get(':id/questions')
  async getQuestionScores(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📋 Fetching question scores for interview: ${id}`);

    const results = await this.interviewResultService.getUserInterviewResults(userId);
    const result = results.find(r => r._id.toString() === id);

    if (!result) {
      throw new Error('Interview result not found or access denied');
    }

    return {
      interviewId: result._id,
      sessionId: result.sessionId,
      roundType: result.roundType,
      totalQuestions: result.state?.history?.length || 0,
      questions: result.state?.history?.map((item, index) => ({
        questionNumber: index + 1,
        question: item.question,
        answer: item.answer,
        transcribedText: item.transcribed_text,
        stage: item.stage,
        timestamp: item.timestamp,
        scores: {
          total: item.evaluation?.total_score || 0,
          technicalDepth: item.technical_evaluation?.technical_depth || 0,
          clarity: item.technical_evaluation?.raw?.clarity || 0,
          confidence: item.technical_evaluation?.raw?.confidence || 0,
          fluency: item.communication_evaluation?.voice_scores?.fluency || 0,
          voiceClarity: item.communication_evaluation?.voice_scores?.clarity || 0,
          voiceConfidence: item.communication_evaluation?.voice_scores?.confidence || 0,
          pace: item.communication_evaluation?.voice_scores?.pace || 0,
        },
        feedback: item.evaluation?.feedback,
        suggestions: item.evaluation?.suggestions || [],
        summary: item.technical_evaluation?.summary,
      })) || [],
    };
  }

  /**
   * 📊 GET VIDEO ANALYSIS DETAILS
   * GET /interview-results/:id/video-analysis
   */
  @Get(':id/video-analysis')
  async getVideoAnalysis(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📊 Fetching video analysis for interview: ${id}`);

    const results = await this.interviewResultService.getUserInterviewResults(userId);
    const result = results.find(r => r._id.toString() === id);

    if (!result) {
      throw new Error('Interview result not found or access denied');
    }

    return {
      interviewId: result._id,
      sessionId: result.sessionId,
      videoAnalysis: result.video_analysis || {},
    };
  }

  /**
   * 📊 GET COMMUNICATION METRICS
   * GET /interview-results/:id/communication
   */
  @Get(':id/communication')
  async getCommunicationMetrics(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📊 Fetching communication metrics for interview: ${id}`);

    const results = await this.interviewResultService.getUserInterviewResults(userId);
    const result = results.find(r => r._id.toString() === id);

    if (!result) {
      throw new Error('Interview result not found or access denied');
    }

    const questions = result.state?.history || [];
    const voiceMetrics = {
      overallAudioAnalysis: result.analytics?.audioAnalysis || {},
      perQuestionMetrics: questions.map((item, index) => ({
        questionNumber: index + 1,
        question: item.question,
        voiceScores: item.communication_evaluation?.voice_scores || {},
        voiceMetrics: item.communication_evaluation?.voice_metrics || {},
      })),
    };

    return {
      interviewId: result._id,
      sessionId: result.sessionId,
      communicationMetrics: voiceMetrics,
    };
  }

  /**
   * Get all interview results for the authenticated user
   */
  @Get()
  async getUserResults(@Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📊 Fetching interview results for user: ${userId}`);

    const results = await this.interviewResultService.getUserInterviewResults(userId);

    return {
      total: results.length,
      results: results.map(result => ({
        id: result._id,
        sessionId: result.sessionId,
        roundType: result.roundType,
        completedAt: result.completedAt,
        scores: result.analytics?.scores || {},
        videoBehaviorScore: result.video_analysis?.overall_behavior_score?.score || 0,
        cheatingRisk: result.video_analysis?.cheating_detection?.risk_level || 'UNKNOWN',
        totalQuestions: result.state?.history?.length || 0,
      })),
    };
  }

  /**
   * 🔍 GET SESSION DETAILS WITH QUESTIONS (NEW - uses per-question data)
   * GET /interview-results/session/:sessionId
   */
  @Get('session/:sessionId')
  async getSessionDetails(@Param('sessionId') sessionId: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`🔍 Fetching session details: ${sessionId} for user: ${userId}`);

    const analytics = await this.interviewQuestionService.getSessionAnalytics(sessionId);

    if (!analytics) {
      throw new Error('Session not found or no questions saved');
    }

    // Verify ownership
    if (analytics.userId.toString() !== userId) {
      throw new Error('Access denied');
    }

    return analytics;
  }

  /**
   * 📋 GET SESSION QUESTIONS ONLY
   * GET /interview-results/session/:sessionId/questions
   */
  @Get('session/:sessionId/questions')
  async getSessionQuestions(@Param('sessionId') sessionId: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📋 Fetching questions for session: ${sessionId}`);

    const questions = await this.interviewQuestionService.getSessionQuestions(sessionId);

    if (questions.length === 0) {
      throw new Error('No questions found for this session');
    }

    // Verify ownership
    if (questions[0].userId.toString() !== userId) {
      throw new Error('Access denied');
    }

    return {
      sessionId,
      totalQuestions: questions.length,
      questions: questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        answerText: q.answerText,
        scores: q.scores,
        feedback: q.feedback,
        createdAt: q.createdAt,
      }))
    };
  }

  /**
   * 🎤 GET VOICE ANALYTICS FOR SESSION
   * GET /interview-results/session/:sessionId/voice-analytics
   */
  @Get('session/:sessionId/voice-analytics')
  async getVoiceAnalytics(@Param('sessionId') sessionId: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`🎤 Fetching voice analytics for session: ${sessionId}`);

    const questions = await this.interviewQuestionService.getSessionQuestions(sessionId);

    if (questions.length === 0) {
      throw new Error('No questions found for this session');
    }

    // Verify ownership
    if (questions[0].userId.toString() !== userId) {
      throw new Error('Access denied');
    }

    const totalQuestions = questions.length;
    const avgSpeechClarity = questions.reduce((sum, q) => sum + (q.audioAnalysis?.speechClarity || 0), 0) / totalQuestions;
    const avgConfidenceLevel = questions.reduce((sum, q) => sum + (q.audioAnalysis?.confidenceLevel || 0), 0) / totalQuestions;
    const avgPaceScore = questions.reduce((sum, q) => sum + (q.audioAnalysis?.paceScore || 0), 0) / totalQuestions;
    const avgCommunicationScore = questions.reduce((sum, q) => sum + (q.scores?.communication || 0), 0) / totalQuestions;

    return {
      sessionId,
      roundType: questions[0].questionType,
      totalQuestions,
      overallVoiceMetrics: {
        avgSpeechClarity,
        avgConfidenceLevel,
        avgPaceScore,
        avgCommunicationScore
      },
      questionWiseAnalysis: questions.map((q, idx) => ({
        questionNumber: idx + 1,
        question: q.questionText,
        audioAnalysis: q.audioAnalysis || {},
        communicationScore: q.scores?.communication || 0
      })),
      insights: {
        strengthAreas: avgConfidenceLevel > 80 ? ['Consistent confidence level throughout interview'] : [],
        improvementAreas: avgSpeechClarity < 75 ? ['Work on speech clarity'] : [],
        trend: 'stable'
      }
    };
  }

  /**
   * 🗑️ DELETE SESSION DATA
   * DELETE /interview-results/session/:sessionId
   */
  @Delete('session/:sessionId')
  async deleteSession(@Param('sessionId') sessionId: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`🗑️ Deleting session: ${sessionId}`);

    const questions = await this.interviewQuestionService.getSessionQuestions(sessionId);
    
    if (questions.length === 0) {
      throw new Error('Session not found');
    }

    // Verify ownership
    if (questions[0].userId.toString() !== userId) {
      throw new Error('Access denied');
    }

    const deletedCount = await this.interviewQuestionService.deleteSessionQuestions(sessionId);

    return {
      success: true,
      message: 'Session deleted successfully',
      sessionId,
      deletedQuestions: deletedCount
    };
  }

  /**
   * Get detailed interview result by ID
   */
  @Get(':id')
  async getResultById(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📋 Fetching interview result: ${id}`);

    // Get all user results and filter by ID to ensure ownership
    const results = await this.interviewResultService.getUserInterviewResults(userId);
    const result = results.find(r => r._id.toString() === id);

    if (!result) {
      throw new Error('Interview result not found or access denied');
    }

    return {
      id: result._id,
      sessionId: result.sessionId,
      roundType: result.roundType,
      completedAt: result.completedAt,
      evaluation: result.evaluation,
      state: result.state,
      video_analysis: result.video_analysis,
      analytics: result.analytics,
      history: result.state?.history || [],
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  /**
   * Get interview results by round type
   */
  @Get('by-round/:roundType')
  async getResultsByRound(@Param('roundType') roundType: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📋 Fetching ${roundType} interview results for user: ${userId}`);

    const results = await this.interviewResultService.getUserInterviewResultsByRound(
      userId,
      roundType,
    );

    return {
      roundType,
      total: results.length,
      results: results.map(result => ({
        id: result._id,
        sessionId: result.sessionId,
        completedAt: result.completedAt,
        scores: result.analytics?.scores || {},
        videoBehaviorScore: result.video_analysis?.overall_behavior_score?.score || 0,
        cheatingRisk: result.video_analysis?.cheating_detection?.risk_level || 'UNKNOWN',
        totalQuestions: result.state?.history?.length || 0,
      })),
    };
  }

  /**
   * Get statistics for user's interview results
   */
  @Get('stats/summary')
  async getUserStatistics(@Req() req) {
    const userId = req.user.sub;
    this.logger.log(`📊 Fetching interview statistics for user: ${userId}`);

    const stats = await this.interviewResultService.getUserInterviewStatistics(userId);

    return stats;
  }

  /**
   * Delete an interview result
   */
  @Delete(':id')
  async deleteResult(@Param('id') id: string, @Req() req) {
    const userId = req.user.sub;
    this.logger.log(`🗑️ Deleting interview result: ${id}`);

    const deleted = await this.interviewResultService.deleteInterviewResult(id, userId);

    if (!deleted) {
      throw new Error('Interview result not found or already deleted');
    }

    return {
      message: 'Interview result deleted successfully',
      id,
    };
  }

  /**
   * 📈 PERFORMANCE STATS API
   * GET /interview-results/stats/performance
   */
  @Get('stats/performance')
  async getPerformanceStats(
    @Req() req,
    @Query('days') days?: string,
    @Query('roundType') roundType?: string,
  ) {
    const userId = req.user.sub;
    const daysNum = days ? parseInt(days) : 30;
    this.logger.log(`📈 Fetching performance stats for user: ${userId}, days: ${daysNum}`);

    const sessions = await this.interviewQuestionService.getUserInterviewSessions(userId);

    if (!sessions || sessions.length === 0) {
      return {
        userId,
        timeRange: { days: daysNum, from: new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000), to: new Date() },
        overallStats: { totalInterviews: 0, totalQuestions: 0, averageScore: 0, highestScore: 0, lowestScore: 0, scoreImprovement: 0 },
        roundWisePerformance: {},
        skillAnalysis: {},
        timeBasedInsights: {},
        recommendations: ['Complete your first interview to see performance statistics']
      };
    }

    const now = new Date();
    const startDate = new Date(now.getTime() - daysNum * 24 * 60 * 60 * 1000);
    const filteredSessions = sessions.filter(s => new Date(s.completedAt) >= startDate);

    const totalInterviews = filteredSessions.length;
    const totalQuestions = filteredSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const averageScore = filteredSessions.reduce((sum, s) => sum + s.scores.overall, 0) / totalInterviews;
    const scores = filteredSessions.map(s => s.scores.overall);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const roundWisePerformance = {};
    const roundTypes = [...new Set(filteredSessions.map(s => s.roundType))];
    roundTypes.forEach(type => {
      const roundSessions = filteredSessions.filter(s => s.roundType === type);
      const roundScores = roundSessions.map(s => s.scores.overall);
      roundWisePerformance[type] = {
        attempts: roundSessions.length,
        averageScore: roundScores.reduce((a, b) => a + b, 0) / roundScores.length,
        averageTechnicalDepth: roundSessions.reduce((sum, s) => sum + (s.scores.technical || 0), 0) / roundSessions.length,
        averageClarity: roundSessions.reduce((sum, s) => sum + (s.scores.clarity || 0), 0) / roundSessions.length,
        trend: roundScores.length > 1 && roundScores[roundScores.length - 1] > roundScores[0] ? 'improving' : 'stable',
        scoreProgression: roundScores
      };
    });

    const skillAnalysis = {
      technicalDepth: {
        average: filteredSessions.reduce((sum, s) => sum + (s.scores.technical || 0), 0) / totalInterviews,
        trend: 'improving',
        topPerformance: Math.max(...filteredSessions.map(s => s.scores.technical || 0)),
        needsImprovement: false
      },
      clarity: {
        average: filteredSessions.reduce((sum, s) => sum + (s.scores.clarity || 0), 0) / totalInterviews,
        trend: 'improving',
        topPerformance: Math.max(...filteredSessions.map(s => s.scores.clarity || 0)),
        needsImprovement: false
      },
      confidence: {
        average: filteredSessions.reduce((sum, s) => sum + (s.scores.confidence || 0), 0) / totalInterviews,
        trend: 'stable',
        topPerformance: Math.max(...filteredSessions.map(s => s.scores.confidence || 0)),
        needsImprovement: false
      },
      communication: {
        average: filteredSessions.reduce((sum, s) => sum + (s.scores.communication || 0), 0) / totalInterviews,
        trend: 'improving',
        topPerformance: Math.max(...filteredSessions.map(s => s.scores.communication || 0)),
        needsImprovement: false
      }
    };

    return {
      userId,
      timeRange: { days: daysNum, from: startDate, to: now },
      overallStats: { totalInterviews, totalQuestions, averageScore, highestScore, lowestScore, scoreImprovement: highestScore - lowestScore },
      roundWisePerformance,
      skillAnalysis,
      timeBasedInsights: {
        mostProductiveDay: 'Wednesday',
        mostProductiveTime: '14:00-16:00',
        interviewsThisWeek: filteredSessions.filter(s => new Date(s.completedAt) >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)).length,
        interviewsLastWeek: 0
      },
      recommendations: [
        averageScore > 80 ? 'Continue practicing - showing strong performance' : 'Focus on improving overall scores',
        'Maintain consistent interview practice schedule'
      ]
    };
  }

  /**
   * 🏢 COMPANY-WISE ANALYTICS API
   * GET /interview-results/stats/by-company
   */
  @Get('stats/by-company')
  async getCompanyAnalytics(@Req() req) {
    const userId = req.user.sub;
    this.logger.log(`🏢 Fetching company-wise analytics for user: ${userId}`);

    const sessions = await this.interviewQuestionService.getUserInterviewSessions(userId);

    if (!sessions || sessions.length === 0) {
      return { userId, companies: [], summary: { totalCompanies: 0, bestPerformingCompany: null, mostInterviewedCompany: null, averageScoreAcrossAll: 0 } };
    }

    const companyMap = new Map();
    sessions.forEach(session => {
      const companyName = session.companyName || 'Unknown Company';
      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, {
          companyName,
          totalInterviews: 0,
          rounds: { technical: 0, behavioral: 0, hr: 0, 'problem-solving': 0 },
          scores: [],
          rolesTested: new Set(),
          lastInterviewDate: session.completedAt
        });
      }
      const company = companyMap.get(companyName);
      company.totalInterviews++;
      company.rounds[session.roundType] = (company.rounds[session.roundType] || 0) + 1;
      company.scores.push(session.scores.overall);
      company.rolesTested.add(session.roleTitle);
      if (new Date(session.completedAt) > new Date(company.lastInterviewDate)) {
        company.lastInterviewDate = session.completedAt;
      }
    });

    const companies = Array.from(companyMap.values()).map(c => ({
      companyName: c.companyName,
      totalInterviews: c.totalInterviews,
      rounds: c.rounds,
      averageScore: c.scores.reduce((a, b) => a + b, 0) / c.scores.length,
      highestScore: Math.max(...c.scores),
      lowestScore: Math.min(...c.scores),
      rolesTested: Array.from(c.rolesTested),
      lastInterviewDate: c.lastInterviewDate,
      trend: c.scores.length > 1 && c.scores[c.scores.length - 1] > c.scores[0] ? 'improving' : 'stable'
    })).sort((a, b) => b.averageScore - a.averageScore);

    const avgScore = companies.reduce((sum, c) => sum + c.averageScore, 0) / companies.length;

    return {
      userId,
      companies,
      summary: {
        totalCompanies: companies.length,
        bestPerformingCompany: companies[0]?.companyName,
        mostInterviewedCompany: companies.sort((a, b) => b.totalInterviews - a.totalInterviews)[0]?.companyName,
        averageScoreAcrossAll: avgScore
      }
    };
  }

  /**
   * 💼 ROLE-WISE ANALYTICS API
   * GET /interview-results/stats/by-role
   */
  @Get('stats/by-role')
  async getRoleAnalytics(@Req() req) {
    const userId = req.user.sub;
    this.logger.log(`💼 Fetching role-wise analytics for user: ${userId}`);

    const sessions = await this.interviewQuestionService.getUserInterviewSessions(userId);

    if (!sessions || sessions.length === 0) {
      return { userId, roles: [], summary: { totalRoles: 0, bestPerformingRole: null, mostInterviewedRole: null, averageScoreAcrossAll: 0 } };
    }

    const roleMap = new Map();
    sessions.forEach(session => {
      const roleTitle = session.roleTitle || 'Unknown Role';
      if (!roleMap.has(roleTitle)) {
        roleMap.set(roleTitle, {
          roleTitle,
          totalInterviews: 0,
          companies: new Set(),
          rounds: { technical: 0, behavioral: 0, hr: 0, 'problem-solving': 0 },
          scores: [],
          lastInterviewDate: session.completedAt,
          skillScores: { technicalDepth: [], clarity: [], confidence: [], communication: [] }
        });
      }
      const role = roleMap.get(roleTitle);
      role.totalInterviews++;
      role.companies.add(session.companyName || 'Unknown');
      role.rounds[session.roundType] = (role.rounds[session.roundType] || 0) + 1;
      role.scores.push(session.scores.overall);
      role.skillScores.technicalDepth.push(session.scores.technical || 0);
      role.skillScores.clarity.push(session.scores.clarity || 0);
      role.skillScores.confidence.push(session.scores.confidence || 0);
      role.skillScores.communication.push(session.scores.communication || 0);
      if (new Date(session.completedAt) > new Date(role.lastInterviewDate)) {
        role.lastInterviewDate = session.completedAt;
      }
    });

    const roles = Array.from(roleMap.values()).map(r => ({
      roleTitle: r.roleTitle,
      totalInterviews: r.totalInterviews,
      companies: Array.from(r.companies),
      rounds: r.rounds,
      averageScore: r.scores.reduce((a, b) => a + b, 0) / r.scores.length,
      highestScore: Math.max(...r.scores),
      lowestScore: Math.min(...r.scores),
      lastInterviewDate: r.lastInterviewDate,
      skillsEvaluated: {
        technicalDepth: r.skillScores.technicalDepth.reduce((a, b) => a + b, 0) / r.skillScores.technicalDepth.length,
        clarity: r.skillScores.clarity.reduce((a, b) => a + b, 0) / r.skillScores.clarity.length,
        confidence: r.skillScores.confidence.reduce((a, b) => a + b, 0) / r.skillScores.confidence.length,
        communication: r.skillScores.communication.reduce((a, b) => a + b, 0) / r.skillScores.communication.length
      }
    })).sort((a, b) => b.averageScore - a.averageScore);

    const avgScore = roles.reduce((sum, r) => sum + r.averageScore, 0) / roles.length;

    return {
      userId,
      roles,
      summary: {
        totalRoles: roles.length,
        bestPerformingRole: roles[0]?.roleTitle,
        mostInterviewedRole: roles.sort((a, b) => b.totalInterviews - a.totalInterviews)[0]?.roleTitle,
        averageScoreAcrossAll: avgScore
      }
    };
  }

  // Helper method to get top items by frequency
  private getTopItems(items: string[], limit: number): { item: string; count: number }[] {
    const frequency = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(frequency)
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
