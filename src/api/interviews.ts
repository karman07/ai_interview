import http from "./http";

export type Difficulty = "easy" | "medium" | "hard";
export type Format = "text" | "mcq";

export type CreateInterviewDto = {
  jobDescription: string;
  difficulty: Difficulty;
  format?: Format;
  count?: number;
  positionTitle?: string;
  candidateName?: string;
  // when running: include questions[] and answers[] if running directly
  questions?: string[]; 
  answers?: string[];
};

export const InterviewApi = {
  generate: (dto: CreateInterviewDto) => http.post("/interview/generate", dto),
  run: (dto: CreateInterviewDto) => http.post("/interview/run", dto),
};
