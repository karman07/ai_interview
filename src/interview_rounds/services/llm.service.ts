import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InterviewService } from './interview.service';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly interviewService: InterviewService) {}

  private async callGemini(prompt: string): Promise<string> {
    try {
      const res = await axios.post(
        `${process.env.GEMINI_BASE_URL}/models/${process.env.GEMINI_MODEL}:generateContent`,
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY,
          },
        },
      );

      this.logger.debug('Gemini raw response:', JSON.stringify(res.data, null, 2));

      const raw =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

      this.logger.debug(`Gemini extracted text: "${raw}"`);

      if (!raw) return 'NA';

      if (/concluded|no further/i.test(raw)) {
        this.logger.warn('Gemini tried to end the interview, using fallback question.');
        return 'Can you explain a challenging problem you solved recently and how you approached it?';
      }

      return raw
        .replace(/^(Question:|Q:)/i, '')
        .replace(/\*\*/g, '')
        .trim();
    } catch (err: any) {
      this.logger.error(
        `Gemini request failed: ${err.response?.status} ${err.response?.statusText}`,
      );
      this.logger.error(err.response?.data || err.message);
      return 'Error from Gemini API';
    }
  }

  /**
   * Generate the next interview question using job context + recent history.
   * Keeps last 5 Q&A to avoid LLM hallucinating interview end.
   */
  async generateQuestion(round: string, userId: string): Promise<string> {
    const history = await this.interviewService.getHistory(userId);
    const recentHistory = history.slice(-5);

    const context = recentHistory
      .map(
        (h) =>
          `Q: ${h.question}\nA: ${h.answer || '(not answered yet)'}\nFeedback: ${
            h.feedback || '(pending)'
          }`,
      )
      .join('\n\n');

    // get job context from earliest record (startWithContext) if present
    const base = history.find((h) => h.role || h.company || h.jobDescription || h.experience);

    const jobContext = base
      ? `Role: ${base.role || 'N/A'}\nCompany: ${base.company || 'N/A'}\nExperience: ${
          base.experience || 'N/A'
        }\nJob Description: ${base.jobDescription || 'N/A'}`
      : 'No job context provided.';

    const prompt = `You are an interviewer creating a question for the ${round} round.
Job context:
${jobContext}

Recent interview context:
${context}

Generate ONLY the next interview question in plain text. Do not provide any explanation, do not conclude the interview. If the context is empty, generate a starter question appropriate for the role.`;

    return this.callGemini(prompt);
  }

  async evaluateAnswer(question: string, answer: string): Promise<string> {
    const prompt = `You are an interviewer evaluating a candidate's answer.

Question: ${question}
Answer: ${answer}

Respond STRICTLY in this format (no extra text):
Feedback: <1-2 sentence feedback>
Score: X/10`;

    return this.callGemini(prompt);
  }
}
