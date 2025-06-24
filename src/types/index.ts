// Mock data and types for the dashboard
export interface Stat {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface Job {
  id: string;
  name: string;
  model: string;
  dataset: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  accuracy?: number;
  startTime: string;
  estimatedCompletion?: string;
  description?: string;
}

// Mock stats data
export const mockStats: Stat[] = [
  {
    title: 'Active Jobs',
    value: '12',
    change: '+2 from last week',
    trend: 'up'
  },
  {
    title: 'Completed Jobs',
    value: '847',
    change: '+23 from last week',
    trend: 'up'
  },
  {
    title: 'Total Models',
    value: '24',
    change: '+1 this month',
    trend: 'up'
  },
  {
    title: 'Success Rate',
    value: '94.2%',
    change: '+1.2% from last month',
    trend: 'up'
  }
];

// Mock jobs data
export const mockJobs: Job[] = [
  {
    id: '1',
    name: 'GPT-3.5 Customer Support',
    model: 'gpt-3.5-turbo',
    dataset: 'customer_support_v2.jsonl',
    status: 'running',
    progress: 67,
    startTime: '2024-01-15T10:30:00Z',
    estimatedCompletion: '2024-01-15T14:30:00Z',
    description: 'Fine-tuning for customer support automation'
  },
  {
    id: '2',
    name: 'Code Generation Model',
    model: 'gpt-4',
    dataset: 'code_examples_python.jsonl',
    status: 'completed',
    progress: 100,
    accuracy: 92.5,
    startTime: '2024-01-14T08:00:00Z',
    description: 'Python code generation and completion'
  },
  {
    id: '3',
    name: 'Legal Document Analysis',
    model: 'gpt-3.5-turbo',
    dataset: 'legal_docs_processed.jsonl',
    status: 'failed',
    progress: 34,
    startTime: '2024-01-13T16:45:00Z',
    description: 'Legal document classification and analysis'
  },
  {
    id: '4',
    name: 'Medical Transcription',
    model: 'whisper-large-v2',
    dataset: 'medical_audio_transcripts.jsonl',
    status: 'pending',
    progress: 0,
    startTime: '2024-01-16T09:00:00Z',
    description: 'Medical audio transcription fine-tuning'
  },
  {
    id: '5',
    name: 'E-commerce Recommendations',
    model: 'gpt-3.5-turbo',
    dataset: 'product_recommendations.jsonl',
    status: 'completed',
    progress: 100,
    accuracy: 88.7,
    startTime: '2024-01-12T11:20:00Z',
    description: 'Product recommendation engine optimization'
  },
  {
    id: '6',
    name: 'Social Media Analysis',
    model: 'gpt-4',
    dataset: 'social_sentiment_v3.jsonl',
    status: 'running',
    progress: 23,
    startTime: '2024-01-15T13:15:00Z',
    estimatedCompletion: '2024-01-15T18:00:00Z',
    description: 'Social media sentiment analysis and moderation'
  }
];
