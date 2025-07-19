import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create Axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management utilities
const TOKEN_KEY = 'codecollab_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = getToken();
    
    if (token) {
      // Add Bearer token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for development (remove in production)
    if (import.meta.env.DEV) {
      console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Log request error
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token management
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response for development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status}`, {
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    const status = error.response?.status;
    const message = error.response?.data as any;
    
    // Log error for development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${status}`, {
        url: error.config?.url,
        message: message,
        error: error
      });
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      // Remove invalid token
      removeToken();
      
      // Only redirect to login if we're not already on auth pages
      const isAuthPage = window.location.pathname.includes('/login') || 
                        window.location.pathname.includes('/register');
      
      if (!isAuthPage) {
        // Redirect to login page
        window.location.href = '/login';
        
        // Show user-friendly message
        console.warn('⚠️ Sessão expirada. Redirecionando para login...');
      }
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      console.warn('⚠️ Acesso negado. Você não tem permissão para esta operação.');
    }
    
    // Handle 404 Not Found
    if (status === 404) {
      console.warn('⚠️ Recurso não encontrado.');
    }
    
    // Handle 500 Internal Server Error
    if (status === 500) {
      console.error('💥 Erro interno do servidor. Tente novamente mais tarde.');
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Erro de conexão. Verifique sua internet e tente novamente.');
    }
    
    return Promise.reject(error);
  }
);

// API methods for common operations
export const apiMethods = {
  // GET request
  get: <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => 
    api.get<T>(url, config),
  
  // POST request
  post: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => 
    api.post<T>(url, data, config),
  
  // PUT request
  put: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => 
    api.put<T>(url, data, config),
  
  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> => 
    api.patch<T>(url, data, config),
  
  // DELETE request
  delete: <T = any>(url: string, config?: any): Promise<AxiosResponse<T>> => 
    api.delete<T>(url, config),
};

// Export the configured Axios instance as default
export default api;
