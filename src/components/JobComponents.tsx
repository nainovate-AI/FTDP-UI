import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { theme } = useTheme();

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-600 text-white';
      case 'completed':
        return 'bg-green-600 text-white';
      case 'failed':
        return 'bg-red-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                    rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 m-0 mb-2 
                         transition-colors duration-300">
            {job.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 m-0 transition-colors duration-300">
            {job.model}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusClasses(job.status)}`}>
          {getStatusText(job.status)}
        </span>
      </div>

      {/* Progress */}
      {job.status === 'running' && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Progress
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
              {job.progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Accuracy for completed jobs */}
      {job.status === 'completed' && job.accuracy && (
        <div className="mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-300 mr-2 transition-colors duration-300">
            Accuracy:
          </span>
          <span className="text-sm font-semibold text-green-600">
            {job.accuracy}%
          </span>
        </div>
      )}

      {/* Dataset */}
      <div className="mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-300 mr-2 transition-colors duration-300">
          Dataset:
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {job.dataset}
        </span>
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 m-0 mb-4 leading-relaxed 
                      transition-colors duration-300">
          {job.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
          Started {new Date(job.startTime).toLocaleDateString()}
        </span>
        {job.estimatedCompletion && job.status === 'running' && (
          <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
            ETA {new Date(job.estimatedCompletion).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
