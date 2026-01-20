// types/Resume.ts
export interface Resume {
  _id: string;
  id: string;
  filename: string;
  url: string;
  analytics: {
    cv_quality: {
      overall_score: number;
      subscores: {
        dimension: string;
        score: number;
        max_score: number;
        evidence: string[];
      }[];
    };
    jd_match?: {
      overall_score?: number;
      subscores?: {
        dimension: string;
        score: number;
        max_score: number;
        evidence: string[];
      }[];
    };
    key_takeaways: {
      red_flags: string[];
      green_flags: string[];
    };
    overall_score: number;
  };
  enhancement: {
    tailored_resume: {
      summary: string;
      experience: string[];
      skills: string[];
      projects: string[];
    };
    top_1_percent_gap: {
      strengths: string[];
      gaps: string[];
      actionable_next_steps: string[];
    };
    cover_letter: string;
  };
  createdAt: string;
}
