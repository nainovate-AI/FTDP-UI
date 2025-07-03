'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlayCircle, 
  PauseCircle, 
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Activity,
  Database,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { ThemeToggle } from '../../../../components/ThemeToggle';
import { loadCurrentJobs, loadPastJobs, Job } from '../../../../utils/jobUtils';

interface QueueItem extends Job {
  position: number;
  estimatedStart?: string;
}

export default function AllJobsDashboard() {
  const router = useRouter();
  const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
  const [pastJobs, setPastJobs] = useState<Job[]>([]);
  const [queuedJobs, setQueuedJobs] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobsData = async () => {
      try {
        const [current, past] = await Promise.all([
          loadCurrentJobs(),
          loadPastJobs()
        ]);
        
        // Separate running and queued jobs
        const running = current.filter(job => job.status === 'running');
        const queued = current.filter(job => job.status === 'queued')
          .map((job, index) => ({ ...job, position: index + 1 }));
        
        setCurrentJobs(running);
        setQueuedJobs(queued);
        setPastJobs(past);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobsData();
  }, []);

  const handleJobClick = (uid: string) => {
    router.push(`/job/${uid}`);
  };

  const handleBackToDetailedDashboard = () => {
    router.push('/finetuning/dashboard/detailed');
  };

  const getStageProgress = (progress: number = 0) => {
    if (progress < 20) return { current: 'Dataset Loading', step: 1, total: 5 };
    if (progress < 40) return { current: 'Tokenization', step: 2, total: 5 };
    if (progress < 70) return { current: 'Training', step: 3, total: 5 };
    if (progress < 90) return { current: 'Validation', step: 4, total: 5 };
    return { current: 'Save Model', step: 5, total: 5 };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Training Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor all fine-tuning jobs and training progress
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Left 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Jobs</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentJobs.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Queue</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{queuedJobs.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {pastJobs.filter(job => job.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Training Progress</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active training jobs with stage progression</p>
              </div>
              
              <div className="p-6 space-y-6">
                {currentJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No active training jobs</p>
                  </div>
                ) : (
                  currentJobs.map((job) => {
                    const stage = getStageProgress(job.progress);
                    return (
                      <div 
                        key={job.uid}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleJobClick(job.uid)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{job.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{job.description}</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm font-medium">
                            Running
                          </span>
                        </div>
                        
                        {/* Simple Stage Progress */}
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="flex items-center space-x-2">
                            {Array.from({ length: stage.total }, (_, i) => (
                              <div key={i} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                  i < stage.step 
                                    ? 'bg-blue-600 text-white' 
                                    : i === stage.step - 1 
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 animate-pulse'
                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                  {i < stage.step ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    i + 1
                                  )}
                                </div>
                                {i < stage.total - 1 && (
                                  <div className={`w-8 h-0.5 ${
                                    i < stage.step - 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                  }`} />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {stage.current} ({stage.step}/{stage.total})
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {job.progress && job.progress > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{Math.round(job.progress || 0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Recent Completions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Completions</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {pastJobs.slice(0, 3).map((job) => (
                    <div 
                      key={job.uid}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => handleJobClick(job.uid)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          job.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900' 
                            : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {job.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{job.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {job.status === 'completed' ? 'Completed' : 'Failed'} • 
                            {new Date(job.completedAt || job.failedAt || job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Currently Running & Queue */}
          <div className="lg:col-span-1 space-y-6">
            {/* Currently Running */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Currently Running
                </h3>
              </div>
              
              <div className="p-4 space-y-3">
                {currentJobs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No jobs running
                  </p>
                ) : (
                  currentJobs.map((job) => (
                    <div 
                      key={job.uid}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleJobClick(job.uid)}
                    >
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {job.name}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {Math.round(job.progress || 0)}% complete
                        </span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                            style={{ width: `${job.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Queue */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                  Queue
                </h3>
              </div>
              
              <div className="p-4 space-y-3">
                {queuedJobs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No jobs in queue
                  </p>
                ) : (
                  queuedJobs.map((job) => (
                    <div 
                      key={job.uid}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleJobClick(job.uid)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {job.name}
                        </h4>
                        <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full">
                          #{job.position}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Position {job.position} in queue
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Back to Detailed Dashboard Button */}
            <div className="text-center">
              <button
                onClick={handleBackToDetailedDashboard}
                className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 
                           rounded-lg font-medium hover:bg-gray-700 dark:hover:bg-gray-300 
                           transition-colors duration-200 w-full"
              >
                Back to Detailed Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
