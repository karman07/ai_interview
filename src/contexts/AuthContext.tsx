import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AuthPayload, LoginDto, SignupDto, User } from "@/types/user";
import { AuthApi } from "@/api/auth";
import { UsersApi } from "@/api/users";
import http, { tokenStore } from "@/api/http";

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

  // On mount, check localStorage for access_token
  const bootstrap = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        tokenStore.set(accessToken);
        const me = await UsersApi.me();
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
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
        if (res.accessToken) {
          localStorage.setItem('access_token', res.accessToken);
          tokenStore.set(res.accessToken);
        }
        const me = await UsersApi.me();
        setUser(me);
        return res;
      },

      signup: async (dto) => {
        const res = await AuthApi.signup(dto);
        if (res.accessToken) {
          localStorage.setItem('access_token', res.accessToken);
          tokenStore.set(res.accessToken);
        }
        const me = await UsersApi.me();
        setUser(me);
        return res;
      },

      logout: async () => {
        await AuthApi.logout();
        localStorage.removeItem('access_token');
        tokenStore.set(null);
        setUser(null);
      },

      refreshMe: async () => {
        const me = await UsersApi.me();
        setUser(me);
      },

      googleLogin: async (idToken: string): Promise<AuthPayload> => {
        const res = await http.post<AuthPayload>("/auth/google", { idToken });
        console.log("Google Login Response:", res.data);

        if (res.data.accessToken) {
          localStorage.setItem('access_token', res.data.accessToken);
          tokenStore.set(res.data.accessToken);
        }
        const me = await UsersApi.me();
        setUser(me);
        return res.data;
      },
    }),
    [user, loading]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-lg">Loading…</div>
      </div>
    );
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
