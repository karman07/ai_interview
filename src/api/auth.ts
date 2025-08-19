import http, { tokenStore, userStore } from './http';
import { AuthPayload, LoginDto, SignupDto } from '@/types/user';

export const AuthApi = {
  async signup(dto: SignupDto): Promise<AuthPayload> {
    const { data } = await http.post<AuthPayload>('/auth/signup', dto);
    tokenStore.set(data.accessToken);
    userStore.set({ _id: data.user._id, email: data.user.email });
    return data;
  },

  async login(dto: LoginDto): Promise<AuthPayload> {
    const { data } = await http.post<AuthPayload>('/auth/login', dto);
    tokenStore.set(data.accessToken);
    userStore.set({ _id: data.user._id, email: data.user.email });
    return data;
  },

  async google(idToken: string): Promise<AuthPayload> {
    const { data } = await http.post<AuthPayload>('/auth/google', { idToken });
    tokenStore.set(data.accessToken);
    userStore.set({ _id: data.user._id, email: data.user.email });
    return data;
  },

  async logout(): Promise<void> {
    await http.get('/auth/logout');
    tokenStore.set(null);
    userStore.set(null);
  },
};
