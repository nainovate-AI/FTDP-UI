import { useState, useEffect, useCallback } from 'react';
import type { Model } from '../types';
import modelsData from '../data/models.json';

export const useModelManagement = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUsingBackend, setIsUsingBackend] = useState(false);

  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Attempting to connect to backend at http://localhost:8000/api/models');
      const response = await fetch('http://localhost:8000/api/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache busting to ensure fresh data
        cache: 'no-cache'
      });
      console.log('🌐 Backend response received:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Successfully loaded models from backend');
        
        // Handle both array and object responses
        const models = Array.isArray(data) ? data : data.models || [];
        const categories = data.categories || [];
        const providers = data.providers || [];
        
        console.log('📊 Loaded', models.length, 'models from backend');
        setModels(models);
        setIsUsingBackend(true);
        setError(null); // Clear any previous errors
        
        // Extract categories and providers from the loaded models if not provided
        const uniqueCategories = new Set(['All Models']);
        const uniqueProviders = new Set(['All Providers']);
        
        if (categories.length > 0) {
          categories.forEach((cat: string) => uniqueCategories.add(cat));
        } else {
          models.forEach((model: Model) => {
            uniqueCategories.add(model.category);
          });
        }
        
        if (providers.length > 0) {
          providers.forEach((prov: string) => uniqueProviders.add(prov));
        } else {
          models.forEach((model: Model) => {
            uniqueProviders.add(model.provider);
          });
        }
        
        setCategories(Array.from(uniqueCategories));
        setProviders(Array.from(uniqueProviders));
        setLoading(false);
        return true; // Indicate successful backend load
      } else {
        throw new Error(`Backend error: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Backend connection failed:', err);
      
      // Fallback to local import
      console.log('📂 Falling back to local JSON data');
      setModels(modelsData.models as Model[]);
      setCategories(modelsData.categories);
      setProviders(modelsData.providers);
      setIsUsingBackend(false);
      setError('Backend not available - using local data. Start the Python backend for full functionality.');
      setLoading(false);
      return false; // Indicate fallback to local data
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Force reconnect to backend and reload
  const forceReconnect = useCallback(async () => {
    console.log('🔄 Force reconnecting to backend...');
    setLoading(true);
    const success = await loadModels();
    if (success) {
      console.log('✅ Successfully reconnected and reloaded');
      setError(null);
    } else {
      console.log('❌ Reconnection failed');
    }
    return success;
  }, [loadModels]);

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
  };

  // Search HuggingFace models via backend API
  const searchHuggingFaceModels = useCallback(async (query: string, limit: number = 10) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/models/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const results = await response.json();
      setSearchResults(results);
      
      // If search succeeds, we know backend is available, so update the flag
      if (!isUsingBackend) {
        setIsUsingBackend(true);
        setError(null);
        // Optionally reload models to sync with backend
        loadModels();
      }
    } catch (err) {
      console.error('HuggingFace search error:', err);
      setError(err instanceof Error ? err.message : 'Search requires backend connection');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [isUsingBackend, loadModels]);

  // Add a model from search results to local collection
  const addModelFromSearch = useCallback(async (searchModel: any) => {
    try {
      console.log('🔄 Adding model to backend:', searchModel.id);
      
      // Always attempt to add to backend
      const response = await fetch('http://localhost:8000/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchModel),
      });

      console.log('📤 Add model response status:', response.status);

      if (response.status === 409) {
        // Duplicate model
        const errorData = await response.json();
        setError(errorData.detail);
        return false;
      }

      if (!response.ok) {
        throw new Error(`Failed to add model to backend: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Model added successfully:', result.model?.id);
      
      if (result.success) {
        console.log('🔄 Force reloading models from backend...');
        
        // Force a fresh reload from backend
        try {
          const reloadResponse = await fetch('http://localhost:8000/api/models');
          if (reloadResponse.ok) {
            const freshData = await reloadResponse.json();
            console.log('✅ Fresh data loaded:', freshData.length, 'models');
            
            setModels(freshData);
            setIsUsingBackend(true);
            
            // Update categories and providers
            const uniqueCategories = new Set(['All Models']);
            const uniqueProviders = new Set(['All Providers']);
            
            freshData.forEach((model: Model) => {
              uniqueCategories.add(model.category);
              uniqueProviders.add(model.provider);
            });
            
            setCategories(Array.from(uniqueCategories));
            setProviders(Array.from(uniqueProviders));
            
            // Select the newly added model
            const newModel = result.model;
            setSelectedModel(newModel);
            setError(null);
          } else {
            throw new Error('Failed to reload after add');
          }
        } catch (reloadErr) {
          console.log('⚠ Reload failed, adding to local state only');
          // If reload fails, at least add to current local state
          setModels(prev => [...prev, result.model]);
          setSelectedModel(result.model);
        }
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to add model');
      }
    } catch (err) {
      console.error('❌ Error adding model:', err);
      setError(err instanceof Error ? err.message : 'Backend not available for model addition');
      return false;
    }
  }, []);

  // Remove a model from the collection
  const removeModel = useCallback(async (modelId: string) => {
    try {
      console.log('🔄 Removing model from backend:', modelId);
      
      // Always attempt to remove from backend
      const response = await fetch(`http://localhost:8000/api/models/${encodeURIComponent(modelId)}`, {
        method: 'DELETE',
      });

      console.log('📤 Remove model response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to remove model from backend: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Model removed successfully:', modelId);
      
      if (result.success) {
        console.log('🔄 Force reloading models from backend...');
        
        // Force a fresh reload from backend
        try {
          const reloadResponse = await fetch('http://localhost:8000/api/models');
          if (reloadResponse.ok) {
            const freshData = await reloadResponse.json();
            console.log('✅ Fresh data loaded:', freshData.length, 'models');
            
            setModels(freshData);
            setIsUsingBackend(true);
            
            // Update categories and providers
            const uniqueCategories = new Set(['All Models']);
            const uniqueProviders = new Set(['All Providers']);
            
            freshData.forEach((model: Model) => {
              uniqueCategories.add(model.category);
              uniqueProviders.add(model.provider);
            });
            
            setCategories(Array.from(uniqueCategories));
            setProviders(Array.from(uniqueProviders));
            
            // Clear selected model if it was the one removed
            setSelectedModel(prev => prev?.id === modelId ? null : prev);
            setError(null);
          } else {
            throw new Error('Failed to reload after remove');
          }
        } catch (reloadErr) {
          console.log('⚠ Reload failed, removing from local state only');
          // If reload fails, at least remove from current local state
          setModels(prev => prev.filter(m => m.id !== modelId));
          setSelectedModel(prev => prev?.id === modelId ? null : prev);
        }
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to remove model');
      }
    } catch (err) {
      console.error('❌ Error removing model:', err);
      setError(err instanceof Error ? err.message : 'Backend not available for model removal');
      return false;
    }
  }, []);

  // Check if a model already exists
  const checkModelExists = useCallback(async (modelId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/models/check/${encodeURIComponent(modelId)}`);
      
      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.exists;
    } catch (err) {
      console.error('Error checking model existence:', err);
      return false;
    }
  }, []);

  const getFilteredModels = (
    searchTerm: string,
    category: string,
    provider: string
  ): Model[] => {
    return models.filter((model) => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (model.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = category === 'All Models' || model.category === category;
      const matchesProvider = provider === 'All Providers' || model.provider === provider;

      return matchesSearch && matchesCategory && matchesProvider;
    });
  };

  return {
    models,
    categories,
    providers,
    selectedModel,
    loading,
    error,
    isUsingBackend,
    handleModelSelect,
    getFilteredModels,
    // New search functionality
    searchResults,
    isSearching,
    searchHuggingFaceModels,
    addModelFromSearch,
    removeModel,
    checkModelExists,
    // Manual reload function
    loadModels,
    forceReconnect,
  };
};
