import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  isOnline,
  showStatus = false,
  className = '',
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const statusPositions = {
    xs: '-bottom-0.5 -right-0.5',
    sm: '-bottom-0.5 -right-0.5',
    md: 'bottom-0 right-0',
    lg: 'bottom-0.5 right-0.5',
    xl: 'bottom-1 right-1',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-dark-card`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center ring-2 ring-white dark:ring-dark-card`}
        >
          <User className={`text-primary-500 dark:text-primary-400 ${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute ${statusPositions[size]} ${statusSizes[size]} rounded-full ring-2 ring-white dark:ring-dark-card ${
            isOnline ? 'bg-online' : 'bg-offline'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;