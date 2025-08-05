'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'running' | 'completed' | 'failed' | 'queued' | 'created';
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

const statusBadgeVariants = cva(
  'inline-flex items-center font-medium rounded-full transition-colors',
  {
    variants: {
      variant: {
        success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        created: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

const dotVariants = cva('rounded-full mr-2', {
  variants: {
    variant: {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      neutral: 'bg-gray-500',
      running: 'bg-blue-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      queued: 'bg-yellow-500',
      created: 'bg-gray-500',
    },
    size: {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    },
  },
  defaultVariants: {
    variant: 'neutral',
    size: 'md',
  },
});

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  variant: StatusBadgeVariant;
  size?: StatusBadgeSize;
  showDot?: boolean;
  animate?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, size, showDot = false, animate = false, children, ...props }, ref) => {
    return (
      <span
        className={cn(
          statusBadgeVariants({ variant, size }),
          animate && 'animate-pulse',
          className
        )}
        ref={ref}
        {...props}
      >
        {showDot && (
          <span
            className={cn(
              dotVariants({ variant, size }),
              animate && 'animate-pulse'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export { StatusBadge, statusBadgeVariants };
export default StatusBadge;
