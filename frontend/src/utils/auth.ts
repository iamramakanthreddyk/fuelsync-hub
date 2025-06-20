import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from './api';
import { ApiResponse, LoginResponseData, RegisterResponseData, User, UserResponseData } from '../types/api';

/**
 * Login function that authenticates a user with email and password
 */
export const login = async (email: string, password: string, isAdmin = false): Promise<LoginResponseData> => {
  try {
    const endpoint = isAdmin ? '/admin/login' : '/auth/login';
    const response = await apiPost<ApiResponse<LoginResponseData>>(endpoint, { email, password });
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Login failed');
    }
    
    // Store token and user in localStorage
    const token = response.data.token.replace('Bearer ', '');
    localStorage.setItem(isAdmin ? 'admin_token' : 'token', token);
    localStorage.setItem(isAdmin ? 'admin_user' : 'user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

/**
 * Register function that creates a new tenant and owner
 */
export const register = async (
  name: string,
  email: string,
  password: string,
  subscriptionPlan: string
): Promise<RegisterResponseData> => {
  try {
    const response = await apiPost<ApiResponse<RegisterResponseData>>(
      '/auth/register',
      { name, email, password, subscriptionPlan }
    );
    
    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

/**
 * Logout function that removes auth data from localStorage
 */
export const logout = async (isAdmin = false): Promise<void> => {
  try {
    // Call logout endpoint to clear server-side session/cookies
    await apiPost<ApiResponse<{ message: string }>>('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Always clear local storage regardless of API success
    localStorage.removeItem(isAdmin ? 'admin_token' : 'token');
    localStorage.removeItem(isAdmin ? 'admin_user' : 'user');
    window.location.href = isAdmin ? '/admin/login' : '/login';
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (isAdmin = false): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem(isAdmin ? 'admin_user' : 'user');
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (isAdmin = false): boolean => {
  if (typeof window === 'undefined') return false;
  
  return !!localStorage.getItem(isAdmin ? 'admin_token' : 'token');
};

/**
 * Custom hook for auth protection and management
 */
export const useAuth = (isAdminSection = false) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Login handler
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login(email, password, isAdminSection);
      setUser(result.user);
      
      router.push(isAdminSection ? '/admin/dashboard' : '/dashboard');
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout handler
   */
  const handleLogout = async () => {
    await logout(isAdminSection);
    setUser(null);
  };

  /**
   * Check if current user is an admin
   */
  const isAdmin = () => {
    return user?.role === 'superadmin';
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  };

  /**
   * Verify authentication status with server
   */
  const checkAuth = async () => {
    const token = localStorage.getItem(isAdminSection ? 'admin_token' : 'token');
    if (!token) {
      setLoading(false);
      return false;
    }
    
    try {
      const response = await apiGet<ApiResponse<UserResponseData>>('/auth/me');
      
      if (response.status !== 'success' || !response.data) {
        throw new Error('Failed to get user data');
      }
      
      setUser(response.data.user);
      return true;
    } catch (error) {
      localStorage.removeItem(isAdminSection ? 'admin_token' : 'token');
      localStorage.removeItem(isAdminSection ? 'admin_user' : 'user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    loading,
    isAdmin,
    hasRole,
    login: handleLogin,
    logout: handleLogout,
    checkAuth
  };
};