import React from 'react';
import { ExternalLink, Clock, Tag } from 'lucide-react';
import { Job } from '../../utils/jobUtils';

interface JobCardProps {
  job: Job;
  onClick?: (uid: string) => void;
  compact?: boolean;
  showProgress?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onClick, 
  compact = false,
  showProgress = false 
}) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'created':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(job.uid);
    }
  };

  const cardClasses = compact 
    ? "bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
    : "cards-job-item rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer";

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${
          compact ? 'text-sm line-clamp-2' : 'text-lg'
        }`}>
          {job.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
          getStatusBadgeColor(job.status)
        }`}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>

      {/* Job Details */}
      <div className={`space-y-1 text-gray-600 dark:text-gray-400 ${
        compact ? 'text-xs' : 'text-sm'
      }`}>
        {job.model && (
          <div>Model: {typeof job.model === 'string' ? job.model : job.model.name}</div>
        )}
        {job.dataset && (
          <div>Dataset: {typeof job.dataset === 'string' ? job.dataset : job.dataset.name}</div>
        )}
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Created: {new Date(job.createdAt).toLocaleDateString()}
        </div>
        {job.priority && (
          <div className={`font-medium ${getPriorityColor(job.priority)}`}>
            Priority: {job.priority}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && job.progress !== undefined && job.progress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{job.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                job.status === 'running' ? 'bg-blue-500' : 
                job.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
              }`}
              style={{ width: `${job.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Description */}
      {!compact && job.description && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {job.description}
        </div>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          <Tag className="w-3 h-3 text-gray-400 mr-1 mt-0.5" />
          {job.tags.slice(0, compact ? 2 : 4).map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full ${
                compact ? 'text-xs' : 'text-xs'
              }`}
            >
              {tag}
            </span>
          ))}
          {job.tags.length > (compact ? 2 : 4) && (
            <span className={`px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full ${
              compact ? 'text-xs' : 'text-xs'
            }`}>
              +{job.tags.length - (compact ? 2 : 4)}
            </span>
          )}
        </div>
      )}

      {/* View Button */}
      {compact && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick(job.uid);
            }}
            className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Details
          </button>
        </div>
      )}
    </div>
  );
};
