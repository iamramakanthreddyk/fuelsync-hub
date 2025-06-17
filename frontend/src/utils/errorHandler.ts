import { AxiosError } from 'axios';
import { ApiResponse } from '../types/api';

/**
 * Standard error structure for API errors
 */
export class ApiError extends Error {
  code: string;
  status: number;
  
  constructor(message: string, code = 'UNKNOWN_ERROR', status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Handles API errors and returns a standardized ApiError
 */
export function handleApiError(error: unknown): ApiError {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiResponse<any>;
    
    return new ApiError(
      response?.message || error.message || 'An unexpected error occurred',
      response?.code || 'API_ERROR',
      error.response?.status || 500
    );
  }
  
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return error;
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  // Handle unknown errors
  return new ApiError('An unexpected error occurred');
}

/**
 * Formats an error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}