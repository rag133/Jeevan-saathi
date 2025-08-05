import React, { useState } from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem, TimeSlot } from '../types';
import { CalendarItemType } from '../types';

interface TimeBlockProps {
  item: CalendarItem;
  onClick: (item: CalendarItem) => void;
  isSelected: boolean;
  onTimeUpdate?: (itemId: string, startTime: string, endTime: string) => void;
  conflicts?: CalendarItem[];
}

const TimeBlock: React.FC<TimeBlockProps> = ({
  item,
  onClick,
  isSelected,
  onTimeUpdate,
  conflicts = [],
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [startTime, setStartTime] = useState(item.startTime || '09:00');
  const [endTime, setEndTime] = useState(item.endTime || '10:00');

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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.max(0, endMinutes - startMinutes);
  };

  const hasTimeConflict = conflicts.length > 0;

  const handleTimeSave = () => {
    if (onTimeUpdate) {
      onTimeUpdate(item.id, startTime, endTime);
    }
    setIsEditing(false);
  };

  const handleTimeCancel = () => {
    setStartTime(item.startTime || '09:00');
    setEndTime(item.endTime || '10:00');
    setIsEditing(false);
  };

  const duration = calculateDuration(startTime, endTime);

  return (
    <div
      onClick={() => onClick(item)}
      className={`
        relative p-3 rounded-lg border transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${hasTimeConflict ? 'border-red-300 bg-red-50' : ''}
      `}
    >
      {/* Time Conflict Warning */}
      {hasTimeConflict && (
        <div className="absolute top-1 right-1">
          <Icons.AlertCircleIcon className="w-4 h-4 text-red-500" title={`${conflicts.length} time conflict(s)`} />
        </div>
      )}

      {/* Time Display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icons.ClockIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            {formatTime(startTime)} - {formatTime(endTime)}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {duration} min
        </span>
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

        {/* Time Edit Button */}
        {onTimeUpdate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title="Edit time"
          >
            <Icons.EditIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Time Conflicts */}
      {hasTimeConflict && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <div className="flex items-center space-x-1 text-red-700 mb-1">
            <Icons.AlertCircleIcon className="w-3 h-3" />
            <span className="font-medium">Time conflicts:</span>
          </div>
          <div className="space-y-1">
            {conflicts.slice(0, 2).map((conflict) => (
              <div key={conflict.id} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getItemColor(conflict.color)}`} />
                <span className="text-red-600 truncate">{conflict.title}</span>
                <span className="text-red-500">
                  {conflict.startTime && conflict.endTime 
                    ? `${formatTime(conflict.startTime)} - ${formatTime(conflict.endTime)}`
                    : 'No time set'
                  }
                </span>
              </div>
            ))}
            {conflicts.length > 2 && (
              <span className="text-red-500">+{conflicts.length - 2} more conflicts</span>
            )}
          </div>
        </div>
      )}

      {/* Time Edit Modal */}
      {isEditing && (
        <div className="absolute inset-0 bg-white border-2 border-blue-300 rounded-lg p-3 z-10">
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-900">Edit Time</h5>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Duration: {calculateDuration(startTime, endTime)} minutes
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleTimeSave}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleTimeCancel}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeBlock; 