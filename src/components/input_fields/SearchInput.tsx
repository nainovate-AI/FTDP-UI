'use client'

import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '../ui';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void;
  showClearButton?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  onClear,
  showClearButton = true,
  loading = false,
  size = 'md',
  fullWidth = true,
  className = '',
  value,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm pl-9',
    md: 'px-4 py-3 text-base pl-10',
    lg: 'px-6 py-4 text-lg pl-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-5 h-5 left-3',
    lg: 'w-6 h-6 left-3'
  };

  const inputClasses = [
    'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
    'rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    sizeClasses[size],
    showClearButton && value ? 'pr-10' : '',
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
      <div className={`absolute inset-y-0 flex items-center pointer-events-none ${iconSizes[size]}`}>
        <Search className={`text-gray-400 ${iconSizes[size].split(' ')[0]} ${iconSizes[size].split(' ')[1]}`} />
      </div>
      
      <input
        {...props}
        ref={ref}
        value={value}
        className={inputClasses}
      />
      
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
        </div>
      )}
      
      {showClearButton && value && !loading && onClear && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            icon={X}
            className="h-auto w-auto p-1 text-gray-400 hover:text-gray-600"
          />
        </div>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
