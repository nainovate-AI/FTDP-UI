import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { WelcomePanel, StatsGrid } from '../components/CommonComponents';
import { JobCard } from '../components/JobComponents';
import { mockJobs, mockStats } from '../types';

/**
 * Layout 3: Card-Centric Layout
 * 
 * Description:
 * Modern card-based layout with emphasis on visual separation and modularity.
 * Everything is contained in cards for consistent visual treatment.
 * 
 * Wireframe:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Top Navigation Bar                       │
 * ├─────────────────────────────────────────────────────────────┤
 * │                     Welcome Panel                           │
 * │                   (Hero Section)                            │
 * ├─────────────────────────────────────────────────────────────┤
 * │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
 * │  │ Stat 1  │  │ Stat 2  │  │ Stat 3  │  │ Stat 4  │       │
 * │  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
 * ├─────────────────────────────────────────────────────────────┤
 * │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
 * │ │    Job 1    │ │    Job 2    │ │    Job 3    │           │
 * │ │   Card      │ │   Card      │ │   Card      │           │
 * │ └─────────────┘ └─────────────┘ └─────────────┘           │
 * │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
 * │ │    Job 4    │ │    Job 5    │ │    Job 6    │           │
 * │ │   Card      │ │   Card      │ │   Card      │           │
 * │ └─────────────┘ └─────────────┘ └─────────────┘           │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Rationale:
 * - Modern, visually appealing design
 * - Easy to scan individual items
 * - Great for mobile and touch interfaces
 * - Cards can contain rich information and actions
 * - Flexible layout that adapts to content
 */

const CardCentricLayout: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleBackToDashboard = () => {
    navigate('/dashboard/minimal');
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '3rem 2rem',
      minHeight: 'calc(100vh - 64px)'
    }}>
      {/* Back Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={handleBackToDashboard}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text.secondary,
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.hover;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ← Back to Minimal View
        </button>
      </div>

      <WelcomePanel />
      <StatsGrid stats={mockStats} />
      
      {/* Jobs Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: theme.colors.text.primary,
            margin: 0,
            transition: 'color 0.3s ease'
          }}>
            Recent Finetuning Jobs
          </h2>
          <button style={{
            background: theme.colors.accent,
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            New Job
          </button>
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
      
      {/* Additional action cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{ 
          background: theme.colors.surface,
          textAlign: 'center', 
          padding: '2rem',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.sm,
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ 
            marginBottom: '1rem', 
            color: '#3b82f6',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            Quick Start
          </h3>
          <p style={{ 
            color: theme.colors.text.muted, 
            marginBottom: '1.5rem', 
            fontSize: '0.875rem',
            transition: 'color 0.3s ease'
          }}>
            Create your first finetuning job with our guided setup
          </p>
          <button style={{ 
            width: '100%',
            background: theme.colors.accent,
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            Get Started
          </button>
        </div>
        
        <div style={{ 
          background: theme.colors.surface,
          textAlign: 'center', 
          padding: '2rem',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.sm,
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ 
            marginBottom: '1rem', 
            color: '#10b981',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            Documentation
          </h3>
          <p style={{ 
            color: theme.colors.text.muted, 
            marginBottom: '1.5rem', 
            fontSize: '0.875rem',
            transition: 'color 0.3s ease'
          }}>
            Learn best practices for model finetuning
          </p>
          <button style={{ 
            width: '100%',
            padding: '0.5rem 1rem',
            border: `1px solid ${theme.colors.border}`,
            background: 'transparent',
            color: theme.colors.text.primary,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            Read Docs
          </button>
        </div>
        
        <div style={{ 
          background: theme.colors.surface,
          textAlign: 'center', 
          padding: '2rem',
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.sm,
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ 
            marginBottom: '1rem', 
            color: '#f59e0b',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            Support
          </h3>
          <p style={{ 
            color: theme.colors.text.muted, 
            marginBottom: '1.5rem', 
            fontSize: '0.875rem',
            transition: 'color 0.3s ease'
          }}>
            Get help from our expert team
          </p>
          <button style={{ 
            width: '100%',
            padding: '0.5rem 1rem',
            border: `1px solid ${theme.colors.border}`,
            background: 'transparent',
            color: theme.colors.text.primary,
            borderRadius: '0.375rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCentricLayout;
