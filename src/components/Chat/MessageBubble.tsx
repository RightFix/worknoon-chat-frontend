import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Download } from 'lucide-react';
import type { Message, User } from '../../types';
import { Avatar } from '../Common';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onFileClick?: (url: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onFileClick,
}) => {
  const sender = typeof message.sender === 'string' ? null : message.sender as User;
  const isRead = message.readBy.length > 1;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.includes('pdf')) return '📄';
    return '📎';
  };

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {showAvatar && !isOwn && (
        <Avatar src={sender?.avatar} alt={sender?.username} size="sm" />
      )}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%] lg:max-w-[60%]`}>
        {!isOwn && showAvatar && sender && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {sender.username}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-primary-500 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-dark-input text-gray-900 dark:text-gray-100 rounded-bl-md'
          }`}
        >
          {message.messageType === 'image' && message.attachments?.[0] && (
            <img
              src={message.attachments[0].url}
              alt="Attachment"
              className="max-w-full rounded-lg mb-2 cursor-pointer"
              onClick={() => onFileClick?.(message.attachments[0].url)}
            />
          )}
          {message.messageType === 'file' && message.attachments?.[0] && (
            <a
              href={message.attachments[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 mb-2 ${isOwn ? 'text-primary-100' : 'text-primary-600'} hover:underline`}
            >
              <span className="text-lg">{getFileIcon(message.attachments[0].mimeType)}</span>
              <span className="text-sm font-medium truncate max-w-[200px]">
                {message.attachments[0].filename}
              </span>
              <Download className="w-4 h-4" />
            </a>
          )}
          {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
        </div>
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isOwn && (
            <span className="text-gray-400 dark:text-gray-500">
              {isRead ? <CheckCheck className="w-3.5 h-3.5 text-primary-500" /> : <Check className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;