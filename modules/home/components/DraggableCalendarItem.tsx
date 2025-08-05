import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';

interface DraggableCalendarItemProps {
  item: CalendarItem;
  onClick: (item: CalendarItem) => void;
  isSelected: boolean;
}

const DraggableCalendarItem: React.FC<DraggableCalendarItemProps> = ({
  item,
  onClick,
  isSelected,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: {
      item,
      type: 'calendar-item',
    },
  });

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
      case CalendarItemType.HABIT_LOG:
        return 'Habit Log';
      case CalendarItemType.LOG:
        return 'Journal';
      default:
        return 'Item';
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(item)}
      className={`
        relative p-3 rounded-lg border cursor-move transition-all duration-200
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${isDragging ? 'z-50' : ''}
      `}
    >
      {/* Drag Handle */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Icons.GripVerticalIcon className="w-3 h-3 text-gray-400" />
      </div>

      {/* Item Content */}
      <div className="flex items-start space-x-3">
        {/* Color Indicator */}
        <div className={`w-3 h-3 rounded-full ${getItemColor(item.color)} mt-1 flex-shrink-0`} />
        
        {/* Icon */}
        <div className="flex items-center text-gray-500 flex-shrink-0">
          {getItemIcon(item.icon)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {item.title}
          </h4>
          {item.description && (
            <p className="text-xs text-gray-500 truncate mt-1">
              {item.description}
            </p>
          )}
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {getTypeLabel(item.type)}
            </span>
            {item.completed && (
              <Icons.CheckIcon className="w-3 h-3 text-green-500" />
            )}
          </div>
        </div>
      </div>

      {/* Time indicator (if available) */}
      {item.date && (
        <div className="mt-2 text-xs text-gray-400">
          {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};

export default DraggableCalendarItem; 