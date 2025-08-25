export type ResultItem = {
  question: string;
  answer: string;
  isCorrect?: boolean;
  explanation?: string;
  score?: number;
};

export type Result = {
  _id: string;
  owner: string | { _id: string; email: string };
  jobDescription: string;
  questions: string[];
  difficulty: string;
  items: ResultItem[];
  overall: { summary: string; overallScore: number };
  rawOutput?: string;
  createdAt?: string;
};