// types/Resume.ts
export interface Resume {
  _id: string;
  filename: string;
  stats: {
    cv_quality: {
      overall_score: number;
      subscores: {
        dimension: string;
        score: number;
        max_score: number;
        evidence: string[];
      }[];
    };
    jd_match: {
      overall_score: number;
      subscores: {
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
  };
  createdAt: string;
}
