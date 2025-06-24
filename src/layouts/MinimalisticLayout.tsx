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
    <div className="max-w-6xl mx-auto px-8 py-12 min-h-screen">
      {/* Simplified welcome section */}
      <div className="text-center mb-16 py-8">
        <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-4 tracking-tight transition-colors duration-300">
          Good morning, Alex
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-normal transition-colors duration-300">
          You have 8 active jobs and 3 pending reviews
        </p>
      </div>

      {/* Minimalist stats */}
      <div className="grid grid-cols-2 grid-rows-2 gap-12 mb-16 py-8">
        {mockStats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">
              {stat.title}
            </div>
            {stat.change && (
              <div className={`text-sm mt-1 font-medium ${
                stat.trend === 'up' 
                  ? 'text-green-500' 
                  : stat.trend === 'down' 
                  ? 'text-red-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View More Section */}
      <div className="text-center mt-16 py-12">
        <button 
          onClick={handleViewMore}
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-4 
                     border-0 rounded-xl text-base font-medium cursor-pointer transition-all duration-200 
                     shadow-md hover:bg-gray-700 dark:hover:bg-gray-300 hover:-translate-y-0.5"
        >
          View More Details
        </button>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 italic transition-colors duration-300">
          See detailed view of jobs, datasets, and more
        </p>
      </div>
    </div>
  );
};

export default MinimalisticLayout;
