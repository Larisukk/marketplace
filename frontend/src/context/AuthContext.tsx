// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/auth";
import type { MeResponse, AuthResponse } from "../types/auth";

export type AuthState = {
  user: MeResponse | null;
  accessToken: string | null;
};

export type AuthCtx = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
};

const Context = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    authService.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("accessToken");
        setAccessToken(null);
        setUser(null);
      });
  }, [accessToken]);

  function handleAuthSuccess(res: AuthResponse) {
    if (res.accessToken) {
      localStorage.setItem("accessToken", res.accessToken);
      setAccessToken(res.accessToken);
    }
    if (res.user) setUser(res.user);
  }

  const login = async (email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.login({ email, password });
      handleAuthSuccess(res);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Autentificare eșuată";
      setError(message);
      throw e;
    } finally { setLoading(false); }
  };

  const register = async (displayName: string, email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      await authService.register({ displayName, email, password });

      await login(email, password);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Înregistrare eșuată";
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem("accessToken");
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    user, accessToken, login, register, logout, loading, error
  }), [user, accessToken, loading, error]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
