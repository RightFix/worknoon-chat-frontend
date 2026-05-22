import React from 'react';

interface TypingIndicatorProps {
  username?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ username }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {username && <span className="text-sm">{username} is typing...</span>}
    </div>
  );
};

export default TypingIndicator;