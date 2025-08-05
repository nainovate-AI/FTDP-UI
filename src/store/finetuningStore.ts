'use client'

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Model } from '../types';

// Define interfaces for each step's data
interface DatasetState {
  selectedDataset: string | null;
  datasetData: any;
  taskType: string;
  selectedTags: string[];
}

interface ModelState {
  selectedModel: Model | null;
  modelData: any;
}

interface HyperparametersState {
  learningRate: number;
  batchSize: number;
  epochs: number;
  weightDecay: number;
  adapterMethod: string;
  mode: string;
  loraR: number;
  loraAlpha: number;
  loraDropout: number;
  outputDirectory: string;
  uid: string;
  [key: string]: any;
}

interface JobReviewState {
  jobName: string;
  description: string;
  modelSaving: {
    type: 'local' | 'huggingface';
    huggingfaceRepo: string;
    isPrivate: boolean;
  };
}

// Main finetuning store
export interface FinetuningStore {
  // Current step
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // Step completion status
  completedSteps: Set<number>;
  markStepComplete: (step: number) => void;
  markStepIncomplete: (step: number) => void;
  
  // Dataset step
  dataset: DatasetState;
  setDataset: (data: Partial<DatasetState>) => void;
  clearDataset: () => void;
  
  // Model step
  model: ModelState;
  setModel: (data: Partial<ModelState>) => void;
  clearModel: () => void;
  
  // Hyperparameters step
  hyperparameters: HyperparametersState;
  setHyperparameters: (data: Partial<HyperparametersState>) => void;
  clearHyperparameters: () => void;
  
  // Job review step
  jobReview: JobReviewState;
  setJobReview: (data: Partial<JobReviewState>) => void;
  clearJobReview: () => void;
  
  // Navigation
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  
  // Validation
  validateStep: (step: number) => boolean;
  
  // Reset
  reset: () => void;
}

const initialDatasetState: DatasetState = {
  selectedDataset: null,
  datasetData: null,
  taskType: '',
  selectedTags: []
};

const initialModelState: ModelState = {
  selectedModel: null,
  modelData: null
};

const initialHyperparametersState: HyperparametersState = {
  learningRate: 2e-4,
  batchSize: 4,
  epochs: 3,
  weightDecay: 0.01,
  adapterMethod: 'LoRA',
  mode: 'Manual',
  loraR: 16,
  loraAlpha: 32,
  loraDropout: 0.1,
  outputDirectory: './fine_tuned_model',
  uid: ''
};

const initialJobReviewState: JobReviewState = {
  jobName: '',
  description: '',
  modelSaving: {
    type: 'local',
    huggingfaceRepo: '',
    isPrivate: true
  }
};

export const useFinetuningStore = create<FinetuningStore>()(
  persist(
    (set, get) => ({
      // Current step
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),
      
      // Step completion
      completedSteps: new Set<number>(),
      markStepComplete: (step) => set((state) => ({
        completedSteps: new Set(state.completedSteps).add(step)
      })),
      markStepIncomplete: (step) => set((state) => {
        const newCompleted = new Set(state.completedSteps);
        newCompleted.delete(step);
        return { completedSteps: newCompleted };
      }),
      
      // Dataset state
      dataset: initialDatasetState,
      setDataset: (data) => set((state) => ({
        dataset: { ...state.dataset, ...data }
      })),
      clearDataset: () => set({ dataset: initialDatasetState }),
      
      // Model state
      model: initialModelState,
      setModel: (data) => set((state) => ({
        model: { ...state.model, ...data }
      })),
      clearModel: () => set({ model: initialModelState }),
      
      // Hyperparameters state
      hyperparameters: initialHyperparametersState,
      setHyperparameters: (data) => set((state) => ({
        hyperparameters: { ...state.hyperparameters, ...data }
      })),
      clearHyperparameters: () => set({ hyperparameters: initialHyperparametersState }),
      
      // Job review state
      jobReview: initialJobReviewState,
      setJobReview: (data) => set((state) => ({
        jobReview: { ...state.jobReview, ...data }
      })),
      clearJobReview: () => set({ jobReview: initialJobReviewState }),
      
      // Navigation
      canGoNext: () => {
        const state = get();
        return state.validateStep(state.currentStep);
      },
      
      canGoPrevious: () => {
        const state = get();
        return state.currentStep > 1;
      },
      
      nextStep: () => {
        const state = get();
        if (state.canGoNext() && state.currentStep < 5) {
          const currentStepToComplete = state.currentStep;
          const nextStep = state.currentStep + 1;
          set({ currentStep: nextStep });
          state.markStepComplete(currentStepToComplete);
        }
      },
      
      previousStep: () => {
        const state = get();
        if (state.canGoPrevious()) {
          set({ currentStep: state.currentStep - 1 });
        }
      },
      
      goToStep: (step) => {
        if (step >= 1 && step <= 5) {
          set({ currentStep: step });
        }
      },
      
      // Validation
      validateStep: (step) => {
        const state = get();
        switch (step) {
          case 1: // Dataset Selection
            return !!state.dataset.selectedDataset;
          case 2: // Model Selection
            return !!state.model.selectedModel;
          case 3: // Hyperparameters
            return true; // Hyperparameters have defaults, so always valid
          case 4: // Job Review
            return !!state.jobReview.jobName.trim();
          case 5: // Success
            return true;
          default:
            return false;
        }
      },
      
      // Reset
      reset: () => set({
        currentStep: 1,
        completedSteps: new Set<number>(),
        dataset: initialDatasetState,
        model: initialModelState,
        hyperparameters: initialHyperparametersState,
        jobReview: initialJobReviewState
      })
    }),
    {
      name: 'finetuning-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps),
        dataset: state.dataset,
        model: state.model,
        hyperparameters: state.hyperparameters,
        jobReview: state.jobReview
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.completedSteps)) {
          // Convert array back to Set after rehydration
          state.completedSteps = new Set(state.completedSteps);
        }
      }
    }
  )
);

// Utility hooks for easier access to specific parts of the store
export const useCurrentStep = () => useFinetuningStore((state) => state.currentStep);
export const useDatasetState = () => useFinetuningStore((state) => state.dataset);
export const useModelState = () => useFinetuningStore((state) => state.model);
export const useHyperparametersState = () => useFinetuningStore((state) => state.hyperparameters);
export const useJobReviewState = () => useFinetuningStore((state) => state.jobReview);
export const useStepNavigation = () => {
  const currentStep = useFinetuningStore((state) => state.currentStep);
  const completedSteps = useFinetuningStore((state) => state.completedSteps);
  const validateStep = useFinetuningStore((state) => state.validateStep);
  const nextStep = useFinetuningStore((state) => state.nextStep);
  const previousStep = useFinetuningStore((state) => state.previousStep);
  const goToStep = useFinetuningStore((state) => state.goToStep);
  
  // Compute derived values without triggering re-renders
  const canGoNext = validateStep(currentStep);
  const canGoPrevious = currentStep > 1;
  
  return {
    currentStep,
    canGoNext,
    canGoPrevious,
    nextStep,
    previousStep,
    goToStep,
    completedSteps
  };
};
