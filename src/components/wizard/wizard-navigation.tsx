'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface WizardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  canProceed: boolean;
}

export function WizardNavigation({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  isSubmitting,
  canProceed,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between items-center pt-6">
      <div>
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
      </div>
      
      <Button
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        loading={isSubmitting}
      >
        {isLastStep ? 'Complete' : 'Next'}
      </Button>
    </div>
  );
}
