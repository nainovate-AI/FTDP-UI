'use client'

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, PlayCircle, PauseCircle, Activity, Clock, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '../../../../components/ThemeToggle';

export default function Training() {
  const params = useParams();
  const router = useRouter();
  const jobUid = params?.uid as string;

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <ThemeToggle />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Job Training Monitor - Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <Activity className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Training Monitor
            </h1>
            {jobUid ? (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Monitoring job: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{jobUid}</code>
              </p>
            ) : (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Select a job to monitor its training progress
              </p>
            )}

            {/* Placeholder Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Duration</h3>
                <p className="text-gray-600 dark:text-gray-400">--:--:--</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <TrendingUp className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Progress</h3>
                <p className="text-gray-600 dark:text-gray-400">0%</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <PlayCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Status</h3>
                <p className="text-gray-600 dark:text-gray-400">Queued</p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                🚧 Training Monitor Coming Soon
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This page will show real-time training progress, metrics, and logs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
