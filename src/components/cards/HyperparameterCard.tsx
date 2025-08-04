'use client'

import React from 'react';
import { Settings } from 'lucide-react';
import { StatusBadge } from '../ui';

interface HyperparameterCardProps {
  title: string;
  description?: string;
  value: any;
  defaultValue?: any;
  type: 'number' | 'select' | 'boolean' | 'range';
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: any) => void;
  disabled?: boolean;
  isModified?: boolean;
  className?: string;
}

export const HyperparameterCard: React.FC<HyperparameterCardProps> = ({
  title,
  description,
  value,
  defaultValue,
  type,
  options,
  min,
  max,
  step,
  onChange,
  disabled = false,
  isModified = false,
  className = ''
}) => {
  const renderInput = () => {
    switch (type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );
      
      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value}
              min={min}
              max={max}
              step={step}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{min}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{value}</span>
              <span>{max}</span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Settings className="w-4 h-4 text-gray-400 mr-2" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {isModified && (
          <StatusBadge variant="warning" size="sm">
            Modified
          </StatusBadge>
        )}
      </div>

      <div className="space-y-2">
        {renderInput()}
        
        {defaultValue !== undefined && defaultValue !== value && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Default: {defaultValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default HyperparameterCard;
