import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '../services/apiClient';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SB_TREASURER = 'SB_TREASURER',
  SOCIETY_ADMIN = 'SOCIETY_ADMIN',
  VIEWER = 'VIEWER',
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  societyId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  isSuperAdmin: boolean;
  isTreasurer: boolean;
  isSocietyAdmin: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ieee_token');
    const savedUser = localStorage.getItem('ieee_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('ieee_token');
        localStorage.removeItem('ieee_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    const { token: newToken, refreshToken, user: userData } = data.data;

    localStorage.setItem('ieee_token', newToken);
    localStorage.setItem('ieee_refresh_token', refreshToken);
    localStorage.setItem('ieee_user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ieee_token');
    localStorage.removeItem('ieee_refresh_token');
    localStorage.removeItem('ieee_user');
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    hasRole,
    isSuperAdmin: user?.role === UserRole.SUPER_ADMIN,
    isTreasurer: user?.role === UserRole.SB_TREASURER,
    isSocietyAdmin: user?.role === UserRole.SOCIETY_ADMIN,
    isViewer: user?.role === UserRole.VIEWER,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
