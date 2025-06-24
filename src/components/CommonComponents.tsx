import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Stat } from '../types';

// Welcome Panel Component
export const WelcomePanel: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      background: theme.colors.surface,
      padding: '3rem',
      borderRadius: '12px',
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.md,
      textAlign: 'center',
      marginBottom: '2rem',
      transition: 'all 0.3s ease'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: '1rem',
        transition: 'color 0.3s ease'
      }}>
        Welcome back, Alex
      </h1>
      <p style={{
        fontSize: '1.125rem',
        color: theme.colors.text.muted,
        transition: 'color 0.3s ease'
      }}>
        Manage your AI model finetuning jobs and monitor training progress
      </p>
    </div>
  );
};

// Stats Grid Component
interface StatsGridProps {
  stats: Stat[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {stats.map((stat, index) => (
        <div 
          key={index} 
          style={{
            background: theme.colors.surface,
            padding: '2rem',
            borderRadius: '12px',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.shadows.sm,
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          <h3 style={{
            fontSize: '0.875rem',
            color: theme.colors.text.muted,
            margin: '0 0 0.75rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'color 0.3s ease'
          }}>
            {stat.title}
          </h3>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginBottom: '0.5rem',
            transition: 'color 0.3s ease'
          }}>
            {stat.value}
          </div>
          {stat.change && (
            <div style={{ 
              fontSize: '0.875rem', 
              color: stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : theme.colors.text.muted,
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}>
              {stat.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
