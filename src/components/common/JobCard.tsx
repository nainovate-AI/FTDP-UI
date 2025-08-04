import React from 'react';
import { ExternalLink, Clock, Tag, Zap, Database, User, Calendar } from 'lucide-react';
import { Job } from '../../utils/jobUtils';
import { StatusBadge, ProgressBar, Button, type StatusBadgeVariant } from '../ui';

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
  const getStatusBadgeVariant = (status: string): StatusBadgeVariant => {
    switch (status) {
      case 'queued':
        return 'queued';
      case 'running':
        return 'running';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      case 'created':
        return 'created';
      default:
        return 'neutral';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(job.uid);
    }
  };

  const cardClasses = compact 
    ? "bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:border-gray-600 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
    : "bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer";

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 ${
          compact ? 'text-sm line-clamp-2' : 'text-lg'
        }`}>
          {job.name}
        </h3>
        <StatusBadge 
          variant={getStatusBadgeVariant(job.status)}
          size={compact ? 'sm' : 'md'}
          animate={job.status === 'running'}
        >
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </StatusBadge>
      </div>

      {/* Job Details */}
      <div className={`space-y-2 text-gray-600 dark:text-gray-400 ${
        compact ? 'text-xs' : 'text-sm'
      }`}>
        {job.model && (
          <div className="flex items-center">
            <Database className="w-3 h-3 mr-1.5 text-blue-500" />
            <span className="truncate">
              {typeof job.model === 'string' ? job.model : job.model.name}
            </span>
          </div>
        )}
        {job.dataset && (
          <div className="flex items-center">
            <Zap className="w-3 h-3 mr-1.5 text-green-500" />
            <span className="truncate">
              {typeof job.dataset === 'string' ? job.dataset : job.dataset.name}
            </span>
          </div>
        )}
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1.5 text-gray-400" />
          <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
        {job.owner && !compact && (
          <div className="flex items-center text-xs">
            <User className="w-3 h-3 mr-1.5 text-gray-400" />
            <span>{job.owner.email}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && job.progress !== undefined && job.progress > 0 && (
        <div className="mt-4">
          <ProgressBar
            value={job.progress || 0}
            variant={job.status === 'running' ? 'running' : job.status === 'completed' ? 'success' : 'default'}
            size="md"
            showLabel={true}
            showPercentage={true}
            label="Progress"
          />
          {job.status === 'running' && job.estimatedCompletion && (
            <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              <span>Est. completion: {new Date(job.estimatedCompletion).toLocaleTimeString()}</span>
            </div>
          )}
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
        <div className="mt-4 flex items-start space-x-2">
          <Tag className="w-3 h-3 text-gray-400 mt-1 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {job.tags.slice(0, compact ? 2 : 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full ${
                  compact ? 'text-xs' : 'text-xs'
                } font-medium`}
              >
                {tag}
              </span>
            ))}
            {job.tags.length > (compact ? 2 : 3) && (
              <span className={`px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full ${
                compact ? 'text-xs' : 'text-xs'
              } font-medium`}>
                +{job.tags.length - (compact ? 2 : 3)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          {job.status === 'completed' && job.completedAt && (
            <span>Completed {new Date(job.completedAt).toLocaleDateString()}</span>
          )}
          {job.status === 'failed' && job.failedAt && (
            <span>Failed {new Date(job.failedAt).toLocaleDateString()}</span>
          )}
          {job.status === 'queued' && job.queuePosition && (
            <span>Position #{job.queuePosition} in queue</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={ExternalLink}
          iconPosition="right"
          animate={false}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick(job.uid);
          }}
          className="text-xs"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};
