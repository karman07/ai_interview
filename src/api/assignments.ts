import http from "./http";
import { StudentAssignment } from "../types/assignment";

export const assignmentsApi = {
  getAssignments: () => http.get<StudentAssignment[]>("/assignments/student"),
  getAssignmentDetails: (id: string) => http.get<StudentAssignment>(`/assignments/student/${id}`),
};
