import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { storeToken, removeToken, getToken, getUserInfo, isTokenExpired } from '../utils/authHelper';

interface AuthContextProps {
  token: string | null;
  user: ReturnType<typeof getUserInfo> | null;
  login: (token: string) => void;
  logout: () => void;
  hasPermission: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<ReturnType<typeof getUserInfo> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = token || getToken();
    if (stored && !token) {
      setToken(stored);
      setUser(getUserInfo());
    }

    const interval = setInterval(() => {
      if (stored && isTokenExpired()) {
        logout();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [token]);

  const login = (newToken: string) => {
    storeToken(newToken);
    setToken(newToken);
    setUser(getUserInfo());
  };

  const logout = () => {
    removeToken();
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const hasPermission = (roles: string | string[]) => {
    if (!user || !user.role) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
