'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  PlayCircle, 
  PauseCircle, 
  Activity, 
  Clock, 
  TrendingUp, 
  Cpu, 
  Monitor, 
  HardDrive,
  Thermometer,
  Zap,
  Database,
  RefreshCw
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
import { ThemeToggle } from '../../../../components/ThemeToggle';

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

interface TrainingStatus {
  job_id: string;
  status: string;
  current_epoch: number;
  total_epochs: number;
  progress_percent: number;
  elapsed_time: string;
  estimated_remaining: string;
  current_step: number;
  total_steps: number;
}

export default function Training() {
  const params = useParams();
  const router = useRouter();
  const jobUid = params?.uid as string;
  
  // Data states
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [resourceData, setResourceData] = useState<ResourceData[]>([]);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for intervals
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleBack = () => {
    router.push('/');
  };

  const fetchTrainingData = async () => {
    try {
      const [lossesRes, resourcesRes, statusRes] = await Promise.all([
        fetch('http://localhost:8001/api/training/losses?last_n=50'),
        fetch('http://localhost:8001/api/training/resources?last_n=50'),
        fetch(`http://localhost:8001/api/training/status/${jobUid}`)
      ]);

      if (lossesRes.ok) {
        const losses = await lossesRes.json();
        setTrainingData(losses);
      }

      if (resourcesRes.ok) {
        const resources = await resourcesRes.json();
        setResourceData(resources);
      }

      if (statusRes.ok) {
        const status = await statusRes.json();
        setTrainingStatus(status);
      }

      setError(null);
    } catch (err) {
      setError('Unable to connect to training monitor API. Please ensure the backend is running on port 8001.');
      console.error('Error fetching training data:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTrainingData();

    // Set up polling if live mode is enabled
    if (isLive) {
      intervalRef.current = setInterval(fetchTrainingData, 3000); // Fetch every 3 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, jobUid]);

  const toggleLiveMode = () => {
    setIsLive(!isLive);
  };

  // Chart configurations
  const lossChartData = {
    labels: trainingData.map(d => new Date(Date.now() - (trainingData.length - trainingData.indexOf(d)) * 3000)),
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
    labels: resourceData.map(d => new Date(Date.now() - (resourceData.length - resourceData.indexOf(d)) * 3000)),
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
          display: true,
          text: 'Time'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
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
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4
      }
    }
  };

  const lossChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Loss'
        }
      }
    }
  };

  const resourceChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Percentage (%)'
        },
        max: 100
      },
      y1: {
        ...chartOptions.scales.y1,
        title: {
          display: true,
          text: 'Memory (GB)'
        }
      }
    }
  };

  const getCurrentMetrics = () => {
    if (!resourceData.length) return null;
    return resourceData[resourceData.length - 1];
  };

  const currentMetrics = getCurrentMetrics();

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
            <button
              onClick={toggleLiveMode}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isLive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {isLive ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
              {isLive ? 'Live' : 'Paused'}
            </button>
            <button
              onClick={fetchTrainingData}
              className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Start the training monitor API: <code>python python-backend/training_monitor_api.py</code>
            </p>
          </div>
        )}

        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Training Monitor
            </h1>
            {trainingStatus && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                trainingStatus.status === 'running' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : trainingStatus.status === 'completed'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {trainingStatus.status.toUpperCase()}
              </div>
            )}
          </div>
          
          {jobUid && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Job: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{jobUid}</code>
            </p>
          )}

          {/* Status Cards */}
          {trainingStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Elapsed</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">{trainingStatus.elapsed_time}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Progress</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">{trainingStatus.progress_percent}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 text-purple-500 mr-2" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Epoch</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">{trainingStatus.current_epoch}/{trainingStatus.total_epochs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-orange-500 mr-2" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Remaining</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">{trainingStatus.estimated_remaining}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Training Loss Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Training Losses
            </h2>
            <div className="h-64">
              {trainingData.length > 0 ? (
                <Line data={lossChartData} options={lossChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No training data available
                </div>
              )}
            </div>
          </div>

          {/* Resource Metrics Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Resource Utilization
            </h2>
            <div className="h-64">
              {resourceData.length > 0 ? (
                <Line data={resourceChartData} options={resourceChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  No resource data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Metrics */}
        {currentMetrics && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Current System Metrics
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-green-900 dark:text-green-100 text-sm">GPU</h3>
                    <p className="text-green-700 dark:text-green-300 text-lg font-semibold">{currentMetrics.gpu_percent.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Cpu className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-purple-900 dark:text-purple-100 text-sm">CPU</h3>
                    <p className="text-purple-700 dark:text-purple-300 text-lg font-semibold">{currentMetrics.cpu_percent.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Monitor className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-100 text-sm">RAM</h3>
                    <p className="text-yellow-700 dark:text-yellow-300 text-lg font-semibold">{currentMetrics.ram_used_gb.toFixed(1)}GB</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Database className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 text-sm">VRAM</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-lg font-semibold">{currentMetrics.vram_used_gb.toFixed(1)}GB</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Thermometer className="w-5 h-5 text-red-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-100 text-sm">GPU Temp</h3>
                    <p className="text-red-700 dark:text-red-300 text-lg font-semibold">{currentMetrics.gpu_temp}°C</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center">
                  <HardDrive className="w-5 h-5 text-gray-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Disk</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold">{(currentMetrics.disk_used_gb / 1000).toFixed(1)}TB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
