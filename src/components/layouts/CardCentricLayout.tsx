'use client'

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mockStats, mockJobs } from '../../types';
import { ThemeToggle } from '../ThemeToggle';

interface CardCentricLayoutProps {
  children?: React.ReactNode;
}

/**
 * Layout: Detailed Dashboard Layout
 * 
 * Description:
 * Modern card-based layout with emphasis on visual separation and modularity.
 * Everything is contained in cards for consistent visual treatment.
 */
export const CardCentricLayout: React.FC<CardCentricLayoutProps> = ({ children }) => {
  const router = useRouter();
  const currentJobsScrollRef = useRef<HTMLDivElement>(null);

  const handleBackToDashboard = () => {
    router.push('/finetuning/dashboard/minimal');
  };

  const handleCreateJob = () => {
    router.push('/finetuning/dataset-selection');
  };

  const handleViewAllJobs = () => {
    // TODO: Navigate to all jobs page or expand view
    console.log('View all jobs');
  };

  const scrollCurrentJobs = (direction: 'left' | 'right') => {
    if (currentJobsScrollRef.current) {
      const scrollAmount = 408; // Width of one card (384px) + gap (24px) = 408px
      const currentScroll = currentJobsScrollRef.current.scrollLeft;
      const newScrollPosition = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      currentJobsScrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const currentJobs = mockJobs.filter(job => job.status === 'running' || job.status === 'pending');

  if (children) {
    return (
      <div className="cards-dashboard-container min-h-screen w-screen m-0 p-0">
        <div className="max-w-7xl mx-auto p-6 bg-inherit">
          <ThemeToggle />
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="cards-dashboard-container min-h-screen w-screen m-0 p-0">
      <div className="max-w-7xl mx-auto p-6 bg-inherit">
        <ThemeToggle />
        {/* Welcome Panel */}
        <div className="cards-welcome-panel rounded-xl p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, Alex
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Here's what's happening with your projects today
          </p>
          <button 
            onClick={handleCreateJob}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg 
                     font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
            + Create New Fine-tuning Job
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockStats.map((stat, index) => (
            <div key={index} className="cards-stat-item rounded-xl p-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {stat.title}
              </div>
              {stat.change && (
                <div className={`text-sm font-medium ${
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

        {/* Current Jobs Grid */}
        <div className="mb-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Current Jobs</h2>
          </div>
          
          {/* Floating Arrow Buttons */}
          {currentJobs.length > 3 && (
            <>
              <button 
                onClick={() => scrollCurrentJobs('left')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full 
                         bg-transparent hover:bg-blue-500 border-0 hover:border hover:border-blue-500 
                         text-gray-400 hover:text-white transition-all duration-300 
                         hover:shadow-lg opacity-50 hover:opacity-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => scrollCurrentJobs('right')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full 
                         bg-transparent hover:bg-blue-500 border-0 hover:border hover:border-blue-500 
                         text-gray-400 hover:text-white transition-all duration-300 
                         hover:shadow-lg opacity-50 hover:opacity-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          <div 
            ref={currentJobsScrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12"
          >
            {currentJobs.map((job) => (
              <div key={job.id} className="cards-job-item rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0 w-80 md:w-96">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {job.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'running'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>Model: {job.model}</div>
                  <div>Dataset: {job.dataset}</div>
                  <div>Started: {new Date(job.startTime).toLocaleDateString()}</div>
                  {job.accuracy && <div>Accuracy: {job.accuracy}%</div>}
                </div>
                
                {job.progress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          job.status === 'running' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Past Jobs Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Past Jobs</h2>
            <button 
              onClick={handleViewAllJobs}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                       text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium 
                       transition-colors duration-200">
              View All Jobs
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockJobs.filter(job => job.status === 'completed' || job.status === 'failed').map((job) => (
              <div key={job.id} className="cards-job-item rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {job.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    job.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>Model: {job.model}</div>
                  <div>Dataset: {job.dataset}</div>
                  <div>Started: {new Date(job.startTime).toLocaleDateString()}</div>
                  {job.accuracy && <div>Accuracy: {job.accuracy}%</div>}
                </div>
                
                {job.progress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          job.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Back to Minimal View Button */}
        <div className="text-center">
          <button
            onClick={handleBackToDashboard}
            className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 
                       rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 
                       transition-colors duration-200"
          >
            Back to Minimal View
          </button>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={handleCreateJob}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white 
                     w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 
                     flex items-center justify-center z-40"
          aria-label="Create new fine-tuning job"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
