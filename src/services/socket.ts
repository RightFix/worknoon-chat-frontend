import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUser(userId: string): void {
    this.socket?.emit('join-user', userId);
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit('join-conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit('leave-conversation', conversationId);
  }

  emitTypingStart(conversationId: string, userId: string): void {
    this.socket?.emit('typing-start', { conversationId, userId });
  }

  emitTypingStop(conversationId: string, userId: string): void {
    this.socket?.emit('typing-stop', { conversationId, userId });
  }

  onNewMessage(callback: (data: { message: Message }) => void): void {
    this.socket?.on(EVENTS.NEW_MESSAGE, callback);
  }

  onUserNotification(callback: (data: { type: string; conversationId: string; message: Message }) => void): void {
    this.socket?.on(EVENTS.NOTIFICATION, callback);
  }

  onTypingStart(callback: (data: { userId: string }) => void): void {
    this.socket?.on(EVENTS.TYPING_START, callback);
  }

  onTypingStop(callback: (data: { userId: string }) => void): void {
    this.socket?.on(EVENTS.TYPING_STOP, callback);
  }

  onUserOnline(callback: (data: { userId: string }) => void): void {
    this.socket?.on(EVENTS.USER_ONLINE, callback);
  }

  onUserOffline(callback: (data: { userId: string }) => void): void {
    this.socket?.on(EVENTS.USER_OFFLINE, callback);
  }

  onMessageRead(callback: (data: { messageId: string; userId: string }) => void): void {
    this.socket?.on(EVENTS.MESSAGE_READ, callback);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  offAll(): void {
    this.socket?.removeAllListeners();
  }
}

export const EVENTS = {
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  NOTIFICATION: 'notification',
};

export const socketService = new SocketService();

export const subscribeToNewMessages = (
  conversationId: string,
  callback: (message: Message) => void
): (() => void) => {
  socketService.joinConversation(conversationId);
  socketService.onNewMessage((data) => {
    callback(data.message);
  });

  return () => {
    socketService.leaveConversation(conversationId);
    socketService.off(EVENTS.NEW_MESSAGE);
  };
};

export const subscribeToUserNotifications = (
  userId: string,
  callback: (data: { type: string; conversationId: string; message: Message }) => void
): (() => void) => {
  socketService.joinUser(userId);
  socketService.onUserNotification(callback);

  return () => {
    socketService.off(EVENTS.NOTIFICATION);
  };
};

export const subscribeToTyping = (
  conversationId: string,
  callback: (data: { userId: string; isTyping: boolean }) => void
): (() => void) => {
  socketService.joinConversation(conversationId);
  socketService.onTypingStart((data) => {
    callback({ ...data, isTyping: true });
  });
  socketService.onTypingStop((data) => {
    callback({ ...data, isTyping: false });
  });

  return () => {
    socketService.leaveConversation(conversationId);
    socketService.off(EVENTS.TYPING_START);
    socketService.off(EVENTS.TYPING_STOP);
  };
};

export const subscribeToUserStatus = (
  callback: (data: { userId: string; isOnline: boolean }) => void
): (() => void) => {
  socketService.onUserOnline((data) => {
    callback({ ...data, isOnline: true });
  });
  socketService.onUserOffline((data) => {
    callback({ ...data, isOnline: false });
  });

  return () => {
    socketService.off(EVENTS.USER_ONLINE);
    socketService.off(EVENTS.USER_OFFLINE);
  };
};

export const subscribeToMessageRead = (
  conversationId: string,
  callback: (data: { messageId: string; userId: string }) => void
): (() => void) => {
  socketService.joinConversation(conversationId);
  socketService.onMessageRead(callback);

  return () => {
    socketService.leaveConversation(conversationId);
    socketService.off(EVENTS.MESSAGE_READ);
  };
};