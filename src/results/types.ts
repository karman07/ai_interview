export interface InterviewResult {
  id: string;
  ownerId: string;    
  createdAt: string;
  request: {
    jobDescription: string;
    questions: string[];
    difficulty: string;
    candidateName?: string;
    positionTitle?: string;
  };
  output: {
    raw: string;
    structured?: any;
  };
}
