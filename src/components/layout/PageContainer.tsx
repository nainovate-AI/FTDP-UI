'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePageConfig } from '@/hooks/usePageConfig';
import { GlobalHeader } from './GlobalHeader';

// Import page components
import { LandingPage } from '../pages/LandingPage';
import {
  DatasetSelectionPage,
  ModelSelectionPage,
  HyperparametersPage,
  JobReviewPage,
  SuccessPage
} from '../pages';

interface PageContainerProps {
  initialPage?: string;
  children?: React.ReactNode;
}

/**
 * PageContainer Component
 * 
 * Features:
 * - Single URL navigation with query parameters
 * - Dynamic component loading based on pages.json configuration
 * - URL state management with browser history
 * - Page validation and fallback handling
 * - Preserves all backend API links
 */
export const PageContainer: React.FC<PageContainerProps> = ({ 
  initialPage = 'landing',
  children 
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    config, 
    currentPageId, 
    setCurrentPageId, 
    currentPage,
    getNextEnabledPage,
    getPreviousEnabledPage,
    goToPage,
    canNavigateNext,
    canNavigatePrevious
  } = usePageConfig();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get page from URL parameters (now using step parameter for flow)
  const stepParam = searchParams?.get('step');
  
  useEffect(() => {
    setMounted(true);
    setLoading(false);
  }, []);

  // Update current page when URL changes
  useEffect(() => {
    if (mounted && config) {
      let targetPage = initialPage;
      
      // Map step parameter to page ID for finetuning flow
      if (stepParam) {
        switch (stepParam) {
          case 'dataset':
          case 'data':
            targetPage = 'dataset-selection';
            break;
          case 'model':
            targetPage = 'model-selection';
            break;
          case 'hyperparameters':
          case 'params':
            targetPage = 'hyperparameters';
            break;
          case 'review':
            targetPage = 'job-review';
            break;
          case 'success':
            targetPage = 'success';
            break;
          default:
            targetPage = 'dataset-selection'; // Default to start of flow
        }
      }
      
      // Check if page exists and is enabled
      if (config.pages[targetPage] && config.pages[targetPage].enabled) {
        setCurrentPageId(targetPage);
      } else {
        // Fallback to landing page if invalid or disabled page
        setCurrentPageId('landing');
        if (targetPage !== 'landing') {
          // Update URL to reflect the fallback
          router.replace('/', { scroll: false });
        }
      }
    }
  }, [mounted, config, stepParam, initialPage, setCurrentPageId, router]);

  // Navigate to a specific page
  const navigateToPage = (pageId: string) => {
    if (config?.pages[pageId] && config.pages[pageId].enabled) {
      const pageConfig = config.pages[pageId];
      
      // Map page ID to step parameter for cleaner URLs
      let stepParam = '';
      switch (pageId) {
        case 'dataset-selection':
          stepParam = 'dataset';
          break;
        case 'model-selection':
          stepParam = 'model';
          break;
        case 'hyperparameters':
          stepParam = 'hyperparameters';
          break;
        case 'job-review':
          stepParam = 'review';
          break;
        case 'success':
          stepParam = 'success';
          break;
        case 'landing':
          // For landing page, use root path
          router.push('/', { scroll: false });
          setCurrentPageId(pageId);
          return;
        default:
          stepParam = pageId;
      }
      
      // Update URL with step parameter
      router.push(`/?step=${stepParam}`, { scroll: false });
      setCurrentPageId(pageId);
      
      // Update document title
      if (pageConfig.header?.title) {
        document.title = `${pageConfig.header.title} - Nainovate AI`;
      }
    }
  };

  // Navigation handlers for page components
  const handleNext = () => {
    const nextPageId = getNextEnabledPage(currentPageId);
    if (nextPageId) {
      navigateToPage(nextPageId);
    }
  };

  const handlePrevious = () => {
    const previousPageId = getPreviousEnabledPage(currentPageId);
    if (previousPageId) {
      navigateToPage(previousPageId);
    }
  };

  const handleNavigateToPage = (pageId: string) => {
    navigateToPage(pageId);
  };

  // Render the current page component
  const renderCurrentPage = () => {
    if (!mounted || loading || !config) {
      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    const pageConfig = config.pages[currentPageId];
    
    if (!pageConfig || !pageConfig.enabled) {
      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The requested page is not available or has been disabled.
            </p>
            <button
              onClick={() => navigateToPage('landing')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    // Common props for all page components
    const pageProps = {
      onNavigate: handleNavigateToPage,
      onNext: handleNext,
      onPrevious: handlePrevious,
      canGoNext: canNavigateNext,
      canGoPrevious: canNavigatePrevious,
      pageConfig,
      config
    };

    // Render the appropriate page component
    switch (currentPageId) {
      case 'landing':
        return <LandingPage {...pageProps} />;
      
      case 'dataset-selection':
        return <DatasetSelectionPage {...pageProps} />;
      case 'model-selection':
        return <ModelSelectionPage {...pageProps} />;
      case 'hyperparameters':
        return <HyperparametersPage {...pageProps} />;
      case 'job-review':
        return <JobReviewPage {...pageProps} />;
      case 'success':
        return <SuccessPage {...pageProps} searchParams={searchParams} />;
      
      // TODO: Add dashboard and other page components
      // case 'dashboard-minimal':
      // case 'dashboard-detailed':
      //   return <DashboardPage {...pageProps} mode={pageConfig.dashboardMode} />;
      
      default:
        return (
          <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Component Not Implemented
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The {pageConfig.name} page component is being converted to the new system.
              </p>
              <button
                onClick={() => navigateToPage('landing')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        );
    }
  };

  // If children are provided, render them (for backward compatibility)
  if (children) {
    return (
      <div className="page-container">
        {children}
      </div>
    );
  }

  return (
    <div className="page-container">
      {renderCurrentPage()}
    </div>
  );
};

export default PageContainer;
