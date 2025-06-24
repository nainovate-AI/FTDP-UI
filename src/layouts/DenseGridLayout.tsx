import React from 'react';
import { WelcomePanel } from '../components/CommonComponents';
import { JobsTable } from '../components/JobComponents';
import { mockJobs, mockStats } from '../types';

/**
 * Layout 4: Dense Grid Layout
 * 
 * Description:
 * Information-dense layout utilizing a CSS Grid system for optimal space usage.
 * Multiple content areas arranged in a sophisticated grid pattern.
 * 
 * Wireframe:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Top Navigation Bar                       │
 * ├─────────────────────────────────────────────────────────────┤
 * │                     Welcome Panel                           │
 * ├─────────┬───────────┬───────────┬───────────┬───────────────┤
 * │ Stat 1  │  Stat 2   │  Stat 3   │  Stat 4   │   Quick       │
 * ├─────────┴───────────┴───────────┴───────────┤   Actions     │
 * │                                               │               │
 * │              Jobs Table                       │               │
 * │                                               ├───────────────┤
 * │                                               │   Recent      │
 * │                                               │   Activity    │
 * │                                               │               │
 * └───────────────────────────────────────────────┴───────────────┘
 * 
 * Rationale:
 * - Maximum information density
 * - Efficient use of screen real estate
 * - Great for power users and large screens
 * - Multiple data streams visible simultaneously
 * - Professional, dashboard-like appearance
 */

const DenseGridLayout: React.FC = () => {
  const recentActivity = [
    { action: 'Job "Customer Support Bot v2" started', time: '2 min ago' },
    { action: 'Model "GPT-3.5-turbo" updated', time: '15 min ago' },
    { action: 'Dataset "support-tickets.json" uploaded', time: '1 hour ago' },
    { action: 'Job "Code Review Assistant" completed', time: '2 hours ago' },
  ];

  return (
    <div className="main-content">
      <div className="full-width" style={{ marginBottom: '2rem' }}>
        <WelcomePanel />
      </div>
      
      <div className="grid-layout" style={{ 
        gridTemplateColumns: '1fr 1fr 1fr 1fr 300px',
        gridTemplateRows: 'auto auto',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Stats row */}
        {mockStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3 className="stat-title">{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
            {stat.change && (
              <div style={{ 
                fontSize: '0.875rem', 
                color: stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : '#64748b',
                marginTop: '0.5rem'
              }}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
        
        {/* Quick Actions sidebar */}
        <div className="stat-card" style={{ gridRow: '1 / 3' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn-primary" style={{ width: '100%' }}>
              New Job
            </button>
            <button style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              background: 'white', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>
              Upload Dataset
            </button>
            <button style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              background: 'white', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>
              View Models
            </button>
          </div>
          
          <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '2rem 0 1rem 0' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity.map((activity, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                background: '#f8fafc', 
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ color: '#374151', marginBottom: '0.25rem' }}>
                  {activity.action}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Jobs table spanning 4 columns */}
        <div style={{ gridColumn: '1 / 5' }}>
          <JobsTable jobs={mockJobs} />
        </div>
      </div>
    </div>
  );
};

export default DenseGridLayout;
