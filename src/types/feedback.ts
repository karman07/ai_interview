export interface Feedback {
  _id: string;
  teacherId: {
    _id: string;
    name: string;
    profileImageUrl?: string;
  };
  studentId: string;
  type: "interview" | "resume" | "general";
  resultId?: string;
  assignmentId?: string;
  content: string;
  rating?: number;
  suggestions: string[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
