// Main API instance and utilities
export { default as api, getToken, setToken, removeToken, apiMethods } from './api';

// Authentication API
export { authAPI } from './authAPI';
export type { 
  RegisterData, 
  LoginData, 
  User, 
  AuthResponse 
} from './authAPI';

// Snippet API  
export { snippetAPI } from './snippetAPI';
export type {
  Snippet,
  CreateSnippetData,
  UpdateSnippetData,
  SnippetSearchQuery,
  PaginatedSnippets
} from './snippetAPI';

// Common API Response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// API Error handling utility
export interface APIError {
  success: false;
  error: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
}

// Type guard to check if error is API error
export const isAPIError = (error: any): error is APIError => {
  return error && typeof error === 'object' && error.success === false;
};

// Extract error message from API response
export const getErrorMessage = (error: any): string => {
  if (isAPIError(error)) {
    return error.message || error.error || 'Erro desconhecido';
  }
  
  if (error?.response?.data) {
    const data = error.response.data;
    if (data.message) return data.message;
    if (data.error) return data.error;
  }
  
  if (error?.message) return error.message;
  
  return 'Erro de conexão. Tente novamente.';
};
