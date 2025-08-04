import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '../ui';

interface JobReviewNavigationButtonsProps {
  onBack: () => void;
  onCreateJob: () => void;
  canProceed: boolean;
}

export const JobReviewNavigationButtons: React.FC<JobReviewNavigationButtonsProps> = ({
  onBack,
  onCreateJob,
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
        Back to Hyperparameters
      </Button>
      
      <Button
        variant="success"
        onClick={onCreateJob}
        disabled={!canProceed}
        icon={Check}
        iconPosition="right"
        size="lg"
      >
        Create Finetuning Job
      </Button>
    </div>
  );
};
