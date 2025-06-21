import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { storeUser, removeUser, getUser, getUserRole } from '../utils/authHelper';

interface AuthContextProps {
  user: ReturnType<typeof getUser> | null;
  login: (user: ReturnType<typeof getUser>) => void;
  logout: () => void;
  hasPermission: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = getUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  const login = (userInfo: ReturnType<typeof getUser>) => {
    if (userInfo) {
      storeUser(userInfo);
      setUser(userInfo);
    }
  };

  const logout = () => {
    removeUser();
    setUser(null);
    router.push('/login');
  };

  const hasPermission = (roles: string | string[]) => {
    const role = getUserRole();
    if (!role) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.includes(role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
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
