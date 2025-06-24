import React from 'react';
import { mockJobs, mockStats } from '../types';

/**
 * Card-Centric Variant 5: Kanban Style
 * 
 * Description:
 * Trello-inspired column layout for workflow management.
 * Jobs organized by status in vertical columns with drag-and-drop style.
 * 
 * Features:
 * - Column-based workflow organization
 * - Status-based job grouping
 * - Kanban board style layout
 * - Visual workflow management
 * - Progress tracking by stage
 */

const CardCentricVariant5: React.FC = () => {
  // Add some pending jobs for demo
  const allJobs = [
    ...mockJobs,
    {
      id: '5',
      name: 'Sentiment Analysis Model',
      model: 'RoBERTa-base',
      status: 'pending' as const,
      progress: 0,
      createdAt: '2024-01-16T08:00:00Z'
    },
    {
      id: '6',
      name: 'Image Classification',
      model: 'ResNet-50',
      status: 'pending' as const,
      progress: 0,
      createdAt: '2024-01-16T09:30:00Z'
    }
  ];

  const groupedJobs = {
    pending: allJobs.filter(job => job.status === 'pending'),
    running: allJobs.filter(job => job.status === 'running'),
    completed: allJobs.filter(job => job.status === 'completed'),
    failed: allJobs.filter(job => job.status === 'failed')
  };

  const columns = [
    {
      id: 'pending',
      title: 'Pending',
      color: '#64748b',
      bg: '#f8fafc',
      jobs: groupedJobs.pending
    },
    {
      id: 'running',
      title: 'In Progress',
      color: '#3b82f6',
      bg: '#f0f9ff',
      jobs: groupedJobs.running
    },
    {
      id: 'completed',
      title: 'Completed',
      color: '#10b981',
      bg: '#f0fdf4',
      jobs: groupedJobs.completed
    },
    {
      id: 'failed',
      title: 'Failed',
      color: '#ef4444',
      bg: '#fef2f2',
      jobs: groupedJobs.failed
    }
  ];

  return (
    <div className="main-content">
      {/* Header with stats */}
      <div className="stat-card" style={{ 
        padding: '2rem', 
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            ML Training Pipeline
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>
            Track your machine learning jobs through the complete training lifecycle
          </p>
        </div>
        
        {/* Inline stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          {mockStats.map((stat, index) => (
            <div key={index} style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                {stat.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {columns.map((column) => (
          <div key={column.id} style={{ minHeight: '500px' }}>
            {/* Column header */}
            <div style={{
              background: column.bg,
              border: `2px solid ${column.color}`,
              borderRadius: '0.75rem 0.75rem 0 0',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                margin: 0,
                color: column.color
              }}>
                {column.title}
              </h3>
              <span style={{
                background: column.color,
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {column.jobs.length}
              </span>
            </div>

            {/* Column content */}
            <div style={{
              background: 'white',
              border: `2px solid ${column.color}`,
              borderTop: 'none',
              borderRadius: '0 0 0.75rem 0.75rem',
              minHeight: '400px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {/* Job cards */}
              {column.jobs.map((job) => (
                <div key={job.id} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  {/* Job header */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <h4 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      margin: 0,
                      marginBottom: '0.25rem',
                      lineHeight: '1.3'
                    }}>
                      {job.name}
                    </h4>
                    <p style={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b', 
                      margin: 0 
                    }}>
                      {job.model}
                    </p>
                  </div>

                  {/* Progress (only for running jobs) */}
                  {job.status === 'running' && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.25rem'
                      }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Progress</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{job.progress}%</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '4px', 
                        backgroundColor: '#e2e8f0', 
                        borderRadius: '2px'
                      }}>
                        <div style={{ 
                          width: `${job.progress}%`, 
                          height: '100%', 
                          backgroundColor: '#3b82f6',
                          borderRadius: '2px'
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Job footer */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.625rem', color: '#64748b' }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: column.color
                    }} />
                  </div>
                </div>
              ))}

              {/* Add new job card */}
              {column.id === 'pending' && (
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'white',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#9ca3af' }}>+</div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Add New Job
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏱️</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>2.3h</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg Completion Time</div>
        </div>
        
        <div className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎯</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>94.2%</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Success Rate</div>
        </div>
        
        <div className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔄</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>12</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Jobs This Week</div>
        </div>
        
        <div className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💾</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>847GB</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Data Processed</div>
        </div>
      </div>
    </div>
  );
};

export default CardCentricVariant5;
