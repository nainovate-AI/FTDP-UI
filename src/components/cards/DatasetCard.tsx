'use client'

import React from 'react';
import { Database, Calendar, FileText, Download } from 'lucide-react';
import { Button, StatusBadge } from '../ui';

interface DatasetCardProps {
  dataset: {
    id: string;
    name: string;
    description?: string;
    type: string;
    size: string;
    rows?: number;
    columns?: number;
    format?: string;
    uploadedAt?: string;
    status?: 'processing' | 'ready' | 'error';
  };
  isSelected?: boolean;
  onSelect?: (dataset: any) => void;
  onDownload?: (datasetId: string) => void;
  onPreview?: (datasetId: string) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  isSelected = false,
  onSelect,
  onDownload,
  onPreview,
  showActions = true,
  compact = false,
  className = ''
}) => {
  const handleSelect = () => {
    onSelect?.(dataset);
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'processing': return 'warning';
      case 'ready': return 'success';
      case 'error': return 'error';
      default: return 'neutral';
    }
  };

  const cardClasses = [
    'border rounded-lg transition-all duration-200',
    compact ? 'p-3' : 'p-4',
    onSelect ? 'cursor-pointer' : '',
    isSelected
      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
    className
  ].filter(Boolean).join(' ');

  return (
    <div onClick={handleSelect} className={cardClasses}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Database className="w-5 h-5 text-green-500 mr-2" />
          <div>
            <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-base'}`}>
              {dataset.name}
            </h3>
            <p className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
              {dataset.type} • {dataset.size}
            </p>
          </div>
        </div>
        
        {dataset.status && (
          <StatusBadge variant={getStatusVariant(dataset.status)} size="sm">
            {dataset.status}
          </StatusBadge>
        )}
      </div>

      {!compact && dataset.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {dataset.description}
        </p>
      )}

      <div className={`grid grid-cols-2 gap-2 text-gray-500 dark:text-gray-400 mb-3 ${compact ? 'text-xs' : 'text-sm'}`}>
        {dataset.rows && (
          <div className="flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            <span>{dataset.rows.toLocaleString()} rows</span>
          </div>
        )}
        {dataset.columns && (
          <div className="flex items-center">
            <Database className="w-3 h-3 mr-1" />
            <span>{dataset.columns} columns</span>
          </div>
        )}
        {dataset.format && (
          <div>
            <span className="font-medium">Format:</span> {dataset.format}
          </div>
        )}
        {dataset.uploadedAt && (
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{new Date(dataset.uploadedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {onPreview && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(dataset.id);
              }}
              fullWidth={false}
            >
              Preview
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(dataset.id);
              }}
              fullWidth={false}
            >
              Download
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DatasetCard;
