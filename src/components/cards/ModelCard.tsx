'use client'

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button, StatusBadge } from '../ui';
import type { Model } from '../../types';

interface ModelCardProps {
  model: Model;
  isSelected?: boolean;
  onSelect?: (model: Model) => void;
  onRemove?: (modelId: string) => void;
  showRemoveButton?: boolean;
  showRecommendedBadge?: boolean;
  compact?: boolean;
  className?: string;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  isSelected = false,
  onSelect,
  onRemove,
  showRemoveButton = false,
  showRecommendedBadge = true,
  compact = false,
  className = ''
}) => {
  const [isRemoving, setIsRemoving] = useState(false);
  
  const isFromHuggingFace = model.provider === 'HuggingFace' || 
                           model.id.includes('/') ||
                           model.performance?.speed === 'See benchmarks';

  const handleSelect = () => {
    onSelect?.(model);
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !isRemoving) {
      setIsRemoving(true);
      try {
        await onRemove(model.id);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  const cardClasses = [
    'relative border rounded-lg cursor-pointer transition-all duration-200',
    compact ? 'p-3' : 'p-4',
    isSelected
      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
    className
  ].filter(Boolean).join(' ');

  return (
    <div onClick={handleSelect} className={cardClasses}>
      {/* Remove button */}
      {showRemoveButton && isFromHuggingFace && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isRemoving}
          className="absolute top-2 right-2 p-1 h-auto w-auto text-gray-400 hover:text-red-500"
          title="Remove model"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Recommended badge */}
      {showRecommendedBadge && model.recommended && (
        <div className="absolute top-2 left-2">
          <StatusBadge variant="info" size="sm">
            Recommended
          </StatusBadge>
        </div>
      )}

      {/* Model content */}
      <div className={model.recommended ? 'mt-6' : ''}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-base'}`}>
              {model.name}
            </h3>
            <p className={`text-gray-500 dark:text-gray-400 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
              {model.provider} • {model.category}
            </p>
          </div>
        </div>

        {!compact && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {model.description}
          </p>
        )}

        <div className={`grid grid-cols-2 gap-2 text-gray-500 dark:text-gray-400 mb-3 ${compact ? 'text-xs' : 'text-sm'}`}>
          <div>
            <span className="font-medium">Parameters:</span> {model.parameters}
          </div>
          <div>
            <span className="font-medium">Context:</span> {model.contextLength || 'N/A'}
          </div>
        </div>

        {/* Performance indicators */}
        {model.performance && (
          <div className="flex gap-2 text-xs mb-3">
            <StatusBadge variant="neutral" size="sm">
              Speed: {model.performance.speed}
            </StatusBadge>
            <StatusBadge variant="neutral" size="sm">
              Memory: {model.performance.memoryUsage}
            </StatusBadge>
          </div>
        )}

        {/* Tags */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
              <StatusBadge key={index} variant="neutral" size="sm">
                {tag}
              </StatusBadge>
            ))}
            {model.tags.length > (compact ? 2 : 3) && (
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                +{model.tags.length - (compact ? 2 : 3)}
              </span>
            )}
          </div>
        )}

        {/* HuggingFace indicator */}
        {isFromHuggingFace && (
          <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
            <span>🤗</span>
            <span>Added from HuggingFace</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelCard;
