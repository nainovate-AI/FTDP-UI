'use client'

import { useState, useEffect, useCallback } from 'react';
import pagesConfig from '@/config/pages.json';

export interface PageConfig {
  id: string;
  name: string;
  component: string;
  enabled: boolean;
  showInNavigation?: boolean;
  showInStepper?: boolean;
  stepOrder?: number;
  route: string;
  nextPage?: string;
  previousPage?: string;
  fallbackNext?: string;
  requiresAuth?: boolean;
  dashboardMode?: string;
  header: {
    title: string;
    showBackButton: boolean;
    showBreadcrumbs: boolean;
  };
}

export interface HeaderConfig {
  enabled: boolean;
  showLogo: boolean;
  showBreadcrumbs: boolean;
  showThemeToggle: boolean;
  title: string;
}

export interface PagesConfig {
  header: HeaderConfig;
  pages: Record<string, PageConfig>;
}

/**
 * Hook for managing page configuration and navigation
 * 
 * Features:
 * - Dynamic page configuration from pages.json
 * - Navigation with skip logic for disabled pages
 * - Stepper generation for workflow pages
 * - Header configuration management
 */
export const usePageConfig = () => {
  const [config, setConfig] = useState<PagesConfig>(pagesConfig as PagesConfig);
  const [currentPageId, setCurrentPageId] = useState<string>('landing');

  // Get all enabled pages
  const getEnabledPages = useCallback((): PageConfig[] => {
    return Object.values(config.pages).filter(page => page.enabled);
  }, [config.pages]);

  // Get pages that should show in stepper
  const getStepperPages = useCallback((): PageConfig[] => {
    return Object.values(config.pages)
      .filter(page => page.enabled && page.showInStepper)
      .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));
  }, [config.pages]);

  // Get current page configuration
  const getCurrentPage = useCallback((): PageConfig | null => {
    return config.pages[currentPageId] || null;
  }, [config.pages, currentPageId]);

  // Find next enabled page in the flow
  const getNextEnabledPage = useCallback((pageId: string): string | null => {
    const page = config.pages[pageId];
    if (!page) return null;

    let nextPageId = page.nextPage;
    
    // Check if next page is enabled
    while (nextPageId && config.pages[nextPageId] && !config.pages[nextPageId].enabled) {
      // Use fallback if available, otherwise try the next page's nextPage
      if (page.fallbackNext && config.pages[page.fallbackNext]?.enabled) {
        nextPageId = page.fallbackNext;
        break;
      }
      nextPageId = config.pages[nextPageId].nextPage;
    }

    return nextPageId && config.pages[nextPageId]?.enabled ? nextPageId : null;
  }, [config.pages]);

  // Find previous enabled page in the flow
  const getPreviousEnabledPage = useCallback((pageId: string): string | null => {
    const page = config.pages[pageId];
    if (!page) return null;

    let previousPageId = page.previousPage;
    
    // Check if previous page is enabled
    while (previousPageId && config.pages[previousPageId] && !config.pages[previousPageId].enabled) {
      previousPageId = config.pages[previousPageId].previousPage;
    }

    return previousPageId && config.pages[previousPageId]?.enabled ? previousPageId : null;
  }, [config.pages]);

  // Navigation functions
  const goToPage = useCallback((pageId: string) => {
    if (config.pages[pageId]?.enabled) {
      setCurrentPageId(pageId);
    }
  }, [config.pages]);

  const goToNextPage = useCallback(() => {
    const nextPageId = getNextEnabledPage(currentPageId);
    if (nextPageId) {
      setCurrentPageId(nextPageId);
    }
  }, [currentPageId, getNextEnabledPage]);

  const goToPreviousPage = useCallback(() => {
    const previousPageId = getPreviousEnabledPage(currentPageId);
    if (previousPageId) {
      setCurrentPageId(previousPageId);
    }
  }, [currentPageId, getPreviousEnabledPage]);

  // Check if navigation is possible
  const canNavigateNext = useCallback((): boolean => {
    return getNextEnabledPage(currentPageId) !== null;
  }, [currentPageId, getNextEnabledPage]);

  const canNavigatePrevious = useCallback((): boolean => {
    return getPreviousEnabledPage(currentPageId) !== null;
  }, [currentPageId, getPreviousEnabledPage]);

  // Get page by route for URL matching
  const getPageByRoute = useCallback((route: string): PageConfig | null => {
    return Object.values(config.pages).find(page => page.route === route) || null;
  }, [config.pages]);

  // Generate breadcrumbs for current page
  const getBreadcrumbs = useCallback((): Array<{ label: string; href?: string }> => {
    const currentPage = getCurrentPage();
    if (!currentPage) return [];

    const breadcrumbs = [];
    
    // Add home if not on landing page
    if (currentPageId !== 'landing') {
      breadcrumbs.push({ label: 'Home', href: '/' });
    }

    // Add stepper pages leading to current page
    const stepperPages = getStepperPages();
    const currentStepOrder = currentPage.stepOrder || 0;
    
    stepperPages
      .filter(page => (page.stepOrder || 0) < currentStepOrder)
      .forEach(page => {
        breadcrumbs.push({ 
          label: page.name, 
          href: page.route 
        });
      });

    // Add current page
    breadcrumbs.push({ label: currentPage.name });

    return breadcrumbs;
  }, [currentPageId, getCurrentPage, getStepperPages]);

  // Update configuration (for dynamic changes)
  const updatePageConfig = useCallback((pageId: string, updates: Partial<PageConfig>) => {
    setConfig(prev => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: {
          ...prev.pages[pageId],
          ...updates
        }
      }
    }));
  }, []);

  // Toggle page enabled status
  const togglePageEnabled = useCallback((pageId: string) => {
    updatePageConfig(pageId, { 
      enabled: !config.pages[pageId]?.enabled 
    });
  }, [config.pages, updatePageConfig]);

  return {
    // Configuration
    config,
    headerConfig: config.header,
    
    // Current state
    currentPageId,
    currentPage: getCurrentPage(),
    
    // Page collections
    enabledPages: getEnabledPages(),
    stepperPages: getStepperPages(),
    breadcrumbs: getBreadcrumbs(),
    
    // Navigation
    goToPage,
    goToNextPage,
    goToPreviousPage,
    canNavigateNext: canNavigateNext(),
    canNavigatePrevious: canNavigatePrevious(),
    
    // Utilities
    getPageByRoute,
    getNextEnabledPage,
    getPreviousEnabledPage,
    updatePageConfig,
    togglePageEnabled,
    
    // State setters
    setCurrentPageId
  };
};

export default usePageConfig;
