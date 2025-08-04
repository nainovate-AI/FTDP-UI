'use client'

import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

export type FormInputVariant = 'default' | 'filled' | 'outlined';
export type FormInputSize = 'sm' | 'md' | 'lg';
export type FormInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  variant?: FormInputVariant;
  size?: FormInputSize;
  type?: FormInputType;
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  variant = 'default',
  size = 'md',
  type = 'text',
  label,
  error,
  success,
  hint,
  required = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500',
    filled: 'border-0 bg-gray-100 dark:bg-gray-700 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:ring-blue-500 focus:border-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-lg'
  };

  const stateClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : success
    ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
    : '';

  const disabledClasses = disabled || loading 
    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
    : '';

  const widthClasses = fullWidth ? 'w-full' : '';

  const inputClasses = [
    baseClasses,
    stateClasses || variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    widthClasses,
    Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '',
    className
  ].filter(Boolean).join(' ');

  const containerId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={containerId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          {...props}
          ref={ref}
          id={containerId}
          type={type}
          disabled={disabled || loading}
          className={inputClasses}
        />
        
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
          </div>
        )}
        
        {Icon && iconPosition === 'right' && !loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      
      {(error || success || hint) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && !error && (
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          )}
          {hint && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

// Textarea component
interface FormTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: FormInputVariant;
  size?: FormInputSize;
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  rows?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(({
  variant = 'default',
  size = 'md',
  label,
  error,
  success,
  hint,
  required = false,
  loading = false,
  fullWidth = true,
  rows = 4,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-vertical';
  
  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500',
    filled: 'border-0 bg-gray-100 dark:bg-gray-700 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent focus:ring-blue-500 focus:border-blue-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-lg'
  };

  const stateClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : success
    ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
    : '';

  const disabledClasses = disabled || loading 
    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed' 
    : '';

  const widthClasses = fullWidth ? 'w-full' : '';

  const textareaClasses = [
    baseClasses,
    stateClasses || variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    widthClasses,
    className
  ].filter(Boolean).join(' ');

  const containerId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={containerId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          {...props}
          ref={ref}
          id={containerId}
          rows={rows}
          disabled={disabled || loading}
          className={textareaClasses}
        />
        
        {loading && (
          <div className="absolute top-3 right-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
          </div>
        )}
      </div>
      
      {(error || success || hint) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {success && !error && (
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          )}
          {hint && !error && !success && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';

export default FormInput;
