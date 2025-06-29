'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Edit3, Check, X, HelpCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { ProgressStepper } from '../../../components/dataset-selection/ProgressStepper';
import {
  JobReviewNavigationButtons,
  JobConfigurationSummary,
  ModelSavingOptions,
  JobMetadata
} from '../../../components/job-review';
import { useToast } from '../../../hooks/useToast';
import { useTagManagement } from '../../../hooks/useTagManagement';
import { ToastContainer } from '../../../components/common/ToastNotification';

interface JobConfiguration {
  model: {
    uid: string;
    baseModel: string;
    modelName: string;
    provider: string;
  };
  dataset: {
    uid: string;
    name: string;
    selectedAt: string;
  };
  hyperparameters: {
    uid: string;
    outputDirectory: string;
    adapterMethod: string;
    mode: string;
    learningRate: number | number[];
    batchSize: number | number[];
    epochs: number | number[];
    weightDecay: number | number[];
    loraR: number | number[];
    loraAlpha: number | number[];
    loraDropout: number | number[];
    modeLogic?: string;
    searchLimit?: number;
    targetLoss?: number;
  };
}

interface JobMetadataState {
  name: string;
  description: string;
}

interface ModelSavingState {
  type: 'local' | 'huggingface';
  localPath: string;
  isLocalPathCustom: boolean;
  huggingfaceRepo: string;
  isPrivateRepo: boolean;
}

export default function JobReview() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [jobConfig, setJobConfig] = useState<JobConfiguration | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Job metadata state
  const [jobMetadata, setJobMetadata] = useState<JobMetadataState>({
    name: '',
    description: ''
  });
  
  // Model saving state
  const [modelSaving, setModelSaving] = useState<ModelSavingState>({
    type: 'local',
    localPath: '',
    isLocalPathCustom: false,
    huggingfaceRepo: '',
    isPrivateRepo: false
  });
  
  // Tag management
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

  // Load job configuration from metadata and related files
  useEffect(() => {
    const loadJobConfiguration = async () => {
      try {
        setLoading(true);
        
        // Use the FastAPI backend endpoint to get complete job configuration
        const response = await fetch('http://localhost:8000/api/job-configuration');
        if (!response.ok) {
          throw new Error(`Failed to load job configuration: ${response.status} ${response.statusText}`);
        }
        
        const jobConfigData = await response.json();
        
        // Validate that we have the required data
        if (!jobConfigData.model || !jobConfigData.dataset || !jobConfigData.hyperparameters) {
          throw new Error('Incomplete job configuration data');
        }
        
        // Build the job configuration object
        const config: JobConfiguration = {
          model: {
            uid: jobConfigData.model.uid || '',
            baseModel: jobConfigData.model.baseModel || '',
            modelName: jobConfigData.model.modelName || '',
            provider: jobConfigData.model.provider || ''
          },
          dataset: {
            uid: jobConfigData.dataset.uid || '',
            name: jobConfigData.dataset.name || '',
            selectedAt: jobConfigData.dataset.selectedAt || ''
          },
          hyperparameters: {
            uid: jobConfigData.hyperparameters.uid || '',
            outputDirectory: jobConfigData.hyperparameters.outputDirectory || './fine_tuned_model',
            adapterMethod: jobConfigData.hyperparameters.adapterMethod || 'LoRA',
            mode: jobConfigData.hyperparameters.mode || 'Manual',
            learningRate: jobConfigData.hyperparameters.learningRate || 2e-4,
            batchSize: jobConfigData.hyperparameters.batchSize || 4,
            epochs: jobConfigData.hyperparameters.epochs || 3,
            weightDecay: jobConfigData.hyperparameters.weightDecay || 0.01,
            loraR: jobConfigData.hyperparameters.loraR || 16,
            loraAlpha: jobConfigData.hyperparameters.loraAlpha || 32,
            loraDropout: jobConfigData.hyperparameters.loraDropout || 0.1,
            modeLogic: jobConfigData.hyperparameters.modeLogic,
            searchLimit: jobConfigData.hyperparameters.searchLimit,
            targetLoss: jobConfigData.hyperparameters.targetLoss
          }
        };
        
        setJobConfig(config);
        
        // Set default local path based on job configuration
        const jobId = `job_${Date.now()}`;
        const defaultLocalPath = `./ft/${jobId}`;
        setModelSaving(prev => ({
          ...prev,
          localPath: defaultLocalPath
        }));
        
      } catch (err) {
        console.error('Error loading job configuration:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        addToast('Failed to load job configuration. Make sure the backend is running.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadJobConfiguration();
  }, [addToast]);

  const steps = [
    'Data Upload',
    'Model Selection', 
    'Hyperparameters',
    'Job Review',
    'Success'
  ];

  const handleBack = () => {
    router.push('/finetuning/hyperparameters');
  };

  const handleCreateJob = async () => {
    // Validate required fields
    if (!jobMetadata.name.trim()) {
      addToast('Job name is required', 'error');
      return;
    }
    
    if (modelSaving.type === 'huggingface' && !modelSaving.huggingfaceRepo.trim()) {
      addToast('Hugging Face repository name is required', 'error');
      return;
    }
    
    try {
      // Create the job configuration
      const jobData = {
        name: jobMetadata.name,
        description: jobMetadata.description,
        tags: selectedTags,
        configuration: jobConfig,
        modelSaving,
        createdAt: new Date().toISOString()
      };
      
      // Save job data via backend API
      const response = await fetch('http://localhost:8000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create job');
      }
      
      const result = await response.json();
      
      addToast(`Finetuning job "${jobMetadata.name}" created successfully!`, 'success');
      
      // Navigate to training/monitoring screen
      router.push('/finetuning/training');
      
    } catch (err) {
      console.error('Error creating job:', err);
      addToast(
        err instanceof Error ? err.message : 'Failed to create finetuning job. Make sure the backend is running.',
        'error'
      );
    }
  };

  const canProceed = () => {
    return (
      jobMetadata.name.trim() !== '' &&
      (modelSaving.type === 'local' || 
       (modelSaving.type === 'huggingface' && modelSaving.huggingfaceRepo.trim() !== ''))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading job configuration...</p>
        </div>
      </div>
    );
  }

  if (error || !jobConfig) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configuration Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            {error || 'Unable to load job configuration. Please check your previous selections.'}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <ThemeToggle />
        
        <ProgressStepper 
          currentStep={4} 
          steps={steps} 
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Review Finetuning Job
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Verify the details below before submitting your job
          </p>
        </div>

        <div className="space-y-6">
          {/* Job Configuration Summary */}
          <JobConfigurationSummary jobConfig={jobConfig} />
          
          {/* Model Saving Options */}
          <ModelSavingOptions 
            modelSaving={modelSaving}
            setModelSaving={setModelSaving}
            jobConfig={jobConfig}
          />
          
          {/* Job Metadata */}
          <JobMetadata
            jobMetadata={jobMetadata}
            setJobMetadata={setJobMetadata}
            selectedTags={selectedTags}
            customTag={customTag}
            isAddingTag={isAddingTag}
            setCustomTag={setCustomTag}
            handleTagToggle={handleTagToggle}
            handleAddCustomTag={handleAddCustomTag}
            handleStartAddingTag={handleStartAddingTag}
            handleCancelAddingTag={handleCancelAddingTag}
            handleRemoveTag={handleRemoveTag}
            handleKeyPress={handleKeyPress}
          />
        </div>

        {/* Navigation */}
        <div className="mt-8">
          <JobReviewNavigationButtons
            onBack={handleBack}
            onCreateJob={handleCreateJob}
            canProceed={canProceed()}
          />
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
