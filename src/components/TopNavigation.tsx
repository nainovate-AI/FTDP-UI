import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const TopNavigation: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleProfileAction = (action: string) => {
    console.log(`Profile action: ${action}`);
    setIsProfileDropdownOpen(false);
  };

  return (
    <nav style={{
      background: theme.colors.surface,
      borderBottom: `1px solid ${theme.colors.border}`,
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: theme.shadows.sm,
      transition: 'all 0.3s ease'
    }}>
      {/* Left: Logo/Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '700'
        }}>
          AI
        </div>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: theme.colors.text.primary,
          margin: 0,
          transition: 'color 0.3s ease'
        }}>
          Finetuning Platform
        </h1>
      </div>

      {/* Right: Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            width: '40px',
            height: '40px',
            color: theme.colors.text.primary
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = theme.colors.hover;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            // Sun icon for light mode
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={toggleProfileDropdown}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme.colors.hover;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              AK
            </div>
            
            {/* User Name */}
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: theme.colors.text.primary,
              transition: 'color 0.3s ease'
            }}>
              Alex Kim
            </span>

            {/* Dropdown Arrow */}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{
                transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            >
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '8px',
              boxShadow: theme.shadows.md,
              minWidth: '200px',
              zIndex: 200,
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              {/* User Info */}
              <div style={{
                padding: '1rem',
                borderBottom: `1px solid ${theme.colors.border}`
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: '0.25rem',
                  transition: 'color 0.3s ease'
                }}>
                  Alex Kim
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: theme.colors.text.muted,
                  transition: 'color 0.3s ease'
                }}>
                  alex.kim@company.com
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '0.5rem' }}>
                {[
                  { label: 'Profile Settings', icon: '👤' },
                  { label: 'Billing', icon: '💳' },
                  { label: 'API Keys', icon: '🔑' },
                  { label: 'Documentation', icon: '📚' },
                  { label: 'Support', icon: '❓' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleProfileAction(item.label)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                
                {/* Separator */}
                <div style={{
                  height: '1px',
                  background: '#f1f5f9',
                  margin: '0.5rem 0'
                }} />

                {/* Sign Out */}
                <button
                  onClick={() => handleProfileAction('Sign Out')}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '0.75rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#dc2626',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>🚪</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
