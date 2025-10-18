import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  CodeExecutionResult,
  RunCodeDto,
  ValidateCodeDto,
  RunCustomCodeDto,
  ExecutionHistoryFilters,
  ComplexityAnalysis,
} from '@/types/dsa';
import { codeExecutionApi } from '@/api/codeExecution';

interface CodeExecutionContextType {
  // State
  currentExecution: CodeExecutionResult | null;
  executionHistory: CodeExecutionResult[];
  complexityAnalysis: ComplexityAnalysis | null;
  isRunning: boolean;
  isValidating: boolean;
  error: string | null;

  // Actions
  runCode: (questionId: string, data: RunCodeDto) => Promise<CodeExecutionResult | null>;
  validateCode: (questionId: string, data: ValidateCodeDto) => Promise<{ isValid: boolean; errors: string[] } | null>;
  runCustomCode: (data: RunCustomCodeDto) => Promise<CodeExecutionResult | null>;
  getExecutionResult: (executionId: string) => Promise<void>;
  fetchExecutionHistory: (filters?: ExecutionHistoryFilters) => Promise<void>;
  fetchComplexityAnalysis: (questionId: string) => Promise<void>;
  clearError: () => void;
  clearCurrentExecution: () => void;
}

const CodeExecutionContext = createContext<CodeExecutionContextType | undefined>(undefined);

export const useCodeExecution = () => {
  const context = useContext(CodeExecutionContext);
  if (!context) {
    throw new Error('useCodeExecution must be used within a CodeExecutionProvider');
  }
  return context;
};

interface CodeExecutionProviderProps {
  children: ReactNode;
}

export const CodeExecutionProvider: React.FC<CodeExecutionProviderProps> = ({ children }) => {
  const [currentExecution, setCurrentExecution] = useState<CodeExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<CodeExecutionResult[]>([]);
  const [complexityAnalysis, setComplexityAnalysis] = useState<ComplexityAnalysis | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentExecution = useCallback(() => {
    setCurrentExecution(null);
  }, []);

  const runCode = useCallback(async (
    questionId: string,
    data: RunCodeDto
  ): Promise<CodeExecutionResult | null> => {
    try {
      setIsRunning(true);
      setError(null);
      const result = await codeExecutionApi.runCode(questionId, data);
      setCurrentExecution(result);
      
      // Add to history
      setExecutionHistory(prev => [result, ...prev]);
      
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to run code');
      console.error('Error running code:', err);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const validateCode = useCallback(async (
    questionId: string,
    data: ValidateCodeDto
  ): Promise<{ isValid: boolean; errors: string[] } | null> => {
    try {
      setIsValidating(true);
      setError(null);
      const result = await codeExecutionApi.validateCode(questionId, data);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to validate code');
      console.error('Error validating code:', err);
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const runCustomCode = useCallback(async (
    data: RunCustomCodeDto
  ): Promise<CodeExecutionResult | null> => {
    try {
      setIsRunning(true);
      setError(null);
      const result = await codeExecutionApi.runCustomCode(data);
      setCurrentExecution(result);
      
      // Add to history
      setExecutionHistory(prev => [result, ...prev]);
      
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to run custom code');
      console.error('Error running custom code:', err);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const getExecutionResult = useCallback(async (executionId: string) => {
    try {
      setError(null);
      const result = await codeExecutionApi.getExecutionResult(executionId);
      setCurrentExecution(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get execution result');
      console.error('Error getting execution result:', err);
    }
  }, []);

  const fetchExecutionHistory = useCallback(async (filters?: ExecutionHistoryFilters) => {
    try {
      setError(null);
      const history = await codeExecutionApi.getExecutionHistory(filters);
      setExecutionHistory(history);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch execution history');
      console.error('Error fetching execution history:', err);
    }
  }, []);

  const fetchComplexityAnalysis = useCallback(async (questionId: string) => {
    try {
      setError(null);
      const analysis = await codeExecutionApi.getComplexityAnalysis(questionId);
      setComplexityAnalysis(analysis);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch complexity analysis');
      console.error('Error fetching complexity analysis:', err);
    }
  }, []);

  const value: CodeExecutionContextType = {
    currentExecution,
    executionHistory,
    complexityAnalysis,
    isRunning,
    isValidating,
    error,
    runCode,
    validateCode,
    runCustomCode,
    getExecutionResult,
    fetchExecutionHistory,
    fetchComplexityAnalysis,
    clearError,
    clearCurrentExecution,
  };

  return (
    <CodeExecutionContext.Provider value={value}>
      {children}
    </CodeExecutionContext.Provider>
  );
};

export default CodeExecutionContext;
