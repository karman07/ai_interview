import axios from 'axios';
import { tokenStore } from './http';

const aiHttp = axios.create({
    baseURL: import.meta.env.VITE_AI_INTERVIEW_API || 'http://localhost:8001',
    withCredentials: true,
});

aiHttp.interceptors.request.use((config) => {
    const token = tokenStore.get();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default aiHttp;
