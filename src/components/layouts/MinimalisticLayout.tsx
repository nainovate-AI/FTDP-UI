'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockStats } from '../../types';
import { SideAnimation } from '../common/SideAnimation';
import { Button } from '../ui';
import { Plus } from 'lucide-react';

interface MinimalisticLayoutProps {
  children?: React.ReactNode;
  onNavigate?: (pageId: string) => void;
}

/**
 * Get time-based greeting
 */
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) return 'SPECIAL_QUOTE'; // 12:00 AM - 4:59 AM
  if (hour >= 5 && hour < 12) return 'Good morning'; // 5:00 AM - 11:59 AM
  if (hour >= 12 && hour < 18) return 'Good afternoon'; // 12:00 PM - 5:59 PM
  return 'Good evening'; // 6:00 PM - 11:59 PM
};

/**
 * Layout: Minimalistic Dashboard
 * 
 * Description:
 * Clean, focused design with emphasis on whitespace and typography.
 * Shows essential information with option to view more detailed content.
 */
export const MinimalisticLayout: React.FC<MinimalisticLayoutProps> = ({ children, onNavigate }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setStatsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleViewMore = () => {
    if (onNavigate) {
      onNavigate('dashboard-detailed');
    } else {
      router.push('/finetuning/dashboard/detailed');
    }
  };

  const handleCreateJob = () => {
    if (onNavigate) {
      onNavigate('dataset-selection');
    } else {
      router.push('/finetuning/dataset-selection');
    }
  };

  if (children) {
    return (
      <div className="minimal-dashboard-container h-screen w-full overflow-hidden flex flex-col">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 py-1 flex-1 flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="minimal-dashboard-container h-screen w-full overflow-hidden flex flex-col relative">
      {/* Ambient side animations */}
      <SideAnimation />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex-1 flex flex-col justify-center relative z-10">
        {/* Simplified welcome section - Enhanced spacing */}
        <div className={`text-center mb-8 transition-all duration-700 ${
          mounted ? 'animate-fade-scale' : 'opacity-0'
        }`}>
          {getTimeBasedGreeting() === 'SPECIAL_QUOTE' ? (
            <>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-900 dark:text-gray-100 tracking-tight mb-3">
                Hello Alex
              </h1>
              <div>
                <blockquote className="text-sm sm:text-base lg:text-lg font-serif italic text-amber-700 dark:text-amber-300 relative inline-block">
                  <span className="text-lg sm:text-xl text-amber-600 dark:text-amber-400">&quot;</span>
                  <span className="relative z-10 px-1">The world sleeps. You create.</span>
                  <span className="text-lg sm:text-xl text-amber-600 dark:text-amber-400">&quot;</span>
                </blockquote>
              </div>
            </>
          ) : (
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-900 dark:text-gray-100 tracking-tight mb-3">
              {getTimeBasedGreeting()}, Alex
            </h1>
          )}
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-normal mt-3">
            You have 8 active jobs and 3 pending reviews
          </p>
        </div>

        {/* 2x2 stats grid - Enhanced spacing and size */}
        <div className={`grid grid-cols-2 gap-8 sm:gap-10 lg:gap-12 mb-10 max-w-4xl mx-auto transition-all duration-700 ${
          statsVisible ? 'animate-slide-up' : 'opacity-0 translate-y-8'
        }`}>
          {mockStats.slice(0, 4).map((stat, index) => (
            <div 
              key={index} 
              className={`text-center py-3 transition-all duration-700 ${
                statsVisible ? 'animate-stagger-up' : 'opacity-0 translate-y-8'
              }`}
              style={{
                animationDelay: statsVisible ? `${index * 150}ms` : '0ms'
              }}
            >
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">
                {stat.value}
              </div>
              <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400 uppercase tracking-wider leading-tight break-words mb-2">
                {stat.title}
              </div>
              {stat.change && (
                <div className={`text-sm font-medium leading-tight truncate ${
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

        {/* Action section - Enhanced spacing */}
        <div className={`text-center transition-all duration-700 ${
          statsVisible ? 'animate-fade-scale' : 'opacity-0'
        }`}
        style={{
          animationDelay: statsVisible ? '600ms' : '0ms'
        }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <Button 
              variant="primary"
              size="lg"
              icon={Plus}
              iconPosition="left"
              onClick={handleCreateJob}
              fullWidth={true}
              className="sm:w-auto whitespace-nowrap"
            >
              Create New Job
            </Button>
            
            <Button 
              variant="secondary"
              size="lg"
              onClick={handleViewMore}
              fullWidth={true}
              className="sm:w-auto whitespace-nowrap"
            >
              Detailed Dashboard
            </Button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
            See detailed view of jobs, datasets, and more
          </p>
        </div>
      </div>
    </div>
  );
};
