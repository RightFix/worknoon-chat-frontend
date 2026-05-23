import axios, { AxiosError } from 'axios';
import type { AuthResponse, ApiResponse, User, Conversation, Message, RegisterInput, LoginInput } from '../types';
import { getCookie, removeCookie } from '../utils/cookies';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getCookie('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeCookie('token');
      removeCookie('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  refresh: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/refresh');
    return response.data;
  },
};

export const userAPI = {
  getUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string }): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>('/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  updateUserRole: async (id: string, role: string): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return response.data;
  },

  updateStatus: async (id: string, isOnline: boolean): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}/status`, { isOnline });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<{ totalUsers: number; usersByRole: Record<string, number>; onlineUsers: number }>> => {
    const response = await api.get('/users/stats/admin');
    return response.data;
  },
};

export const conversationAPI = {
  getConversations: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Conversation[]>> => {
    const response = await api.get<ApiResponse<Conversation[]>>('/conversations', { params });
    return response.data;
  },

  createConversation: async (data: { participantId: string; type?: 'direct' | 'group' }): Promise<ApiResponse<Conversation>> => {
    const response = await api.post<ApiResponse<Conversation>>('/conversations', data);
    return response.data;
  },

  getConversation: async (id: string): Promise<ApiResponse<Conversation>> => {
    const response = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`);
    return response.data;
  },

  deleteConversation: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/conversations/${id}`);
    return response.data;
  },
};

export const messageAPI = {
  getMessages: async (conversationId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<Message[]>> => {
    const response = await api.get<ApiResponse<Message[]>>(`/messages/${conversationId}`, { params });
    return response.data;
  },

  sendMessage: async (conversationId: string, data: { content: string; messageType?: string; attachments?: any[] }): Promise<ApiResponse<Message>> => {
    const response = await api.post<ApiResponse<Message>>(`/messages/${conversationId}`, data);
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/messages/${messageId}/read`);
    return response.data;
  },

  markAllAsRead: async (conversationId: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/messages/${conversationId}/read-all`);
    return response.data;
  },

  deleteMessage: async (messageId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/messages/${messageId}`);
    return response.data;
  },
};

export const uploadAPI = {
  uploadFile: async (file: File): Promise<ApiResponse<{ url: string; filename: string; mimeType: string; size: number }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<{ url: string; filename: string; mimeType: string; size: number }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadMultiple: async (files: File[]): Promise<ApiResponse<{ url: string; filename: string; mimeType: string; size: number }[]>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post<ApiResponse<{ url: string; filename: string; mimeType: string; size: number }[]>>('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default api;