import http from './http';
import {
  DSAQuestion,
  DSAQuestionFilters,
  DSAQuestionStatistics,
  CreateQuestionDto,
  UpdateQuestionDto,
  SubmitSolutionDto,
  PaginatedResponse,
} from '@/types/dsa';

const DSA_QUESTIONS_BASE = '/dsa-questions';

/**
 * DSA Questions API Service
 */
export const dsaQuestionsApi = {
  /**
   * Create a new DSA question (Admin only)
   */
  createQuestion: async (data: CreateQuestionDto): Promise<DSAQuestion> => {
    const response = await http.post<any>(DSA_QUESTIONS_BASE, data);
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Get all questions with optional filters, search, and pagination
   */
  getAllQuestions: async (
    filters?: DSAQuestionFilters
  ): Promise<PaginatedResponse<DSAQuestion>> => {
    // Build params object for Axios to handle properly
    const params: any = {};
    
    if (filters?.difficulty) params.difficulty = filters.difficulty;
    if (filters?.category) params.category = filters.category;
    if (filters?.tags) params.tags = filters.tags;
    if (filters?.search) params.search = filters.search;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.sortOrder) params.sortOrder = filters.sortOrder;
    if (filters?.page !== undefined) params.page = Number(filters.page);
    if (filters?.limit !== undefined) params.limit = Number(filters.limit);
    if (filters?.includeSolutions) params.includeSolutions = true;

    const response = await http.get<any>(
      DSA_QUESTIONS_BASE,
      { params }
    );

    // Transform backend response to match frontend PaginatedResponse interface
    const backendData = response.data;
    return {
      data: backendData.questions || [],
      pagination: {
        currentPage: backendData.page || 1,
        totalPages: backendData.totalPages || 1,
        totalItems: backendData.total || 0,
        itemsPerPage: backendData.limit || 10,
      },
    };
  },

  /**
   * Get questions by difficulty
   */
  getQuestionsByDifficulty: async (
    difficulty: 'Easy' | 'Medium' | 'Hard',
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<DSAQuestion>> => {
    return dsaQuestionsApi.getAllQuestions({ difficulty, page, limit });
  },

  /**
   * Get questions by category
   */
  getQuestionsByCategory: async (
    category: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<DSAQuestion>> => {
    return dsaQuestionsApi.getAllQuestions({ category, page, limit });
  },

  /**
   * Search questions
   */
  searchQuestions: async (
    search: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<DSAQuestion>> => {
    return dsaQuestionsApi.getAllQuestions({ search, page, limit });
  },

  /**
   * Get question statistics
   */
  getStatistics: async (): Promise<DSAQuestionStatistics> => {
    const response = await http.get<any>(
      `${DSA_QUESTIONS_BASE}/statistics`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Get a random question
   */
  getRandomQuestion: async (difficulty?: 'Easy' | 'Medium' | 'Hard'): Promise<DSAQuestion> => {
    const params = difficulty ? `?difficulty=${difficulty}` : '';
    const response = await http.get<any>(
      `${DSA_QUESTIONS_BASE}/random${params}`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Get a single question by ID
   */
  getQuestionById: async (
    questionId: string,
    includeSolutions = false
  ): Promise<DSAQuestion> => {
    const params = includeSolutions ? '?includeSolutions=true' : '';
    const response = await http.get<any>(
      `${DSA_QUESTIONS_BASE}/${questionId}${params}`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Update a question (Admin only)
   */
  updateQuestion: async (
    questionId: string,
    data: UpdateQuestionDto
  ): Promise<DSAQuestion> => {
    const response = await http.patch<any>(
      `${DSA_QUESTIONS_BASE}/${questionId}`,
      data
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Like a question
   */
  likeQuestion: async (questionId: string): Promise<DSAQuestion> => {
    const response = await http.post<any>(
      `${DSA_QUESTIONS_BASE}/${questionId}/like`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Dislike a question
   */
  dislikeQuestion: async (questionId: string): Promise<DSAQuestion> => {
    const response = await http.post<any>(
      `${DSA_QUESTIONS_BASE}/${questionId}/dislike`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Submit solution to update question statistics
   */
  submitSolution: async (
    questionId: string,
    data: SubmitSolutionDto
  ): Promise<DSAQuestion> => {
    const response = await http.post<any>(
      `${DSA_QUESTIONS_BASE}/${questionId}/submit`,
      data
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Soft delete a question (Admin only)
   */
  softDeleteQuestion: async (questionId: string): Promise<{ message: string }> => {
    const response = await http.delete<any>(
      `${DSA_QUESTIONS_BASE}/${questionId}`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Hard delete a question (Admin only)
   */
  hardDeleteQuestion: async (questionId: string): Promise<{ message: string }> => {
    const response = await http.delete<any>(
      `${DSA_QUESTIONS_BASE}/${questionId}/hard`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },
};

export default dsaQuestionsApi;
