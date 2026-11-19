"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as authService from "@/services/auth";
import type { AuthUser, LoginData, RegisterData } from "@/types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasRequestedSession = useRef(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      setUser(await authService.getCurrentUser());
    } catch {
      // 401, rede indisponível ou qualquer falha: não há sessão utilizável.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasRequestedSession.current) return;

    hasRequestedSession.current = true;
    void refresh();
  }, [refresh]);

  const login = useCallback(async (data: LoginData) => {
    const authenticatedUser = await authService.login(data);
    setUser(authenticatedUser);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    // O cadastro não autentica: o usuário é encaminhado para /login pela tela.
    await authService.register(data);
  }, []);

  const logout = useCallback(async () => {
    // Se a requisição falhar, o estado permanece autenticado: não afirmamos
    // que a sessão foi revogada sem confirmação do backend.
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      refresh,
    }),
    [user, isLoading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
