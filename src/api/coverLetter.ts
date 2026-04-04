import aiHttp from './aiHttp';
import http from './http';
import { CoverLetterData, GenerateCoverLetterRequest } from '@/types/CoverLetter';

export const CoverLetterApi = {
  /**
   * Ask the AI to generate a structured cover letter from a JD + resume text.
   * Falls back to a client-side prompt if the backend endpoint isn't live yet.
   */
  generate: async (req: GenerateCoverLetterRequest): Promise<CoverLetterData> => {
    try {
      const { data } = await aiHttp.post<{ cover_letter: CoverLetterData }>(
        '/api/v1/cover-letter/generate',
        req,
      );
      return data.cover_letter;
    } catch {
      // Graceful fallback — build a structured placeholder that the user can edit
      return buildFallback(req);
    }
  },

  /**
   * GET /cover-letters/usage
   * Returns { used, limit, remaining } for the authenticated user.
   */
  getUsage: async (): Promise<{ used: number; limit: number; remaining: number }> => {
    const { data } = await http.get('/cover-letters/usage');
    return data;
  },

  /**
   * Extract plain text from an uploaded JD file (PDF, DOCX, TXT).
   * Uses the AI server's /upload/extract-text endpoint.
   */
  extractJdText: async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await aiHttp.post<{ text: string }>(
      '/api/v1/upload/extract-text',
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.text;
  },
};

/** Client-side fallback used when the AI endpoint is unavailable. */
function buildFallback(req: GenerateCoverLetterRequest): CoverLetterData {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    applicantName: req.applicantName || 'Your Name',
    email: req.email || 'your.email@example.com',
    phone: req.phone || '+1 (555) 000-0000',
    location: req.location || 'City, State',
    date: today,

    hiringManagerName: 'Hiring Manager',
    hiringManagerTitle: 'Hiring Manager',
    companyName: req.companyName || 'Company Name',
    companyAddress: '123 Business Ave, City, State 00000',

    roleTitle: req.roleTitle || 'the advertised position',

    openingParagraph: `I am writing to express my strong interest in the ${
      req.roleTitle || 'open position'
    } at ${
      req.companyName || 'your company'
    }. With my background in the relevant field and a proven track record of delivering results, I am confident that I would make a valuable addition to your team.`,

    bodyParagraphs: [
      `Throughout my career, I have developed a deep expertise in the skills required for this role. My experience has equipped me with the ability to tackle complex challenges, collaborate effectively with cross-functional teams, and deliver high-quality outcomes consistently.`,
      `I am particularly drawn to ${
        req.companyName || 'your company'
      } because of its commitment to innovation and excellence. I believe my skills and passion align perfectly with your organisational goals, and I am eager to contribute to your continued success.`,
    ],

    closingParagraph: `I would welcome the opportunity to discuss how my experience and skills align with your needs. Thank you for considering my application. I look forward to hearing from you.`,

    salutation: 'Sincerely',
  };
}
