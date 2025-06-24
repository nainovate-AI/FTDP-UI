import React from 'react';
import { WelcomePanel, StatsGrid } from '../components/CommonComponents';
import { JobCard } from '../components/JobComponents';
import { mockJobs, mockStats } from '../types';

/**
 * Card-Centric Variant 1: Classic Cards
 * 
 * Description:
 * Traditional card layout with standard job cards in a responsive grid.
 * Clean, balanced design with consistent spacing and visual hierarchy.
 * 
 * Features:
 * - Standard card sizes with equal heights
 * - Responsive grid (3-4 cards per row on desktop)
 * - Traditional welcome panel
 * - Stats cards in a clean row
 * - Job cards with progress bars and status badges
 */

const CardCentricVariant1: React.FC = () => {
  return (
    <div className="main-content">
      <WelcomePanel />
      <StatsGrid stats={mockStats} />
      
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title">Recent Finetuning Jobs</h2>
          <button className="btn-primary">New Job</button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
      
      {/* Quick action cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="stat-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ marginBottom: '1rem', color: '#3b82f6' }}>Quick Start Guide</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Learn how to create your first finetuning job in minutes
          </p>
          <button className="btn-primary" style={{ width: '100%' }}>
            Get Started
          </button>
        </div>
        
        <div className="stat-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>Analytics</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            View detailed performance metrics and training insights
          </p>
          <button 
            style={{ 
              width: '100%',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            View Analytics
          </button>
        </div>
        
        <div className="stat-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
          <h3 style={{ marginBottom: '1rem', color: '#f59e0b' }}>Community</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            Connect with other developers and share best practices
          </p>
          <button 
            style={{ 
              width: '100%',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Join Community
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCentricVariant1;
