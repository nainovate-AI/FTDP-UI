'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { mockStats } from '../../types';
import { ThemeToggle } from '../ThemeToggle';

interface MinimalisticLayoutProps {
  children?: React.ReactNode;
}

/**
 * Layout: Minimalistic Dashboard
 * 
 * Description:
 * Clean, focused design with emphasis on whitespace and typography.
 * Shows essential information with option to view more detailed content.
 */
export const MinimalisticLayout: React.FC<MinimalisticLayoutProps> = ({ children }) => {
  const router = useRouter();

  const handleViewMore = () => {
    router.push('/dashboard/cards');
  };

  const handleCreateJob = () => {
    // TODO: Navigate to job creation page or open modal
    console.log('Create new fine-tuning job');
  };

  if (children) {
    return (
      <div className="max-w-6xl mx-auto p-8 min-h-screen">
        <ThemeToggle />
        {children}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen">
      <ThemeToggle />
      {/* Simplified welcome section */}
      <div className="text-center mb-16 py-8">
        <h1 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
          Good morning, Alex
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-normal">
          You have 8 active jobs and 3 pending reviews
        </p>
        <div className="mt-8">
          <button 
            onClick={handleCreateJob}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg 
                     font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
            + Create New Fine-tuning Job
          </button>
        </div>
      </div>

      {/* Minimalist stats */}
      <div className="grid grid-cols-2 gap-12 mb-16 py-8">
        {mockStats.slice(0, 4).map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {stat.title}
            </div>
            {stat.change && (
              <div className={`text-sm mt-1 font-medium ${
                stat.trend === 'up' 
                  ? 'text-green-500' 
                  : stat.trend === 'down' 
                  ? 'text-red-500' 
                  : 'text-gray-500'
              }`}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View More Section */}
      <div className="text-center mt-16 py-12">
        <div className="space-x-4">
          <button 
            onClick={handleViewMore}
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-4 
                       rounded-xl text-base font-medium cursor-pointer transition-all duration-200 
                       shadow-md hover:bg-gray-700 dark:hover:bg-gray-300 hover:-translate-y-0.5"
          >
            View Detailed Dashboard
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 italic">
          See detailed view of jobs, datasets, and more
        </p>
      </div>
    </div>
  );
};
