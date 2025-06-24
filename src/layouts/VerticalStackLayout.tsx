import React from 'react';
import { WelcomePanel, StatsGrid } from '../components/CommonComponents';
import { JobsTable } from '../components/JobComponents';
import { mockJobs, mockStats } from '../types';

/**
 * Layout 1: Vertical Stack Layout
 * 
 * Description:
 * Traditional top-down linear layout with full-width components stacked vertically.
 * Clean separation between sections with generous spacing.
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
 * │                                                             │
 * │              Recent Finetuning Jobs Table                  │
 * │                                                             │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Rationale:
 * - Familiar and intuitive for most users
 * - Excellent readability with clear visual hierarchy
 * - Works well on all screen sizes
 * - Perfect for content-heavy dashboards
 * - Easy to scan from top to bottom
 */

const VerticalStackLayout: React.FC = () => {
  return (
    <div className="main-content">
      <WelcomePanel />
      <StatsGrid stats={mockStats} />
      <JobsTable jobs={mockJobs} />
    </div>
  );
};

export default VerticalStackLayout;
