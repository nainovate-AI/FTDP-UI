'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockStats } from '../../types';
import { JobCard } from '../common/JobCard';
import { loadCurrentJobs, loadPastJobs, Job } from '../../utils/jobUtils';
import { LoadingSkeleton, SkeletonCard, Button } from '../ui';
import { Plus } from 'lucide-react';
import { useFinetuningStore } from '../../store/finetuningStore';

interface CardCentricLayoutProps {
  children?: React.ReactNode;
  onNavigate?: (pageId: string) => void;
}

/**
 * Layout: Detailed Dashboard Layout
 * 
 * Description:
 * Modern card-based layout with emphasis on visual separation and modularity.
 * Everything is contained in cards for consistent visual treatment.
 */
export const CardCentricLayout: React.FC<CardCentricLayoutProps> = ({ children, onNavigate }) => {
  const router = useRouter();
  const reset = useFinetuningStore((state) => state.reset);
  const currentJobsScrollRef = useRef<HTMLDivElement>(null);
  const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
  const [pastJobs, setPastJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const [current, past] = await Promise.all([
          loadCurrentJobs(),
          loadPastJobs()
        ]);
        setCurrentJobs(current);
        setPastJobs(past);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleBackToDashboard = () => {
    if (onNavigate) {
      onNavigate('dashboard-minimal');
    } else {
      router.push('/finetuning/dashboard/minimal');
    }
  };

  const handleCreateJob = () => {
    // Reset the finetuning store to start fresh
    reset();
    
    if (onNavigate) {
      onNavigate('dataset-selection');
    } else {
      router.push('/finetuning/dataset-selection');
    }
  };

  const handleJobClick = (uid: string) => {
    if (onNavigate) {
      onNavigate(`job?uid=${uid}`);
    } else {
      router.push(`/job/${uid}`);
    }
  };

  const handleViewAllJobs = () => {
    if (onNavigate) {
      onNavigate('all-jobs');
    } else {
      router.push('/finetuning/dashboard/all-jobs');
    }
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

  // Preloading Screen Component
  const PreloadingScreen = () => (
    <div className="cards-dashboard-container min-h-screen w-screen m-0 p-0">
      <div className="max-w-7xl mx-auto p-6 bg-inherit">
        {/* Animated Welcome Panel Skeleton */}
        <div className="cards-welcome-panel rounded-xl p-8 mb-8 text-center animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto mb-6"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-56 mx-auto"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="cards-stat-item rounded-xl p-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Current Jobs Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse"></div>
          </div>
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-12">
            {[...Array(3)].map((_, index) => (
              <SkeletonCard key={index} className="flex-shrink-0 w-80 md:w-96" />
            ))}
          </div>
        </div>

        {/* Past Jobs Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>

        {/* Back Button Skeleton */}
        <div className="text-center">
          <LoadingSkeleton variant="button" size="lg" width="10rem" />
        </div>

        {/* Loading indicator */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading dashboard...</span>
        </div>
      </div>
    </div>
  );

  if (children) {
    return (
      <div className="cards-dashboard-container min-h-screen w-screen m-0 p-0">
        <div className="max-w-7xl mx-auto p-6 bg-inherit">
          {children}
        </div>
      </div>
    );
  }

  // Show preloading screen while loading
  if (loading) {
    return <PreloadingScreen />;
  }

  return (
    <div className="cards-dashboard-container min-h-screen w-screen m-0 p-0 opacity-0 animate-fade-in">
      <div className="max-w-7xl mx-auto p-6 bg-inherit">
        {/* Welcome Panel */}
        <div className="cards-welcome-panel rounded-xl p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome back, Alex
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Here&apos;s what&apos;s happening with your projects today
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
              <div 
                key={job.uid} 
                className="cards-job-item rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 flex-shrink-0 w-80 md:w-96 cursor-pointer"
                onClick={() => handleJobClick(job.uid)}
              >
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
                  <div>Model: {typeof job.model === 'object' ? job.model?.name : job.model}</div>
                  <div>Dataset: {typeof job.dataset === 'object' ? job.dataset?.name : job.dataset}</div>
                  <div>Started: {new Date(job.createdAt).toLocaleDateString()}</div>
                  {job.metrics?.accuracy && <div>Accuracy: {job.metrics.accuracy}%</div>}
                </div>
                
                {job.progress && job.progress > 0 && (
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
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewAllJobs}
            >
              View All Jobs
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastJobs.map((job) => (
              <div 
                key={job.uid} 
                className="cards-job-item rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                onClick={() => handleJobClick(job.uid)}
              >
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
                  <div>Model: {typeof job.model === 'object' ? job.model?.name : job.model}</div>
                  <div>Dataset: {typeof job.dataset === 'object' ? job.dataset?.name : job.dataset}</div>
                  <div>Started: {new Date(job.createdAt).toLocaleDateString()}</div>
                  {job.metrics?.accuracy && <div>Accuracy: {job.metrics.accuracy}%</div>}
                </div>
                
                {job.progress && job.progress > 0 && (
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
          <Button
            variant="secondary"
            onClick={handleBackToDashboard}
          >
            Back to Minimal View
          </Button>
        </div>

        {/* Floating Action Button */}
        <Button
          variant="primary"
          size="lg"
          icon={Plus}
          onClick={handleCreateJob}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl z-40 !p-0"
          aria-label="Create new fine-tuning job"
        />
      </div>
    </div>
  );
};
