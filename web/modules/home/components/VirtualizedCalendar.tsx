import React, { useMemo, useCallback } from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { getItemsForDate, getItemsForWeek, getItemsForMonth } from '../utils/dataAggregator';

interface VirtualizedCalendarProps {
  items: CalendarItem[];
  selectedDate: Date;
  view: 'daily' | 'weekly' | 'monthly';
  onItemSelect: (item: CalendarItem) => void;
  onDateSelect: (date: Date) => void;
  onViewChange: (view: 'daily' | 'weekly' | 'monthly') => void;
}

const VirtualizedCalendar: React.FC<VirtualizedCalendarProps> = ({
  items,
  selectedDate,
  view,
  onItemSelect,
  onDateSelect,
  onViewChange,
}) => {
  // Memoized data calculations
  const calendarData = useMemo(() => {
    switch (view) {
      case 'daily':
        return getItemsForDate(items, selectedDate);
      case 'weekly':
        return getItemsForWeek(items, selectedDate);
      case 'monthly':
        return getItemsForMonth(items, selectedDate);
      default:
        return [];
    }
  }, [items, selectedDate, view]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string, callback: (results: CalendarItem[]) => void) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const results = items.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
          );
          callback(results);
        }, 300);
      };
    })(),
    [items]
  );

  // Lazy loading for calendar items
  const renderCalendarItems = useCallback((items: CalendarItem[], limit: number = 50) => {
    return items.slice(0, limit).map((item) => (
      <div
        key={item.id}
        onClick={() => onItemSelect(item)}
        className="p-2 border border-gray-200 rounded mb-2 cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <div className={`w-3 h-3 rounded-full bg-${item.color} flex-shrink-0`} />
          <span className="text-sm font-medium truncate flex-1 min-w-0">{item.title}</span>
          {item.completed && (
            <Icons.CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}
        </div>
      </div>
    ));
  }, [onItemSelect]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  // Error boundary component
  const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className="text-center py-8">
      <Icons.AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={resetError}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  // Optimized calendar day component
  const CalendarDay = React.memo(({ 
    date, 
    items, 
    isToday, 
    isSelected 
  }: {
    date: Date;
    items: CalendarItem[];
    isToday: boolean;
    isSelected: boolean;
  }) => (
    <div
      onClick={() => onDateSelect(date)}
      className={`
        p-2 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200
        ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        hover:border-gray-300 hover:shadow-sm
      `}
    >
      <div className="text-sm font-medium text-gray-900 mb-1">
        {date.getDate()}
      </div>
      <div className="space-y-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onItemSelect(item);
            }}
            className="text-xs p-1 rounded bg-gray-100 truncate min-w-0"
          >
            {item.title}
          </div>
        ))}
        {items.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            +{items.length - 3} more
          </div>
        )}
      </div>
    </div>
  ));

  CalendarDay.displayName = 'CalendarDay';

  // View toggle component
  const ViewToggle = () => (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      {(['daily', 'weekly', 'monthly'] as const).map((viewOption) => (
        <button
          key={viewOption}
          onClick={() => onViewChange(viewOption)}
          className={`
            px-3 py-1 text-sm rounded-md transition-colors
            ${view === viewOption 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
        <ViewToggle />
      </div>

      <div className="space-y-4">
        {view === 'daily' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            {calendarData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icons.CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No items for this date</p>
              </div>
            ) : (
              <div className="space-y-2">
                {renderCalendarItems(calendarData)}
              </div>
            )}
          </div>
        )}

        {view === 'weekly' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Week of {selectedDate.toLocaleDateString()}
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, index) => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - date.getDay() + index);
                const dayItems = getItemsForDate(items, date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();

                return (
                  <CalendarDay
                    key={index}
                    date={date}
                    items={dayItems}
                    isToday={isToday}
                    isSelected={isSelected}
                  />
                );
              })}
            </div>
          </div>
        )}

        {view === 'monthly' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </h3>
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {Array.from({ length: 35 }).map((_, index) => {
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                date.setDate(date.getDate() - date.getDay() + index);
                const dayItems = getItemsForDate(items, date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();

                if (!isCurrentMonth) {
                  return <div key={index} className="p-2" />;
                }

                return (
                  <CalendarDay
                    key={index}
                    date={date}
                    items={dayItems}
                    isToday={isToday}
                    isSelected={isSelected}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedCalendar; 