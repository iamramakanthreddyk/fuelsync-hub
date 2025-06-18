// frontend/src/utils/api.ts
import { authHeader } from './authHelper';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // Get auth headers from authHelper
  const authHeaders = authHeader();
  
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

  console.log(`API Request to ${endpoint}:`, { method, headers: requestOptions.headers });

  try {
    const response = await fetch(endpoint, requestOptions);
    const data = await response.json();
    
    console.log(`API Response from ${endpoint}:`, data);

    if (!response.ok) {
      // Check for auth errors
      if (response.status === 401) {
        console.error('Authentication error:', data);
        // Could redirect to login page here
      }
      
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
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