'use client'

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ToastProvider } from '../../components/toast';
import { ProgressStepper } from '../../components/stepper';
import { useFinetuningStore, useCurrentStep, useStepNavigation } from '../../store/finetuningStore';

// Import all step components
import { DatasetSelectionPage } from '../../components/pages/DatasetSelectionPage';
import { ModelSelectionPage } from '../../components/pages/ModelSelectionPage';
import { HyperparametersPage } from '../../components/pages/HyperparametersPage';
import { JobReviewPage } from '../../components/pages/JobReviewPage';
import { SuccessPage } from '../../components/pages/SuccessPage';

const STEPS = [
  { id: 'dataset-selection', title: 'Data Upload', component: DatasetSelectionPage },
  { id: 'model-selection', title: 'Model Selection', component: ModelSelectionPage },
  { id: 'hyperparameters', title: 'Hyperparameters', component: HyperparametersPage },
  { id: 'job-review', title: 'Job Review', component: JobReviewPage },
  { id: 'success', title: 'Success', component: SuccessPage }
];

function FinetuningWorkflowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use Zustand store for state management
  const currentStep = useCurrentStep();
  const { nextStep, previousStep, canGoNext, canGoPrevious, completedSteps, goToStep } = useStepNavigation();
  const setCurrentStep = useFinetuningStore((state) => state.setCurrentStep);
  
  // Sync URL params with store state (one-way sync to prevent infinite loops)
  useEffect(() => {
    const stepParam = searchParams?.get('step');
    const currentStepId = STEPS[currentStep - 1]?.id;
    
    if (stepParam && stepParam !== currentStepId) {
      // URL has a different step than store - update store
      const stepIndex = STEPS.findIndex(step => step.id === stepParam);
      if (stepIndex >= 0) {
        setCurrentStep(stepIndex + 1);
      }
    } else if (!stepParam && currentStepId) {
      // No step in URL but we have a current step - update URL without triggering re-render
      const newUrl = `/finetuning?step=${currentStepId}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, setCurrentStep]); // Removed currentStep and router from dependencies
  
  // Separate effect to sync store changes to URL
  useEffect(() => {
    const currentStepId = STEPS[currentStep - 1]?.id;
    const stepParam = searchParams?.get('step');
    
    if (currentStepId && stepParam !== currentStepId) {
      const newUrl = `/finetuning?step=${currentStepId}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [currentStep, router]); // Only depend on currentStep and router

  const handleNext = () => {
    nextStep();
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or adjacent steps
    const targetStep = stepIndex + 1;
    if (targetStep <= currentStep + 1 || completedSteps.has(targetStep)) {
      goToStep(targetStep);
    }
  };

  const handleNavigate = (pageId: string) => {
    // Handle special navigation cases
    if (pageId === 'dashboard' || pageId === 'dashboard-detailed') {
      router.push('/dashboard');
      return;
    }

    // Handle step navigation
    const stepIndex = STEPS.findIndex(step => step.id === pageId);
    if (stepIndex >= 0) {
      goToStep(stepIndex + 1);
    } else {
      // Handle other navigation (like job details)
      if (pageId.startsWith('job?') || pageId.startsWith('success?')) {
        router.push(`/${pageId}`);
      }
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  if (!CurrentStepComponent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Step not found
          </h1>
          <button
            onClick={() => goToStep(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to first step
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Global Progress Stepper - only show if not on success page */}
        {currentStep < STEPS.length && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <ProgressStepper 
                currentStep={currentStep}
                steps={STEPS.map((step, index) => ({
                  id: step.id,
                  title: step.title,
                  disabled: index + 1 > currentStep + 1 && !completedSteps.has(index + 1)
                }))}
                variant="horizontal"
                allowStepClick={true}
                showNavigation={false}
                onStepClick={handleStepClick}
                completedSteps={Array.from(completedSteps)}
                className="mb-0"
              />
            </div>
          </div>
        )}

        {/* Current Step Content */}
        <CurrentStepComponent
          onNext={handleNext}
          onPrevious={handlePrevious}
          onNavigate={handleNavigate}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
        />
      </div>
    </ToastProvider>
  );
}

export default function FinetuningWorkflow() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading finetuning workflow...</p>
        </div>
      </div>
    }>
      <FinetuningWorkflowContent />
    </Suspense>
  );
}
