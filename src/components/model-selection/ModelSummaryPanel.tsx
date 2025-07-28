import React from 'react';
import type { Model } from '../../types';

interface ModelSummaryPanelProps {
  selectedModel: Model | null;
}

export const ModelSummaryPanel: React.FC<ModelSummaryPanelProps> = ({ selectedModel }) => {
  if (!selectedModel) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No Model Selected
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select a model to view detailed information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedModel.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              by {selectedModel.provider}
            </p>
          </div>
          {selectedModel.recommended && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              Recommended
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Description
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedModel.description}
          </p>
        </div>

        {/* Specifications */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Specifications
          </h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Parameters</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white break-words">
              {selectedModel.parameters}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Context Length</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedModel.contextLength ? selectedModel.contextLength.toLocaleString() : 'Unknown'} tokens
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedModel.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">License</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white break-words">
              {selectedModel.license}
            </span>
          </div>
        </div>

        {/* Download Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Download Information
          </h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-2 items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Download Size</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedModel.downloadSize}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Model ID</span>
            <span className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {selectedModel.id}
            </span>
          </div>
        </div>

        {/* Performance */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Speed</span>
              <PerformanceBadge value={selectedModel.performance?.speed || 'Unknown'} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Accuracy</span>
              <PerformanceBadge value={selectedModel.performance?.accuracy || 'Unknown'} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Memory Usage</span>
              <PerformanceBadge value={selectedModel.performance?.memoryUsage || 'Unknown'} />
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Capabilities
          </h4>
          <div className="flex flex-wrap gap-2">
            {(selectedModel.capabilities || []).map((capability) => (
              <span
                key={capability}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              >
                {capability.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Use Case */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Best Use Cases
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedModel.useCase}
          </p>
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {(selectedModel.tags || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PerformanceBadgeProps {
  value: string;
}

const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ value }) => {
  const getColor = (val: string) => {
    switch (val.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'very good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'good':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'fair':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getColor(value)}`}>
      {value}
    </span>
  );
};
