import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Stat } from '../types';

// Welcome Panel Component
export const WelcomePanel: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-12 rounded-xl border border-gray-200 dark:border-gray-700 
                    shadow-md text-center mb-8 transition-all duration-300">
      <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-300">
        Welcome back, Alex
      </h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 transition-colors duration-300">
        Manage your AI model finetuning jobs and monitor training progress
      </p>
    </div>
  );
};

// Stats Grid Component
interface StatsGridProps {
  stats: Stat[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const { theme } = useTheme();
  
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 
                     shadow-sm text-center transition-all duration-300 hover:shadow-md"
        >
          <h3 className="text-sm text-gray-500 dark:text-gray-400 m-0 mb-3 uppercase tracking-wider 
                         transition-colors duration-300">
            {stat.title}
          </h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">
            {stat.value}
          </div>
          {stat.change && (
            <div className={`text-sm font-medium transition-colors duration-300 ${
              stat.trend === 'up' 
                ? 'text-green-500' 
                : stat.trend === 'down' 
                ? 'text-red-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {stat.change}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
