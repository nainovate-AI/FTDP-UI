import React from 'react';
import { WelcomePanel } from '../components/CommonComponents';
import { mockJobs, mockStats } from '../types';

/**
 * Card-Centric Variant 3: Masonry Style
 * 
 * Description:
 * Pinterest-style masonry layout with variable height cards.
 * Dynamic content adaptation with flowing, organic layout.
 * 
 * Features:
 * - Variable height cards based on content
 * - Masonry/Pinterest-style layout
 * - Rich content cards with different types
 * - Visual emphasis on important information
 * - Organic, flowing design
 */

const CardCentricVariant3: React.FC = () => {
  // Enhanced job data with additional content for masonry effect
  const enhancedJobs = mockJobs.map((job, index) => ({
    ...job,
    description: [
      "Fine-tuning GPT model for customer support automation with advanced context understanding.",
      "Optimizing CodeLlama for enhanced code review and suggestion capabilities.",
      "Training document summarization model with focus on technical documentation.",
      "Developing multilingual translation model for real-time communication."
    ][index] || "AI model training for specialized use case.",
    tags: [
      ['Customer Support', 'NLP', 'Automation'],
      ['Code Review', 'Programming', 'AI Assistant'],
      ['Summarization', 'Documents', 'Text Processing'],
      ['Translation', 'Multilingual', 'Communication']
    ][index] || ['AI', 'Machine Learning'],
    metrics: [
      { label: 'Accuracy', value: '94.2%' },
      { label: 'Training Loss', value: '0.23' },
      { label: 'Validation Score', value: '89.1%' },
      { label: 'F1 Score', value: '0.91' }
    ][index] || { label: 'Score', value: 'N/A' }
  }));

  return (
    <div className="main-content">
      {/* Compact header */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '2rem',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0.75rem',
        color: 'white'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            AI Training Hub
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>
            Discover, monitor, and manage your machine learning experiments
          </p>
        </div>
        <button 
          className="btn-primary" 
          style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          New Experiment
        </button>
      </div>

      {/* Masonry layout */}
      <div style={{
        columns: 'auto',
        columnWidth: '320px',
        columnGap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Stats overview card */}
        <div className="stat-card" style={{ 
          padding: '1.5rem', 
          marginBottom: '1.5rem', 
          breakInside: 'avoid',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#0369a1' }}>
            📊 Quick Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {mockStats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {stat.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced job cards with variable heights */}
        {enhancedJobs.map((job, index) => (
          <div key={job.id} className="stat-card" style={{ 
            padding: '1.5rem', 
            marginBottom: '1.5rem', 
            breakInside: 'avoid'
          }}>
            {/* Header with status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, lineHeight: '1.3' }}>
                {job.name}
              </h3>
              <span className={`status-badge status-${job.status}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>

            {/* Description */}
            <p style={{ 
              color: '#64748b', 
              fontSize: '0.875rem', 
              lineHeight: '1.4',
              marginBottom: '1rem'
            }}>
              {job.description}
            </p>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {job.tags.map((tag, tagIndex) => (
                <span 
                  key={tagIndex}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Model info */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '0.75rem', 
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Model
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                {job.model}
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Training Progress</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{job.progress}%</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                backgroundColor: '#e2e8f0', 
                borderRadius: '3px'
              }}>
                <div style={{ 
                  width: `${job.progress}%`, 
                  height: '100%', 
                  background: job.status === 'completed' 
                    ? 'linear-gradient(90deg, #10b981, #059669)' 
                    : job.status === 'failed' 
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)' 
                    : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>

            {/* Metrics (show more details for some cards) */}
            {index % 2 === 0 && (
              <div style={{ 
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Key Metrics
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                  {job.metrics.label}: {job.metrics.value}
                </div>
              </div>
            )}

            {/* Footer */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9'
            }}>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
              <button style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
                View Details
              </button>
            </div>
          </div>
        ))}

        {/* Additional info cards */}
        <div className="stat-card" style={{ 
          padding: '1.5rem', 
          marginBottom: '1.5rem', 
          breakInside: 'avoid',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#92400e' }}>
            Pro Tip
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#a16207', margin: 0 }}>
            Use data augmentation to improve model performance with limited datasets.
          </p>
        </div>

        <div className="stat-card" style={{ 
          padding: '1.5rem', 
          marginBottom: '1.5rem', 
          breakInside: 'avoid',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#166534' }}>
            Success Rate
          </h3>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#15803d', marginBottom: '0.25rem' }}>
            94.2%
          </div>
          <p style={{ fontSize: '0.875rem', color: '#16a34a', margin: 0 }}>
            This month's training success rate
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardCentricVariant3;
