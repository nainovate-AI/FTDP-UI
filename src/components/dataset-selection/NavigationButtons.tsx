import React from 'react';

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
      <button
        onClick={onBack}
        className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>
      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          canProceed
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continue to Model Selection
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
