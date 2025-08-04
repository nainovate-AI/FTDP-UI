'use client'

import React from 'react';

export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'error' | 'running';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  showLabel?: boolean;
  showPercentage?: boolean;
  animate?: boolean;
  className?: string;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  showPercentage = false,
  animate = true,
  className = '',
  label
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const containerClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    running: 'bg-blue-500'
  };

  const animateClasses = animate ? 'transition-all duration-500 ease-out' : '';

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center text-sm mb-2">
          {showLabel && label && (
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          )}
          {showPercentage && (
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${containerClasses[size]}`}>
        <div 
          className={`${containerClasses[size]} rounded-full ${variantClasses[variant]} ${animateClasses}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
