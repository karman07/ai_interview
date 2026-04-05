export interface CoverLetterData {
  /** Full name of the applicant */
  applicantName: string;
  /** Applicant email */
  email: string;
  /** Applicant phone */
  phone: string;
  /** City / location */
  location: string;
  /** LinkedIn URL (optional) */
  linkedin?: string;
  /** Portfolio / website (optional) */
  website?: string;
  /** Date string shown on the letter */
  date: string;

  /** Hiring manager's name */
  hiringManagerName: string;
  /** Hiring manager title */
  hiringManagerTitle: string;
  /** Company name */
  companyName: string;
  /** Company address */
  companyAddress: string;

  /** Subject / role title */
  roleTitle: string;

  /** Opening paragraph */
  openingParagraph: string;
  /** Body paragraphs — array allows easy per-paragraph editing */
  bodyParagraphs: string[];
  /** Closing paragraph */
  closingParagraph: string;

  /** Salutation e.g. "Sincerely" */
  salutation: string;
}

export type CoverLetterTemplate =
  | 'Professional'
  | 'Modern'
  | 'Creative'
  | 'Minimal'
  | 'Executive';

export interface CoverLetterSettings {
  selectedTemplate: CoverLetterTemplate;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface GenerateCoverLetterRequest {
  jd: string;
  resumeText: string;
  applicantName?: string;
  email?: string;
  phone?: string;
  location?: string;
  companyName?: string;
  roleTitle?: string;
}
