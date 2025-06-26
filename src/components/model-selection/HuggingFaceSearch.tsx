import React, { useState } from 'react';
import { useModelManagement } from '../../hooks';

interface HuggingFaceSearchProps {
  onModelAdd?: (model: any) => void;
}

export const HuggingFaceSearch: React.FC<HuggingFaceSearchProps> = ({ onModelAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addingModels, setAddingModels] = useState<Set<string>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const { 
    searchResults, 
    isSearching, 
    searchHuggingFaceModels, 
    addModelFromSearch, 
    checkModelExists,
    error,
    isUsingBackend 
  } = useModelManagement();

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setSuccessMessage('');
      await searchHuggingFaceModels(searchQuery, 10);
    }
  };

  const handleAddModel = async (searchModel: any) => {
    const modelId = searchModel.id;
    
    // Check if already adding this model
    if (addingModels.has(modelId)) {
      return;
    }
    
    setAddingModels(prev => new Set(prev).add(modelId));
    setSuccessMessage('');
    
    try {
      // Check if model already exists
      const exists = await checkModelExists(modelId);
      if (exists) {
        alert(`Model "${searchModel.name}" already exists in your collection!`);
        return;
      }
      
      const success = await addModelFromSearch(searchModel);
      if (success) {
        setSuccessMessage(`Successfully added "${searchModel.name}" to your collection!`);
        if (onModelAdd) {
          onModelAdd(searchModel);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
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
            <span className="inline-block w-4 h-4 mr-2">⚠</span>Using local data. Search will attempt to connect to backend.
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
        </div>
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim() || isSearching}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-sm">{successMessage}</p>
        </div>
      )}

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
          No models found for "{searchQuery}". Try a different search term.
        </div>
      )}
    </div>
  );
};
