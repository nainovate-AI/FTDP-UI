import React from 'react';
import { WelcomePanel, StatsGrid } from '../components/CommonComponents';
import { JobsTable } from '../components/JobComponents';
import { mockJobs, mockStats } from '../types';

/**
 * Layout 2: Sidebar Layout
 * 
 * Description:
 * Navigation-focused layout with a persistent sidebar for navigation and tools.
 * Main content area optimized for data display and interaction.
 * 
 * Wireframe:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Top Navigation Bar                       │
 * ├─────────┬───────────────────────────────────────────────────┤
 * │         │                Welcome Panel                     │
 * │ Side    │                (Hero Section)                    │
 * │ bar     ├───────────────────────────────────────────────────┤
 * │         │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
 * │ - Jobs  │ │ Stat 1  │ │ Stat 2  │ │ Stat 3  │ │ Stat 4  │ │
 * │ - Models│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
 * │ - Data  ├───────────────────────────────────────────────────┤
 * │ - API   │                                                 │
 * │         │           Recent Finetuning Jobs Table         │
 * │         │                                                 │
 * └─────────┴───────────────────────────────────────────────────┘
 * 
 * Rationale:
 * - Efficient use of horizontal space
 * - Quick navigation between different sections
 * - Familiar pattern from many enterprise applications
 * - Sidebar can contain contextual actions and filters
 * - Good for power users who need quick access to different areas
 */

const SidebarLayout: React.FC = () => {
  const sidebarItems = [
    { name: 'Dashboard', active: true },
    { name: 'Finetuning Jobs', active: false },
    { name: 'Models', active: false },
    { name: 'Datasets', active: false },
    { name: 'API Keys', active: false },
    { name: 'Settings', active: false },
  ];

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            Navigation
          </h3>
          <ul className="sidebar-nav">
            {sidebarItems.map((item) => (
              <li key={item.name}>
                <a href="#" className={item.active ? 'active' : ''}>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            Quick Actions
          </h3>
          <button className="btn-primary" style={{ width: '100%', marginBottom: '0.5rem' }}>
            New Job
          </button>
          <button 
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              border: '1px solid #d1d5db', 
              background: 'white', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Upload Dataset
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <WelcomePanel />
        <StatsGrid stats={mockStats} />
        <JobsTable jobs={mockJobs} />
      </main>
    </div>
  );
};

export default SidebarLayout;
