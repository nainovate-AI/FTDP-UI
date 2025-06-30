// Job data utilities for loading current and past jobs across the application

export interface Job {
  uid: string;
  name: string;
  status: 'created' | 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  model?: string | { uid: string; name: string; provider: string; version: string };
  dataset?: string | { uid: string; name: string; size: string; samples: number; format: string };
  description?: string;
  tags?: string[];
  progress?: number;
  duration?: string;
  queuePosition?: number;
  estimatedStart?: string;
  estimatedCompletion?: string;
  hyperparameters?: any;
  metrics?: any;
  finalMetrics?: any;
  resources?: any;
  deploymentInfo?: any;
  errorDetails?: any;
  failureReason?: string;
  owner?: { userId: string; email: string; department: string };
}

export interface JobsData {
  jobs: Job[];
  statistics?: any;
}

/**
 * Load current active jobs from API or fallback to local JSON
 */
export async function loadCurrentJobs(): Promise<Job[]> {
  try {
    // Try API first
    const response = await fetch('http://localhost:8000/api/jobs');
    if (response.ok) {
      const data = await response.json();
      return data.jobs || [];
    }
    throw new Error('API not available');
  } catch (error) {
    console.log('Loading current jobs from local data...');
    
    try {
      // Import the JSON data directly (works in Next.js)
      const currentJobsData = await import('../data/current-jobs.json');
      return (currentJobsData.jobs || []) as Job[];
    } catch (importError) {
      console.error('Error loading current jobs:', importError);
      return [];
    }
  }
}

/**
 * Load past completed/failed jobs from local JSON
 */
export async function loadPastJobs(): Promise<Job[]> {
  try {
    // Import the JSON data directly (works in Next.js)
    const pastJobsData = await import('../data/past-jobs.json');
    return (pastJobsData.jobs || []) as Job[];
  } catch (error) {
    console.error('Error loading past jobs:', error);
    return [];
  }
}

/**
 * Load all jobs (current + past)
 */
export async function loadAllJobs(): Promise<{ current: Job[]; past: Job[] }> {
  const [current, past] = await Promise.all([
    loadCurrentJobs(),
    loadPastJobs()
  ]);
  
  return { current, past };
}

/**
 * Get jobs by status
 */
export function filterJobsByStatus(jobs: Job[], status: Job['status'] | Job['status'][]): Job[] {
  const statusArray = Array.isArray(status) ? status : [status];
  return jobs.filter(job => statusArray.includes(job.status));
}

/**
 * Get active jobs (created, queued, running)
 */
export function getActiveJobs(jobs: Job[]): Job[] {
  return filterJobsByStatus(jobs, ['created', 'queued', 'running']);
}

/**
 * Get completed jobs
 */
export function getCompletedJobs(jobs: Job[]): Job[] {
  return filterJobsByStatus(jobs, ['completed']);
}

/**
 * Get failed jobs
 */
export function getFailedJobs(jobs: Job[]): Job[] {
  return filterJobsByStatus(jobs, ['failed']);
}

/**
 * Get job statistics
 */
export function getJobStatistics(currentJobs: Job[], pastJobs: Job[]) {
  const allJobs = [...currentJobs, ...pastJobs];
  const activeJobs = getActiveJobs(currentJobs);
  const completedJobs = getCompletedJobs(pastJobs);
  const failedJobs = getFailedJobs(pastJobs);
  
  return {
    total: allJobs.length,
    active: activeJobs.length,
    running: filterJobsByStatus(activeJobs, 'running').length,
    queued: filterJobsByStatus(activeJobs, 'queued').length,
    created: filterJobsByStatus(activeJobs, 'created').length,
    completed: completedJobs.length,
    failed: failedJobs.length,
    successRate: pastJobs.length > 0 ? (completedJobs.length / pastJobs.length * 100).toFixed(1) : '0',
  };
}

/**
 * Sort jobs by creation date (newest first)
 */
export function sortJobsByDate(jobs: Job[], ascending = false): Job[] {
  return [...jobs].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Get recent jobs (last N jobs)
 */
export function getRecentJobs(jobs: Job[], count = 5): Job[] {
  return sortJobsByDate(jobs).slice(0, count);
}
