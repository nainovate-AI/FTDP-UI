import { previewCsvWithFallback, PreviewResponse } from './csvPreviewApi';

/**
 * Preview CSV file with real parsing via FastAPI backend
 * Falls back to mock data if backend is unavailable
 */
export async function previewCsvFile(file: File): Promise<{
  preview: any;
  usedBackend: boolean;
  error?: string;
}> {
  try {
    const result = await previewCsvWithFallback(file);
    
    // Transform the API response to match the expected format
    const preview = {
      filename: result.data.filename,
      columns: result.data.columns,
      data: result.data.data,
      isNewUpload: result.data.isNewUpload,
      statistics: result.data.statistics
    };

    return {
      preview,
      usedBackend: result.usedBackend,
      error: result.error
    };
  } catch (error) {
    console.error('Error in previewCsvFile:', error);
    
    // Ultimate fallback - create mock data
    const mockPreview = {
      filename: file.name,
      columns: ['input', 'output', 'confidence', 'source'],
      data: [
        { input: 'This product is amazing!', output: 'positive', confidence: '0.95', source: 'review' },
        { input: 'I hate this service.', output: 'negative', confidence: '0.89', source: 'feedback' },
        { input: 'The quality is okay.', output: 'neutral', confidence: '0.76', source: 'review' },
        { input: 'Best purchase ever!', output: 'positive', confidence: '0.92', source: 'review' },
        { input: 'Could be better.', output: 'neutral', confidence: '0.68', source: 'feedback' }
      ],
      isNewUpload: true,
      statistics: {
        total_rows: 100,
        total_columns: 4,
        file_size_kb: 25.6,
        preview_rows: 5,
        has_required_columns: true
      }
    };

    return {
      preview: mockPreview,
      usedBackend: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use previewCsvFile instead
 */
export function simulateFilePreview(file: File) {
  // Mock CSV data for backward compatibility
  const mockPreview = {
    filename: file.name,
    columns: ['input', 'output', 'confidence', 'source'],
    data: [
      { input: 'This product is amazing!', output: 'positive', confidence: 0.95, source: 'review' },
      { input: 'I hate this service.', output: 'negative', confidence: 0.89, source: 'feedback' },
      { input: 'The quality is okay.', output: 'neutral', confidence: 0.76, source: 'review' },
      { input: 'Best purchase ever!', output: 'positive', confidence: 0.92, source: 'review' },
      { input: 'Could be better.', output: 'neutral', confidence: 0.68, source: 'feedback' },
      { input: 'Terrible experience.', output: 'negative', confidence: 0.94, source: 'review' },
      { input: 'Highly recommended!', output: 'positive', confidence: 0.87, source: 'review' }
    ],
    isNewUpload: true
  };

  return mockPreview;
}

/**
 * Validates that the preview data has required "input" and "output" columns
 * Now works with both API response and legacy format
 */
export function validatePreviewColumns(previewData: any): string[] {
  const errors: string[] = [];
  
  if (!previewData || !previewData.columns) {
    errors.push('No column information available');
    return errors;
  }

  const hasInputColumn = previewData.columns.includes('input');
  const hasOutputColumn = previewData.columns.includes('output');

  if (!hasInputColumn) {
    errors.push('Missing required "input" column');
  }

  if (!hasOutputColumn) {
    errors.push('Missing required "output" column');
  }

  return errors;
}

/**
 * Validates CSV file before processing
 */
export function validateCsvFile(file: File): string[] {
  const errors: string[] = [];
  
  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errors.push('Only CSV files are supported');
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }
  
  // Check if file is empty
  if (file.size === 0) {
    errors.push('File appears to be empty');
  }
  
  return errors;
}
