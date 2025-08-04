'use client'

import React from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button, LoadingSkeleton } from '../ui';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  onRowClick?: (item: T, index: number) => void;
  selectedRows?: string[];
  onRowSelect?: (key: string) => void;
  rowKey?: string | ((item: T) => string);
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
}

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  sortBy,
  sortDirection = 'asc',
  onSort,
  onRowClick,
  selectedRows = [],
  onRowSelect,
  rowKey = 'id',
  emptyMessage = 'No data available',
  className = '',
  compact = false,
  stickyHeader = false,
  maxHeight
}: TableProps<T>) => {
  const getRowKey = (item: T) => {
    return typeof rowKey === 'function' ? rowKey(item) : item[rowKey];
  };

  const handleSort = (key: string) => {
    if (onSort && columns.find(col => col.key === key)?.sortable) {
      onSort(key);
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const containerClasses = [
    'border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden',
    className
  ].filter(Boolean).join(' ');

  const tableContainerClasses = [
    'overflow-auto',
    maxHeight ? `max-h-[${maxHeight}]` : ''
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="p-4">
          <LoadingSkeleton variant="rectangular" className="h-8 mb-4" />
          {Array.from({ length: 5 }).map((_, index) => (
            <LoadingSkeleton key={index} variant="rectangular" className="h-12 mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={tableContainerClasses}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className={`bg-gray-50 dark:bg-gray-700 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={`
                    px-${compact ? '3' : '6'} py-${compact ? '2' : '3'}
                    text-${column.align || 'left'} text-xs font-medium text-gray-500 dark:text-gray-400 
                    uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {(onRowSelect || onRowClick) && (
                <th className={`px-${compact ? '3' : '6'} py-${compact ? '2' : '3'} relative`}>
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (onRowSelect || onRowClick ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = getRowKey(item);
                const isSelected = selectedRows.includes(key);
                
                return (
                  <tr
                    key={key}
                    className={`
                      ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      transition-colors duration-150
                    `}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {columns.map((column) => {
                      const value = item[column.key];
                      const rendered = column.render ? column.render(value, item, index) : value;
                      
                      return (
                        <td
                          key={column.key}
                          className={`
                            px-${compact ? '3' : '6'} py-${compact ? '2' : '4'}
                            text-${column.align || 'left'} text-sm text-gray-900 dark:text-gray-100
                            whitespace-nowrap
                          `}
                        >
                          {rendered}
                        </td>
                      );
                    })}
                    {(onRowSelect || onRowClick) && (
                      <td className={`px-${compact ? '3' : '6'} py-${compact ? '2' : '4'} text-right text-sm font-medium`}>
                        {onRowSelect && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowSelect(key);
                            }}
                            icon={MoreHorizontal}
                            className="h-auto w-auto p-1"
                          />
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
