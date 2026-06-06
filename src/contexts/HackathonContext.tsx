import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import http from '@/api/http';
import { useAuth } from '@/contexts/AuthContext';

export interface HackathonConfig {
  isActive: boolean;
  title: string;
  description: string;
  jdText: string;
  difficulty: string;
}

interface HackathonState {
  eligible: boolean;
  loading: boolean;
  interviewTaken: boolean;
  formSubmitted: boolean;
  config: HackathonConfig | null;
  refresh: () => Promise<void>;
  markInterviewTaken: () => Promise<void>;
  saveResult: (data: {
    overallScore: number;
    metrics?: Record<string, number>;
    sessionId?: string;
    cvVerified?: boolean;
    rawData?: Record<string, any>;
  }) => Promise<void>;
}

const HackathonContext = createContext<HackathonState | null>(null);

export function HackathonProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [interviewTaken, setInterviewTaken] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [config, setConfig] = useState<HackathonConfig | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setEligible(false);
      setLoading(false);
      return;
    }
    try {
      const res = await http.get('/hackathon/check-eligibility');
      const data = res.data;
      setEligible(!!data.eligible);
      setInterviewTaken(!!data.interviewTaken);
      setFormSubmitted(!!data.formSubmitted);
      setConfig(data.config ?? null);
    } catch {
      setEligible(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markInterviewTaken = useCallback(async () => {
    await http.post('/hackathon/mark-interview-taken');
    setInterviewTaken(true);
  }, []);

  const saveResult = useCallback(async (data: Parameters<HackathonState['saveResult']>[0]) => {
    await http.post('/hackathon/save-result', data);
  }, []);

  return (
    <HackathonContext.Provider value={{
      eligible, loading, interviewTaken, formSubmitted, config,
      refresh, markInterviewTaken, saveResult,
    }}>
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  const ctx = useContext(HackathonContext);
  if (!ctx) throw new Error('useHackathon must be used inside HackathonProvider');
  return ctx;
}
