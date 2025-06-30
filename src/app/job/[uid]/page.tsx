'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  PlayCircle, 
  PauseCircle, 
  ChevronDown,
  ChevronUp,
  Clock, 
  Database,
  Cpu,
  Activity,
  CheckCircle,
  Circle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Download,
  Tag,
  User,
  Calendar,
  TrendingUp,
  Monitor,
  HardDrive,
  Thermometer,
  Zap
} from 'lucide-react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { loadCurrentJobs, loadPastJobs, Job } from '../../../utils/jobUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface TrainingData {
  timestamp: number;
  epoch: number;
  step: number;
  train_loss: number;
  validation_loss: number;
  learning_rate: number;
  batch_size: number;
}

interface ResourceData {
  timestamp: number;
  cpu_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  gpu_percent: number;
  vram_used_gb: number;
  vram_total_gb: number;
  disk_used_gb: number;
  disk_total_gb: number;
  gpu_temp: number;
  cpu_temp: number;
  network_in_mbps: number;
  network_out_mbps: number;
}

interface StageStatus {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: string;
  description: string;
}

const TRAINING_STAGES: StageStatus[] = [
  { id: 'dataset', name: 'Dataset Loading', status: 'pending', description: 'Loading and validating training data' },
  { id: 'tokenize', name: 'Tokenization', status: 'pending', description: 'Converting text to model tokens' },
  { id: 'train', name: 'Training', status: 'pending', description: 'Fine-tuning the model' },
  { id: 'validate', name: 'Validation', status: 'pending', description: 'Evaluating model performance' },
  { id: 'save', name: 'Save Model', status: 'pending', description: 'Saving trained model artifacts' }
];

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobUid = params?.uid as string;
  
  // Job data
  const [job, setJob] = useState<Job | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [stages, setStages] = useState<StageStatus[]>(TRAINING_STAGES);
  const [logsVisible, setLogsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Live training data
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [resourceData, setResourceData] = useState<ResourceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Navigation handler
  const handleBack = () => {
    router.push('/finetuning/dashboard/detailed');
  };

  // Load job data
  useEffect(() => {
    const loadJobData = async () => {
      try {
        // Try to load from different sources
        let foundJob = null;
        
        // First check current jobs
        try {
          const currentResponse = await fetch('/api/jobs/current');
          if (currentResponse.ok) {
            const currentData = await currentResponse.json();
            foundJob = currentData.jobs?.find((j: any) => j.uid === jobUid);
            if (foundJob) {
              foundJob.isHistorical = false;
            }
          }
        } catch (err) {
          console.log('Current jobs API not available, trying fallback');
        }
        
        // If not found in current, check past jobs
        if (!foundJob) {
          try {
            const pastResponse = await fetch('/api/jobs/past');
            if (pastResponse.ok) {
              const pastData = await pastResponse.json();
              foundJob = pastData.jobs?.find((j: any) => j.uid === jobUid);
              if (foundJob) {
                foundJob.isHistorical = true;
              }
            }
          } catch (err) {
            console.log('Past jobs API not available, trying fallback');
          }
        }
        
        // Final fallback to main jobs
        if (!foundJob) {
          try {
            const jobsResponse = await fetch('/api/jobs');
            if (jobsResponse.ok) {
              const jobsData = await jobsResponse.json();
              foundJob = jobsData.jobs?.find((j: any) => j.uid === jobUid);
              if (foundJob) {
                foundJob.isHistorical = foundJob.status === 'completed' || foundJob.status === 'failed';
              }
            }
          } catch (err) {
            console.log('Jobs API not available, using mock data');
          }
        }
        
        // Ultimate fallback to mock data
        if (!foundJob) {
          foundJob = await getMockJobData(jobUid);
        }
        
        if (foundJob) {
          setJob(foundJob);
          setIsLive(foundJob.status === 'running' && !foundJob.isHistorical);
          
          // Update stages based on job status
          updateStagesFromJob(foundJob);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Error loading job:', err);
        // Fallback to mock data
        const mockJob = await getMockJobData(jobUid);
        setJob(mockJob);
        setIsLive(mockJob.status === 'running');
        updateStagesFromJob(mockJob);
      }
    };

    loadJobData();
  }, [jobUid]);

  // Mock job data generator with better UID handling
  const getMockJobData = async (uid: string) => {
    // Base job data
    let jobData = {
      uid,
      name: 'GPT-3.5 Customer Support Assistant',
      description: 'Fine-tuning GPT-3.5 for specialized customer support responses with company-specific knowledge',
      status: 'running' as const,
      priority: 'high' as const,
      progress: 75,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      model: {
        uid: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI'
      },
      dataset: {
        uid: 'dataset_customer_support_v2',
        name: 'Customer Support Conversations v2',
        size: '2.8 GB',
        samples: 15420
      },
      metrics: {
        currentEpoch: 2,
        totalEpochs: 3,
        currentLoss: 0.225,
        validationLoss: 0.267,
        accuracy: 0.935,
        f1Score: 0.928
      },
      resources: {
        gpuType: 'A100-40GB',
        gpuCount: 2,
        memoryUsage: '32.5 GB',
        estimatedCost: 24.75
      },
      owner: {
        userId: 'user_alex_chen',
        email: 'alex.chen@company.com',
        department: 'AI Engineering'
      },
      tags: ['customer-service', 'chatbot', 'support', 'production'],
      isHistorical: false
    };

    // Customize based on UID patterns
    if (uid.includes('bert') || uid.includes('sentiment')) {
      jobData = {
        ...jobData,
        name: 'BERT Sentiment Classifier v3',
        description: 'Training BERT for enhanced sentiment analysis with multilingual support',
        status: 'queued',
        progress: 0,
        model: {
          uid: 'bert-base-multilingual',
          name: 'BERT Base Multilingual',
          provider: 'Hugging Face'
        },
        dataset: {
          uid: 'dataset_multilingual_sentiment',
          name: 'Multilingual Sentiment Dataset',
          size: '1.2 GB',
          samples: 8750
        },
        metrics: {
          currentEpoch: 0,
          totalEpochs: 5,
          currentLoss: 0,
          validationLoss: 0,
          accuracy: 0,
          f1Score: 0
        },
        resources: {
          gpuType: 'V100-32GB',
          gpuCount: 1,
          memoryUsage: '0 GB',
          estimatedCost: 18.20
        },
        owner: {
          userId: 'user_sarah_kim',
          email: 'sarah.kim@company.com',
          department: 'Data Science'
        },
        tags: ['sentiment', 'classification', 'multilingual', 'nlp']
      };
    } else if (uid.includes('completed') || uid.includes('tech')) {
      jobData = {
        ...jobData,
        name: 'GPT-3.5 Tech Documentation Helper',
        description: 'Fine-tuning GPT-3.5 for technical documentation generation and Q&A',
        status: 'completed',
        progress: 100,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: '5h 7m',
        model: {
          uid: 'openai/gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'OpenAI'
        },
        dataset: {
          uid: 'dataset_tech_docs_v3',
          name: 'Technical Documentation Corpus v3',
          size: '3.2 GB',
          samples: 18500
        },
        finalMetrics: {
          finalLoss: 0.183,
          finalValidationLoss: 0.201,
          bestAccuracy: 0.952,
          bestF1Score: 0.948,
          perplexity: 1.85,
          bleuScore: 0.67
        },
        resources: {
          gpuType: 'A100-40GB',
          gpuCount: 2,
          totalCost: 35.40,
          peakMemoryUsage: '38.2 GB'
        },
        deployment: {
          status: 'deployed',
          endpoint: 'api.company.com/models/gpt35-techdocs-v1',
          version: 'v1.0.0'
        },
        tags: ['documentation', 'technical-writing', 'qa', 'deployed'],
        isHistorical: true
      };
    } else if (uid.includes('failed') || uid.includes('llama')) {
      jobData = {
        ...jobData,
        name: 'LLaMA Legal Document Analysis',
        description: 'Fine-tuning LLaMA 2 for legal document analysis and extraction',
        status: 'failed',
        progress: 18,
        failedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration: '2h 35m',
        failureReason: 'GPU memory exhaustion during epoch 1',
        model: {
          uid: 'meta/llama2-7b',
          name: 'LLaMA 2 7B',
          provider: 'Meta'
        },
        dataset: {
          uid: 'dataset_legal_docs_v2',
          name: 'Legal Document Analysis Dataset v2',
          size: '4.1 GB',
          samples: 8900
        },
        errorDetails: {
          errorCode: 'CUDA_OUT_OF_MEMORY',
          errorMessage: 'CUDA out of memory. Tried to allocate 2.73 GiB',
          suggestedFix: 'Reduce batch size or use gradient accumulation'
        },
        resources: {
          gpuType: 'V100-32GB',
          gpuCount: 1,
          totalCost: 12.80,
          peakMemoryUsage: '31.2 GB'
        },
        tags: ['legal', 'document-analysis', 'failed', 'memory-error'],
        isHistorical: true
      };
    }

    return jobData;
  };

  // Live data polling
  useEffect(() => {
    if (isLive && job?.status === 'running') {
      fetchLiveData();
      intervalRef.current = setInterval(fetchLiveData, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, job?.status]);

  const updateStagesFromJob = (job: Job) => {
    const updatedStages = [...TRAINING_STAGES];
    
    if (job.status === 'running' && job.metrics) {
      // Mark stages as completed/active based on progress
      const progress = job.progress || 0;
      
      if (progress > 0) updatedStages[0].status = 'completed';
      if (progress > 20) updatedStages[1].status = 'completed';
      if (progress > 40) {
        updatedStages[2].status = 'active';
      }
      if (progress > 80) {
        updatedStages[2].status = 'completed';
        updatedStages[3].status = 'active';
      }
      if (progress >= 100) {
        updatedStages[3].status = 'completed';
        updatedStages[4].status = 'completed';
      }
    } else if (job.status === 'completed') {
      updatedStages.forEach(stage => stage.status = 'completed');
    } else if (job.status === 'failed') {
      updatedStages[0].status = 'completed';
      updatedStages[1].status = 'failed';
    }
    
    setStages(updatedStages);
  };

  const fetchLiveData = async () => {
    try {
      const [lossesRes, resourcesRes] = await Promise.all([
        fetch('http://localhost:8001/api/training/losses?last_n=50'),
        fetch('http://localhost:8001/api/training/resources?last_n=50')
      ]);

      if (lossesRes.ok) {
        const losses = await lossesRes.json();
        setTrainingData(losses);
      }

      if (resourcesRes.ok) {
        const resources = await resourcesRes.json();
        setResourceData(resources);
      }

      // Simulate logs for demo
      if (Math.random() > 0.7) {
        const newLog = `[${new Date().toLocaleTimeString()}] Step ${Math.floor(Math.random() * 1000)}: Loss = ${(Math.random() * 2).toFixed(4)}`;
        setLogs(prev => [...prev.slice(-19), newLog]);
      }

      setError(null);
    } catch (err) {
      setError('Unable to connect to training monitor API');
      console.error('Error fetching live data:', err);
    }
  };

  // Generate mock data for completed jobs
  const generateMockData = (job: Job) => {
    if (job.status !== 'completed') return;
    
    // Generate mock training curve
    const mockTraining = Array.from({ length: 30 }, (_, i) => ({
      timestamp: Date.now() - (30 - i) * 60000,
      epoch: Math.floor(i / 10) + 1,
      step: i + 1,
      train_loss: 2.5 * Math.exp(-i * 0.1) + Math.random() * 0.1,
      validation_loss: 2.7 * Math.exp(-i * 0.08) + Math.random() * 0.1,
      learning_rate: 5e-5,
      batch_size: 16
    }));
    
    setTrainingData(mockTraining);
    
    // Generate mock resource data
    const mockResources = Array.from({ length: 30 }, (_, i) => ({
      timestamp: Date.now() - (30 - i) * 60000,
      cpu_percent: 40 + Math.random() * 20,
      ram_used_gb: 25 + Math.random() * 5,
      ram_total_gb: 64,
      gpu_percent: 80 + Math.random() * 15,
      vram_used_gb: 30 + Math.random() * 8,
      vram_total_gb: 40,
      disk_used_gb: 500,
      disk_total_gb: 1000,
      gpu_temp: 65 + Math.random() * 10,
      cpu_temp: 55 + Math.random() * 10,
      network_in_mbps: Math.random() * 100,
      network_out_mbps: Math.random() * 50
    }));
    
    setResourceData(mockResources);
  };

  useEffect(() => {
    if (job && job.status === 'completed') {
      generateMockData(job);
    }
  }, [job]);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (logsVisible) {
      scrollToBottom();
    }
  }, [logs, logsVisible]);

  const getStatusIcon = (status: StageStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Circle className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  // Chart configurations
  const lossChartData = {
    labels: trainingData.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: 'Training Loss',
        data: trainingData.map(d => d.train_loss),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Validation Loss',
        data: trainingData.map(d => d.validation_loss),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const resourceChartData = {
    labels: resourceData.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: 'GPU %',
        data: resourceData.map(d => d.gpu_percent),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'CPU %',
        data: resourceData.map(d => d.cpu_percent),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        yAxisID: 'y',
      },
      {
        label: 'RAM GB',
        data: resourceData.map(d => d.ram_used_gb),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            second: 'HH:mm:ss'
          }
        },
        title: {
          display: false
        },
        grid: {
          display: false
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 4
      }
    }
  };

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Job Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentMetrics = resourceData.length > 0 ? resourceData[resourceData.length - 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
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
          
          <div className="flex items-center space-x-4">
            {job.status === 'running' && (
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isLive 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isLive ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                {isLive ? 'Live' : 'Paused'}
              </button>
            )}
            {job.status === 'running' && (
              <button
                onClick={fetchLiveData}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {job.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {job.description}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                job.status === 'running' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : job.status === 'completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : job.status === 'failed'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Job Metadata Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Model Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Model</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {typeof job.model === 'object' && job.model ? (
                  <>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{job.model.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.model.provider} • {job.model.version}</p>
                  </>
                ) : (
                  <p className="text-gray-900 dark:text-gray-100">{job.model || 'N/A'}</p>
                )}
              </div>
            </div>

            {/* Dataset Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dataset</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {typeof job.dataset === 'object' && job.dataset ? (
                  <>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{job.dataset.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.dataset.samples.toLocaleString()} samples • {job.dataset.size}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-900 dark:text-gray-100">{job.dataset || 'N/A'}</p>
                )}
              </div>
            </div>

            {/* Timing Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Timing</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {job.duration && (
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{job.duration}</span>
                  </div>
                )}
                {job.owner && (
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Owner:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{job.owner.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {job.progress !== undefined && job.progress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    job.status === 'running' ? 'bg-blue-500' : 
                    job.status === 'completed' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${job.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Stage Tracker */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Training Stages</h2>
              <div className="space-y-4">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(stage.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium ${
                        stage.status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                        stage.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                        stage.status === 'failed' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {stage.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {stage.description}
                      </p>
                      {stage.duration && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {stage.duration}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts and Metrics */}
          <div className="xl:col-span-3 space-y-8">
            {/* Current Status Cards */}
            {job.status === 'running' && job.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Current Loss</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                        {job.metrics.currentLoss?.toFixed(4) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Accuracy</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                        {job.metrics.accuracy ? (job.metrics.accuracy * 100).toFixed(1) + '%' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Epoch</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                        {job.metrics.currentEpoch || 0}/{job.metrics.totalEpochs || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 text-orange-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">F1 Score</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                        {job.metrics.f1Score?.toFixed(3) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Training Loss Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Training Metrics
                </h2>
                <div className="h-64">
                  {trainingData.length > 0 ? (
                    <Line data={lossChartData} options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          title: { display: true, text: 'Loss' }
                        }
                      }
                    }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      {job.status === 'completed' ? 'Training completed' : 'No training data available'}
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Metrics Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Resource Usage
                </h2>
                <div className="h-64">
                  {resourceData.length > 0 ? (
                    <Line data={resourceChartData} options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: { ...chartOptions.scales.y, title: { display: true, text: 'Usage (%)' }, max: 100 },
                        y1: { ...chartOptions.scales.y1, title: { display: true, text: 'Memory (GB)' } }
                      }
                    }} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      {job.status === 'completed' ? 'Resource monitoring completed' : 'No resource data available'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current System Metrics */}
            {currentMetrics && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Current System Status
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-green-900 dark:text-green-100 text-sm">GPU</h3>
                        <p className="text-green-700 dark:text-green-300 text-lg font-semibold">
                          {currentMetrics.gpu_percent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Cpu className="w-5 h-5 text-purple-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-purple-900 dark:text-purple-100 text-sm">CPU</h3>
                        <p className="text-purple-700 dark:text-purple-300 text-lg font-semibold">
                          {currentMetrics.cpu_percent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Monitor className="w-5 h-5 text-yellow-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-yellow-900 dark:text-yellow-100 text-sm">RAM</h3>
                        <p className="text-yellow-700 dark:text-yellow-300 text-lg font-semibold">
                          {currentMetrics.ram_used_gb.toFixed(1)}GB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Database className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm">VRAM</h3>
                        <p className="text-blue-700 dark:text-blue-300 text-lg font-semibold">
                          {currentMetrics.vram_used_gb.toFixed(1)}GB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Thermometer className="w-5 h-5 text-red-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-red-900 dark:text-red-100 text-sm">GPU Temp</h3>
                        <p className="text-red-700 dark:text-red-300 text-lg font-semibold">
                          {Math.round(currentMetrics.gpu_temp)}°C
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <HardDrive className="w-5 h-5 text-gray-600 mr-2" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Disk</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">
                          {(currentMetrics.disk_used_gb / 1000).toFixed(1)}TB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible Logs Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setLogsVisible(!logsVisible)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-xl"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Training Logs
                </h2>
                {logsVisible ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {logsVisible && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                    {logs.length > 0 ? (
                      <>
                        {logs.map((log, index) => (
                          <div key={index} className="text-green-400 mb-1">
                            {log}
                          </div>
                        ))}
                        <div ref={logsEndRef} />
                      </>
                    ) : (
                      <div className="text-gray-500 italic">
                        {job.status === 'running' ? 'Waiting for logs...' : 'No logs available'}
                      </div>
                    )}
                  </div>
                  {logs.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setLogs([])}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Clear Logs
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hyperparameters */}
            {job.hyperparameters && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Hyperparameters
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(job.hyperparameters).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </h3>
                      <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deployment Info (for completed jobs) */}
            {job.status === 'completed' && job.deploymentInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Deployment
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        Model Version: {job.deploymentInfo.modelVersion}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Deployed: {new Date(job.deploymentInfo.deployedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.deploymentInfo.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {job.deploymentInfo.status}
                      </span>
                      <button
                        onClick={() => window.open(job.deploymentInfo.endpoint, '_blank')}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        API
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Details (for failed jobs) */}
            {job.status === 'failed' && job.errorDetails && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">
                  Error Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-200">Error Code</h3>
                    <p className="text-red-700 dark:text-red-300 font-mono text-sm">
                      {job.errorDetails.errorCode}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-200">Message</h3>
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {job.errorDetails.errorMessage}
                    </p>
                  </div>
                  {job.errorDetails.suggestedFix && (
                    <div>
                      <h3 className="font-medium text-red-800 dark:text-red-200">Suggested Fix</h3>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {job.errorDetails.suggestedFix}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
