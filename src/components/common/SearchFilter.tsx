import React, { useState, useEffect } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  placeholder?: string;
  onSearchChange: (value: string) => void;
  onFiltersChange?: (filters: Record<string, string[]>) => void;
  filterGroups?: FilterGroup[];
  className?: string;
  debounceMs?: number;
}

/**
 * Reusable search and filter component with debouncing
 * @param placeholder - Search input placeholder text
 * @param onSearchChange - Callback when search value changes (debounced)
 * @param onFiltersChange - Callback when filters change
 * @param filterGroups - Array of filter groups with options
 * @param className - Additional CSS classes
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 */
const SearchFilter: React.FC<SearchFilterProps> = ({
  placeholder = 'Search...',
  onSearchChange,
  onFiltersChange,
  filterGroups = [],
  className = '',
  debounceMs = 300,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, onSearchChange]);

  const handleClearSearch = () => {
    setSearchValue('');
    onSearchChange('');
  };

  const handleFilterToggle = (groupId: string, value: string) => {
    setSelectedFilters(prev => {
      const groupFilters = prev[groupId] || [];
      const newGroupFilters = groupFilters.includes(value)
        ? groupFilters.filter(v => v !== value)
        : [...groupFilters, value];

      const newFilters = {
        ...prev,
        [groupId]: newGroupFilters,
      };

      // Remove empty filter groups
      if (newGroupFilters.length === 0) {
        delete newFilters[groupId];
      }

      if (onFiltersChange) {
        onFiltersChange(newFilters);
      }

      return newFilters;
    });
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  const activeFilterCount = Object.values(selectedFilters).flat().length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative flex gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-12 pr-10 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            aria-label={placeholder}
          />
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        {filterGroups.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black ${
              showFilters || activeFilterCount > 0
                ? 'bg-purple-500 border-purple-500 text-white'
                : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            aria-label="Toggle filters"
            aria-expanded={showFilters}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full text-xs font-bold flex items-center justify-center"
                  aria-label={`${activeFilterCount} active filters`}
                >
                  {activeFilterCount}
                </span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && filterGroups.length > 0 && (
        <div
          className="p-6 bg-slate-900/80 border border-slate-700 rounded-lg backdrop-blur-sm"
          role="region"
          aria-label="Filter options"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filter Options</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                aria-label="Clear all filters"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterGroups.map(group => (
              <div key={group.id}>
                <h4 className="text-sm font-medium text-slate-400 mb-3">{group.label}</h4>
                <div className="space-y-2">
                  {group.options.map(option => {
                    const isSelected = selectedFilters[group.id]?.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleFilterToggle(group.id, option.value)}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
                          aria-label={option.label}
                        />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                          {option.label}
                          {option.count !== undefined && (
                            <span className="text-slate-500 ml-1">({option.count})</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
