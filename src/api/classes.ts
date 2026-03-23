import http from "./http";

export interface StudentClass {
  _id: string;
  name: string;
  department: string;
  semester: string;
  classCode: string;
  teacherId: string;
  universityId: string;
  studentCount: number;
  createdAt: string;
}

export const classesApi = {
  getStudentClasses: () => http.get<StudentClass[]>("/classes/student"),
  getClassDetails: (id: string) => http.get<any>(`/classes/student/${id}`),
  joinByCode: (code: string) => http.post<any>(`/classes/join/${code}`, {}),
  getJoinPreview: (code: string) => http.get<any>(`/classes/join/${code}`),
};
