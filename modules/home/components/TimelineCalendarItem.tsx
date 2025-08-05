import React from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';
import { calculateHabitCompletionForDate } from '../utils/dataAggregator';
import { useAbhyasaStore } from '~/modules/abhyasa/abhyasaStore';
import { useDainandiniStore } from '~/modules/dainandini/dainandiniStore';
import { LogType } from '~/modules/dainandini/types';


interface TimelineCalendarItemProps {
  item: CalendarItem & { displayDate?: Date };
  onClick: (item: CalendarItem) => void;
  isSelected: boolean;
}

// --- Display Components ---
const StarRatingDisplay: React.FC<{ rating?: number }> = ({ rating = 0 }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <Icons.StarIcon
        key={star}
        className={`w-3 h-3 text-yellow-400 ${rating >= star ? 'fill-current' : 'fill-transparent stroke-current'}`}
      />
    ))}
  </div>
);

const ChecklistDisplay: React.FC<{
  items?: Array<{ id: string; text: string; completed: boolean }>;
}> = ({ items = [] }) => {
  const completedCount = items.filter(item => item.completed).length;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <Icons.CheckSquareIcon className="w-3 h-3" />
      <span>{completedCount}/{items.length} completed</span>
    </div>
  );
};

const TimelineCalendarItem: React.FC<TimelineCalendarItemProps> = ({
  item,
  onClick,
  isSelected,
}) => {
  const abhyasaStore = useAbhyasaStore();
  const dainandiniStore = useDainandiniStore();
  
  // Calculate completion status dynamically for habits
  const isCompleted = React.useMemo(() => {
    if (item.type === CalendarItemType.HABIT) {
      // For habits, prioritize the completed property from the CalendarItem
      // This ensures optimistic updates work correctly
      if (item.completed !== undefined) {
        return item.completed;
      }
      
      // Fallback to calculating from habit logs if completed property is not set
      const habit = item.originalData as any;
      // Normalize the date to just the date part (remove time)
      const normalizedDate = new Date(item.date);
      normalizedDate.setHours(0, 0, 0, 0);
      
      return calculateHabitCompletionForDate(habit, abhyasaStore.habitLogs, normalizedDate);
    }
    return item.completed;
  }, [item.type, item.originalData?.id, item.date, item.completed, abhyasaStore.habitLogs]);

  // Get focus area for logs
  const focus = React.useMemo(() => {
    if (item.type === CalendarItemType.LOG) {
      const log = item.originalData as any;
      return dainandiniStore.foci.find(f => f.id === log.focusId);
    }
    return null;
  }, [item.type, item.originalData, dainandiniStore.foci]);

  const getItemIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.CircleIcon;
    return <IconComponent className="w-4 h-4" />;
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

  // Render log-specific content
  const renderLogContent = () => {
    if (item.type !== CalendarItemType.LOG) return null;
    
    const log = item.originalData as any;
    
    return (
      <div className="space-y-2 mt-2">
        {/* Focus Area */}
        {focus && (
          <div className="flex items-center space-x-2">
            <Icons.TargetIcon className="w-3 h-3 text-purple-500" />
            <span className={`text-xs px-2 py-1 rounded ${
              focus.color === 'blue-500' ? 'text-blue-500 bg-blue-500/10' :
              focus.color === 'green-500' ? 'text-green-500 bg-green-500/10' :
              focus.color === 'purple-500' ? 'text-purple-500 bg-purple-500/10' :
              focus.color === 'red-500' ? 'text-red-500 bg-red-500/10' :
              focus.color === 'yellow-500' ? 'text-yellow-500 bg-yellow-500/10' :
              focus.color === 'indigo-500' ? 'text-indigo-500 bg-indigo-500/10' :
              focus.color === 'pink-500' ? 'text-pink-500 bg-pink-500/10' :
              'text-gray-500 bg-gray-500/10'
            }`}>
              {focus.name}
            </span>
          </div>
        )}
        
        {/* Description - only for logs */}
        {log.description && (
          <p className="text-xs text-gray-600 truncate">
            {log.description}
          </p>
        )}
        
        {/* Log Type Specific Content */}
        {log.logType === LogType.RATING && log.rating && (
          <div className="flex items-center gap-2">
            <StarRatingDisplay rating={log.rating} />
            <span className="text-xs text-gray-500">{log.rating}/5</span>
          </div>
        )}
        
        {log.logType === LogType.CHECKLIST && log.checklist && (
          <ChecklistDisplay items={log.checklist} />
        )}
      </div>
    );
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
              {item.type === CalendarItemType.TASK && (item.originalData as any)?.priority && (
                <Icons.FlagIcon className={`w-3 h-3 ${
                  (item.originalData as any).priority === 1 ? 'text-red-600' :
                  (item.originalData as any).priority === 2 ? 'text-orange-500' :
                  (item.originalData as any).priority === 3 ? 'text-blue-500' :
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

          {/* Log-specific content */}
          {renderLogContent()}
        </div>
      </div>
    </div>
  );
};

const MemoizedTimelineCalendarItem = React.memo(TimelineCalendarItem, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.item.completed === nextProps.item.completed &&
    prevProps.item.date.getTime() === nextProps.item.date.getTime()
  );
});

export default MemoizedTimelineCalendarItem; 