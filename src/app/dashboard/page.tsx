'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  TrendingUp,
  RefreshCw,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { JobCard } from '../../components/common/JobCard';
import { loadCurrentJobs, loadPastJobs, Job, getJobStatistics } from '../../utils/jobUtils';

type JobFilter = 'all' | 'running' | 'queued' | 'completed' | 'failed';

export default function Dashboard() {
  const router = useRouter();
  const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
  const [pastJobs, setPastJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<JobFilter>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const [current, past] = await Promise.all([
        loadCurrentJobs(),
        loadPastJobs()
      ]);
      setCurrentJobs(current);
      setPastJobs(past);
      setError(null);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (uid: string) => {
    router.push(`/job/${uid}`);
  };

  const handleNewJob = () => {
    router.push('/finetuning/dataset-selection');
  };

  const statistics = getJobStatistics(currentJobs, pastJobs);

  // Filter and search jobs
  const allJobs = [...currentJobs, ...pastJobs];
  const filteredJobs = allJobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (typeof job.model === 'object' && job.model?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (typeof job.dataset === 'object' && job.dataset?.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || job.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const currentRunningJobs = currentJobs.filter(job => job.status === 'running');
  const currentQueuedJobs = currentJobs.filter(job => job.status === 'queued');
  const recentCompletedJobs = pastJobs.filter(job => job.status === 'completed').slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ThemeToggle />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Training Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Monitor and manage your fine-tuning jobs
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={loadJobs}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={handleNewJob}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-500 mr-4" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Active Jobs
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {statistics.active}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {statistics.running} running, {statistics.queued} queued
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mr-4" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Completed
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {statistics.completed}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last 30 days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mr-4" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Success Rate
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {statistics.successRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overall performance
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-500 mr-4" />
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Failed Jobs
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {statistics.failed}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Requires attention
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Running Jobs Section */}
        {currentRunningJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Currently Running
              </h2>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live monitoring active
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentRunningJobs.map(job => (
                <JobCard
                  key={job.uid}
                  job={job}
                  onClick={handleJobClick}
                  showProgress={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Queued Jobs Section */}
        {currentQueuedJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Queue ({currentQueuedJobs.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {currentQueuedJobs.map(job => (
                <JobCard
                  key={job.uid}
                  job={job}
                  onClick={handleJobClick}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by name, model, or dataset..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as JobFilter)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Jobs</option>
                <option value="running">Running</option>
                <option value="queued">Queued</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* All Jobs Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              All Jobs ({filteredJobs.length})
            </h2>
          </div>
          
          {filteredJobs.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                  <JobCard
                    key={job.uid}
                    job={job}
                    onClick={handleJobClick}
                    showProgress={job.status === 'running'}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Activity className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  No jobs found
                </h3>
                <p className="text-gray-400 dark:text-gray-500">
                  {searchTerm || activeFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first fine-tuning job.'
                  }
                </p>
              </div>
              {!searchTerm && activeFilter === 'all' && (
                <button
                  onClick={handleNewJob}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Job
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent Completed Jobs */}
        {recentCompletedJobs.length > 0 && activeFilter === 'all' && !searchTerm && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Recently Completed
              </h2>
              <button
                onClick={() => setActiveFilter('completed')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All Completed →
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recentCompletedJobs.map(job => (
                <JobCard
                  key={job.uid}
                  job={job}
                  onClick={handleJobClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
