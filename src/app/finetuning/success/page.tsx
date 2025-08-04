'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, PlayCircle, Home } from 'lucide-react';
import { ProgressStepper } from '../../../components/stepper';
import { JobCard, DrawingCheckmark } from '../../../components/common';
import { useToastHelpers } from '../../../components/toast';
import { loadCurrentJobs, getActiveJobs, Job } from '../../../utils/jobUtils';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: showSuccess, error: showError } = useToastHelpers();
  
  const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [createdJobUid, setCreatedJobUid] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  // Get job UID from URL params if available
  const jobUid = searchParams?.get('jobUid');

  const steps = [
    { id: 'data-upload', title: 'Data Upload' },
    { id: 'model-selection', title: 'Model Selection' },
    { id: 'hyperparameters', title: 'Hyperparameters' },
    { id: 'job-review', title: 'Job Review' },
    { id: 'success', title: 'Success' }
  ];

  // Load current jobs from backend or local data
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        
        // Use the utility function to load current jobs
        const allCurrentJobs = await loadCurrentJobs();
        const activeJobs = getActiveJobs(allCurrentJobs).slice(0, 6);
        
        setCurrentJobs(activeJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
        setCurrentJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    
    // Set the created job UID if provided
    if (jobUid) {
      setCreatedJobUid(jobUid);
    }

    // Trigger success animation
    setTimeout(() => setShowAnimation(true), 100);
  }, [jobUid]);

  const handleViewJobProgress = () => {
    if (createdJobUid) {
      router.push(`/job/${createdJobUid}`);
    } else {
      router.push('/finetuning/dashboard/all-jobs');
    }
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleViewJob = (uid: string) => {
    router.push(`/job/${uid}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 opacity-0 animate-fade-in">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <ProgressStepper 
          currentStep={4}
          steps={steps}
          variant="horizontal"
          allowStepClick={false}
          showNavigation={false}
        />

        {/* Success Section */}
        <div className="text-center mb-12">
          {/* Success Icon with Custom Drawing Animation */}
          <div className="flex justify-center mb-6">
            <DrawingCheckmark 
              size={72} 
              strokeWidth={5}
              delay={showAnimation ? 0 : 1000}
              className={`transition-all duration-1000 ease-out ${
                showAnimation ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
            />
          </div>

          {/* Success Message */}
          <div className={`transition-all duration-1000 delay-300 ease-out ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Job Created Successfully
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Your fine-tuning job has been queued and will start shortly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className={`transition-all duration-1000 delay-500 ease-out ${
            showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleViewJobProgress}
                className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                View Job Progress
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              
              <button
                onClick={handleReturnHome}
                className="flex items-center px-8 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-xl font-medium transition-all duration-200"
              >
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </button>
            </div>
          </div>
        </div>

        {/* Current Jobs Section */}
        <div className={`transition-all duration-1000 delay-700 ease-out ${
          showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Current Jobs
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentJobs.length} active
                </span>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : currentJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentJobs.map((job) => (
                    <JobCard
                      key={job.uid}
                      job={job}
                      onClick={handleViewJob}
                      compact={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">
                    No active jobs found
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Your new job will appear here once it starts processing
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading success page...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
