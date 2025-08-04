'use client'

import React from 'react';
import { Database, FileText, Image, Music, Video, Code } from 'lucide-react';

export type DatasetTypeBadgeType = 'text' | 'image' | 'audio' | 'video' | 'code' | 'tabular' | 'mixed';

interface DatasetTypeBadgeProps {
  type: DatasetTypeBadgeType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const DatasetTypeBadge: React.FC<DatasetTypeBadgeProps> = ({
  type,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getConfig = (datasetType: DatasetTypeBadgeType) => {
    switch (datasetType) {
      case 'text':
        return {
          icon: FileText,
          label: 'Text',
          colors: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'image':
        return {
          icon: Image,
          label: 'Image',
          colors: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
      case 'audio':
        return {
          icon: Music,
          label: 'Audio',
          colors: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        };
      case 'video':
        return {
          icon: Video,
          label: 'Video',
          colors: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
      case 'code':
        return {
          icon: Code,
          label: 'Code',
          colors: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        };
      case 'tabular':
        return {
          icon: Database,
          label: 'Tabular',
          colors: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
        };
      case 'mixed':
        return {
          icon: Database,
          label: 'Mixed',
          colors: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        };
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

  const config = getConfig(type);
  const Icon = config.icon;

  const finalClasses = [
    'inline-flex items-center rounded-full font-medium',
    config.colors,
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={finalClasses}>
      {showIcon && <Icon className={`${showIcon ? 'mr-1' : ''} ${iconSizes[size]}`} />}
      {config.label}
    </span>
  );
};

export default DatasetTypeBadge;
