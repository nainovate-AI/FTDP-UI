'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 gradient-mesh flex items-center justify-center">
      <ThemeToggle />
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white dark:text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-slate-900 dark:text-white">Nainovate</span>
          </Link>
        </div>
      </nav>
      
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Main 404 Content */}
        <div className={`transition-all duration-1000 ${mounted ? 'animate-fade-scale' : 'opacity-0'}`}>
          {/* 404 Number with subtle styling */}
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-bold text-slate-200 dark:text-slate-800 select-none">
              404
            </h1>
          </div>

          {/* Main Message */}
          <div className="space-y-6 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Page not found
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. 
              Perhaps you&apos;ve mistyped the URL or the page has been moved.
            </p>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/"
              className="group inline-flex items-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all duration-200 shadow-lg hover:shadow-xl hover-lift"
            >
              <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
            
            <Link 
              href="/finetuning/dashboard/minimal"
              className="inline-flex items-center px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Go to dashboard
            </Link>
          </div>

          {/* Quick Navigation */}
          <div className="glass-effect border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Looking for something specific?
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link 
                href="/finetuning/dataset-selection"
                className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Fine-tuning</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Start training models</div>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/finetuning/dashboard/minimal"
                className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Dashboard</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">View your projects</div>
                  </div>
                </div>
              </Link>

              <Link 
                href="/finetuning/model-selection"
                className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Models</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Browse AI models</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
