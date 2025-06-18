// frontend/src/utils/api.ts
import { authHeader, removeToken } from './authHelper';
import Router from 'next/router';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  try {
    // Get auth headers from authHelper
    const authHeaders = authHeader();
    
    // If no auth headers and endpoint requires auth, redirect to login
    if (!authHeaders.Authorization && !endpoint.includes('/login')) {
      console.error('No auth token available for API request');
      Router.push('/login');
      throw new Error('Authentication required');
    }
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    console.log(`API Request to ${endpoint}:`, { 
      method, 
      headers: { 
        ...requestOptions.headers,
        Authorization: authHeaders.Authorization ? 'Bearer [FILTERED]' : undefined 
      }
    });

    const response = await fetch(endpoint, requestOptions);
    
    // Handle 401 Unauthorized errors
    if (response.status === 401) {
      console.error('Authentication error:', await response.text());
      removeToken(); // Clear invalid token
      Router.push('/login');
      throw new Error('Authentication failed');
    }
    
    const data = await response.json();
    
    console.log(`API Response from ${endpoint}:`, data);

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // If error message indicates JWT issues, clear token and redirect
    if (error.message && (
      error.message.includes('jwt') || 
      error.message.includes('token') || 
      error.message.includes('auth')
    )) {
      console.error('Token error detected, redirecting to login');
      removeToken();
      Router.push('/login');
    }
    
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => 
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<T> => 
    fetchApi<T>(endpoint, { ...options, method: 'POST', body }),
    
  put: <T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<T> => 
    fetchApi<T>(endpoint, { ...options, method: 'PUT', body }),
    
  delete: <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => 
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};