import React from 'react';
import { useModelManagement } from '../../hooks';
import { ModelCard } from './ModelCard';
import type { Model } from '../../types';

interface ModelGridProps {
  models: Model[];
  selectedModel: Model | null;
  onModelSelect: (model: Model) => void;
  showWarning?: (message: string) => void;
  showSuccess?: (message: string) => void;
  showError?: (message: string) => void;
}

export const ModelGrid: React.FC<ModelGridProps> = ({
  models,
  selectedModel,
  onModelSelect,
  showWarning,
  showSuccess,
  showError
}) => {
  const { removeModel } = useModelManagement();

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.824-2.563"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No models found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria, or search for models from HuggingFace below.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          selectedModel={selectedModel}
          onModelSelect={onModelSelect}
          onModelRemove={removeModel}
          showRemoveButton={true}
          showWarning={showWarning}
          showSuccess={showSuccess}
          showError={showError}
        />
      ))}
    </div>
  );
};