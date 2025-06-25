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
import { loadDatasets, addDataset, updateDataset, type Dataset } from '../../../utils/datasetUtils';

const mockDatasets: Dataset[] = [
  {
    id: '1',
    name: 'Customer Support QA Dataset',
    description: 'Customer support questions with detailed answers and troubleshooting steps',
    size: '2.3 MB',
    format: 'CSV',
    taskType: 'Question Answering',
    samples: 5420,
    lastModified: '2024-01-15',
    tags: ['factual', 'customer-service', 'support'],
    inputColumn: 'question',
    targetColumn: 'answer',
    columns: ['question', 'answer', 'category', 'priority'],
    preview: [
      { question: 'How do I reset my password?', answer: 'Click on "Forgot Password" on the login page and follow the instructions.', category: 'account', priority: 'high' },
      { question: 'Where can I find my order history?', answer: 'Go to your account dashboard and click on "Order History" in the sidebar.', category: 'orders', priority: 'medium' },
      { question: 'How to cancel my subscription?', answer: 'Navigate to Settings > Billing > Cancel Subscription. Note that cancellation takes effect at the end of your current billing cycle.', category: 'billing', priority: 'high' },
      { question: 'Why is my payment failing?', answer: 'Check if your card details are correct and has sufficient funds. Contact your bank if the issue persists.', category: 'payment', priority: 'high' },
      { question: 'How to update my profile information?', answer: 'Go to Settings > Profile and click Edit. Save your changes when done.', category: 'account', priority: 'low' }
    ]
  },
  {
    id: '2',
    name: 'Article Summarization Dataset',
    description: 'News articles paired with human-written summaries for training summarization models',
    size: '15.7 MB',
    format: 'CSV',
    taskType: 'Summarization',
    samples: 12800,
    lastModified: '2024-01-12',
    tags: ['news', 'abstractive', 'journalism'],
    inputColumn: 'article',
    targetColumn: 'summary',
    columns: ['article', 'summary', 'source', 'date', 'category'],
    preview: [
      { article: 'Breaking: Scientists at MIT have developed a new quantum computing algorithm that could revolutionize...', summary: 'MIT researchers create breakthrough quantum algorithm with potential to transform computing.', source: 'TechNews', date: '2024-01-10', category: 'technology' },
      { article: 'The global economy shows signs of recovery as inflation rates begin to stabilize across major markets...', summary: 'Global economic recovery underway as inflation stabilizes in key markets.', source: 'EconDaily', date: '2024-01-09', category: 'economics' },
      { article: 'Climate change activists gathered in major cities worldwide to demand immediate action on carbon emissions...', summary: 'Worldwide climate protests call for urgent action on carbon emission reductions.', source: 'GreenNews', date: '2024-01-08', category: 'environment' }
    ]
  },
  {
    id: '3',
    name: 'Code Generation Examples',
    description: 'Programming tasks with corresponding code solutions and explanations',
    size: '8.9 MB',
    format: 'CSV',
    taskType: 'Code Generation',
    samples: 3200,
    lastModified: '2024-01-10',
    tags: ['python', 'documentation', 'programming'],
    inputColumn: 'prompt',
    targetColumn: 'code',
    columns: ['prompt', 'code', 'language', 'difficulty', 'explanation'],
    preview: [
      { prompt: 'Write a function to reverse a string', code: 'def reverse_string(s):\n    return s[::-1]', language: 'python', difficulty: 'easy', explanation: 'Uses Python slice notation to reverse the string' },
      { prompt: 'Create a binary search algorithm', code: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1', language: 'python', difficulty: 'medium', explanation: 'Efficient O(log n) search algorithm for sorted arrays' },
      { prompt: 'Implement a stack data structure', code: 'class Stack:\n    def __init__(self):\n        self.items = []\n    \n    def push(self, item):\n        self.items.append(item)\n    \n    def pop(self):\n        return self.items.pop() if self.items else None', language: 'python', difficulty: 'easy', explanation: 'Basic stack implementation using Python list' }
    ]
  }
];

export default function DatasetSelection() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>(mockDatasets);
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

  // Load datasets on component mount
  useEffect(() => {
    const loadInitialDatasets = async () => {
      try {
        const loadedDatasets = await loadDatasets();
        if (loadedDatasets.length > 0) {
          setDatasets(loadedDatasets);
        }
      } catch (error) {
        console.error('Failed to load datasets:', error);
        // Keep using mockDatasets as fallback
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
          
          // Simulate file parsing and show preview
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
    
    setPreviewData(mockPreview);
    setInputColumn(''); // Reset column selections
    setTargetColumn('');
    setValidationErrors([]);
    setShowPreview(true);
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
      setPreviewData({
        filename: dataset.name,
        columns: dataset.columns || [],
        data: dataset.preview,
        isNewUpload: false
      });
      setInputColumn(dataset.inputColumn || '');
      setTargetColumn(dataset.targetColumn || '');
      setShowPreview(true);
      validateColumns(dataset.inputColumn || '', dataset.targetColumn || '', dataset.columns || []);
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
              onFileUpload={handleFileUpload}
              onTaskTypeChange={handleTaskTypeChange}
              onTagToggle={handleTagToggle}
              onStartAddingTag={handleStartAddingTag}
              onCancelAddingTag={handleCancelAddingTag}
              onCustomTagChange={setCustomTag}
              onAddCustomTag={handleAddCustomTag}
              onKeyPress={handleKeyPress}
              onRemoveTag={handleRemoveTag}
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
          onInputColumnChange={handleInputColumnChange}
          onTargetColumnChange={handleTargetColumnChange}
          onSave={handleDatasetSave}
          onClose={() => setShowPreview(false)}
        />

        <DatasetEditModal
          isOpen={showEditModal}
          dataset={editingDataset}
          taskTags={taskTags}
          onSave={handleDatasetUpdate}
          onClose={() => {
            setShowEditModal(false);
            setEditingDataset(null);
          }}
        />
      </div>
    </div>
  );
}
