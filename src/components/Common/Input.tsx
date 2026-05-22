import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-lg border transition-colors duration-200
            bg-white dark:bg-dark-input
            border-gray-200 dark:border-dark-border
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-dark-card disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-error focus:ring-error' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default Input;