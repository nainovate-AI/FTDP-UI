import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { WelcomePanel, StatsGrid } from '../components/CommonComponents';
import { JobCard } from '../components/JobComponents';
import { mockJobs, mockStats } from '../types';

/**
 * Layout 3: Card-Centric Layout
 * 
 * Description:
 * Modern card-based layout with emphasis on visual separation and modularity.
 * Everything is contained in cards for consistent visual treatment.
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
 * │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
 * │ │    Job 1    │ │    Job 2    │ │    Job 3    │           │
 * │ │   Card      │ │   Card      │ │   Card      │           │
 * │ └─────────────┘ └─────────────┘ └─────────────┘           │
 * │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
 * │ │    Job 4    │ │    Job 5    │ │    Job 6    │           │
 * │ │   Card      │ │   Card      │ │   Card      │           │
 * │ └─────────────┘ └─────────────┘ └─────────────┘           │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * Rationale:
 * - Modern, visually appealing design
 * - Easy to scan individual items
 * - Great for mobile and touch interfaces
 * - Cards can contain rich information and actions
 * - Flexible layout that adapts to content
 */

const CardCentricLayout: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleBackToDashboard = () => {
    navigate('/dashboard/minimal');
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 min-h-screen">
      {/* Back Button */}
      <div className="mb-8">
        <button
          onClick={handleBackToDashboard}
          className="bg-transparent border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 
                     px-4 py-2 rounded-md text-sm cursor-pointer flex items-center gap-2 
                     transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          ← Back to Minimal View
        </button>
      </div>

      <WelcomePanel />
      <StatsGrid stats={mockStats} />
      
      {/* Jobs Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 m-0 transition-colors duration-300">
            Recent Finetuning Jobs
          </h2>
          <button className="bg-blue-600 text-white px-4 py-2 border-0 rounded-md text-sm font-medium 
                           cursor-pointer transition-all duration-200 hover:bg-blue-700">
            New Job
          </button>
        </div>
        
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
      
      {/* Additional action cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
        <div className="bg-white dark:bg-gray-800 text-center p-8 rounded-xl border border-gray-200 dark:border-gray-700 
                        shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="mb-4 text-blue-600 text-lg font-semibold">
            Quick Start
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm transition-colors duration-300">
            Create your first finetuning job with our guided setup
          </p>
          <button className="w-full bg-blue-600 text-white px-4 py-2 border-0 rounded-md text-sm font-medium 
                           cursor-pointer transition-all duration-200 hover:bg-blue-700">
            Get Started
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 text-center p-8 rounded-xl border border-gray-200 dark:border-gray-700 
                        shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="mb-4 text-green-600 text-lg font-semibold">
            Documentation
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm transition-colors duration-300">
            Learn best practices for model finetuning
          </p>
          <button className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-transparent 
                           text-gray-900 dark:text-gray-100 rounded-md cursor-pointer transition-all duration-200 
                           hover:bg-gray-50 dark:hover:bg-gray-700">
            Read Docs
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 text-center p-8 rounded-xl border border-gray-200 dark:border-gray-700 
                        shadow-sm transition-all duration-300 hover:shadow-md">
          <h3 className="mb-4 text-yellow-600 text-lg font-semibold">
            Support
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm transition-colors duration-300">
            Get help from our expert team
          </p>
          <button className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-transparent 
                           text-gray-900 dark:text-gray-100 rounded-md cursor-pointer transition-all duration-200 
                           hover:bg-gray-50 dark:hover:bg-gray-700">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardCentricLayout;
