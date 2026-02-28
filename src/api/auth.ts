import http, { tokenStore, userStore } from './http';
import { AuthPayload, LoginDto, SignupDto } from '@/types/user';

export const AuthApi = {
  async signup(dto: SignupDto): Promise<AuthPayload> {
    const { data } = await http.post<AuthPayload>('/auth/signup', dto);
    // Do NOT store tokens — user must verify email before being considered authenticated.
    // Immediately clear any tokens/user that might have been set so the app stays
    // in a logged-out state and routes the user to the verification page.
    tokenStore.set(null);
    userStore.set(null);
    return data;
  },

  async login(dto: LoginDto): Promise<AuthPayload> {
    const { data } = await http.post<AuthPayload>('/auth/login', dto);
    if (data?.accessToken) tokenStore.set(data.accessToken);
    if (data?.user) userStore.set({ _id: data.user._id, email: data.user.email });
    return data;
  },


  googleLogin: (idToken: string) =>
    http.post<AuthPayload>("/auth/google", { idToken }),

  async logout(): Promise<void> {
    await http.get('/auth/logout');
    tokenStore.set(null);
    userStore.set(null);
  },
};
