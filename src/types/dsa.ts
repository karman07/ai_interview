// DSA Question Types
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionStatus = 'Not Started' | 'Attempted' | 'Solved' | 'Failed';
export type SortBy = 'difficulty' | 'likes' | 'acceptanceRate' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface FunctionSignature {
  language: string;
  signature?: string;  // For template/starter code
  code?: string;       // For full solution code
  returnType?: string;
}

export interface Constraints {
  timeComplexity: string;
  spaceComplexity: string;
  timeLimit: number;
  memoryLimit: number;
}

export interface Hint {
  order: number;
  content?: string;  // Some APIs use 'content'
  text?: string;     // Some APIs use 'text'
}

export interface Example {
  input?: string;
  output?: string;
  explanation?: string;
}

export type ExampleType = Example | string;  // Can be object or string format

export interface DSAQuestion {
  _id?: string;
  questionId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  categories: string[];
  tags: string[];
  testCases: TestCase[];
  functionSignatures: FunctionSignature[];
  constraints: Constraints;
  hints: Hint[];
  examples: ExampleType[];  // Can be string or object format
  likes?: number;
  dislikes?: number;
  submissions?: number;
  acceptedSubmissions?: number;
  acceptanceRate?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DSAQuestionFilters {
  difficulty?: Difficulty;
  category?: string | string[];
  tags?: string | string[];
  search?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
  includeSolutions?: boolean;
}

export interface DSAQuestionStatistics {
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  categoryCounts: Record<string, number>;
  totalSubmissions: number;
  totalAccepted: number;
  overallAcceptanceRate: number;
}

export interface CreateQuestionDto {
  questionId: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  categories: string[];
  tags: string[];
  testCases: TestCase[];
  functionSignatures: FunctionSignature[];
  constraints: Constraints;
  hints: Hint[];
  examples: Example[];
}

export interface UpdateQuestionDto {
  title?: string;
  description?: string;
  difficulty?: Difficulty;
  categories?: string[];
  tags?: string[];
  testCases?: TestCase[];
  functionSignatures?: FunctionSignature[];
  constraints?: Constraints;
  hints?: Hint[];
  examples?: Example[];
}

export interface SubmitSolutionDto {
  language: string;
  isAccepted: boolean;
}

// Progress Tracking Types
export interface Submission {
  submittedAt: string;
  language: string;
  code: string;
  status: QuestionStatus;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed?: number;
  errorMessage?: string;
  timeSpent?: number;
  isAccepted?: boolean;
}

export interface DSAProgress {
  _id?: string;
  userId: string;
  questionId: string;
  status: QuestionStatus;
  attempts?: number;
  totalAttempts?: number;
  successfulAttempts?: number;
  lastAttemptedAt?: string;
  lastAttemptDate?: string;
  solvedAt?: string;
  solvedDate?: string;
  submissions: Submission[];
  totalTimeSpent: number;
  bestExecutionTime?: number;
  isBookmarked: boolean;
  userNotes?: string;
  userRating?: number;
  hintsUsed: string[];
  languagesAttempted?: string[];
  isLiked?: boolean;
  isDisliked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface SubmitCodeDto {
  language: string;
  code: string;
  status: QuestionStatus;
  testCasesPassed: number;
  totalTestCases: number;
  executionTime: number;
  memoryUsed?: number;
  errorMessage?: string;
  timeSpent: number;
}

export interface UpdateProgressDto {
  isBookmarked?: boolean;
  userNotes?: string;
  userRating?: number;
}

export interface RecordHintDto {
  hintContent: string;
}

export interface DSAProgressFilters {
  status?: QuestionStatus;
  isBookmarked?: boolean;
  difficulty?: Difficulty;
  category?: string;
}

export interface UserStatistics {
  totalQuestions: number;
  solvedQuestions: number;
  attemptedQuestions: number;
  notStartedQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  successRate: number;
  totalTimeSpent: number;
  averageTimePerQuestion: number;
  bookmarkedQuestions: number;
  categoriesProgress: Record<string, {
    total: number;
    solved: number;
    percentage: number;
  }>;
  recentActivity: {
    lastSolved?: string;
    lastAttempted?: string;
    currentStreak: number;
  };
}

export interface RecentSubmission {
  questionId: string;
  questionTitle?: string;
  difficulty?: Difficulty;
  status: QuestionStatus;
  submittedAt: string;
  language: string;
  executionTime: number;
  testCasesPassed: number;
  totalTestCases: number;
}

export interface ProgressWithQuestion extends DSAProgress {
  question?: DSAQuestion;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Code Execution Types
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'error';

export interface TestCaseResult {
  testCaseIndex?: number;  // Index of the test case
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
  memoryUsed?: number;
  error?: string;
  errorMessage?: string;  // Some APIs use errorMessage instead of error
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
}

export interface CodeExecutionResult {
  _id?: string;
  userId?: string;
  questionId?: string;
  language: string;
  code: string;
  status: ExecutionStatus | 'Completed' | 'Failed';  // API may return these strings
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  testResults: TestCaseResult[];
  totalExecutionTime: number;
  averageExecutionTime: number;
  peakMemoryUsage?: number;
  maxMemoryUsed?: number;  // Some APIs use maxMemoryUsed
  allTestsPassed?: boolean;  // Some APIs include this flag
  complexityAnalysis?: ComplexityAnalysis;
  error?: string;
  createdAt?: string;
  submittedAt?: string;  // Some APIs use submittedAt
}

export interface RunCodeDto {
  language: string;
  code: string;
  includeHiddenTests?: boolean;
  analyzeComplexity?: boolean;
}

export interface ValidateCodeDto {
  language: string;
  code: string;
}

export interface RunCustomCodeDto {
  language: string;
  code: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
}

export interface ExecutionHistoryFilters {
  questionId?: string;
  limit?: number;
}
