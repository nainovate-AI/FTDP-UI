'use client'

import React, { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Main Page Component - Component-Based Navigation System
 * 
 * Features:
 * - Single URL with query parameters (?page=pageId)
 * - Dynamic page loading from pages.json configuration
 * - Backward compatibility with existing routes
 * - Global header integration (handled by root layout)
 * - Preserves all backend API endpoints
 */
export default function MainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <PageContainer initialPage="landing" />
    </Suspense>
  );
}
