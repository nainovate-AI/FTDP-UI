'use client'

import React from 'react';
import { Table, TableColumn } from './Table';
import { StatusBadge, ProgressBar } from '../ui';
import { Calendar, User, Eye } from 'lucide-react';

interface JobsTableProps {
  jobs: Array<{
    uid: string;
    name: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'created';
    progress?: number;
    createdAt: string;
    owner?: { email: string };
    model?: string;
    dataset?: string;
  }>;
  loading?: boolean;
  onJobClick?: (job: any) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  compact?: boolean;
  className?: string;
}

export const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  loading = false,
  onJobClick,
  sortBy,
  sortDirection,
  onSort,
  compact = false,
  className = ''
}) => {
  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Job Name',
      sortable: true,
      width: '25%',
      render: (value) => (
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {value}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '15%',
      render: (value) => (
        <StatusBadge variant={value} size="sm" animate={value === 'running'}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </StatusBadge>
      )
    },
    {
      key: 'progress',
      label: 'Progress',
      width: '20%',
      render: (value, item) => {
        if (value === undefined || value === null) return '-';
        return (
          <ProgressBar
            value={value}
            variant={item.status === 'running' ? 'running' : item.status === 'completed' ? 'success' : 'default'}
            size="sm"
            showPercentage={true}
          />
        );
      }
    },
    {
      key: 'model',
      label: 'Model',
      width: '15%',
      render: (value) => value || '-'
    },
    {
      key: 'dataset',
      label: 'Dataset',
      width: '15%',
      render: (value) => value || '-'
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      width: '10%',
      render: (value) => (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  if (!compact) {
    columns.push({
      key: 'owner',
      label: 'Owner',
      width: '15%',
      render: (value) => value ? (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <User className="w-3 h-3 mr-1" />
          {value.email}
        </div>
      ) : '-'
    });
  }

  return (
    <Table
      columns={columns}
      data={jobs}
      loading={loading}
      onRowClick={onJobClick}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={onSort}
      rowKey="uid"
      emptyMessage="No jobs found"
      compact={compact}
      stickyHeader={true}
      className={className}
    />
  );
};

export default JobsTable;
