'use client'

import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { Button, StatusBadge } from '../ui';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  uploadedFiles?: Array<{
    file: File;
    status: 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
  }>;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  label,
  hint,
  error,
  required = false,
  onFileSelect,
  onFileRemove,
  uploadedFiles = [],
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Validate file count
    if (!multiple && files.length > 1) {
      return;
    }
    
    if (uploadedFiles.length + files.length > maxFiles) {
      return;
    }

    // Validate file sizes
    const validFiles = files.filter(file => file.size <= maxSize);
    
    if (validFiles.length > 0 && onFileSelect) {
      onFileSelect(validFiles);
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const dropzoneClasses = [
    'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer',
    isDragOver && !disabled
      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
      : error
      ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
    disabled ? 'cursor-not-allowed opacity-50' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={dropzoneClasses}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {accept && `Accepted formats: ${accept}`}
          {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
          {multiple && ` • Max files: ${maxFiles}`}
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((fileInfo, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(fileInfo.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {fileInfo.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(fileInfo.file.size)}
                  </p>
                  {fileInfo.error && (
                    <p className="text-xs text-red-500">{fileInfo.error}</p>
                  )}
                </div>
                {fileInfo.status === 'uploading' && fileInfo.progress !== undefined && (
                  <div className="w-20">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${fileInfo.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {onFileRemove && fileInfo.status !== 'uploading' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove(index);
                  }}
                  className="h-auto w-auto p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {(error || hint) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {hint && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
