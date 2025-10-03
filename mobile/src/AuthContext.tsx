import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from './api';
import { User, UserRole } from './types/user';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user on load', error);
          await AsyncStorage.removeItem('token'); // Token is invalid
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user: userData } = await api.login({ username, password });
    await AsyncStorage.setItem('token', token);
    setAuthToken(token);
    setUser(userData);
  }, []);

  const register = useCallback(async (username: string, password: string, fullName: string, role: UserRole) => {
    const { token, user: userData } = await api.register({ username, password, fullName, role });
    await AsyncStorage.setItem('token', token);
    setAuthToken(token);
    setUser(userData);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user', error);
      // Might want to logout if token is invalid
      logout();
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


