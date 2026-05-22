import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Users, BarChart3, Settings, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { Avatar, Badge } from '../Common';
import { format } from 'date-fns';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { conversations, unreadCount } = useChat();

  const adminLinks = [
    { path: '/', icon: Home, label: 'Inbox' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/admin', icon: BarChart3, label: 'Dashboard' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const userLinks = [
    { path: '/', icon: Home, label: 'Inbox', badge: unreadCount > 0 ? unreadCount : undefined },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const links = user?.role === 'admin' || user?.role === 'agent' ? adminLinks : userLinks;

  const getOtherParticipant = (participants: any[]) => {
    return participants.find((p) => p._id !== user?.id) || participants[0];
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      
      <aside
        className={`
          fixed lg:relative z-50 lg:z-0
          w-72 lg:w-80 h-[calc(100vh-4rem)] bg-white dark:bg-dark-card
          border-r border-gray-200 dark:border-dark-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conversations</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-input">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 border-b border-gray-200 dark:border-dark-border">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={onClose}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                    ${location.pathname === link.path}
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-input'
                  `}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </div>
                  {link.badge && (
                    <Badge variant="primary" size="sm">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Recent Chats
            </h3>
            <ul className="space-y-1">
              {conversations.slice(0, 10).map((conv) => {
                const other = getOtherParticipant(conv.participants);
                return (
                  <li key={conv._id}>
                    <Link
                      to={`/chat/${conv._id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-input transition-colors"
                    >
                      <Avatar
                        src={other?.avatar}
                        alt={other?.username}
                        size="md"
                        isOnline={other?.isOnline}
                        showStatus
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {other?.username || 'Unknown'}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {format(new Date(conv.lastMessageAt), 'HH:mm')}
                          </span>
                        )}
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <Badge variant="primary" size="sm">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;