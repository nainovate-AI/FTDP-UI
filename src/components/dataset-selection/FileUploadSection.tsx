import React from 'react';

interface FileUploadSectionProps {
  isUploading: boolean;
  uploadProgress: number;
  taskType: string;
  selectedTags: string[];
  isAddingTag: boolean;
  customTag: string;
  taskTags: Record<string, string[]>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTaskTypeChange: (taskType: string) => void;
  onTagToggle: (tag: string) => void;
  onStartAddingTag: () => void;
  onCancelAddingTag: () => void;
  onCustomTagChange: (tag: string) => void;
  onAddCustomTag: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  isUploading,
  uploadProgress,
  taskType,
  selectedTags,
  isAddingTag,
  customTag,
  taskTags,
  onFileUpload,
  onTaskTypeChange,
  onTagToggle,
  onStartAddingTag,
  onCancelAddingTag,
  onCustomTagChange,
  onAddCustomTag,
  onKeyPress,
  onRemoveTag
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Upload New Dataset
      </h2>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Drop your CSV dataset file here, or click to browse
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Currently supports CSV files up to 100MB
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
          JSONL and TXT support coming soon!
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={onFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Choose CSV File
        </label>
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {/* Task Type Selection and Tags */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Type (Optional)
          </label>
          <select
            value={taskType}
            onChange={(e) => onTaskTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select a task type...</option>
            {Object.keys(taskTags).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {taskType && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Select relevant tags or add custom ones to categorize your dataset
            </p>
            
            {/* Predefined Tags and Add Button */}
            <div className="flex flex-wrap gap-2">
              {taskTags[taskType as keyof typeof taskTags]?.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
              
              {/* Add Custom Tag Button/Input */}
              {isAddingTag ? (
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => onCustomTagChange(e.target.value)}
                  onKeyDown={onKeyPress}
                  onBlur={onCancelAddingTag}
                  autoFocus
                  placeholder="Enter tag name..."
                  className="px-3 py-1 text-sm border border-blue-500 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[120px]"
                />
              ) : (
                <button
                  type="button"
                  onClick={onStartAddingTag}
                  className="px-3 py-1 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add tag
                </button>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected tags:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => onRemoveTag(tag)}
                        className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
