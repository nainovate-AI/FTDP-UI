'use client'

import React from 'react';

export type StatusBadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'running' | 'completed' | 'failed' | 'queued' | 'created';
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  size?: StatusBadgeSize;
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
  animate?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  size = 'md',
  children,
  className = '',
  showDot = false,
  animate = false
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variantClasses = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    created: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  const dotClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
    running: 'bg-blue-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    queued: 'bg-yellow-500',
    created: 'bg-gray-500'
  };

  const animateClasses = animate ? 'animate-pulse' : '';

  const finalClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    animateClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={finalClasses}>
      {showDot && (
        <span 
          className={`w-2 h-2 ${dotClasses[variant]} rounded-full mr-2 ${animate ? 'animate-pulse' : ''}`}
        />
      )}
      {children}
    </span>
  );
};

export default StatusBadge;
