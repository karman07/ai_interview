export interface CodeExecutionResult {
    _id: string;
    questionId: string;
    userId: string;
    language: string;
    code: string;
    status: 'pending' | 'success' | 'failed' | 'error';
    executionId?: string;
    testCases?: {
        total: number;
        passed: number;
        failed: number;
        results: Array<{
            input: string;
            expectedOutput: string;
            actualOutput: string;
            passed: boolean;
            error?: string;
            executionTime?: number;
        }>;
    };
    complexity?: {
        time: string;
        space: string;
        description: string;
    };
    feedback?: string;
    score?: number;
    createdAt: string;
    updatedAt: string;
}

export interface RunCodeDto {
    language: string;
    code: string;
}

export interface ValidateCodeDto {
    language: string;
    code: string;
}

export interface RunCustomCodeDto {
    language: string;
    code: string;
    testCases: Array<{
        input: string;
        expectedOutput: string;
    }>;
}

export interface ExecutionHistoryFilters {
    questionId?: string;
    limit?: number;
}

export interface ComplexityAnalysis {
    timeComplexity: string;
    spaceComplexity: string;
    optimizationSuggestions: string[];
}
