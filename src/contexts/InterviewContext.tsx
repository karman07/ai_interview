import React, { createContext, useContext, useState } from "react";
import { CreateInterviewDto } from "@/api/interviews";
import { InterviewApi } from "@/api/interviews";

export type InterviewQuestion = { question: string; options?: string[]; answer?: string };

type InterviewState = {
  draft: CreateInterviewDto | null;
  generatedQuestions: InterviewQuestion[] | null;
  setDraft: (d: CreateInterviewDto) => void;
  generateQuestions: (d?: CreateInterviewDto) => Promise<InterviewQuestion[]>;
  reset: () => void;
};

const InterviewContext = createContext<InterviewState | null>(null);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draft, setDraftState] = useState<CreateInterviewDto | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[] | null>(null);

  const setDraft = (d: CreateInterviewDto) => {
    setDraftState(d);
  };

  const generateQuestions = async (d?: CreateInterviewDto) => {
    const payload = d ?? draft;
    if (!payload) throw new Error("No draft interview");

    const res = await InterviewApi.generate(payload);
    // backend returns { raw, structured }
    const structured = res.data?.structured ?? res.data;
    const questions = structured?.questions ?? structured?.generatedQuestions ?? [];

    // Normalize: accept array of {question, options?, answer?} or strings
    const normalized: InterviewQuestion[] = questions.map((q: string | InterviewQuestion) =>
      typeof q === "string" ? { question: q } : q
    );

    setGeneratedQuestions(normalized);
    setDraftState({ ...payload, questions: normalized.map((q) => q.question) });
    return normalized;
  };

  const reset = () => {
    setDraftState(null);
    setGeneratedQuestions(null);
  };

  return (
    <InterviewContext.Provider value={{ draft, generatedQuestions, setDraft, generateQuestions, reset }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterview must be used within InterviewProvider");
  return ctx;
};
