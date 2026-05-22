import Pusher from 'pusher-js';
import type { Message, User } from '../types';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || '';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

export const pusher = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  forceTLS: true,
});

export const CHANNELS = {
  USER: (userId: string) => `user-${userId}`,
  CONVERSATION: (conversationId: string) => `conversation-${conversationId}`,
};

export const EVENTS = {
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  NOTIFICATION: 'notification',
};

export type PusherEventCallback = (data: unknown) => void;

class PusherService {
  private subscriptions: Map<string, Map<string, PusherEventCallback>> = new Map();

  subscribeToUser(userId: string, event: string, callback: PusherEventCallback): void {
    const channel = pusher.subscribe(CHANNELS.USER(userId));
    
    channel.bind(event, callback);
    
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Map());
    }
    this.subscriptions.get(userId)?.set(event, callback);
  }

  subscribeToConversation(conversationId: string, event: string, callback: PusherEventCallback): void {
    const channel = pusher.subscribe(CHANNELS.CONVERSATION(conversationId));
    
    channel.bind(event, callback);
    
    if (!this.subscriptions.has(conversationId)) {
      this.subscriptions.set(conversationId, new Map());
    }
    this.subscriptions.get(conversationId)?.set(event, callback);
  }

  unsubscribeFromUser(userId: string): void {
    pusher.unsubscribe(CHANNELS.USER(userId));
    this.subscriptions.delete(userId);
  }

  unsubscribeFromConversation(conversationId: string): void {
    pusher.unsubscribe(CHANNELS.CONVERSATION(conversationId));
    this.subscriptions.delete(conversationId);
  }

  disconnect(): void {
    pusher.disconnect();
    this.subscriptions.clear();
  }
}

export const pusherService = new PusherService();

export const subscribeToNewMessages = (
  conversationId: string,
  callback: (message: Message) => void
): (() => void) => {
  const channel = pusher.subscribe(CHANNELS.CONVERSATION(conversationId));
  
  channel.bind(EVENTS.NEW_MESSAGE, (data: { message: Message }) => {
    callback(data.message);
  });

  return () => {
    channel.unbind(EVENTS.NEW_MESSAGE);
    pusher.unsubscribe(CHANNELS.CONVERSATION(conversationId));
  };
};

export const subscribeToUserNotifications = (
  userId: string,
  callback: (data: { type: string; conversationId: string; message: Message }) => void
): (() => void) => {
  const channel = pusher.subscribe(CHANNELS.USER(userId));
  
  channel.bind(EVENTS.NOTIFICATION, callback);

  return () => {
    channel.unbind(EVENTS.NOTIFICATION);
    pusher.unsubscribe(CHANNELS.USER(userId));
  };
};

export const subscribeToTyping = (
  conversationId: string,
  callback: (data: { userId: string; isTyping: boolean }) => void
): (() => void) => {
  const channel = pusher.subscribe(CHANNELS.CONVERSATION(conversationId));
  
  channel.bind(EVENTS.TYPING_START, (data: { userId: string }) => {
    callback({ ...data, isTyping: true });
  });
  
  channel.bind(EVENTS.TYPING_STOP, (data: { userId: string }) => {
    callback({ ...data, isTyping: false });
  });

  return () => {
    channel.unbind(EVENTS.TYPING_START);
    channel.unbind(EVENTS.TYPING_STOP);
    pusher.unsubscribe(CHANNELS.CONVERSATION(conversationId));
  };
};

export const subscribeToUserStatus = (
  userId: string,
  callback: (data: { userId: string; isOnline: boolean }) => void
): (() => void) => {
  const channel = pusher.subscribe(CHANNELS.USER(userId));
  
  channel.bind(EVENTS.USER_ONLINE, (data: { userId: string }) => {
    callback({ ...data, isOnline: true });
  });
  
  channel.bind(EVENTS.USER_OFFLINE, (data: { userId: string }) => {
    callback({ ...data, isOnline: false });
  });

  return () => {
    channel.unbind(EVENTS.USER_ONLINE);
    channel.unbind(EVENTS.USER_OFFLINE);
    pusher.unsubscribe(CHANNELS.USER(userId));
  };
};

export const subscribeToMessageRead = (
  conversationId: string,
  callback: (data: { messageId: string; userId: string }) => void
): (() => void) => {
  const channel = pusher.subscribe(CHANNELS.CONVERSATION(conversationId));
  
  channel.bind(EVENTS.MESSAGE_READ, callback);

  return () => {
    channel.unbind(EVENTS.MESSAGE_READ);
    pusher.unsubscribe(CHANNELS.CONVERSATION(conversationId));
  };
};