import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  DSAQuestion,
  DSAQuestionFilters,
  DSAQuestionStatistics,
  PaginatedResponse,
  CreateQuestionDto,
  UpdateQuestionDto,
  SubmitSolutionDto,
} from '@/types/dsa';
import { dsaQuestionsApi } from '@/api/dsaQuestions';

interface DSAQuestionsContextType {
  // State
  questions: DSAQuestion[];
  currentQuestion: DSAQuestion | null;
  statistics: DSAQuestionStatistics | null;
  pagination: PaginatedResponse<DSAQuestion>['pagination'] | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchQuestions: (filters?: DSAQuestionFilters) => Promise<void>;
  fetchQuestionById: (questionId: string, includeSolutions?: boolean) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchRandomQuestion: (difficulty?: 'Easy' | 'Medium' | 'Hard') => Promise<void>;
  createQuestion: (data: CreateQuestionDto) => Promise<DSAQuestion | null>;
  updateQuestion: (questionId: string, data: UpdateQuestionDto) => Promise<DSAQuestion | null>;
  likeQuestion: (questionId: string) => Promise<void>;
  dislikeQuestion: (questionId: string) => Promise<void>;
  submitSolution: (questionId: string, data: SubmitSolutionDto) => Promise<void>;
  softDeleteQuestion: (questionId: string) => Promise<void>;
  hardDeleteQuestion: (questionId: string) => Promise<void>;
  clearError: () => void;
  setCurrentQuestion: (question: DSAQuestion | null) => void;
}

const DSAQuestionsContext = createContext<DSAQuestionsContextType | undefined>(undefined);

export const useDSAQuestions = () => {
  const context = useContext(DSAQuestionsContext);
  if (!context) {
    throw new Error('useDSAQuestions must be used within a DSAQuestionsProvider');
  }
  return context;
};

interface DSAQuestionsProviderProps {
  children: ReactNode;
}

export const DSAQuestionsProvider: React.FC<DSAQuestionsProviderProps> = ({ children }) => {
  const [questions, setQuestions] = useState<DSAQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<DSAQuestion | null>(null);
  const [statistics, setStatistics] = useState<DSAQuestionStatistics | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<DSAQuestion>['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchQuestions = useCallback(async (filters?: DSAQuestionFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dsaQuestionsApi.getAllQuestions(filters);
      setQuestions(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuestionById = useCallback(async (questionId: string, includeSolutions = false) => {
    try {
      setLoading(true);
      setError(null);
      const question = await dsaQuestionsApi.getQuestionById(questionId, includeSolutions);
      setCurrentQuestion(question);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch question');
      console.error('Error fetching question:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await dsaQuestionsApi.getStatistics();
      setStatistics(stats);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRandomQuestion = useCallback(async (difficulty?: 'Easy' | 'Medium' | 'Hard') => {
    try {
      setLoading(true);
      setError(null);
      const question = await dsaQuestionsApi.getRandomQuestion(difficulty);
      setCurrentQuestion(question);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch random question');
      console.error('Error fetching random question:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuestion = useCallback(async (data: CreateQuestionDto): Promise<DSAQuestion | null> => {
    try {
      setLoading(true);
      setError(null);
      const question = await dsaQuestionsApi.createQuestion(data);
      setQuestions(prev => [question, ...prev]);
      return question;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create question');
      console.error('Error creating question:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuestion = useCallback(async (
    questionId: string,
    data: UpdateQuestionDto
  ): Promise<DSAQuestion | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedQuestion = await dsaQuestionsApi.updateQuestion(questionId, data);
      setQuestions(prev => 
        prev.map(q => q.questionId === questionId ? updatedQuestion : q)
      );
      if (currentQuestion?.questionId === questionId) {
        setCurrentQuestion(updatedQuestion);
      }
      return updatedQuestion;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update question');
      console.error('Error updating question:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentQuestion]);

  const likeQuestion = useCallback(async (questionId: string) => {
    try {
      const updatedQuestion = await dsaQuestionsApi.likeQuestion(questionId);
      setQuestions(prev => 
        prev.map(q => q.questionId === questionId ? updatedQuestion : q)
      );
      if (currentQuestion?.questionId === questionId) {
        setCurrentQuestion(updatedQuestion);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to like question');
      console.error('Error liking question:', err);
    }
  }, [currentQuestion]);

  const dislikeQuestion = useCallback(async (questionId: string) => {
    try {
      const updatedQuestion = await dsaQuestionsApi.dislikeQuestion(questionId);
      setQuestions(prev => 
        prev.map(q => q.questionId === questionId ? updatedQuestion : q)
      );
      if (currentQuestion?.questionId === questionId) {
        setCurrentQuestion(updatedQuestion);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dislike question');
      console.error('Error disliking question:', err);
    }
  }, [currentQuestion]);

  const submitSolution = useCallback(async (questionId: string, data: SubmitSolutionDto) => {
    try {
      const updatedQuestion = await dsaQuestionsApi.submitSolution(questionId, data);
      setQuestions(prev => 
        prev.map(q => q.questionId === questionId ? updatedQuestion : q)
      );
      if (currentQuestion?.questionId === questionId) {
        setCurrentQuestion(updatedQuestion);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit solution');
      console.error('Error submitting solution:', err);
    }
  }, [currentQuestion]);

  const softDeleteQuestion = useCallback(async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      await dsaQuestionsApi.softDeleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.questionId !== questionId));
      if (currentQuestion?.questionId === questionId) {
        setCurrentQuestion(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete question');
      console.error('Error deleting question:', err);
    } finally {
      setLoading(false);
    }
  }, [currentQuestion]);

  const hardDeleteQuestion = useCallback(async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      await dsaQuestionsApi.hardDeleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.questionId !== questionId));
      if (currentQuestion?.questionId === questionId) {
        setCurrentQuestion(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to permanently delete question');
      console.error('Error permanently deleting question:', err);
    } finally {
      setLoading(false);
    }
  }, [currentQuestion]);

  const value: DSAQuestionsContextType = {
    questions,
    currentQuestion,
    statistics,
    pagination,
    loading,
    error,
    fetchQuestions,
    fetchQuestionById,
    fetchStatistics,
    fetchRandomQuestion,
    createQuestion,
    updateQuestion,
    likeQuestion,
    dislikeQuestion,
    submitSolution,
    softDeleteQuestion,
    hardDeleteQuestion,
    clearError,
    setCurrentQuestion,
  };

  return (
    <DSAQuestionsContext.Provider value={value}>
      {children}
    </DSAQuestionsContext.Provider>
  );
};

export default DSAQuestionsContext;
