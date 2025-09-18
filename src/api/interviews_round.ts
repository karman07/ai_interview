import http from "./http";

export const InterviewsApi = {
  async history() {
    const { data } = await http.get("/interviews/history");
    return data;
  },

  async overall(userId: string) {
    const { data } = await http.get(`/interviews/overall/${userId}`);
    return data;
  },
};
