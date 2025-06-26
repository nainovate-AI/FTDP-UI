import React from 'react';
import { useModelManagement } from '../../hooks';
import type { Model } from '../../types';

interface ModelCardProps {
  model: Model;
  selectedModel: Model | null;
  onModelSelect: (model: Model) => void;
  onModelRemove?: (modelId: string) => void;
  showRemoveButton?: boolean;
}

export const ModelCard: React.FC<ModelCardProps> = ({
  model,
  selectedModel,
  onModelSelect,
  onModelRemove,
  showRemoveButton = false
}) => {
  const isSelected = selectedModel?.id === model.id;
  const isFromHuggingFace = model.provider === 'HuggingFace' || 
                           model.id.includes('/') ||
                           model.performance?.speed === 'See benchmarks';

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onModelRemove && confirm(`Are you sure you want to remove "${model.name}" from your collection?`)) {
      onModelRemove(model.id);
    }
  };

  return (
    <div
      onClick={() => onModelSelect(model)}
      className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
      }`}
    >
      {/* Remove button for HuggingFace models */}
      {showRemoveButton && isFromHuggingFace && (
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove model"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Recommended badge */}
      {model.recommended && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">
            Recommended
          </span>
        </div>
      )}

      {/* Model info */}
      <div className={`${model.recommended ? 'mt-6' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {model.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {model.provider} • {model.category}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {model.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
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
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              Speed: {model.performance.speed}
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              Memory: {model.performance.memoryUsage}
            </span>
          </div>
        )}

        {/* Tags */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {model.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {model.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                +{model.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Added from HuggingFace indicator */}
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
