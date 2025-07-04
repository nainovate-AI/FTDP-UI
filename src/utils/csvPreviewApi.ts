/**
 * API utilities for communicating with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface PreviewResponse {
  filename: string;
  columns: string[];
  data: any[];
  validation_errors: string[];
  statistics: {
    total_rows: number;
    total_columns: number;
    file_size_kb: number;
    preview_rows: number;
    has_required_columns: boolean;
  };
  isNewUpload: boolean;
}

export interface ApiError {
  detail: string;
}

/**
 * Check if the FastAPI backend is running
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}

/**
 * Preview a CSV file using the FastAPI backend
 */
export async function previewCsvViaApi(file: File): Promise<PreviewResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/preview-csv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PreviewResponse = await response.json();
    return data;
  } catch (error) {
    console.error('CSV preview API error:', error);
    throw error;
  }
}

/**
 * Fallback function that uses mock data when backend is unavailable
 */
export function getMockPreviewData(file: File): PreviewResponse {
  // Generate mock data similar to the original simulateFilePreview function
  const mockData: PreviewResponse = {
    filename: file.name,
    columns: ['input', 'output', 'confidence', 'source'],
    data: [
      { input: 'This product is amazing!', output: 'positive', confidence: '0.95', source: 'review' },
      { input: 'I hate this service.', output: 'negative', confidence: '0.89', source: 'feedback' },
      { input: 'The quality is okay.', output: 'neutral', confidence: '0.76', source: 'review' },
      { input: 'Best purchase ever!', output: 'positive', confidence: '0.92', source: 'review' },
      { input: 'Could be better.', output: 'neutral', confidence: '0.68', source: 'feedback' },
    ],
    validation_errors: [], // No errors for mock data with correct columns
    statistics: {
      total_rows: 100, // Mock total
      total_columns: 4,
      file_size_kb: 25.6,
      preview_rows: 5,
      has_required_columns: true
    },
    isNewUpload: true
  };

  return mockData;
}

/**
 * Preview CSV file with automatic fallback to mock data
 * This function tries the backend first, then falls back to mock data
 */
export async function previewCsvWithFallback(file: File): Promise<{
  data: PreviewResponse;
  usedBackend: boolean;
  error?: string;
}> {
  try {
    // Try backend first
    const backendData = await previewCsvViaApi(file);
    return {
      data: backendData,
      usedBackend: true
    };
  } catch (error) {
    console.warn('Backend unavailable, using mock data:', error);
    
    // Fall back to mock data
    const mockData = getMockPreviewData(file);
    return {
      data: mockData,
      usedBackend: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
