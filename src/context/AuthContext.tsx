import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, OwnerAuthUser, AdminAuthStatus } from '../services/authService';

interface AuthContextType {
  user: OwnerAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: AdminAuthStatus | null;
  login: (passwordOrEmail: string, pass?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  refreshStatus: () => Promise<AdminAuthStatus | null>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<OwnerAuthUser | null>(null);
  const [status, setStatus] = useState<AdminAuthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshStatus = async (): Promise<AdminAuthStatus | null> => {
    try {
      const s = await authService.getStatus();
      setStatus(s);
      return s;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const existing = authService.getStoredSession();
    if (existing) {
      setUser(existing);
    }
    refreshStatus().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (passwordOrEmail: string, pass?: string) => {
    setIsLoading(true);
    try {
      const u = await authService.login(passwordOrEmail, pass);
      setUser(u);
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const u = await authService.loginWithGoogle();
      setUser(u);
      await refreshStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await authService.changePassword(currentPassword, newPassword);
    await refreshStatus();
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        status,
        login,
        loginWithGoogle,
        logout,
        refreshStatus,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
