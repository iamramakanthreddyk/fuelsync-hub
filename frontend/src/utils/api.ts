// frontend/src/utils/api.ts
import Router from 'next/router';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001/api';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  try {
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      credentials: 'include'
    };

    if (method !== 'GET') {
      const match = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )csrfToken=([^;]+)/) : null;
      const csrfToken = match ? decodeURIComponent(match[1]) : '';
      if (csrfToken) {
        (requestOptions.headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
      }
    }

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    console.log(`API Request to ${url}:`, {
      method,
      headers: requestOptions.headers
    });

    const response = await fetch(url, requestOptions);
    
    // Handle 401 Unauthorized errors
    if (response.status === 401) {
      console.error('Authentication error:', await response.text());
      Router.push('/login');
      throw new Error('Authentication failed');
    }
    
    const data = await response.json();
    
    console.log(`API Response from ${url}:`, data);

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

  patch: <T>(endpoint: string, body: any, options: ApiOptions = {}): Promise<T> =>
    fetchApi<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options: ApiOptions = {}): Promise<T> =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};