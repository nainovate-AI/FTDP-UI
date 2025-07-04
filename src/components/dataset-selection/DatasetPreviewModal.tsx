import React, { useState } from 'react';

interface PreviewData {
  filename: string;
  columns: string[];
  data: any[];
  isNewUpload?: boolean;
  datasetId?: string; // For existing datasets
  validation_errors?: string[]; // From API response
  statistics?: {
    total_rows: number;
    total_columns: number;
    file_size_kb: number;
    preview_rows: number;
    has_required_columns: boolean;
  };
}

interface DatasetPreviewModalProps {
  isOpen: boolean;
  previewData: PreviewData | null;
  validationErrors: string[];
  taskType?: string;
  selectedTags?: string[];
  title?: string; // For new uploads
  description?: string; // For new uploads
  datasetId?: string; // For existing datasets
  onSave?: (datasetData: any) => void;
  onNext?: (datasetData?: any) => void; // For proceeding with valid datasets
  onClose: () => void;
}

export const DatasetPreviewModal: React.FC<DatasetPreviewModalProps> = ({
  isOpen,
  previewData,
  validationErrors,
  taskType,
  selectedTags,
  title,
  description,
  datasetId,
  onSave,
  onNext,
  onClose
}) => {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  if (!isOpen || !previewData) return null;

  // Check if required columns exist
  const hasInputColumn = previewData.columns.includes('input');
  const hasOutputColumn = previewData.columns.includes('output');
  const hasRequiredColumns = hasInputColumn && hasOutputColumn;
  
  // Both new uploads and existing datasets require exact column names to proceed
  const canProceed = hasRequiredColumns;
  const canSave = previewData.isNewUpload ? hasRequiredColumns : true;

  const handleSave = () => {
    if (canSave && previewData.isNewUpload && onSave) {
      // Save new dataset with fixed column names
      const datasetData = {
        name: title || previewData.filename.replace(/\.[^/.]+$/, ""), // Use title or fallback to filename
        description: description || `Uploaded dataset from ${previewData.filename}`, // Use description or fallback
        format: 'CSV',
        taskType: taskType || 'Text Classification',
        samples: previewData.data.length,
        size: `${(previewData.data.length * 0.1).toFixed(1)} KB`, // Rough estimate
        tags: selectedTags || [],
        inputColumn: 'input',
        targetColumn: 'output',
        columns: previewData.columns,
        preview: previewData.data.slice(0, 10), // Store first 10 rows
      };
      onSave(datasetData);
    }
  };

  const handleNext = () => {
    if (canProceed && onNext) {
      // If it's a new upload, pass the dataset data to be saved
      if (previewData.isNewUpload) {
        const datasetData = {
          name: title || previewData.filename.replace(/\.[^/.]+$/, ""), // Use title or fallback to filename
          description: description || `Uploaded dataset from ${previewData.filename}`, // Use description or fallback
          format: 'CSV',
          taskType: taskType || 'Text Classification',
          samples: previewData.data.length,
          size: `${(previewData.data.length * 0.1).toFixed(1)} KB`, // Rough estimate
          tags: selectedTags || [],
          inputColumn: 'input',
          targetColumn: 'output',
          columns: previewData.columns,
          preview: previewData.data.slice(0, 10), // Store first 10 rows
        };
        onNext(datasetData);
      } else {
        // For existing datasets, pass the dataset ID so it can be selected
        onNext(previewData.datasetId);
      }
    }
  };

  const handleCloseClick = () => {
    if (previewData.isNewUpload && !hasRequiredColumns) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  const handleForceClose = () => {
    setShowUnsavedWarning(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowUnsavedWarning(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Dataset Preview: {previewData.filename}
              </h2>
              <button
                onClick={handleCloseClick}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Close preview"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Column Requirements Warning */}
            {previewData.isNewUpload && !hasRequiredColumns && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Required Column Names Missing
                    </h3>
                    <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                      <p>Your dataset must have columns named exactly:</p>
                      <ul className="list-disc list-inside mt-1 ml-4">
                        <li><strong>"input"</strong> - for the input text/data {!hasInputColumn && '(missing)'}</li>
                        <li><strong>"output"</strong> - for the expected output/labels {!hasOutputColumn && '(missing)'}</li>
                      </ul>
                      <p className="mt-2">Please rename your columns accordingly and re-upload your dataset.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for existing datasets without exact column names */}
            {!previewData.isNewUpload && !hasRequiredColumns && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Cannot Proceed with Model Training
                    </h3>
                    <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                      <p>This dataset cannot be used for model training because it lacks the required column names.</p>
                      <p className="mt-2"><strong>Required:</strong> "input" and "output" columns</p>
                      <p><strong>Current columns:</strong> {previewData.columns.join(', ')}</p>
                      <p className="mt-2 font-medium">Model training will fail without the exact "input" and "output" column names. Please update your dataset structure to proceed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success message for valid columns */}
            {previewData.isNewUpload && hasRequiredColumns && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                      Dataset Format Valid
                    </h3>
                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                      Your dataset has the required "input" and "output" columns. Ready to save!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Statistics */}
            {previewData.statistics && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Dataset Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Total Rows:</span>
                    <span className="ml-1 text-blue-800 dark:text-blue-200">{previewData.statistics.total_rows?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Columns:</span>
                    <span className="ml-1 text-blue-800 dark:text-blue-200">{previewData.statistics.total_columns || previewData.columns.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">File Size:</span>
                    <span className="ml-1 text-blue-800 dark:text-blue-200">{previewData.statistics.file_size_kb ? `${previewData.statistics.file_size_kb} KB` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">Preview:</span>
                    <span className="ml-1 text-blue-800 dark:text-blue-200">{previewData.statistics.preview_rows || previewData.data.length} rows</span>
                  </div>
                </div>
              </div>
            )}

            {/* Dataset Preview Table */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    First {Math.min(previewData.data.length, 5)} rows
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {previewData.data.length} rows total
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                    <tr>
                      {previewData.columns.map((column: string) => (
                        <th
                          key={column}
                          className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            column === 'input'
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                              : column === 'output'
                              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                              : 'text-gray-500 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column}</span>
                            {column === 'input' && (
                              <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded">
                                INPUT
                              </span>
                            )}
                            {column === 'output' && (
                              <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded">
                                OUTPUT
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {previewData.data.slice(0, 5).map((row: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {previewData.columns.map((column: string) => (
                          <td
                            key={column}
                            className={`px-4 py-3 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-xs ${
                              column === 'input'
                                ? 'bg-blue-50/50 dark:bg-blue-900/10'
                                : column === 'output'
                                ? 'bg-green-50/50 dark:bg-green-900/10'
                                : ''
                            }`}
                          >
                            <div className="text-gray-900 dark:text-gray-100 truncate" title={String(row[column])}>
                              {String(row[column])}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dataset Summary */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Total Columns
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {previewData.columns.length}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Input Column
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {hasInputColumn ? '✓ Found' : '✗ Missing'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Output Column
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {hasOutputColumn ? '✓ Found' : '✗ Missing'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              {canSave && previewData.isNewUpload && (
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Dataset
                </button>
              )}
              {canProceed && onNext && (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Next
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Force close warning modal */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-60 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 sm:mx-0 sm:h-10 sm:w-10">
                      <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        Invalid Dataset Format
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your dataset doesn't have the required "input" and "output" column names. Please rename your columns and try again.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleForceClose}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close Anyway
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Fix Dataset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
