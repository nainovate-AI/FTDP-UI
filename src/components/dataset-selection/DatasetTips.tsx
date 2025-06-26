import React from 'react';

export const DatasetTips: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        💡 Dataset Tips
      </h3>
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Quality Matters</h4>
          <p className="text-gray-600 dark:text-gray-400">
            High-quality, diverse examples lead to better model performance.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Recommended Size</h4>
          <p className="text-gray-600 dark:text-gray-400">
            For most tasks, 100-1000 examples provide good results.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Task Types</h4>
          <div className="space-y-1">
            <div className="text-gray-600 dark:text-gray-400">• Question Answering</div>
            <div className="text-gray-600 dark:text-gray-400">• Summarization</div>
            <div className="text-gray-600 dark:text-gray-400">• Text Generation</div>
            <div className="text-gray-600 dark:text-gray-400">• Instruction Following</div>
            <div className="text-gray-600 dark:text-gray-400">• Code Generation</div>
            <div className="text-gray-600 dark:text-gray-400">• Translation</div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Tags & Organization</h4>
          <p className="text-gray-600 dark:text-gray-400">
            Use tags to categorize and organize your datasets for easier discovery and reuse.
          </p>
        </div>
      </div>
    </div>
  );
};
