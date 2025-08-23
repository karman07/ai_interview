// types/Resume.ts
export interface Resume {
  _id: string;
  filename: string;
  stats: {
    wordCount: number;
    readabilityScore: number;
    skillsExtracted: string[];
    recommendedImprovements?: string[];

    // ✅ Added new AI analysis fields
    fit_index?: {
      score: number;
      band: string;
    };
    cv_quality?: {
      score: number;
      band: string;
      subscores: {
        dimension: string;
        score: number;
        max_score: number;
        evidence: string;
      }[];
    };
    jd_match?: {
      score: number;
      band: string;
      subscores: {
        dimension: string;
        score: number;
        max_score: number;
        evidence: string;
      }[];
    };
  };
  createdAt: string;
}
