import axios from './http';

export interface StartInterviewRequest {
  user_id: string;
  session_id: string;
  role_title: string;
  company_name: string;
  industry: string;
  jd: string;
  cv: string;
  round_type: 'technical' | 'behavioral' | 'hr' | 'full';
}

export interface SubmitAnswerRequest {
  user_id: string;
  session_id: string;
  answer: string;
}

export interface Evaluation {
  clarity: number;
  confidence: number;
  technical_depth: number;
  summary: string;
}

export interface HistoryItem {
  question: string;
  answer: string | null;
  evaluation: Evaluation | null;
  stage: string;
  is_followup: boolean;
}

export interface InterviewState {
  stage: string;
  session_config: StartInterviewRequest;
  history: HistoryItem[];
  should_follow_up: boolean;
  completed: boolean;
}

export interface StartInterviewResponse {
  session_id: string;
  user_id: string;
  first_question: string;
  state: InterviewState;
}

export interface SubmitAnswerResponse {
  evaluation: Evaluation;
  next_question: string | null;
  state: InterviewState;
}

export interface AverageScores {
  technical_depth: number;
  relevance: number;
  communication: number;
  behavioral: number;
  overall: 'Hire' | 'No Hire' | 'Strong Hire' | 'Strong No Hire';
}

export interface InterviewReport {
  session_id: string;
  user_id: string;
  role: string;
  company: string;
  industry: string;
  avg_scores: AverageScores;
  history: HistoryItem[];
}

/**
 * Start a new AI interview session
 */
export const startInterview = async (
  data: StartInterviewRequest
): Promise<StartInterviewResponse> => {
  const response = await axios.post('/ai-interview/start', data);
  return response.data;
};

/**
 * Submit an answer to the current question
 */
export const submitAnswer = async (
  data: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> => {
  const response = await axios.post('/ai-interview/answer', data);
  return response.data;
};

/**
 * Get current interview state
 */
export const getInterviewState = async (
  userId: string,
  sessionId: string
): Promise<InterviewState> => {
  const response = await axios.get(`/ai-interview/state/${userId}/${sessionId}`);
  return response.data;
};

/**
 * Get interview report/results
 */
export const getInterviewReport = async (
  userId: string,
  sessionId: string
): Promise<InterviewReport> => {
  const response = await axios.get(`/ai-interview/report/${userId}/${sessionId}`);
  return response.data;
};

/**
 * List all sessions for a user
 */
export const getUserSessions = async (
  userId: string
): Promise<Record<string, InterviewState>> => {
  const response = await axios.get(`/ai-interview/sessions/${userId}`);
  return response.data;
};

/**
 * List all sessions (admin)
 */
export const getAllSessions = async (): Promise<Record<string, InterviewState>> => {
  const response = await axios.get('/ai-interview/sessions');
  return response.data;
};
