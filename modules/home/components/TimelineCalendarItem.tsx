import React from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';
import { calculateHabitCompletionForDate } from '../utils/dataAggregator';
import { useAbhyasaStore } from '~/modules/abhyasa/abhyasaStore';

interface TimelineCalendarItemProps {
  item: CalendarItem & { displayDate?: Date };
  onClick: (item: CalendarItem) => void;
  isSelected: boolean;
}

const TimelineCalendarItem: React.FC<TimelineCalendarItemProps> = ({
  item,
  onClick,
  isSelected,
}) => {
  const abhyasaStore = useAbhyasaStore();
  
  // Calculate completion status dynamically for habits
  const isCompleted = React.useMemo(() => {
    if (item.type === CalendarItemType.HABIT) {
      const habit = item.originalData;
      return calculateHabitCompletionForDate(habit, abhyasaStore.habitLogs, item.date);
    }
    return item.completed;
  }, [item, abhyasaStore.habitLogs]);
  const getItemIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.CircleIcon;
    return <IconComponent className="w-4 h-4" />;
  };



  const getTypeLabel = (type: CalendarItemType) => {
    switch (type) {
      case CalendarItemType.TASK:
        return 'Task';
      case CalendarItemType.HABIT:
        return 'Habit';
      case CalendarItemType.HABIT_LOG:
        return 'Habit';
      case CalendarItemType.LOG:
        return 'Journal';
      default:
        return 'Item';
    }
  };

  const getTypeIcon = (type: CalendarItemType) => {
    switch (type) {
      case CalendarItemType.TASK:
        return <Icons.CheckSquareIcon className="w-4 h-4" />;
      case CalendarItemType.HABIT:
        return <Icons.TargetIcon className="w-4 h-4" />;
      case CalendarItemType.HABIT_LOG:
        return <Icons.HeartIcon className="w-4 h-4" />;
      case CalendarItemType.LOG:
        return <Icons.Edit3Icon className="w-4 h-4" />;
      default:
        return <Icons.CircleIcon className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date, type: CalendarItemType, originalData?: any) => {
    // For tasks, only show time if it has a specific time (not just date)
    if (type === CalendarItemType.TASK && originalData) {
      const task = originalData as any;
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        // Check if the time is set to midnight (00:00:00) - means only date was set
        if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0 && dueDate.getSeconds() === 0) {
          return null; // Don't show time for date-only tasks
        }
      }
    }
    
    // For habits, always show time since they're scheduled at specific reminder times
    if (type === CalendarItemType.HABIT) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div
      onClick={() => onClick(item)}
      className={`
        p-4 rounded-lg border transition-all duration-200 cursor-pointer
        ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex items-center text-gray-500 flex-shrink-0">
          {getItemIcon(item.icon)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </h4>
            </div>
            <div className="flex items-center space-x-2">
              {/* Time in top right - only show if not null */}
              {formatTime(item.date, item.type, item.originalData) && (
                <span className="text-xs text-gray-500">
                  {formatTime(item.date, item.type, item.originalData)}
                </span>
              )}
              {/* Priority for tasks */}
              {item.type === CalendarItemType.TASK && item.originalData?.priority && (
                <Icons.FlagIcon className={`w-3 h-3 ${
                  item.originalData.priority === 1 ? 'text-red-600' :
                  item.originalData.priority === 2 ? 'text-orange-500' :
                  item.originalData.priority === 3 ? 'text-blue-500' :
                  'text-gray-500'
                }`} />
              )}
              {/* Type icon only */}
              {getTypeIcon(item.type)}
              {/* Completion status */}
              {isCompleted && (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Icons.CheckIcon className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Focus Area for Habits */}
          {item.type === CalendarItemType.HABIT ? (
            <div className="flex items-center space-x-2 mt-2">
              <Icons.TargetIcon className="w-3 h-3 text-purple-500" />
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                {item.description || 'Wellness'}
              </span>
            </div>
          ) : null}

          {/* Lists for Tasks - only show if not in description */}
          {item.type === CalendarItemType.TASK && (
            <div className="flex items-center space-x-2 mt-2">
              <Icons.ListIcon className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {item.description || 'Inbox'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineCalendarItem; 