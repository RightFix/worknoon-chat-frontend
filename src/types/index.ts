export type UserRole = 'admin' | 'agent' | 'customer' | 'designer' | 'merchant';

export type MessageType = 'text' | 'file' | 'image' | 'system';

export type ConversationType = 'direct' | 'group';

export interface User {
  _id?: string;
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt?: string;
}

export interface Attachment {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User | string;
  content: string;
  messageType: MessageType;
  attachments: Attachment[];
  readBy: (User | string)[];
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  type: ConversationType;
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  toggle: () => void;
}