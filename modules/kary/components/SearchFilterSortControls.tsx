import React, { useState } from 'react';
import { SearchIcon, FilterIcon, SortIcon, ChevronDownIcon, XIcon } from '~/components/Icons';
import { SortOption, SortDirection, FilterOption } from '../karyStore';

interface SearchFilterSortControlsProps {
  searchQuery: string;
  filterOption: FilterOption;
  sortOption: SortOption;
  sortDirection: SortDirection;
  onSearchChange: (query: string) => void;
  onFilterChange: (option: FilterOption) => void;
  onSortChange: (option: SortOption) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
}

const SearchFilterSortControls: React.FC<SearchFilterSortControlsProps> = ({
  searchQuery,
  filterOption,
  sortOption,
  sortDirection,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onSortDirectionChange,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All tasks' },
    { value: 'uncompleted', label: 'Uncompleted' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'dueToday', label: 'Due today' },
    { value: 'dueThisWeek', label: 'Due this week' },
  ] as const;

  const sortOptions = [
    { value: 'created', label: 'Created date' },
    { value: 'dueDate', label: 'Due date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
  ] as const;

  const getFilterLabel = (value: FilterOption) => {
    return filterOptions.find(option => option.value === value)?.label || 'All tasks';
  };

  const getSortLabel = (value: SortOption) => {
    return sortOptions.find(option => option.value === value)?.label || 'Created date';
  };

  const getFilterTooltip = () => {
    const label = getFilterLabel(filterOption);
    return `Filter: ${label}`;
  };

  const getSortTooltip = () => {
    const label = getSortLabel(sortOption);
    const direction = sortDirection === 'asc' ? 'ascending' : 'descending';
    return `Sort: ${label} (${direction})`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search - Icon only, expands on click */}
      <div className="relative">
        {!showSearch ? (
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title={searchQuery ? `Search: "${searchQuery}"` : 'Search tasks'}
          >
            <SearchIcon className="w-4 h-4" />
          </button>
        ) : (
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
              onBlur={() => {
                // Keep search open if there's a query, close if empty
                if (!searchQuery) {
                  setShowSearch(false);
                }
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter - Icon only with dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            filterOption !== 'all' 
              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={getFilterTooltip()}
        >
          <FilterIcon className="w-4 h-4" />
        </button>

        {showFilterDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowFilterDropdown(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                Filter by
              </div>
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onFilterChange(option.value);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                    filterOption === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  {filterOption === option.value && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  )}
                  {filterOption !== option.value && (
                    <div className="w-2 h-2"></div>
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sort - Icon only with dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            sortOption !== 'created' 
              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
          title={getSortTooltip()}
        >
          <SortIcon className="w-4 h-4" />
        </button>

        {showSortDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSortDropdown(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                Sort by
              </div>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                    sortOption === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                  }`}
                >
                  {sortOption === option.value && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  )}
                  {sortOption !== option.value && (
                    <div className="w-2 h-2"></div>
                  )}
                  {option.label}
                </button>
              ))}
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-t border-gray-100">
                Direction
              </div>
              <button
                onClick={() => {
                  onSortDirectionChange('asc');
                  setShowSortDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  sortDirection === 'asc' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                {sortDirection === 'asc' && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                )}
                {sortDirection !== 'asc' && (
                  <div className="w-2 h-2"></div>
                )}
                Ascending
              </button>
              <button
                onClick={() => {
                  onSortDirectionChange('desc');
                  setShowSortDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  sortDirection === 'desc' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
              >
                {sortDirection === 'desc' && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                )}
                {sortDirection !== 'desc' && (
                  <div className="w-2 h-2"></div>
                )}
                Descending
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchFilterSortControls;
