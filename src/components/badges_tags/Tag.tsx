'use client'

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui';

export type TagVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type TagSize = 'sm' | 'md' | 'lg';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  onRemove,
  className = '',
  icon
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-all duration-200';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const finalClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={finalClasses}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {removable && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="ml-1 h-auto w-auto p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </span>
  );
};

export default Tag;
