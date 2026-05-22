import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Video, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { Avatar } from '../Common';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export const ChatWindow: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentConversation, 
    messages, 
    isLoadingMessages, 
    typingUsers,
    setCurrentConversation,
    loadMessages, 
    sendMessage,
    markAllAsRead
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
      markAllAsRead(conversationId);
    }
    return () => {
      setCurrentConversation(null);
    };
  }, [conversationId, loadMessages, markAllAsRead, setCurrentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherParticipant = () => {
    if (!currentConversation?.participants) return null;
    return currentConversation.participants.find((p) => p.id !== user?.id) || currentConversation.participants[0];
  };

  const other = getOtherParticipant();

  const handleSend = async (content: string) => {
    if (conversationId) {
      await sendMessage(conversationId, content);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-dark-input rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-dark-bg">
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-input"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar src={other?.avatar} alt={other?.username} size="md" isOnline={other?.isOnline} showStatus />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{other?.username || 'Unknown'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {other?.isOnline ? 'Online' : other?.lastSeen ? `Last seen ${new Date(other.lastSeen).toLocaleTimeString()}` : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-input">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-input">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-input">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const sender = typeof message.sender === 'string' ? null : message.sender;
          const senderId = sender?.id || sender?._id;
          const isOwn = senderId === user?.id;
          const prevMessage = messages[index - 1];
          const prevSender = prevMessage && typeof prevMessage.sender !== 'string' ? prevMessage.sender : null;
          const prevSenderId = prevSender?.id || prevSender?._id;
          const showAvatar = !prevMessage || prevSenderId !== senderId;

          return (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
            />
          );
        })}
        {typingUsers.size > 0 && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;