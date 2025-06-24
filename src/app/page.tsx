'use client'

import Link from 'next/link'
import { ThemeToggle } from '../components/ThemeToggle'

export default function Home() {
  return (
    <div className="min-h-screen bg-red bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nainovate Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose your preferred dashboard layout
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Minimalistic Layout Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Minimalistic Layout
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Clean, focused design with emphasis on whitespace and typography. 
                  Perfect for users who prefer essential information at a glance.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <div>• Clean typography focus</div>
                  <div>• Simplified navigation</div>
                  <div>• Essential metrics only</div>
                  <div>• Minimal visual clutter</div>
                </div>
                <Link 
                  href="/dashboard/minimal"
                  className="inline-block w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 
                             text-center py-3 px-6 rounded-lg font-medium hover:bg-gray-700 
                             dark:hover:bg-gray-300 transition-colors duration-200"
                >
                  View Minimalistic Dashboard
                </Link>
              </div>
            </div>

            {/* Card-Centric Layout Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  Card-Centric Layout
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Modern card-based layout with emphasis on visual separation and modularity.
                  Ideal for detailed data exploration and management.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <div>• Modular card design</div>
                  <div>• Rich data visualization</div>
                  <div>• Detailed job management</div>
                  <div>• Progress tracking</div>
                </div>
                <Link 
                  href="/dashboard/cards"
                  className="inline-block w-full bg-indigo-600 text-white text-center py-3 px-6 
                             rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  View Card-Centric Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Feature comparison */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Layout Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Next.js App Router</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Built with the latest Next.js 14 app directory structure for optimal performance
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tailwind CSS</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Responsive design with utility-first CSS framework and dark mode support
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">TypeScript</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Type-safe development with full TypeScript support for better developer experience
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
