import http from './http';
import {
  CodeExecutionResult,
  RunCodeDto,
  ValidateCodeDto,
  RunCustomCodeDto,
  ExecutionHistoryFilters,
  ComplexityAnalysis,
} from '@/types/dsa';

const CODE_EXECUTION_BASE = '/code-execution';

/**
 * Code Execution API Service
 */
export const codeExecutionApi = {
  /**
   * Run code against question test cases
   */
  runCode: async (
    questionId: string,
    data: RunCodeDto
  ): Promise<CodeExecutionResult> => {
    const response = await http.post<any>(
      `${CODE_EXECUTION_BASE}/${questionId}/run`,
      data
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Validate code syntax without running tests
   */
  validateCode: async (
    questionId: string,
    data: ValidateCodeDto
  ): Promise<{ isValid: boolean; errors: string[] }> => {
    const response = await http.post<any>(
      `${CODE_EXECUTION_BASE}/${questionId}/validate`,
      data
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Run custom code with custom test cases
   */
  runCustomCode: async (data: RunCustomCodeDto): Promise<CodeExecutionResult> => {
    const response = await http.post<any>(
      `${CODE_EXECUTION_BASE}/run-custom`,
      data
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Get execution result by ID
   */
  getExecutionResult: async (executionId: string): Promise<CodeExecutionResult> => {
    const response = await http.get<any>(
      `${CODE_EXECUTION_BASE}/result/${executionId}`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Get execution history with filters
   */
  getExecutionHistory: async (
    filters?: ExecutionHistoryFilters
  ): Promise<CodeExecutionResult[]> => {
    const params = new URLSearchParams();
    
    if (filters?.questionId) params.append('questionId', filters.questionId);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await http.get<any>(
      `${CODE_EXECUTION_BASE}/history?${params.toString()}`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },

  /**
   * Get complexity analysis for a question
   */
  getComplexityAnalysis: async (questionId: string): Promise<ComplexityAnalysis> => {
    const response = await http.get<any>(
      `${CODE_EXECUTION_BASE}/${questionId}/complexity`
    );
    // Handle both wrapped and direct response formats
    return response.data.data || response.data;
  },
};

export default codeExecutionApi;
