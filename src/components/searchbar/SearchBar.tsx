'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Filter, ChevronDown, Check } from 'lucide-react';
import { Button } from '../ui';

export interface SearchFilter {
  key: string;
  label: string;
  options: Array<{ value: string; label: string; count?: number }>;
  type?: 'single' | 'multiple';
  icon?: React.ReactNode;
}

export interface SearchBarProps {
  value?: string;
  onSearch?: (query: string) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  filters?: SearchFilter[];
  activeFilters?: Record<string, string | string[]>;
  onFilterChange?: (filters: Record<string, string | string[]>) => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  showClearButton?: boolean;
  debounceMs?: number;
  maxSuggestions?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onSearch,
  onChange,
  placeholder = 'Search...',
  filters = [],
  activeFilters = {},
  onFilterChange,
  suggestions = [],
  onSuggestionClick,
  loading = false,
  disabled = false,
  autoFocus = false,
  className = '',
  size = 'md',
  variant = 'default',
  showClearButton = true,
  debounceMs = 300,
  maxSuggestions = 5
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Debounced search handler
  const debounceTimeout = React.useRef<NodeJS.Timeout>();
  const handleDebouncedSearch = useCallback((query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      onSearch?.(query);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
    handleDebouncedSearch(newValue);
    setShowSuggestions(true);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
    onSearch?.('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    onChange?.(suggestion);
    onSuggestionClick?.(suggestion);
    setShowSuggestions(false);
  };

  const handleFilterChange = (filterKey: string, optionValue: string) => {
    if (!onFilterChange) return;

    const filter = filters.find(f => f.key === filterKey);
    if (!filter) return;

    const currentValues = activeFilters[filterKey];
    let newValues: string | string[];

    if (filter.type === 'multiple') {
      const currentArray = Array.isArray(currentValues) ? currentValues : [];
      if (currentArray.includes(optionValue)) {
        newValues = currentArray.filter(v => v !== optionValue);
      } else {
        newValues = [...currentArray, optionValue];
      }
    } else {
      newValues = currentValues === optionValue ? '' : optionValue;
    }

    onFilterChange({
      ...activeFilters,
      [filterKey]: newValues
    });
  };

  const clearFilter = (filterKey: string) => {
    if (!onFilterChange) return;
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    onFilterChange(newFilters);
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!localValue.trim()) return [];
    return suggestions
      .filter(s => s.toLowerCase().includes(localValue.toLowerCase()))
      .slice(0, maxSuggestions);
  }, [suggestions, localValue, maxSuggestions]);

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(v => 
    Array.isArray(v) ? v.length > 0 : v
  ).length;

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className={`
        flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
        rounded-lg transition-all duration-200 ${sizeClasses[size]}
        ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400 dark:hover:border-gray-500'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <Search className={`ml-3 text-gray-400 ${iconSizeClasses[size]}`} />
        
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (localValue) setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch?.(localValue);
              setShowSuggestions(false);
            }
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="flex-1 px-3 py-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="mr-2">
            <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${iconSizeClasses[size]}`} />
          </div>
        )}

        {/* Clear Button */}
        {showClearButton && localValue && !disabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="mr-1 p-1"
          >
            <X className={iconSizeClasses[size]} />
          </Button>
        )}

        {/* Filters Toggle */}
        {filters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`mr-2 ${activeFilterCount > 0 ? 'text-blue-600 dark:text-blue-400' : ''}`}
          >
            <Filter className={iconSizeClasses[size]} />
            {activeFilterCount > 0 && (
              <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1 rounded">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`ml-1 w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              <Search className="inline w-3 h-3 mr-2 text-gray-400" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-40 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    {filter.icon && <span className="mr-2">{filter.icon}</span>}
                    {filter.label}
                  </label>
                  {activeFilters[filter.key] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter(filter.key)}
                      className="text-xs p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filter.options.map((option) => {
                    const isActive = filter.type === 'multiple'
                      ? Array.isArray(activeFilters[filter.key]) && (activeFilters[filter.key] as string[]).includes(option.value)
                      : activeFilters[filter.key] === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange(filter.key, option.value)}
                        className={`
                          w-full flex items-center justify-between px-2 py-1 text-sm rounded transition-colors
                          ${isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        <span className="flex items-center">
                          {isActive && <Check className="w-3 h-3 mr-2" />}
                          {option.label}
                        </span>
                        {option.count !== undefined && (
                          <span className="text-xs text-gray-500">
                            {option.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {variant === 'detailed' && activeFilterCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, values]) => {
            if (!values || (Array.isArray(values) && values.length === 0)) return null;
            
            const filter = filters.find(f => f.key === key);
            if (!filter) return null;

            const valueArray = Array.isArray(values) ? values : [values];
            
            return valueArray.map((value) => {
              const option = filter.options.find(o => o.value === value);
              if (!option) return null;

              return (
                <span
                  key={`${key}-${value}`}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                >
                  {filter.label}: {option.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange(key, value)}
                    className="ml-1 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </span>
              );
            });
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
