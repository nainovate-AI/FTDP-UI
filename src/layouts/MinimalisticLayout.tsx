import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { mockStats } from '../types';

/**
 * Layout: Minimalistic Dashboard
 * 
 * Description:
 * Clean, focused design with emphasis on whitespace and typography.
 * Shows essential information with option to view more detailed content.
 * 
 * Wireframe:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                                                             │
 * │                    Welcome Message                          │
 * │                                                             │
 * ├─────────────────────────────────────────────────────────────┤
 * │                                                             │
 * │    Stat 1      Stat 2      Stat 3      Stat 4             │
 * │                                                             │
 * ├─────────────────────────────────────────────────────────────┤
 * │                                                             │
 * │                   [View More Button]                       │
 * │                                                             │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Rationale:
 * - Reduces cognitive load and distractions
 * - Emphasizes content over chrome
 * - Modern, elegant aesthetic
 * - Great for focused work sessions
 * - Quick access to detailed view when needed
 */

const MinimalisticLayout: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleViewMore = () => {
    navigate('/dashboard/cards');
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '3rem 2rem',
      minHeight: 'calc(100vh - 64px)'
    }}>
      {/* Simplified welcome section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '4rem',
        padding: '2rem 0'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '300', 
          color: theme.colors.text.primary,
          marginBottom: '1rem',
          letterSpacing: '-0.025em',
          transition: 'color 0.3s ease'
        }}>
          Good morning, Alex
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: theme.colors.text.muted,
          fontWeight: '400',
          transition: 'color 0.3s ease'
        }}>
          You have 8 active jobs and 3 pending reviews
        </p>
      </div>

      {/* Minimalist stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '3rem',
        marginBottom: '4rem',
        padding: '2rem 0'
      }}>
        {mockStats.map((stat, index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: theme.colors.text.primary,
              marginBottom: '0.5rem',
              transition: 'color 0.3s ease'
            }}>
              {stat.value}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: theme.colors.text.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'color 0.3s ease'
            }}>
              {stat.title}
            </div>
            {stat.change && (
              <div style={{ 
                fontSize: '0.875rem', 
                color: stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : theme.colors.text.muted,
                marginTop: '0.25rem',
                fontWeight: '500'
              }}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View More Section */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '4rem',
        padding: '3rem 0'
      }}>
        <button 
          onClick={handleViewMore}
          style={{
            background: theme.colors.text.primary,
            color: theme.colors.background,
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: theme.shadows.md
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.text.secondary;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = theme.colors.text.primary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          View More Details
        </button>
        <p style={{ 
          color: theme.colors.text.muted, 
          fontSize: '0.875rem', 
          marginTop: '1rem',
          fontStyle: 'italic',
          transition: 'color 0.3s ease'
        }}>
          See detailed view of jobs, datasets, and more
        </p>
      </div>
    </div>
  );
};

export default MinimalisticLayout;
