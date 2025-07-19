import api from './api';
import type { AxiosResponse } from 'axios';

// Types for snippets
export interface Snippet {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  language: string;
  tags: string[];
  isPublic: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
  _count: {
    reviews: number;
  };
}

export interface CreateSnippetData {
  title: string;
  description?: string;
  content: string;
  language: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateSnippetData {
  title?: string;
  description?: string;
  content?: string;
  language?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface SnippetSearchQuery {
  page?: number;
  limit?: number;
  language?: string;
  search?: string;
  tag?: string;
  author?: string;
  sortBy?: 'created' | 'updated' | 'views' | 'likes' | 'title';
  sortOrder?: 'asc' | 'desc';
  isPublic?: boolean;
}

export interface PaginatedSnippets {
  snippets: Snippet[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Snippet API methods
export const snippetAPI = {
  // Create new snippet
  create: (snippetData: CreateSnippetData): Promise<AxiosResponse<ApiResponse<{ snippet: Snippet }>>> =>
    api.post('/snippets', snippetData),

  // Get all public snippets
  getAll: (): Promise<AxiosResponse<ApiResponse<{ snippets: Snippet[]; count: number }>>> =>
    api.get('/snippets'),

  // Search snippets with pagination and filters
  search: (query: SnippetSearchQuery = {}): Promise<AxiosResponse<ApiResponse<PaginatedSnippets>>> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/snippets/search?${params.toString()}`);
  },

  // Get snippet by ID
  getById: (id: string): Promise<AxiosResponse<ApiResponse<{ snippet: Snippet }>>> =>
    api.get(`/snippets/${id}`),

  // Update snippet
  update: (id: string, updateData: UpdateSnippetData): Promise<AxiosResponse<ApiResponse<{ snippet: Snippet }>>> =>
    api.put(`/snippets/${id}`, updateData),

  // Partially update snippet
  patch: (id: string, updateData: UpdateSnippetData): Promise<AxiosResponse<ApiResponse<{ snippet: Snippet }>>> =>
    api.patch(`/snippets/${id}`, updateData),

  // Delete snippet
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/snippets/${id}`),

  // Get user's snippets
  getUserSnippets: (userId: string): Promise<AxiosResponse<ApiResponse<{ snippets: Snippet[]; count: number }>>> =>
    api.get(`/users/${userId}/snippets`),
};
