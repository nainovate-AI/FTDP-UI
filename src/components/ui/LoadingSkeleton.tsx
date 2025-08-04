'use client'

import React from 'react';

export type LoadingSkeletonVariant = 'text' | 'circular' | 'rectangular' | 'button' | 'card';
export type LoadingSkeletonSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSkeletonProps {
  variant?: LoadingSkeletonVariant;
  size?: LoadingSkeletonSize;
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
  lines?: number; // For text variant
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'rectangular',
  size = 'md',
  width,
  height,
  className = '',
  animate = true,
  lines = 1
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animateClasses = animate ? 'animate-pulse' : '';

  const sizeClasses = {
    sm: {
      text: 'h-3',
      circular: 'h-8 w-8',
      rectangular: 'h-8',
      button: 'h-8 w-20',
      card: 'h-32'
    },
    md: {
      text: 'h-4',
      circular: 'h-12 w-12',
      rectangular: 'h-12',
      button: 'h-12 w-32',
      card: 'h-48'
    },
    lg: {
      text: 'h-5',
      circular: 'h-16 w-16',
      rectangular: 'h-16',
      button: 'h-16 w-40',
      card: 'h-64'
    },
    xl: {
      text: 'h-6',
      circular: 'h-20 w-20',
      rectangular: 'h-20',
      button: 'h-20 w-48',
      card: 'h-80'
    }
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    button: 'rounded-lg',
    card: 'rounded-xl'
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  const finalClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size][variant],
    animateClasses,
    className
  ].filter(Boolean).join(' ');

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${finalClasses} ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={getStyle()}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={finalClasses}
      style={getStyle()}
    />
  );
};

// Predefined skeleton patterns
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}>
    <div className="flex items-center mb-4">
      <LoadingSkeleton variant="circular" size="md" className="mr-4" />
      <div className="flex-1">
        <LoadingSkeleton variant="text" size="md" width="60%" className="mb-2" />
        <LoadingSkeleton variant="text" size="sm" width="40%" />
      </div>
    </div>
    <LoadingSkeleton variant="text" lines={3} size="sm" className="mb-4" />
    <LoadingSkeleton variant="button" size="md" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }, (_, index) => (
        <LoadingSkeleton key={index} variant="text" size="md" width="20%" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }, (_, colIndex) => (
          <LoadingSkeleton key={colIndex} variant="text" size="sm" width="20%" />
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
