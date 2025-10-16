import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DsaQuestionDocument = DsaQuestion & Document;

export enum DifficultyLevel {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum QuestionCategory {
  ARRAY = 'Array',
  STRING = 'String',
  LINKED_LIST = 'Linked List',
  TREE = 'Tree',
  GRAPH = 'Graph',
  DYNAMIC_PROGRAMMING = 'Dynamic Programming',
  SORTING = 'Sorting',
  SEARCHING = 'Searching',
  STACK = 'Stack',
  QUEUE = 'Queue',
  HEAP = 'Heap',
  HASH_TABLE = 'Hash Table',
  BACKTRACKING = 'Backtracking',
  GREEDY = 'Greedy',
  BIT_MANIPULATION = 'Bit Manipulation',
  MATH = 'Math',
  TWO_POINTERS = 'Two Pointers',
  SLIDING_WINDOW = 'Sliding Window',
  RECURSION = 'Recursion',
  TRIE = 'Trie',
  SEGMENT_TREE = 'Segment Tree',
}

export class TestCase {
  @Prop({ required: true })
  input: string; // JSON string of input parameters

  @Prop({ required: true })
  expectedOutput: string; // Expected output

  @Prop({ default: false })
  isHidden: boolean; // Hidden test cases for evaluation

  @Prop()
  explanation?: string;
}

export class FunctionSignature {
  @Prop({ required: true })
  language: string; // e.g., 'javascript', 'python', 'java', 'cpp'

  @Prop({ required: true })
  code: string; // Function template/boilerplate code
}

export class CodeConstraints {
  @Prop()
  timeLimit?: number; // in milliseconds

  @Prop()
  memoryLimit?: number; // in MB

  @Prop([String])
  allowedLibraries?: string[]; // Allowed imports/libraries
}

export class Hint {
  @Prop({ required: true })
  order: number;

  @Prop({ required: true })
  text: string;
}

export class Solution {
  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  explanation?: string;

  @Prop()
  timeComplexity?: string;

  @Prop()
  spaceComplexity?: string;
}

@Schema({ timestamps: true })
export class DsaQuestion {
  @Prop({ required: true, unique: true })
  questionId: string; // e.g., 'two-sum', 'reverse-linked-list'

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string; // Problem statement in markdown format

  @Prop({ required: true, enum: DifficultyLevel })
  difficulty: DifficultyLevel;

  @Prop({ type: [String], required: true, enum: QuestionCategory })
  categories: QuestionCategory[];

  @Prop({ type: [String], default: [] })
  tags: string[]; // Additional tags like 'Amazon', 'Google', 'Facebook'

  @Prop({ type: [TestCase], required: true })
  testCases: TestCase[];

  @Prop({ type: [FunctionSignature], required: true })
  functionSignatures: FunctionSignature[];

  @Prop({ type: CodeConstraints })
  constraints?: CodeConstraints;

  @Prop({ type: [Hint], default: [] })
  hints: Hint[];

  @Prop({ type: [Solution], default: [] })
  solutions: Solution[];

  @Prop([String])
  examples: string[]; // Example inputs and outputs

  @Prop()
  notes?: string; // Additional notes or edge cases

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  acceptanceRate: number; // Percentage of successful submissions

  @Prop({ default: 0 })
  totalSubmissions: number;

  @Prop({ default: 0 })
  successfulSubmissions: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ default: 0 })
  dislikes: number;

  @Prop([String])
  relatedQuestions: string[]; // Array of question IDs
}

export const DsaQuestionSchema = SchemaFactory.createForClass(DsaQuestion);

// Create indexes for better query performance
DsaQuestionSchema.index({ questionId: 1 });
DsaQuestionSchema.index({ difficulty: 1 });
DsaQuestionSchema.index({ categories: 1 });
DsaQuestionSchema.index({ tags: 1 });
DsaQuestionSchema.index({ isActive: 1 });
