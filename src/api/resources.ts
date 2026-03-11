import http from './http';

export interface GetResourcesParams {
    page?: number;
    limit?: number;
    category?: string;
    type?: string;
    difficulty?: string;
    search?: string;
    sort?: string;
}

export const resourcesApi = {
    getAll: async (params?: GetResourcesParams) => {
        const res = await http.get('/resources', { params });
        return res.data; // { data, total, page, totalPages }
    },

    getById: async (id: string) => {
        const res = await http.get(`/resources/${id}`);
        return res.data;
    },

    trackDownload: async (id: string) => {
        const res = await http.post(`/resources/${id}/download`);
        return res.data;
    },
};
