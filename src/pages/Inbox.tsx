import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { userAPI } from '../services/api';
import { Avatar, Button, Input, Badge } from '../components/Common';
import { ChatWindow } from '../components/Chat/ChatWindow';
import type { User } from '../types';
import { format } from 'date-fns';

const Inbox: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, isLoading, loadConversations, createConversation, setCurrentConversation } = useChat();
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const searchUsers = async () => {
      
      setIsSearching(true);
      try {
        const response = await userAPI.getUsers({ search: searchQuery });
        if (response.success && response.data) {
          setSearchResults(response.data.filter((u) => u._id !== user?.id));
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user?.id]);

  const handleStartChat = async (participantId: string) => {

    try {
      const conversation = await createConversation(participantId);
      if (conversation) {
        setSelectedChatId(conversation._id);
        setShowNewChat(false);
        setSearchQuery('');
        setSearchResults([]);
        navigate(`/chat/${conversation._id}`);
      }
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedChatId(conversationId);
    setCurrentConversation(conversations.find(c => c._id === conversationId) || null);
  };

  const getOtherParticipant = (participants: User[]) => {
    return participants.find((p) => p._id !== user?.id) || participants[0];
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-full lg:w-80 xl:w-96 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
            <Button
              onClick={() => setShowNewChat(true)}
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New
            </Button>
          </div>
          <Input
            placeholder="Search conversations..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {showNewChat ? (
            <div className="p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Start a new conversation</p>
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                </div>
              ) : searchResults.length > 0 ? (
                <ul className="space-y-2">
                  {searchResults.map((result) => (
                    <li key={result.id}>
                      <button
                        onClick={() => handleStartChat(result._id || '')}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-input transition-colors"
                      >
                        <Avatar src={result.avatar} alt={result.username} size="md" isOnline={result.isOnline} showStatus />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{result.username}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{result.role}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : searchQuery.length >= 2 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No users found</p>
              ) : null}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
              <Button
                onClick={() => setShowNewChat(true)}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                Start a new chat
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-dark-border">
              {conversations.map((conv) => {
                const other = getOtherParticipant(conv.participants as User[]);
                return (
                  <li key={conv._id}>
                    <Link
                       to={`/chat/${conv._id}`}
                    >
                    <button
                      onClick={() => handleSelectConversation(conv._id)}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-input transition-colors ${
                        selectedChatId === conv._id ? 'bg-gray-50 dark:bg-dark-input' : ''
                      }`}
                    >
                      <Avatar src={other?.avatar} alt={other?.username} size="md" isOnline={other?.isOnline} showStatus />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {other?.username || 'Unknown'}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {format(new Date(conv.lastMessageAt), 'HH:mm')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage?.content || 'No messages'}
                          </p>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <Badge variant="primary" size="sm">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      </button>
                      </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 flex-col">
        <ChatWindow />
      </div>
    </div>
  );
};

export default Inbox;