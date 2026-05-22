import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, X } from 'lucide-react';
import { Button } from '../Common';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  onTyping?: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (message.trim() && onTyping) {
      onTyping();
      typingTimeoutRef.current = setTimeout(() => {}, 1000);
    }
  }, [message, onTyping]);

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onSend(message.trim());
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      const validFiles = files.filter((f) =>
        type === 'image' ? f.type.startsWith('image/') : true
      );
      setAttachments((prev) => [...prev, ...validFiles]);
    } catch (error) {
      console.error('Error selecting files:', error);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card p-4">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-input rounded-lg"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                {file.name}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-input disabled:opacity-50 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-input disabled:opacity-50 transition-colors"
            title="Attach image"
          >
            <Image className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled || isLoading}
            rows={1}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-input text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={disabled || isLoading || (!message.trim() && attachments.length === 0)}
          size="md"
          className="px-4"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;