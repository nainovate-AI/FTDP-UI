'use client'

import React, { useState } from 'react';
import {
  ProgressStepper,
  FileUploadSection,
  ExistingDatasets,
  DatasetTips,
  NavigationButtons,
  DatasetPreviewModal,
  DatasetEditModal
} from '../dataset-selection';
import {
  useDatasetManagement,
  useTagManagement,
  useFileUpload,
  useModalState
} from '../../hooks';
import { validatePreviewColumns } from '../../utils/filePreviewUtils';
import type { Dataset } from '../../utils/datasetUtils';

interface DatasetSelectionPageProps {
  onNavigate?: (pageId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  pageConfig?: any;
  config?: any;
}

/**
 * DatasetSelectionPage Component
 * 
 * Features:
 * - File upload and dataset management
 * - Existing dataset selection
 * - Dataset preview and validation
 * - Navigation integration with new URL system
 * - Preserves all backend API functionality
 */
export const DatasetSelectionPage: React.FC<DatasetSelectionPageProps> = ({ 
  onNavigate, 
  onNext, 
  onPrevious, 
  canGoNext, 
  canGoPrevious, 
  pageConfig, 
  config 
}) => {
  const [taskType, setTaskType] = useState<string>('');

  // Custom hooks for state management
  const {
    datasets,
    selectedDataset,
    loading: datasetsLoading,
    error: datasetsError,
    handleDatasetSelect,
    handleDatasetSave,
    handleDatasetUpdate,
    handleDatasetDelete,
    getSelectedDatasetData,
  } = useDatasetManagement();

  const {
    selectedTags,
    customTag,
    isAddingTag,
    setCustomTag,
    setSelectedTags,
    handleTagToggle,
    handleAddCustomTag,
    handleStartAddingTag,
    handleCancelAddingTag,
    handleRemoveTag,
    handleKeyPress,
    resetTags,
  } = useTagManagement();

  const {
    uploadedFile,
    uploadProgress,
    isUploading,
    previewData,
    title,
    description,
    previewError,
    usedBackend,
    setTitle,
    setDescription,
    setPreviewData,
    handleFileUpload,
    resetUpload,
  } = useFileUpload();

  const {
    showPreview,
    showEditModal,
    editingDataset,
    validationErrors,
    openPreview,
    closePreview,
    openEditModal,
    closeEditModal,
    setErrors,
    clearErrors,
  } = useModalState();

  // Task-based tags for major LLM/text generation tasks
  const taskTags = {
    'Question Answering': ['factual', 'conversational', 'technical', 'educational', 'context-based'],
    'Summarization': ['news', 'research', 'meeting-notes', 'documentation', 'extractive', 'abstractive'],
    'Text Generation': ['creative-writing', 'content-creation', 'dialogue', 'story-telling', 'copywriting'],
    'Instruction Following': ['task-completion', 'step-by-step', 'reasoning', 'problem-solving'],
    'Code Generation': ['python', 'javascript', 'documentation', 'debugging', 'testing', 'explanation'],
    'Translation': ['english', 'spanish', 'french', 'german', 'multilingual', 'localization'],
    'Text Completion': ['autocomplete', 'sentence-completion', 'paragraph-completion', 'prompt-completion']
  };

  // Navigation handlers - updated to use new URL system
  const handleBack = () => {
    if (onPrevious) {
      onPrevious();
    } else if (onNavigate) {
      // Fallback to dashboard-detailed
      onNavigate('dashboard-detailed');
    }
  };

  const handleNext = () => {
    if (selectedDataset && onNext) {
      const selectedDatasetData = getSelectedDatasetData();
      // Log for debugging (preserve original functionality)
      console.log('Proceeding with dataset:', {
        id: selectedDataset,
        uid: selectedDatasetData?.uid,
        name: selectedDatasetData?.name,
        filePath: selectedDatasetData?.filePath
      });
      onNext();
    } else if (onNavigate) {
      // Fallback navigation
      onNavigate('model-selection');
    }
  };

  const handleTaskTypeChange = (type: string) => {
    setTaskType(type);
    resetTags(); // Reset tags when task type changes
  };

  const handleDatasetPreviewClick = (datasetId: string) => {
    // Only open preview, don't select the dataset yet
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset && dataset.preview) {
      setPreviewData({
        filename: dataset.name,
        columns: dataset.columns || [],
        data: dataset.preview,
        isNewUpload: false,
        datasetId: datasetId // Store the dataset ID for later selection
      });
      
      // Validate columns and set errors
      const errors = validatePreviewColumns({
        columns: dataset.columns || [],
        data: dataset.preview
      });
      setErrors(errors);
      
      openPreview();
    }
  };

  const handleDatasetSaveAndProceed = async (datasetData?: any) => {
    if (previewData?.isNewUpload && datasetData) {
      // Save the new dataset and select it
      const success = await handleDatasetSave(datasetData);
      if (success) {
        // Close the preview modal after successful save
        closePreview();
        
        // Reset the upload section
        resetUpload();
        resetTags();
        setTaskType('');
        clearErrors();
        
        // Proceed to next step since dataset is now selected
        handleNext();
      }
    } else if (datasetData && typeof datasetData === 'string') {
      // For existing datasets, datasetData contains the dataset ID
      await handleDatasetSelect(datasetData);
      closePreview();
      handleNext();
    }
  };

  const handleDatasetSaveComplete = async (datasetData: any) => {
    const success = await handleDatasetSave(datasetData);
    if (success) {
      // Close the preview modal after successful save
      closePreview();
      
      // Reset the upload section
      resetUpload();
      resetTags();
      setTaskType('');
      clearErrors();
    }
  };

  const handleDatasetEdit = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      openEditModal(dataset);
    }
  };

  const handleDatasetPreview = (datasetId: string) => {
    // Close edit modal first
    closeEditModal();
    
    // Then trigger dataset preview (not selection)
    handleDatasetPreviewClick(datasetId);
  };

  const handleSaveUploadedDataset = async () => {
    if (!uploadedFile || !previewData) return;

    // Use validation errors from the API response if available, otherwise validate locally
    let errors: string[] = [];
    if (previewData.validation_errors && Array.isArray(previewData.validation_errors)) {
      errors = previewData.validation_errors;
    } else {
      // Fallback to local validation for backward compatibility
      errors = validatePreviewColumns(previewData);
    }
    
    setErrors(errors);
    
    // Show preview modal
    openPreview();
  };

  const handleClearUpload = () => {
    resetUpload();
    resetTags();
    setTaskType('');
    clearErrors();
  };

  const handleDescriptionChange = (desc: string) => {
    setDescription(desc);
  };

  const handleTitleChange = (titleValue: string) => {
    setTitle(titleValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 opacity-0 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProgressStepper 
          currentStep={1} 
          steps={['Data Upload', 'Model Selection', 'Hyperparameters', 'Job Review', 'Success']} 
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Select Your Dataset
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose an existing dataset or upload a new one to begin fine-tuning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <FileUploadSection
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              taskType={taskType}
              selectedTags={selectedTags}
              isAddingTag={isAddingTag}
              customTag={customTag}
              taskTags={taskTags}
              uploadedFile={uploadedFile}
              title={title}
              description={description}
              previewError={previewError}
              usedBackend={usedBackend}
              onFileUpload={handleFileUpload}
              onTaskTypeChange={handleTaskTypeChange}
              onTagToggle={handleTagToggle}
              onStartAddingTag={handleStartAddingTag}
              onCancelAddingTag={handleCancelAddingTag}
              onCustomTagChange={setCustomTag}
              onAddCustomTag={handleAddCustomTag}
              onKeyPress={handleKeyPress}
              onRemoveTag={handleRemoveTag}
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
              onSaveDataset={handleSaveUploadedDataset}
              onClearUpload={handleClearUpload}
            />

            <ExistingDatasets
              datasets={datasets}
              selectedDataset={selectedDataset}
              onDatasetSelect={handleDatasetPreviewClick}
              onDatasetEdit={handleDatasetEdit}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky-below-navbar">
              <DatasetTips />
            </div>
          </div>
        </div>

        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canProceed={selectedDataset !== null && validationErrors.length === 0}
        />

        <DatasetPreviewModal
          isOpen={showPreview}
          previewData={previewData}
          validationErrors={validationErrors}
          taskType={taskType}
          selectedTags={selectedTags}
          title={title}
          description={description}
          datasetId={selectedDataset || undefined}
          onSave={handleDatasetSaveComplete}
          onNext={handleDatasetSaveAndProceed}
          onClose={closePreview}
        />

        <DatasetEditModal
          isOpen={showEditModal}
          dataset={editingDataset}
          taskTags={taskTags}
          onSave={handleDatasetUpdate}
          onDelete={handleDatasetDelete}
          onPreview={handleDatasetPreview}
          onClose={closeEditModal}
        />
      </div>
    </div>
  );
};

export default DatasetSelectionPage;
