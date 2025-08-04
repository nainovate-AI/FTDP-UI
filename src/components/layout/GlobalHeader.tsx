'use client'

import React from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

interface GlobalHeaderProps {
  title?: string;
  showLogo?: boolean;
  showBreadcrumbs?: boolean;
  showThemeToggle?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}

/**
 * GlobalHeader Component
 * 
 * Features:
 * - Responsive header with logo, title, and actions
 * - Integrated theme toggle (moved from individual pages)
 * - Breadcrumb navigation
 * - Back button functionality
 * - Configurable visibility based on pages.json
 */
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  showLogo = true,
  showBreadcrumbs = true,
  showThemeToggle = true,
  showBackButton = false,
  onBack,
  breadcrumbs = [],
  className = ''
}) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 
                       bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 
                       dark:supports-[backdrop-filter]:bg-gray-900/60 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section: Logo + Back Button + Title */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
                          transition-colors duration-200"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Logo */}
            {showLogo && (
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 
                               rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="hidden sm:block font-semibold text-gray-900 dark:text-white">
                  Nainovate
                </span>
              </Link>
            )}

            {/* Title */}
            {title && (
              <div className="flex items-center">
                {showLogo && <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-4" />}
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>
              </div>
            )}
          </div>

          {/* Center Section: Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" 
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                            clipRule="evenodd" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <Link href={crumb.href} 
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 
                                   dark:hover:text-white transition-colors duration-200">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 dark:text-white font-medium">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Right Section: Actions + Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 
                          hover:bg-gray-200 dark:hover:bg-gray-700 
                          transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" 
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                          clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" 
                       fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            )}

            {/* Additional actions can be added here */}
            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600" />
            
            {/* User Avatar Placeholder */}
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" 
                   fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" 
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                      clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
