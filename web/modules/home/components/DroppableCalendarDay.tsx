import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';

interface DroppableCalendarDayProps {
  date: Date;
  items: CalendarItem[];
  isToday: boolean;
  isSelected: boolean;
  onDateSelect: (date: Date) => void;
  onItemSelect: (item: CalendarItem) => void;
  selectedItem: CalendarItem | null;
  children?: React.ReactNode;
}

const DroppableCalendarDay: React.FC<DroppableCalendarDayProps> = ({
  date,
  items,
  isToday,
  isSelected,
  onDateSelect,
  onItemSelect,
  selectedItem,
  children,
}) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `day-${date.toISOString().split('T')[0]}`,
    data: {
      date,
      type: 'calendar-day',
    },
  });

  const isDragOver = isOver && active?.data.current?.type === 'calendar-item';

  const style = {
    transform: CSS.Transform.toString({ x: 0, y: 0 }),
  };

  const dayNumber = date.getDate();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onDateSelect(date)}
      className={`
        relative min-h-[120px] p-2 border border-gray-200 rounded-lg transition-all duration-200
        ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDragOver ? 'bg-green-50 border-green-300 shadow-lg' : ''}
        hover:border-gray-300 hover:shadow-sm cursor-pointer
      `}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-medium ${
            isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {dayNumber}
          </span>
          <span className="text-xs text-gray-500">{dayName}</span>
        </div>
        
        {/* Item Count Badge */}
        {items.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {/* Drop Zone Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-green-100 bg-opacity-50 border-2 border-dashed border-green-400 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Icons.CalendarIcon className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-green-700 font-medium">Drop here</p>
          </div>
        </div>
      )}

      {/* Calendar Items */}
      <div className="space-y-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              onItemSelect(item);
            }}
            className={`
              p-1 rounded text-xs cursor-pointer transition-colors
              ${selectedItem?.id === item.id 
                ? 'bg-blue-100 border border-blue-300' 
                : 'hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center space-x-1 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                item.color === 'blue-500' ? 'bg-blue-500' :
                item.color === 'green-500' ? 'bg-green-500' :
                item.color === 'purple-500' ? 'bg-purple-500' :
                item.color === 'red-500' ? 'bg-red-500' :
                item.color === 'yellow-500' ? 'bg-yellow-500' :
                item.color === 'indigo-500' ? 'bg-indigo-500' :
                item.color === 'pink-500' ? 'bg-pink-500' : 'bg-gray-500'
              }`} />
              <span className="truncate font-medium text-gray-700 flex-1 min-w-0">
                {item.title}
              </span>
              {item.completed && (
                <Icons.CheckIcon className="w-3 h-3 text-green-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
        
        {items.length > 3 && (
          <div className="text-xs text-gray-500 text-center py-1">
            +{items.length - 3} more
          </div>
        )}
      </div>

      {/* Custom Content */}
      {children}
    </div>
  );
};

export default DroppableCalendarDay; 