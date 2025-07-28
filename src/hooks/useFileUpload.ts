import { useState } from 'react';
import { previewCsvFile, validateCsvFile } from '../utils/filePreviewUtils';

export function useFileUpload() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [usedBackend, setUsedBackend] = useState<boolean>(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationErrors = validateCsvFile(file);
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }
    
    setIsUploading(true);
    setPreviewError(null);
    
    try {
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 100);

      // Preview the CSV file using backend or fallback
      const result = await previewCsvFile(file);
      
      // Clear progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Store the results
      setUploadedFile(file);
      setPreviewData(result.preview);
      setUsedBackend(result.usedBackend);
      
      if (result.error) {
        setPreviewError(result.error);
      }
      
      // Auto-fill title from filename if not set
      if (!title) {
        const baseName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setTitle(baseName);
      }
      
      console.log(`CSV preview loaded using ${result.usedBackend ? 'FastAPI backend' : 'mock data'}`);
      
    } catch (error) {
      console.error('File upload error:', error);
      setPreviewError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Clear progress after delay
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewData(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setIsUploading(false);
    setPreviewError(null);
    setUsedBackend(false);
  };

  return {
    uploadedFile,
    uploadProgress,
    isUploading,
    previewData,
    title,
    description,
    previewError,
    usedBackend,
    setTitle,
    setDescription,
    setPreviewData,
    handleFileUpload,
    resetUpload,
  };
}
