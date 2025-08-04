'use client'

import React from 'react';
import { Star, Award, Zap, Shield, Crown } from 'lucide-react';

export type RecommendationBadgeType = 'recommended' | 'featured' | 'popular' | 'verified' | 'premium';

interface RecommendationBadgeProps {
  type: RecommendationBadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({
  type,
  size = 'md',
  className = ''
}) => {
  const getConfig = (badgeType: RecommendationBadgeType) => {
    switch (badgeType) {
      case 'recommended':
        return {
          icon: Star,
          label: 'Recommended',
          colors: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'featured':
        return {
          icon: Award,
          label: 'Featured',
          colors: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        };
      case 'popular':
        return {
          icon: Zap,
          label: 'Popular',
          colors: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        };
      case 'verified':
        return {
          icon: Shield,
          label: 'Verified',
          colors: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
      case 'premium':
        return {
          icon: Crown,
          label: 'Premium',
          colors: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
      <Icon className={`mr-1 ${iconSizes[size]}`} />
      {config.label}
    </span>
  );
};

export default RecommendationBadge;
