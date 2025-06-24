import React from 'react';
import { mockJobs, mockStats } from '../types';

/**
 * Card-Centric Variant 4: Dashboard Cards
 * 
 * Description:
 * Mixed content cards with various widgets and dashboard components.
 * Combines different types of information in a unified card system.
 * 
 * Features:
 * - Mixed content types (charts, lists, metrics)
 * - Widget-style cards with different purposes
 * - Interactive dashboard elements
 * - Rich data visualization placeholders
 * - Unified card design system
 */

const CardCentricVariant4: React.FC = () => {
  const recentActivity = [
    { type: 'success', message: 'Job "Customer Support Bot v2" completed successfully', time: '2 min ago' },
    { type: 'info', message: 'New dataset "conversation-logs.json" uploaded', time: '15 min ago' },
    { type: 'warning', message: 'Job "Document Summarizer" requires attention', time: '1 hour ago' },
    { type: 'info', message: 'Model "GPT-3.5-turbo" updated to latest version', time: '2 hours ago' },
  ];

  return (
    <div className="main-content">
      {/* Header card */}
      <div className="stat-card" style={{ 
        padding: '2rem', 
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                AI Training Dashboard
              </h1>
              <p style={{ fontSize: '1rem', opacity: 0.8 }}>
                Monitor, analyze, and optimize your machine learning workflows
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          zIndex: 1
        }} />
      </div>

      {/* Main dashboard grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Stats overview card */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Overview</h3>
            <button style={{
              background: 'none',
              border: '1px solid #d1d5db',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}>
              View All
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {mockStats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {stat.title}
                </div>
                {stat.change && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                    marginTop: '0.25rem'
                  }}>
                    {stat.change}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active jobs card */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Active Jobs</h3>
            <span style={{ 
              background: '#dbeafe', 
              color: '#1d4ed8', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '9999px', 
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {mockJobs.filter(job => job.status === 'running').length} Running
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mockJobs.slice(0, 3).map((job) => (
              <div key={job.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '0.375rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {job.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {job.model}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {job.progress}%
                  </div>
                  <span className={`status-badge status-${job.status}`} style={{ fontSize: '0.625rem' }}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            View All Jobs
          </button>
        </div>

        {/* Performance chart placeholder */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Training Performance
          </h3>
          <div style={{ 
            height: '120px', 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ textAlign: 'center', color: '#0369a1' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
              <div style={{ fontSize: '0.875rem' }}>Performance Chart</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Last 7 days</span>
            <span>+12% improvement</span>
          </div>
        </div>

        {/* Recent activity */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity.map((activity, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  marginTop: '0.5rem',
                  background: activity.type === 'success' ? '#10b981' : 
                             activity.type === 'warning' ? '#f59e0b' : '#3b82f6'
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>
                    {activity.message}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚀</span> Start New Job
            </button>
            <button style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>📊</span> View Analytics
            </button>
            <button style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚙️</span> Settings
            </button>
          </div>
        </div>

        {/* Resource usage */}
        <div className="stat-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Resource Usage
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'GPU Usage', value: 78, color: '#3b82f6' },
              { label: 'Memory', value: 62, color: '#10b981' },
              { label: 'Storage', value: 45, color: '#f59e0b' }
            ].map((resource, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{resource.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{resource.value}%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  backgroundColor: '#e2e8f0', 
                  borderRadius: '3px'
                }}>
                  <div style={{ 
                    width: `${resource.value}%`, 
                    height: '100%', 
                    backgroundColor: resource.color,
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCentricVariant4;
