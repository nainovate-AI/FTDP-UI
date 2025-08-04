import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  canProceed
}) => {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <Button
        variant="ghost"
        onClick={onBack}
        icon={ChevronLeft}
        iconPosition="left"
        animate={false}
      >
        Back to Dashboard
      </Button>
      
      <Button
        variant="primary"
        onClick={onNext}
        disabled={!canProceed}
        icon={ChevronRight}
        iconPosition="right"
      >
        Continue to Model Selection
      </Button>
    </div>
  );
};
