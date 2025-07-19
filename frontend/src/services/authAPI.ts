import api from './api';
import type { AxiosResponse } from 'axios';

// Types for authentication
export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  points: number;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Authentication API methods
export const authAPI = {
  // Register new user
  register: (userData: RegisterData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', userData),

  // Login user
  login: (credentials: LoginData): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', credentials),

  // Get current user profile
  getProfile: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.get('/auth/profile'),

  // Refresh token
  refreshToken: (): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/refresh'),

  // Logout user
  logout: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/auth/logout'),

  // Verify token
  verifyToken: (): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.get('/auth/verify'),
};
