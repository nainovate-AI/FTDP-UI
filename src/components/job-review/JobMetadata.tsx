import React from 'react';
import { FileText, Plus, X } from 'lucide-react';

interface JobMetadataState {
  name: string;
  description: string;
}

interface JobMetadataProps {
  jobMetadata: JobMetadataState;
  setJobMetadata: React.Dispatch<React.SetStateAction<JobMetadataState>>;
  selectedTags: string[];
  customTag: string;
  isAddingTag: boolean;
  setCustomTag: (tag: string) => void;
  handleTagToggle: (tag: string) => void;
  handleAddCustomTag: () => void;
  handleStartAddingTag: () => void;
  handleCancelAddingTag: () => void;
  handleRemoveTag: (tag: string) => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export const JobMetadata: React.FC<JobMetadataProps> = ({
  jobMetadata,
  setJobMetadata,
  selectedTags,
  customTag,
  isAddingTag,
  setCustomTag,
  handleTagToggle,
  handleAddCustomTag,
  handleStartAddingTag,
  handleCancelAddingTag,
  handleRemoveTag,
  handleKeyPress
}) => {
  // Suggested tags combining task-based and general purpose tags
  const suggestedTags = [
    // Task-based tags
    'factual', 'conversational', 'technical', 'educational', 'context-based',
    'news', 'research', 'documentation', 'creative-writing', 'content-creation',
    'python', 'javascript', 'debugging', 'testing', 'multilingual',
    // General purpose tags
    'production', 'experimental', 'research', 'prototype', 'benchmark',
    'evaluation', 'demo', 'internal', 'public'
  ];

  const handleNameChange = (value: string) => {
    setJobMetadata(prev => ({ ...prev, name: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setJobMetadata(prev => ({ ...prev, description: value }));
  };

  const renderTagInput = () => (
    <div className="flex flex-wrap gap-2">
      {/* Display selected tags */}
      {selectedTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300 border transition-all duration-200"
        >
          {tag}
          <button
            onClick={() => handleRemoveTag(tag)}
            className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {/* Add custom tag input */}
      {isAddingTag ? (
        <input
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleCancelAddingTag}
          autoFocus
          placeholder="Enter tag name..."
          className="px-3 py-1 text-sm border border-blue-500 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-w-[120px]"
        />
      ) : (
        <button
          onClick={handleStartAddingTag}
          className="px-3 py-1 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add tag
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Job Metadata
        </h3>
      </div>

      <div className="space-y-6">
        {/* Job Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={jobMetadata.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              !jobMetadata.name.trim() 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter a descriptive name for your finetuning job"
          />
          {!jobMetadata.name.trim() && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Job name is required
            </p>
          )}
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            value={jobMetadata.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe the purpose and goals of this finetuning job..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags <span className="text-gray-400">(optional)</span>
          </label>
          
          {/* Tag Input */}
          {renderTagInput()}
          
          {/* Suggested Tags */}
          {suggestedTags.length > 0 ? (
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter((tag: string) => !selectedTags.includes(tag))
                  .slice(0, 12) // Limit to 12 tags to keep it clean
                  .map((tag: string) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className="px-3 py-1 text-sm rounded-full border transition-all duration-200 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No suggested tags available. You can add custom tags above.
              </p>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <FileText className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
              Job Organization
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              Use descriptive names and tags to organize your finetuning jobs. This helps track experiments and compare results over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
