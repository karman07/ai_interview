import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthPayload, LoginDto, SignupDto, User } from "@/types/user";
import { AuthApi } from "@/api/auth";
import { UsersApi } from "@/api/users";
import http, { tokenStore, userStore } from "@/api/http";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (dto: LoginDto) => Promise<AuthPayload>;
  signup: (dto: SignupDto) => Promise<AuthPayload>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  googleLogin: (idToken: string) => Promise<AuthPayload>;
};

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const bootstrap = async () => {
    try {
      if (tokenStore.get() && userStore.get()) {
        const me = await UsersApi.me();
        setUser(me);
      }
    } catch {
      // token invalid; clear
      await AuthApi.logout().catch(() => {});
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,

      login: async (dto) => {
        const res = await AuthApi.login(dto);
        const me = await UsersApi.me();
        setUser(me);
        return res;
      },

      signup: async (dto) => {
        const res = await AuthApi.signup(dto);
        const me = await UsersApi.me();
        setUser(me);
        return res;
      },

      logout: async () => {
        await AuthApi.logout();
        setUser(null);
      },

      refreshMe: async () => {
        const me = await UsersApi.me();
        setUser(me);
      },

      // ✅ Google login fixed
      googleLogin: async (idToken: string): Promise<AuthPayload> => {
        const res = await http.post<AuthPayload>("/auth/google", { idToken });
        console.log("Google Login Response:", res.data);

        // store tokens (if your backend sends them)
        if (res.data.accessToken) tokenStore.set(res.data.accessToken);

        // fetch full user profile from backend
        const me = await UsersApi.me();
        setUser(me);

        return res.data; // still return full AuthPayload
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
