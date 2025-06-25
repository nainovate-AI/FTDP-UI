import React, { useState } from 'react';

interface PreviewData {
  filename: string;
  columns: string[];
  data: any[];
  isNewUpload?: boolean;
}

interface DatasetPreviewModalProps {
  isOpen: boolean;
  previewData: PreviewData | null;
  inputColumn: string;
  targetColumn: string;
  validationErrors: string[];
  taskType?: string;
  selectedTags?: string[];
  onInputColumnChange: (column: string) => void;
  onTargetColumnChange: (column: string) => void;
  onSave?: (datasetData: any) => void;
  onClose: () => void;
}

export const DatasetPreviewModal: React.FC<DatasetPreviewModalProps> = ({
  isOpen,
  previewData,
  inputColumn,
  targetColumn,
  validationErrors,
  taskType,
  selectedTags,
  onInputColumnChange,
  onTargetColumnChange,
  onSave,
  onClose
}) => {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  if (!isOpen || !previewData) return null;

  // Prevent closing if input or target columns are not selected
  const canClose = inputColumn && targetColumn && validationErrors.length === 0;
  const canSave = canClose && previewData.isNewUpload;

  const handleInputChange = (column: string) => {
    onInputColumnChange(column);
    setHasUnsavedChanges(true);
  };

  const handleTargetChange = (column: string) => {
    onTargetColumnChange(column);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (canSave && onSave) {
      const datasetData = {
        name: previewData.filename.replace(/\.[^/.]+$/, ""), // Remove file extension
        description: `Uploaded dataset from ${previewData.filename}`,
        format: 'CSV',
        taskType: taskType || 'Text Classification',
        samples: previewData.data.length,
        size: `${(previewData.data.length * 0.1).toFixed(1)} KB`, // Rough estimate
        tags: selectedTags || [],
        inputColumn,
        targetColumn,
        columns: previewData.columns,
        preview: previewData.data.slice(0, 10), // Store first 10 rows
      };
      onSave(datasetData);
      setHasUnsavedChanges(false);
    }
  };

  const handleCloseClick = () => {
    if (canClose) {
      if (hasUnsavedChanges && previewData.isNewUpload) {
        setShowUnsavedWarning(true);
      } else {
        onClose();
      }
    }
  };

  const handleForceClose = () => {
    setShowUnsavedWarning(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowUnsavedWarning(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && canClose) {
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
                disabled={!canClose}
                className={`text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ${
                  !canClose ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={!canClose ? 'Please select input and target columns before closing' : 'Close preview'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Required fields notice */}
            {!canClose && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Configuration Required
                    </h3>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                      Please select both input and target columns to continue.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Column Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Column *
                </label>
                <select
                  value={inputColumn}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select input column...</option>
                  {previewData.columns.map((column: string) => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Column *
                </label>
                <select
                  value={targetColumn}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select target column...</option>
                  {previewData.columns.map((column: string) => (
                    <option key={column} value={column}>{column}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.76 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Validation Issues
                    </h3>
                    <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Data Preview Table */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    First {Math.min(previewData.data.length, 15)} rows
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
                            column === inputColumn
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                              : column === targetColumn
                              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
                              : 'text-gray-500 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column}</span>
                            {column === inputColumn && (
                              <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded">
                                INPUT
                              </span>
                            )}
                            {column === targetColumn && (
                              <span className="px-1.5 py-0.5 text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 rounded">
                                TARGET
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {previewData.data.slice(0, 15).map((row: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {previewData.columns.map((column: string) => (
                          <td
                            key={column}
                            className={`px-4 py-3 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-xs ${
                              column === inputColumn
                                ? 'bg-blue-50/50 dark:bg-blue-900/10'
                                : column === targetColumn
                                ? 'bg-green-50/50 dark:bg-green-900/10'
                                : ''
                            }`}
                          >
                            <div 
                              className="text-gray-900 dark:text-gray-100 truncate"
                              title={String(row[column])}
                            >
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

            {/* Column Info */}
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
                  {inputColumn || 'Not selected'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Target Column
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {targetColumn || 'Not selected'}
                </div>
              </div>
            </div>

            {/* Save Button */}
            {canSave && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Dataset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unsaved Changes Warning Dialog */}
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
                        Unsaved Changes
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          You have unsaved changes to this dataset configuration. Are you sure you want to close without saving?
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
                    Close Without Saving
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Continue Editing
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
