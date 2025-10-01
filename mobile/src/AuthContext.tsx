import React from 'react';
import { api, setToken, clearToken } from './api';

type User = { id: number; email: string; role: 'admin' | 'user' } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: 'admin' | 'user') => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.me();
        setUser(res.user);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const { token, user: u } = await api.login({ email, password });
    await setToken(token);
    setUser(u);
  }, []);

  const register = React.useCallback(async (email: string, password: string, role: 'admin' | 'user' = 'user') => {
    const { token, user: u } = await api.register({ email, password, role });
    await setToken(token);
    setUser(u);
  }, []);

  const logout = React.useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const value = React.useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


