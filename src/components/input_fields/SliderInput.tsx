'use client'

import React, { forwardRef } from 'react';

interface SliderInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  showValue?: boolean;
  showMinMax?: boolean;
  unit?: string;
  marks?: Array<{ value: number; label: string }>;
  fullWidth?: boolean;
}

export const SliderInput = forwardRef<HTMLInputElement, SliderInputProps>(({
  label,
  error,
  hint,
  required = false,
  showValue = true,
  showMinMax = true,
  unit = '',
  marks,
  fullWidth = true,
  min = 0,
  max = 100,
  step = 1,
  value,
  className = '',
  ...props
}, ref) => {
  const containerId = props.id || `slider-${Math.random().toString(36).substr(2, 9)}`;

  const formatValue = (val: string | number | readonly string[] | undefined) => {
    if (val === undefined || val === '') return '';
    return `${val}${unit}`;
  };

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
      
      <div className="space-y-2">
        <input
          {...props}
          ref={ref}
          id={containerId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider ${className}`}
        />
        
        {(showValue || showMinMax) && (
          <div className="flex justify-between items-center text-sm">
            {showMinMax && (
              <span className="text-gray-500 dark:text-gray-400">
                {formatValue(min)}
              </span>
            )}
            {showValue && (
              <span className="font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {formatValue(value)}
              </span>
            )}
            {showMinMax && (
              <span className="text-gray-500 dark:text-gray-400">
                {formatValue(max)}
              </span>
            )}
          </div>
        )}
        
        {marks && (
          <div className="relative">
            {marks.map((mark) => {
              const percentage = ((Number(mark.value) - Number(min)) / (Number(max) - Number(min))) * 100;
              return (
                <div
                  key={mark.value}
                  className="absolute text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2"
                  style={{ left: `${percentage}%` }}
                >
                  {mark.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
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
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider:focus::-webkit-slider-thumb {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
});

SliderInput.displayName = 'SliderInput';

export default SliderInput;
