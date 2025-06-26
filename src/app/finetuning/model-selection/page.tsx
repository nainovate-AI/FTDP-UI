'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../../../components/ThemeToggle';
import {
  ProgressStepper,
  ModelGrid,
  ModelFilters,
  ModelSummaryPanel,
  NavigationButtons,
  HuggingFaceSearch
} from '../../../components/model-selection';
import { useModelManagement } from '../../../hooks';
import { updateModelSelection } from '../../../utils/modelUtils';
import type { Model } from '../../../types';

export default function ModelSelection() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Models');
  const [selectedProvider, setSelectedProvider] = useState('All Providers');

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
    forceReconnect,
  } = useModelManagement();

  const filteredModels = getFilteredModels(searchTerm, selectedCategory, selectedProvider);

  const handleBack = () => {
    router.push('/finetuning/dataset-selection');
  };

  const handleNext = () => {
    if (selectedModel) {
      router.push('/finetuning/training');
    }
  };

  const steps = [
    'Dataset',
    'Model', 
    'Training',
    'Review',
    'Deploy'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ThemeToggle />
        
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
          
          {/* Backend Status Indicator */}
          <div className="mt-4 flex items-center justify-center gap-4">
            {isUsingBackend ? (
              <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Backend Connected - Full functionality available
              </div>
            ) : (
              <div className="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                Using local data - Start Python backend for search functionality
              </div>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={() => forceReconnect()}
              className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              title="Reconnect to backend and refresh model list"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reconnect
            </button>
          </div>
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
                  />
                )}
              </div>
            </div>

            {/* HuggingFace Search Section */}
            <div className="mt-8">
              <HuggingFaceSearch />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ModelSummaryPanel selectedModel={selectedModel} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canProceed={!!selectedModel}
          nextLabel="Continue to Training"
          backLabel="Back to Dataset Selection"
        />
      </div>
    </div>
  );
}
