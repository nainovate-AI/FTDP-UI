import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return theme.colors.text.muted;
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
    <div style={{
      background: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: theme.shadows.sm,
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: theme.colors.text.primary,
            margin: '0 0 0.5rem 0',
            transition: 'color 0.3s ease'
          }}>
            {job.name}
          </h3>
          <p style={{
            fontSize: '0.875rem',
            color: theme.colors.text.muted,
            margin: 0,
            transition: 'color 0.3s ease'
          }}>
            {job.model}
          </p>
        </div>
        <span style={{
          background: getStatusColor(job.status),
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          fontSize: '0.75rem',
          fontWeight: '500',
          textTransform: 'uppercase'
        }}>
          {getStatusText(job.status)}
        </span>
      </div>

      {/* Progress */}
      {job.status === 'running' && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: theme.colors.text.secondary,
              transition: 'color 0.3s ease'
            }}>
              Progress
            </span>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: theme.colors.text.primary,
              transition: 'color 0.3s ease'
            }}>
              {job.progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: theme.colors.border,
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${job.progress}%`,
              height: '100%',
              background: '#3b82f6',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Accuracy for completed jobs */}
      {job.status === 'completed' && job.accuracy && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            fontSize: '0.875rem',
            color: theme.colors.text.secondary,
            marginRight: '0.5rem',
            transition: 'color 0.3s ease'
          }}>
            Accuracy:
          </span>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#10b981'
          }}>
            {job.accuracy}%
          </span>
        </div>
      )}

      {/* Dataset */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{
          fontSize: '0.875rem',
          color: theme.colors.text.secondary,
          marginRight: '0.5rem',
          transition: 'color 0.3s ease'
        }}>
          Dataset:
        </span>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: theme.colors.text.primary,
          transition: 'color 0.3s ease'
        }}>
          {job.dataset}
        </span>
      </div>

      {/* Description */}
      {job.description && (
        <p style={{
          fontSize: '0.875rem',
          color: theme.colors.text.muted,
          margin: '0 0 1rem 0',
          lineHeight: '1.4',
          transition: 'color 0.3s ease'
        }}>
          {job.description}
        </p>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        borderTop: `1px solid ${theme.colors.border}`
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: theme.colors.text.muted,
          transition: 'color 0.3s ease'
        }}>
          Started {new Date(job.startTime).toLocaleDateString()}
        </span>
        {job.estimatedCompletion && job.status === 'running' && (
          <span style={{
            fontSize: '0.75rem',
            color: theme.colors.text.muted,
            transition: 'color 0.3s ease'
          }}>
            ETA {new Date(job.estimatedCompletion).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};
