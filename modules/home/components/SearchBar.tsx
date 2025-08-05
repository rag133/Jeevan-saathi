import React, { useState, useMemo } from 'react';
import * as Icons from '~/components/Icons';
import { useHomeStore } from '../homeStore';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';

interface SearchBarProps {
  onItemSelect: (item: CalendarItem) => void;
}

// Simple Search Icon component since it's not available in Icons.tsx
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const SearchBar: React.FC<SearchBarProps> = ({ onItemSelect }) => {
  const { calendarItems } = useHomeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tasks' | 'habits' | 'logs'>('all');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    let items = calendarItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );

    // Apply type filter
    if (selectedFilter !== 'all') {
      const typeMap = {
        tasks: CalendarItemType.TASK,
        habits: CalendarItemType.HABIT,
        logs: CalendarItemType.LOG,
      };
      items = items.filter(item => item.type === typeMap[selectedFilter]);
    }

    return items.slice(0, 10); // Limit to 10 results
  }, [calendarItems, searchQuery, selectedFilter]);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery('');
    }
  };

  const handleItemClick = (item: CalendarItem) => {
    onItemSelect(item);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const getItemIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.CircleIcon;
    return <IconComponent className="w-4 h-4" />;
  };

  const getItemColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue-500': 'bg-blue-500',
      'green-500': 'bg-green-500',
      'purple-500': 'bg-purple-500',
      'red-500': 'bg-red-500',
      'yellow-500': 'bg-yellow-500',
      'indigo-500': 'bg-indigo-500',
      'pink-500': 'bg-pink-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getTypeLabel = (type: CalendarItemType) => {
    switch (type) {
      case CalendarItemType.TASK:
        return 'Task';
      case CalendarItemType.HABIT:
        return 'Habit';
      case CalendarItemType.LOG:
        return 'Journal';
      default:
        return 'Item';
    }
  };

  return (
    <div className="relative">
      {/* Search Toggle Button */}
      <button
        onClick={handleSearchToggle}
        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors min-w-0"
      >
        <SearchIcon className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="hidden sm:inline">Search</span>
        <Icons.ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform flex-shrink-0 ${isSearchOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Search Panel */}
      {isSearchOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-96">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks, habits, journal entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { key: 'all', label: 'All', count: calendarItems.length },
              { key: 'tasks', label: 'Tasks', count: calendarItems.filter(i => i.type === CalendarItemType.TASK).length },
              { key: 'habits', label: 'Habits', count: calendarItems.filter(i => i.type === CalendarItemType.HABIT).length },
              { key: 'logs', label: 'Journal', count: calendarItems.filter(i => i.type === CalendarItemType.LOG).length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key as any)}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  selectedFilter === key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
                <span className="ml-1 text-xs text-gray-400">({count})</span>
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto">
            {searchQuery.trim() === '' ? (
              <div className="p-4 text-center text-gray-500">
                <SearchIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Start typing to search...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Icons.AlertCircleIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No items found</p>
                <p className="text-xs text-gray-400">Try different keywords or filters</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full p-3 hover:bg-gray-50 flex items-center text-left transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${getItemColor(item.color)} mr-3`} />
                    <div className="flex items-center mr-3 text-gray-500">
                      {getItemIcon(item.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 mr-2">
                          {getTypeLabel(item.type)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.date.toLocaleDateString()}
                        </span>
                        {item.completed && (
                          <Icons.CheckIcon className="w-3 h-3 text-green-500 ml-2" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Tips */}
          {searchQuery.trim() !== '' && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 Tip: Use filters to narrow down results by type
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 