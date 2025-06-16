import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { apiPost } from './api';

// Types
export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  tenantId?: string;
  isAdmin?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Login function
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const data = await apiPost<LoginResponse>('/auth/login', { email, password });
    
    // Store token and user in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Register function
export const register = async (
  name: string,
  email: string,
  password: string,
  planType: string
): Promise<{ message: string; tenant: any }> => {
  try {
    const data = await apiPost<{ message: string; tenant: any }>(
      '/auth/register',
      { name, email, password, planType }
    );
    
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return !!localStorage.getItem('token');
};

// Custom hook for auth protection
export const useAuth = (requiredRoles?: string[]) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (!token || !userJson) {
      router.push('/login');
      return;
    }
    
    const currentUser = JSON.parse(userJson) as User;
    setUser(currentUser);
    
    // Check role if required
    if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
      router.push('/dashboard');
      return;
    }
    
    setLoading(false);
  }, [router, requiredRoles]);
  
  return { loading, user };
};