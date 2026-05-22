import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Conversation, Message, User } from '../types';
import { conversationAPI, messageAPI } from '../services/api';
import { 
  subscribeToNewMessages, 
  subscribeToTyping,
  subscribeToMessageRead,
  subscribeToUserNotifications
} from '../services/pusher';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  typingUsers: Map<string, boolean>;
  unreadCount: number;
  loadConversations: () => Promise<void>;
  setCurrentConversation: (conv: Conversation | null) => void;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  markAllAsRead: (conversationId: string) => Promise<void>;
  createConversation: (participantId: string) => Promise<Conversation | null>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const unsubscribeRef = useRef<(() => void)[]>([]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await conversationAPI.getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
        const totalUnread = response.data.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await messageAPI.getMessages(conversationId);
      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    try {
      await messageAPI.sendMessage(conversationId, { content, messageType: 'text' });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, []);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await messageAPI.markAsRead(messageId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async (conversationId: string) => {
    try {
      await messageAPI.markAllAsRead(conversationId);
      setConversations(prev => prev.map(conv => 
        conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  const createConversation = useCallback(async (participantId: string): Promise<Conversation | null> => {
    try {
      const response = await conversationAPI.createConversation({ participantId });
      if (response.success && response.data) {
        await loadConversations();
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [loadConversations]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await conversationAPI.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [currentConversation]);

  useEffect(() => {
    if (currentConversation?._id && user) {
      const unsubscribers: (() => void)[] = [];

      const unsubMessages = subscribeToNewMessages(currentConversation._id, (message) => {
        setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev;
          return [...prev, message];
        });
      });
      unsubscribers.push(unsubMessages);

      const unsubTyping = subscribeToTyping(currentConversation._id, ({ userId, isTyping }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, isTyping);
          return newMap;
        });
      });
      unsubscribers.push(unsubTyping);

      const unsubRead = subscribeToMessageRead(currentConversation._id, ({ messageId, userId }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, readBy: [...msg.readBy, userId as User] }
            : msg
        ));
      });
      unsubscribers.push(unsubRead);

      unsubscribeRef.current = unsubscribers;

      return () => {
        unsubscribers.forEach(unsub => unsub());
        unsubscribeRef.current = [];
        setTypingUsers(new Map());
      };
    }
  }, [currentConversation?._id, user]);

  useEffect(() => {
    if (user) {
      const unsubNotifications = subscribeToUserNotifications(user.id, (data) => {
        if (data.type === 'new_message') {
          loadConversations();
        }
      });

      return () => {
        unsubNotifications();
      };
    }
  }, [user, loadConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        isLoading,
        isLoadingMessages,
        typingUsers,
        unreadCount,
        loadConversations,
        setCurrentConversation,
        loadMessages,
        sendMessage,
        markAsRead,
        markAllAsRead,
        createConversation,
        deleteConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;