'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../../../components/ThemeToggle';
import {
  ProgressStepper,
  FileUploadSection,
  ExistingDatasets,
  DatasetTips,
  NavigationButtons,
  DatasetPreviewModal,
  DatasetEditModal
} from '../../../components/dataset-selection';
import { loadDatasets, addDataset, updateDataset, deleteDataset, type Dataset } from '../../../utils/datasetUtils';

export default function DatasetSelection() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [taskType, setTaskType] = useState<string>('');
  const [customTag, setCustomTag] = useState<string>('');
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [inputColumn, setInputColumn] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [originalInputColumn, setOriginalInputColumn] = useState<string>('');
  const [originalTargetColumn, setOriginalTargetColumn] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Load datasets on component mount
  useEffect(() => {
    const loadInitialDatasets = async () => {
      try {
        const loadedDatasets = await loadDatasets();
        setDatasets(loadedDatasets);
      } catch (error) {
        console.error('Failed to load datasets:', error);
        setDatasets([]); // Set empty array if loading fails
      }
    };
    
    loadInitialDatasets();
  }, []);

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

  const handleBack = () => {
    router.push('/finetuning/dashboard/detailed');
  };

  const handleNext = () => {
    if (selectedDataset) {
      // TODO: Navigate to next step
      console.log('Proceeding with dataset:', selectedDataset);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is CSV
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Currently only CSV files are supported. JSONL support coming soon!');
        return;
      }
      
      setIsUploading(true);
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(0);
          
          // Store the uploaded file
          setUploadedFile(file);
          
          // Don't auto-show preview anymore, wait for save
          simulateFilePreview(file);
        }
      }, 200);
    }
  };

  const simulateFilePreview = (file: File) => {
    // Mock CSV data based on filename or generate generic data
    const mockPreview = {
      filename: file.name,
      columns: ['text', 'label', 'confidence', 'source'],
      data: [
        { text: 'This product is amazing!', label: 'positive', confidence: 0.95, source: 'review' },
        { text: 'I hate this service.', label: 'negative', confidence: 0.89, source: 'feedback' },
        { text: 'The quality is okay.', label: 'neutral', confidence: 0.76, source: 'review' },
        { text: 'Best purchase ever!', label: 'positive', confidence: 0.92, source: 'review' },
        { text: 'Could be better.', label: 'neutral', confidence: 0.68, source: 'feedback' },
        { text: 'Terrible experience.', label: 'negative', confidence: 0.94, source: 'review' },
        { text: 'Highly recommended!', label: 'positive', confidence: 0.87, source: 'review' }
      ],
      isNewUpload: true
    };
    
    // Store preview data but don't show it yet
    setPreviewData(mockPreview);
    setInputColumn(''); // Reset column selections
    setTargetColumn('');
    setValidationErrors([]);
    // Don't auto-show preview: setShowPreview(true);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
      setIsAddingTag(false);
    }
  };

  const handleStartAddingTag = () => {
    setIsAddingTag(true);
    setCustomTag('');
  };

  const handleCancelAddingTag = () => {
    setIsAddingTag(false);
    setCustomTag('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomTag();
    } else if (e.key === 'Escape') {
      handleCancelAddingTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDataset(datasetId);
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset && dataset.preview) {
      const inputCol = dataset.inputColumn || '';
      const targetCol = dataset.targetColumn || '';
      
      setPreviewData({
        filename: dataset.name,
        columns: dataset.columns || [],
        data: dataset.preview,
        isNewUpload: false
      });
      setInputColumn(inputCol);
      setTargetColumn(targetCol);
      setOriginalInputColumn(inputCol);
      setOriginalTargetColumn(targetCol);
      setShowPreview(true);
      validateColumns(inputCol, targetCol, dataset.columns || []);
    }
  };

  const validateColumns = (input: string, target: string, columns: string[]) => {
    const errors: string[] = [];
    
    if (!input) {
      errors.push('Input column is required');
    }
    if (!target) {
      errors.push('Target column is required');
    }
    if (input && target && input === target) {
      errors.push('Input and target columns must be different');
    }
    if (input && !columns.includes(input)) {
      errors.push('Selected input column does not exist in the dataset');
    }
    if (target && !columns.includes(target)) {
      errors.push('Selected target column does not exist in the dataset');
    }
    
    setValidationErrors(errors);
  };

  const handleInputColumnChange = (column: string) => {
    setInputColumn(column);
    validateColumns(column, targetColumn, previewData?.columns || []);
  };

  const handleTargetColumnChange = (column: string) => {
    setTargetColumn(column);
    validateColumns(inputColumn, column, previewData?.columns || []);
  };

  const handleTaskTypeChange = (type: string) => {
    setTaskType(type);
    setSelectedTags([]); // Reset tags when task type changes
  };

  const handleDatasetSave = async (datasetData: any) => {
    try {
      const success = await addDataset(datasetData);
      if (success) {
        // Reload datasets to include the new one
        const updatedDatasets = await loadDatasets();
        setDatasets(updatedDatasets);
        console.log('Dataset saved successfully');
        
        // Close the preview modal after successful save
        setShowPreview(false);
        
        // Reset the upload section
        setUploadedFile(null);
        setPreviewData(null);
        setTitle('');
        setDescription('');
        setTaskType('');
        setSelectedTags([]);
        setInputColumn('');
        setTargetColumn('');
        setValidationErrors([]);
      }
    } catch (error) {
      console.error('Failed to save dataset:', error);
    }
  };

  const handleDatasetEdit = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      setEditingDataset(dataset);
      setShowEditModal(true);
    }
  };

  const handleDatasetUpdate = async (datasetId: string, updates: Partial<Dataset>) => {
    try {
      const success = await updateDataset(datasetId, updates);
      if (success) {
        // Update local state
        setDatasets(prev => prev.map(d => 
          d.id === datasetId ? { ...d, ...updates } : d
        ));
        console.log('Dataset updated successfully');
      }
    } catch (error) {
      console.error('Failed to update dataset:', error);
    }
  };

  const handleDatasetDelete = async (datasetId: string) => {
    try {
      const success = await deleteDataset(datasetId);
      if (success) {
        // Remove from local state
        setDatasets(prev => prev.filter(d => d.id !== datasetId));
        // Clear selection if the deleted dataset was selected
        if (selectedDataset === datasetId) {
          setSelectedDataset(null);
        }
        console.log('Dataset deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  };

  const handleDatasetPreview = (datasetId: string) => {
    // Close edit modal first
    setShowEditModal(false);
    setEditingDataset(null);
    
    // Then trigger dataset selection which will open preview
    handleDatasetSelect(datasetId);
  };

  const handleDatasetColumnUpdate = async (datasetId: string, updates: any) => {
    try {
      const success = await updateDataset(datasetId, updates);
      if (success) {
        // Update local state
        setDatasets(prev => prev.map(d => 
          d.id === datasetId ? { ...d, ...updates } : d
        ));
        // Update original values to reflect the save
        setOriginalInputColumn(updates.inputColumn);
        setOriginalTargetColumn(updates.targetColumn);
        console.log('Dataset columns updated successfully');
        // Close the preview modal after successful save
        setShowPreview(false);
      }
    } catch (error) {
      console.error('Failed to update dataset columns:', error);
    }
  };

  const handleSaveUploadedDataset = async () => {
    if (!uploadedFile || !previewData) return;

    // Show preview modal for column selection
    setShowPreview(true);
  };

  const handleClearUpload = () => {
    setUploadedFile(null);
    setPreviewData(null);
    setTitle('');
    setDescription('');
    setTaskType('');
    setSelectedTags([]);
    setInputColumn('');
    setTargetColumn('');
    setValidationErrors([]);
  };

  const handleDescriptionChange = (desc: string) => {
    setDescription(desc);
  };

  const handleTitleChange = (titleValue: string) => {
    setTitle(titleValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ThemeToggle />
        
        <ProgressStepper 
          currentStep={1} 
          steps={['Dataset', 'Model', 'Training', 'Review', 'Deploy']} 
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
              onDatasetSelect={handleDatasetSelect}
              onDatasetEdit={handleDatasetEdit}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DatasetTips />
          </div>
        </div>

        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          canProceed={selectedDataset !== null && inputColumn !== '' && targetColumn !== '' && validationErrors.length === 0}
        />

        <DatasetPreviewModal
          isOpen={showPreview}
          previewData={previewData}
          inputColumn={inputColumn}
          targetColumn={targetColumn}
          validationErrors={validationErrors}
          taskType={taskType}
          selectedTags={selectedTags}
          title={title}
          description={description}
          datasetId={selectedDataset || undefined}
          originalInputColumn={originalInputColumn}
          originalTargetColumn={originalTargetColumn}
          onInputColumnChange={handleInputColumnChange}
          onTargetColumnChange={handleTargetColumnChange}
          onSave={handleDatasetSave}
          onUpdateDataset={handleDatasetColumnUpdate}
          onClose={() => setShowPreview(false)}
        />

        <DatasetEditModal
          isOpen={showEditModal}
          dataset={editingDataset}
          taskTags={taskTags}
          onSave={handleDatasetUpdate}
          onDelete={handleDatasetDelete}
          onPreview={handleDatasetPreview}
          onClose={() => {
            setShowEditModal(false);
            setEditingDataset(null);
          }}
        />
      </div>
    </div>
  );
}
