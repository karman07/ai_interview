export enum StudentAssignmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EVALUATED = 'evaluated',
}

export interface StudentAssignment {
  _id: string;
  assignmentId: string;
  studentId: string;
  status: StudentAssignmentStatus;
  completedInterviews: number;
  scores: number[];
  avgScore: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Enriched fields from backend
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  numInterviews: number;
  deadline: string;
  teacherId: string;
}
