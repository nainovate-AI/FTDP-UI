'use client'

import React from 'react';
import { Cpu, Zap, MemoryStick, Clock } from 'lucide-react';

export type PerformanceBadgeType = 'speed' | 'accuracy' | 'memory' | 'latency';
export type PerformanceLevel = 'low' | 'medium' | 'high' | 'excellent';

interface PerformanceBadgeProps {
  type: PerformanceBadgeType;
  level: PerformanceLevel;
  value?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({
  type,
  level,
  value,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getTypeConfig = (perfType: PerformanceBadgeType) => {
    switch (perfType) {
      case 'speed':
        return { icon: Zap, label: 'Speed' };
      case 'accuracy':
        return { icon: Cpu, label: 'Accuracy' };
      case 'memory':
        return { icon: MemoryStick, label: 'Memory' };
      case 'latency':
        return { icon: Clock, label: 'Latency' };
    }
  };

  const getLevelColors = (perfLevel: PerformanceLevel) => {
    switch (perfLevel) {
      case 'low':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const typeConfig = getTypeConfig(type);
  const colors = getLevelColors(level);
  const Icon = typeConfig.icon;

  const finalClasses = [
    'inline-flex items-center rounded-full font-medium',
    colors,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const displayValue = value || level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <span className={finalClasses}>
      {showIcon && <Icon className={`mr-1 ${iconSizes[size]}`} />}
      {displayValue}
    </span>
  );
};

export default PerformanceBadge;
