import React, { createContext, useContext, useState } from "react";
import { ResultsApi } from "@/api/results";
import { InterviewApi } from '@/api/interviews';
import { Result } from "@/types/results";

type ResultsState = {
  results: Result[];
  fetchMine: () => Promise<void>;
  submitRun: (dto: any) => Promise<Result>;
};

const ResultsContext = createContext<ResultsState | null>(null);

export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<Result[]>([]);

  const fetchMine = async () => {
    const res = await ResultsApi.mine();
    setResults(res.data);
  };

  const submitRun = async (dto: any) => {
    const res = await InterviewApi.run(dto);
    const json = res.data;
    await fetchMine();
    return json;
  };

  return (
    <ResultsContext.Provider value={{ results, fetchMine, submitRun }}>
      {children}
    </ResultsContext.Provider>
  );
};

export const useResults = () => {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error("useResults must be used within ResultsProvider");
  return ctx;
};
