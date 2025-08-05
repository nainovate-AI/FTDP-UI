'use client'

import React from 'react';
import { Eye, Download, X } from 'lucide-react';
import { Button } from '../ui';
import { Modal } from './Modal';

interface DatasetPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: {
    name: string;
    description?: string;
    rows: number;
    columns: number;
    size: string;
    format: string;
  };
  previewData?: Array<Record<string, any>>;
  loading?: boolean;
  onDownload?: () => void;
}

export const DatasetPreviewDialog: React.FC<DatasetPreviewDialogProps> = ({
  isOpen,
  onClose,
  dataset,
  previewData = [],
  loading = false,
  onDownload
}) => {
  const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dataset.name}
      size="xl"
      className="max-h-[90vh] overflow-hidden flex flex-col"
    >
      {/* Dataset Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
        {dataset.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {dataset.description}
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">Rows:</span>
            <span className="ml-1 text-gray-600 dark:text-gray-400">{dataset.rows.toLocaleString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">Columns:</span>
            <span className="ml-1 text-gray-600 dark:text-gray-400">{dataset.columns}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">Size:</span>
            <span className="ml-1 text-gray-600 dark:text-gray-400">{dataset.size}</span>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-gray-100">Format:</span>
            <span className="ml-1 text-gray-600 dark:text-gray-400">{dataset.format}</span>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="flex-1 overflow-hidden">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Data Preview (first {Math.min(previewData.length, 10)} rows)
        </h4>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : previewData.length > 0 ? (
          <div className="overflow-auto border border-gray-200 dark:border-gray-600 rounded-lg max-h-96">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {previewData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate"
                        title={String(row[column])}
                      >
                        {String(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No preview data available
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {previewData.length > 10 && `Showing 10 of ${previewData.length} rows`}
        </div>
        <div className="flex space-x-3">
          {onDownload && (
            <Button
              variant="secondary"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          <Button
            variant="default"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DatasetPreviewDialog;
