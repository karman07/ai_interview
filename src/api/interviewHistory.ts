import http from "./http";

export interface InterviewSession {
  session_id: string;
  role_title: string;
  company_name: string;
  status: string;
  round_type: string;
  created_at: string;
  completed_at?: string;
  total_questions: number;
  overall_score: number;
}

export interface InterviewHistory {
  userId: string;
  totalSessions: number;
  sessions: InterviewSession[];
}

export interface VoiceScores {
  fluency: number;
  clarity: number;
  confidence: number;
  pace: number;
  total: number;
}

export interface VoiceMetrics {
  duration: number;
  speech_rate: number;
  avg_pitch: number;
  pitch_variation: number;
  avg_energy: number;
  pause_ratio: number;
  speech_segments: number;
}

export interface QuestionEvaluation {
  total_score: number;
  feedback: string;
  suggestions: string[];
}

export interface TechnicalEvaluation {
  technical_depth: number;
  clarity: number;
  confidence: number;
  summary: string;
}

export interface CommunicationEvaluation {
  voice_scores: VoiceScores;
  voice_metrics: VoiceMetrics;
}

export interface HistoryQuestion {
  question: string;
  answer: string;
  transcribed_text: string;
  has_audio: boolean;
  evaluation: QuestionEvaluation;
  technical_evaluation: TechnicalEvaluation;
  communication_evaluation: CommunicationEvaluation;
  stage: string;
  timestamp: string;
}

export interface SessionState {
  user_id: string;
  session_id: string;
  role_title: string;
  company_name: string;
  industry: string;
  round_type: string;
  status: string;
  history: HistoryQuestion[];
  completed: boolean;
  current_stage: string;
  question_count: number;
}

export interface VoiceAnalysisSummary {
  avg_fluency: number;
  avg_clarity: number;
  avg_confidence: number;
  avg_pace: number;
  total_speaking_time: number;
  avg_speech_rate: number;
}

export interface InterviewReport {
  session_id: string;
  user_id: string;
  role: string;
  company: string;
  industry: string;
  status: string;
  avg_scores: {
    overall: number;
    technical: number;
    communication: number;
    problem_solving: number;
    behavioral: number;
    cultural_fit: number;
  };
  voice_analysis_summary: VoiceAnalysisSummary;
  history: HistoryQuestion[];
  total_questions: number;
  completed: boolean;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  interview_duration: string;
  completion_rate: string;
}

export const InterviewHistoryApi = {
  async getHistory(userId: string): Promise<InterviewHistory> {
    const { data } = await http.get(`/ai-interview/history/${userId}`);
    return data;
  },

  async getSessions(userId: string): Promise<InterviewSession[]> {
    const { data } = await http.get(`/ai-interview/sessions/${userId}`);
    return data;
  },

  async getSessionState(userId: string, sessionId: string): Promise<SessionState> {
    const { data } = await http.get(`/ai-interview/state/${userId}/${sessionId}`);
    return data;
  },

  async getReport(userId: string, sessionId: string): Promise<InterviewReport> {
    const { data } = await http.get(`/ai-interview/report/${userId}/${sessionId}`);
    return data;
  }
};
