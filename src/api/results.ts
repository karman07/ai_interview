import http from "./http";

export const ResultsApi = {
  mine: () => http.get("/results/mine"),
  getOne: (id: string) => http.get(`/results/${id}`),
};
