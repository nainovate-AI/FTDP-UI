import React from 'react';
import { WelcomePanel } from '../components/CommonComponents';
import { mockJobs, mockStats } from '../types';

/**
 * Card-Centric Variant 2: Compact Grid
 * 
 * Description:
 * Dense card grid with smaller, more compact cards to fit more information.
 * Optimized for users who want to see more data at once.
 * 
 * Features:
 * - Smaller card sizes (4-5 cards per row on desktop)
 * - Compact stats integrated into header
 * - Condensed job information
 * - More information density
 * - Efficient use of screen space
 */

const CardCentricVariant2: React.FC = () => {
  return (
    <div className="main-content">
      {/* Compact welcome with inline stats */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '2rem',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Welcome back, Alex
          </h1>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>
            Manage your AI model finetuning jobs and monitor training progress
          </p>
        </div>
        
        {/* Inline stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {mockStats.slice(0, 4).map((stat, index) => (
            <div key={index} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.375rem' }}>
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title">Recent Jobs</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            style={{ 
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Filter
          </button>
          <button className="btn-primary">New Job</button>
        </div>
      </div>
      
      {/* Compact job cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {mockJobs.map((job) => (
          <div key={job.id} className="stat-card" style={{ padding: '1rem' }}>
            {/* Compact header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0, lineHeight: '1.2' }}>
                {job.name}
              </h3>
              <span 
                className={`status-badge status-${job.status}`}
                style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem' }}
              >
                {job.status}
              </span>
            </div>
            
            {/* Model and progress */}
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              {job.model}
            </p>
            
            {/* Compact progress bar */}
            <div style={{ marginBottom: '0.5rem' }}>
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
                height: '3px', 
                backgroundColor: '#e2e8f0', 
                borderRadius: '1.5px'
              }}>
                <div style={{ 
                  width: `${job.progress}%`, 
                  height: '100%', 
                  backgroundColor: job.status === 'completed' ? '#10b981' : job.status === 'failed' ? '#ef4444' : '#3b82f6',
                  borderRadius: '1.5px'
                }} />
              </div>
            </div>
            
            {/* Created date */}
            <p style={{ color: '#64748b', fontSize: '0.625rem', margin: 0 }}>
              {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        
        {/* Add new job card */}
        <div 
          className="stat-card" 
          style={{ 
            padding: '1rem',
            border: '2px dashed #d1d5db',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            minHeight: '140px'
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#9ca3af' }}>+</div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Create New Job
          </p>
        </div>
      </div>
      
      {/* Quick stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem'
      }}>
        <div className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>24h</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg Training Time</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>99.2%</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Model Accuracy</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>15GB</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Data Processed</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>3</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Failed Jobs</div>
        </div>
      </div>
    </div>
  );
};

export default CardCentricVariant2;
