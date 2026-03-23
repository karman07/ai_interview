import http from "./http";
import { Feedback } from "../types/feedback";

export const feedbackApi = {
  getStudentFeedback: () => http.get<Feedback[]>("/feedback/student"),
  markAsRead: (id: string) => http.patch(`/feedback/${id}/read`, {}),
};
