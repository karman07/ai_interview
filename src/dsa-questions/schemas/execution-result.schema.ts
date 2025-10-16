import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExecutionResultDocument = ExecutionResult & Document;

export enum ExecutionStatus {
  SUCCESS = 'Success',
  FAILED = 'Failed',
  RUNTIME_ERROR = 'RuntimeError',
  COMPILATION_ERROR = 'CompilationError',
  TIME_LIMIT_EXCEEDED = 'TimeLimitExceeded',
  MEMORY_LIMIT_EXCEEDED = 'MemoryLimitExceeded',
}

export class TestCaseResult {
  @Prop({ required: true })
  testCaseIndex: number;

  @Prop({ required: true })
  input: string;

  @Prop({ required: true })
  expectedOutput: string;

  @Prop()
  actualOutput: string;

  @Prop({ required: true })
  passed: boolean;

  @Prop()
  executionTime: number; // milliseconds

  @Prop()
  memoryUsed: number; // MB

  @Prop()
  errorMessage?: string;
}

export class ComplexityAnalysis {
  @Prop()
  estimatedTimeComplexity: string; // e.g., "O(n)", "O(n log n)"

  @Prop()
  estimatedSpaceComplexity: string; // e.g., "O(1)", "O(n)"

  @Prop()
  meetsRequirements: boolean;

  @Prop()
  analysis: string;
}

@Schema({ timestamps: true })
export class ExecutionResult {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['javascript', 'python', 'java', 'cpp', 'typescript', 'go', 'rust', 'csharp'] })
  language: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, enum: ExecutionStatus })
  status: ExecutionStatus;

  @Prop({ type: [TestCaseResult], default: [] })
  testResults: TestCaseResult[];

  @Prop({ required: true })
  totalTestCases: number;

  @Prop({ required: true })
  passedTestCases: number;

  @Prop({ required: true })
  failedTestCases: number;

  @Prop()
  totalExecutionTime: number; // milliseconds

  @Prop()
  averageExecutionTime: number; // milliseconds

  @Prop()
  maxMemoryUsed: number; // MB

  @Prop()
  compilationError?: string;

  @Prop()
  runtimeError?: string;

  @Prop({ type: ComplexityAnalysis })
  complexityAnalysis?: ComplexityAnalysis;

  @Prop({ default: false })
  allTestsPassed: boolean;

  @Prop()
  submittedAt: Date;
}

export const ExecutionResultSchema = SchemaFactory.createForClass(ExecutionResult);

// Indexes
ExecutionResultSchema.index({ userId: 1, questionId: 1, submittedAt: -1 });
ExecutionResultSchema.index({ questionId: 1 });
ExecutionResultSchema.index({ allTestsPassed: 1 });
