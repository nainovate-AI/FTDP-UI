'use client'

import React from 'react';
import { Check, ChevronRight, Circle, AlertCircle } from 'lucide-react';
import { Button } from '../ui';

export interface StepperStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
  disabled?: boolean;
  component?: React.ReactNode;
}

export interface ProgressStepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showNavigation?: boolean;
  allowStepClick?: boolean;
  showStepNumbers?: boolean;
  showStepIcons?: boolean;
  className?: string;
  stepClassName?: string;
  completedSteps?: number[];
  errorSteps?: number[];
  nextButtonText?: string;
  previousButtonText?: string;
  completeButtonText?: string;
  nextButtonDisabled?: boolean;
  previousButtonDisabled?: boolean;
  loading?: boolean;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  onNext,
  onPrevious,
  onComplete,
  variant = 'horizontal',
  size = 'md',
  showNavigation = true,
  allowStepClick = true,
  showStepNumbers = true,
  showStepIcons = false,
  className = '',
  stepClassName = '',
  completedSteps = [],
  errorSteps = [],
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  completeButtonText = 'Complete',
  nextButtonDisabled = false,
  previousButtonDisabled = false,
  loading = false
}) => {
  const isStepCompleted = (index: number) => completedSteps.includes(index) || index < currentStep;
  const isStepError = (index: number) => errorSteps.includes(index);
  const isStepCurrent = (index: number) => index === currentStep;
  const isStepDisabled = (index: number) => steps[index]?.disabled || (!allowStepClick && index !== currentStep);

  const handleStepClick = (index: number) => {
    if (isStepDisabled(index)) return;
    onStepClick?.(index);
  };

  // Size classes
  const sizeClasses = {
    sm: {
      step: 'w-6 h-6 text-xs',
      title: 'text-sm',
      description: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      step: 'w-8 h-8 text-sm',
      title: 'text-base',
      description: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      step: 'w-10 h-10 text-base',
      title: 'text-lg',
      description: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  const getStepClasses = (index: number) => {
    const base = `
      ${sizeClasses[size].step} rounded-full border-2 flex items-center justify-center font-medium transition-all duration-200
      ${allowStepClick && !isStepDisabled(index) ? 'cursor-pointer' : 'cursor-default'}
    `;

    if (isStepError(index)) {
      return `${base} bg-red-100 border-red-500 text-red-600 dark:bg-red-900/20 dark:border-red-400 dark:text-red-400`;
    }

    if (isStepCompleted(index)) {
      return `${base} bg-green-500 border-green-500 text-white dark:bg-green-600 dark:border-green-600`;
    }

    if (isStepCurrent(index)) {
      return `${base} bg-blue-500 border-blue-500 text-white dark:bg-blue-600 dark:border-blue-600`;
    }

    if (isStepDisabled(index)) {
      return `${base} bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-500`;
    }

    return `${base} bg-white border-gray-300 text-gray-600 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500`;
  };

  const getStepIcon = (index: number) => {
    const step = steps[index];
    
    if (isStepError(index)) {
      return <AlertCircle className={sizeClasses[size].icon} />;
    }
    
    if (isStepCompleted(index)) {
      return <Check className={sizeClasses[size].icon} />;
    }
    
    if (showStepIcons && step.icon) {
      return React.cloneElement(step.icon as React.ReactElement, {
        className: sizeClasses[size].icon
      });
    }
    
    if (showStepNumbers) {
      return index + 1;
    }
    
    return <Circle className={sizeClasses[size].icon} fill="currentColor" />;
  };

  const getConnectorClasses = (index: number) => {
    const isCompleted = isStepCompleted(index + 1);
    const base = variant === 'horizontal' 
      ? 'flex-1 h-0.5 min-w-8' 
      : 'w-0.5 h-8 mx-auto my-2';
    
    return `${base} ${
      isCompleted 
        ? 'bg-green-500 dark:bg-green-600' 
        : 'bg-gray-300 dark:bg-gray-600'
    }`;
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  if (variant === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Vertical Steps */}
        <div className="space-y-1">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={isStepDisabled(index)}
                  className={`${getStepClasses(index)} ${stepClassName}`}
                >
                  {getStepIcon(index)}
                </button>
                {index < steps.length - 1 && (
                  <div className={getConnectorClasses(index)} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={isStepDisabled(index)}
                  className={`
                    text-left w-full group
                    ${allowStepClick && !isStepDisabled(index) ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <div className={`
                    font-medium transition-colors
                    ${isStepCurrent(index) 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : isStepCompleted(index)
                      ? 'text-green-600 dark:text-green-400'
                      : isStepError(index)
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300'
                    } ${sizeClasses[size].title}
                  `}>
                    {step.title}
                    {step.optional && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                        (Optional)
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <div className={`
                      text-gray-500 dark:text-gray-400 mt-1 
                      ${sizeClasses[size].description}
                    `}>
                      {step.description}
                    </div>
                  )}
                </button>
                {isStepCurrent(index) && step.component && (
                  <div className="mt-4">
                    {step.component}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        {showNavigation && (
          <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={onPrevious}
              disabled={isFirstStep || previousButtonDisabled || loading}
            >
              {previousButtonText}
            </Button>
            <Button
              onClick={isLastStep ? onComplete : onNext}
              disabled={nextButtonDisabled || loading}
              loading={loading}
            >
              {isLastStep ? completeButtonText : nextButtonText}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Horizontal Layout
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Horizontal Steps */}
      <div className="flex items-center justify-center w-full">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleStepClick(index)}
                disabled={isStepDisabled(index)}
                className={`${getStepClasses(index)} ${stepClassName} mb-3`}
              >
                {getStepIcon(index)}
              </button>
              <div className="text-center max-w-24">
                <div className={`
                  font-medium transition-colors leading-tight
                  ${isStepCurrent(index) 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : isStepCompleted(index)
                    ? 'text-green-600 dark:text-green-400'
                    : isStepError(index)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300'
                  } ${sizeClasses[size].title}
                `}>
                  {step.title}
                  {step.optional && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-1">
                      (Optional)
                    </div>
                  )}
                </div>
                {step.description && (
                  <div className={`
                    text-gray-500 dark:text-gray-400 mt-1 leading-tight
                    ${sizeClasses[size].description}
                  `}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`${getConnectorClasses(index)} mt-[-40px]`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current Step Content */}
      {steps[currentStep]?.component && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {steps[currentStep].component}
        </div>
      )}

      {/* Navigation */}
      {showNavigation && (
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={onPrevious}
            disabled={isFirstStep || previousButtonDisabled || loading}
          >
            {previousButtonText}
          </Button>
          <Button
            onClick={isLastStep ? onComplete : onNext}
            disabled={nextButtonDisabled || loading}
            loading={loading}
          >
            {isLastStep ? completeButtonText : nextButtonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProgressStepper;
