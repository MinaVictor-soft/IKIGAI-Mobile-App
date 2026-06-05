import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { saveTokens, clearTokens, getAccessToken, getRefreshToken } from '../lib/storage';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const queryClient = useQueryClient();

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setState({
        user: data.data,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (token) {
        await fetchUser();
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    })();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    await saveTokens(data.data);
    await fetchUser();
  };

  const logout = async () => {
    // Grab refresh token before clearing
    const refreshToken = await getRefreshToken();

    // Immediately clear state so UI redirects to login
    await clearTokens();
    queryClient.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false });

    // Best-effort backend notification (don't block on it)
    if (refreshToken) {
      try {
        const axios = require('axios').default;
        axios.post(`${api.defaults.baseURL}/auth/logout`, { refreshToken }).catch(() => {});
      } catch {
        // Ignore
      }
    }
  };

  const refreshUser = fetchUser;

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
