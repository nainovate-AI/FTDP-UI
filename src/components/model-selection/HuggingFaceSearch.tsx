import React, { useState, useEffect, useRef } from 'react';
import { useModelManagement } from '../../hooks';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

interface HuggingFaceSearchProps {
  onModelAdd?: (model: any) => void;
  showSuccess?: (message: string) => void;
  showError?: (message: string) => void;
  showWarning?: (message: string) => void;
}

export const HuggingFaceSearch: React.FC<HuggingFaceSearchProps> = ({ 
  onModelAdd, 
  showSuccess, 
  showError, 
  showWarning 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addingModels, setAddingModels] = useState<Set<string>>(new Set());
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    model: any;
  }>({ isOpen: false, model: null });
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    searchResults, 
    isSearching, 
    searchHuggingFaceModels, 
    addModelFromSearch, 
    checkModelExists,
    error,
    isUsingBackend 
  } = useModelManagement();

  // Auto-search with 3-second delay
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 3000);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchHuggingFaceModels(searchQuery, 10);
    }
  };

  const handleAddModel = async (searchModel: any) => {
    // Show confirmation dialog first
    setConfirmationDialog({ isOpen: true, model: searchModel });
  };

  const confirmAddModel = async (searchModel: any) => {
    const modelId = searchModel.id;
    
    // Check if already adding this model
    if (addingModels.has(modelId)) {
      return;
    }
    
    setAddingModels(prev => new Set(prev).add(modelId));
    setConfirmationDialog({ isOpen: false, model: null });
    
    try {
      // Check if model already exists
      const exists = await checkModelExists(modelId);
      if (exists) {
        showWarning?.(`Model "${searchModel.name}" already exists in your collection!`);
        return;
      }
      
      const success = await addModelFromSearch(searchModel);
      if (success) {
        showSuccess?.(`Successfully added "${searchModel.name}" to your collection!`);
        if (onModelAdd) {
          onModelAdd(searchModel);
        }
        
        // Auto-reload page after addition
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showError?.(`Failed to add "${searchModel.name}". Please try again.`);
      }
    } catch (error) {
      showError?.(`Error adding model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🤗 Search HuggingFace Models
      </h3>

      {/* Backend Status Warning */}
      {!isUsingBackend && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <svg className="inline-block w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>Using local data. Search will attempt to connect to backend.
          </p>
        </div>
      )}

      {/* Search Input */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for models (e.g. 'bert', 'gpt', 'llama')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {searchQuery.trim() && searchQuery.trim().length >= 3 && !isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
              Auto-search in 3s
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Search Results ({searchResults.length} models found)
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-3">
            {searchResults.map((model, index) => (
              <div
                key={`${model.id}-${index}`}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                      {model.name}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {model.id}
                    </p>
                    {model.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                        {model.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Provider: {model.provider}</span>
                      {model.downloads && <span>Downloads: {model.downloads.toLocaleString()}</span>}
                      {model.likes && <span>Likes: {model.likes}</span>}
                      {model.pipeline_tag && <span>Type: {model.pipeline_tag}</span>}
                    </div>
                    {model.tags && model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {model.tags.slice(0, 5).map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {model.tags.length > 5 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{model.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddModel(model)}
                    disabled={addingModels.has(model.id)}
                    className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    {addingModels.has(model.id) ? 'Adding...' : 'Add Model'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isSearching && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Searching HuggingFace...</span>
        </div>
      )}

      {/* Empty state */}
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchQuery.trim().length < 3 ? (
            <div>
              <p>Type at least 3 characters to search models.</p>
              <p className="text-xs mt-1">Auto-search will begin after 3 seconds of inactivity.</p>
            </div>
          ) : (
            <div>
              <p>No models found for "{searchQuery}".</p>
              <p className="text-xs mt-1">Try a different search term or wait for auto-search.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        title="Add External Model"
        message={`Are you sure you want to add "${confirmationDialog.model?.name}" from HuggingFace? This model is from an external source and may not have been verified by our team.`}
        confirmText="Add Model"
        cancelText="Cancel"
        type="warning"
        onConfirm={() => confirmAddModel(confirmationDialog.model)}
        onCancel={() => setConfirmationDialog({ isOpen: false, model: null })}
      />
    </div>
  );
};
