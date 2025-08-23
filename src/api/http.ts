import axios, { AxiosError, AxiosInstance } from 'axios';
// import { AuthPayload } from '@/types/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

let accessToken: string | null = null;
let currentUser: { _id: string; email: string } | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (t: string | null) => {
    accessToken = t;
  },
};

export const userStore = {
  get: () => currentUser,
  set: (u: { _id: string; email: string } | null) => {
    currentUser = u;
  },
};

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<() => void> = [];

async function refreshAccessToken() {
  const u = userStore.get();
  if (!u) throw new Error('No user in store to refresh.');

  const res = await axios.post<{ accessToken: string }>(
    `${API_BASE_URL}/auth/refresh`,
    { userId: u._id, email: u.email },
    { withCredentials: true }
  );
  tokenStore.set(res.data.accessToken);
  return res.data.accessToken;
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (error.response?.status === 401 && !original?._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => queue.push(resolve));
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${tokenStore.get()}`;
        original._retry = true;
        return http(original);
      }

      try {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        queue.forEach((fn) => fn());
        queue = [];
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        original._retry = true;
        return http(original);
      } catch (e) {
        queue = [];
        tokenStore.set(null);
        userStore.set(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default http;
