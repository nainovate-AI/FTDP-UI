'use client'

import React, { useState } from 'react';
import {
  ProgressStepper,
  ModelGrid,
  ModelFilters,
  ModelSummaryPanel,
  NavigationButtons,
  HuggingFaceSearch
} from '../model-selection';
import { useModelManagement } from '../../hooks';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../common/ToastNotification';
import { updateModelSelection } from '../../utils/modelUtils';
import type { Model } from '../../types';

interface ModelSelectionPageProps {
  onNavigate?: (pageId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  pageConfig?: any;
  config?: any;
}

/**
 * ModelSelectionPage Component
 * 
 * Features:
 * - Model browsing and filtering
 * - HuggingFace model search
 * - Model selection and validation
 * - Navigation integration with new URL system
 * - Preserves all backend API functionality
 */
export const ModelSelectionPage: React.FC<ModelSelectionPageProps> = ({ 
  onNavigate, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious, 
  pageConfig, 
  config 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Models');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  const handleModelSelect = async (model: Model) => {
    await updateModelSelection(model);
    _handleModelSelect(model); // call the original handler from the hook
  };

  // Replace the original handleModelSelect from the hook
  const {
    models,
    categories,
    providers,
    selectedModel,
    loading,
    error,
    isUsingBackend,
    handleModelSelect: _handleModelSelect,
    getFilteredModels,
    loadModels,
  } = useModelManagement();

  const filteredModels = getFilteredModels(searchTerm, selectedCategory, selectedProvider);

  // Navigation handlers - updated to use new URL system
  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    } else if (onNavigate) {
      onNavigate('dataset-selection');
    }
  };

  const handleNext = () => {
    if (selectedModel && onNext) {
      onNext();
    } else if (onNavigate) {
      onNavigate('hyperparameters');
    }
  };

  const steps = [
    'Data Upload',
    'Model Selection', 
    'Hyperparameters',
    'Job Review',
    'Success'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 opacity-0 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProgressStepper 
          currentStep={2} 
          steps={steps} 
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Select Your Model
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose the base model for your fine-tuning job
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Filters */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <ModelFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedProvider={selectedProvider}
                  onProviderChange={setSelectedProvider}
                  categories={categories}
                  providers={providers}
                />
              </div>

              {/* Model Grid */}
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                  </div>
                ) : (
                  <ModelGrid
                    models={filteredModels}
                    selectedModel={selectedModel}
                    onModelSelect={handleModelSelect}
                    showWarning={showWarning}
                    showSuccess={showSuccess}
                    showError={showError}
                  />
                )}
              </div>
            </div>

            {/* HuggingFace Search Section */}
            <div className="mt-8">
              <HuggingFaceSearch 
                showSuccess={showSuccess}
                showError={showError}
                showWarning={showWarning}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky-below-navbar">
              <ModelSummaryPanel selectedModel={selectedModel} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canProceed={!!selectedModel}
          nextLabel="Continue to Hyperparameters"
          backLabel="Back to Data Upload"
        />
        
        {/* Global Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

export default ModelSelectionPage;
