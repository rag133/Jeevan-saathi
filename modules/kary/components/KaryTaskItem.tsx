import React from 'react';
import { Task, Tag } from '~/modules/kary/types';
import Checkbox from '~/components/common/Checkbox';
import { FlagIcon, ChevronRightIcon, ChevronDownIcon, ClockIcon, ExternalLinkIcon } from '~/components/Icons';

const formatDate = (date?: Date) => {
  if (!date) return '';

  const d = new Date(date);

  // Check if the date is valid
  if (isNaN(d.getTime())) {
    return '';
  }

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;

  today.setHours(0, 0, 0, 0);
  const dateToFormat = new Date(d);
  dateToFormat.setHours(0, 0, 0, 0);

  let dateString = '';
  if (dateToFormat.getTime() === today.getTime()) {
    dateString = 'Today';
  } else if (dateToFormat.getTime() === tomorrow.getTime()) {
    dateString = 'Tomorrow';
  } else {
    dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (hasTime) {
    const timeString = d
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      .toLowerCase();
    return `${dateString} ${timeString}`;
  }

  return dateString;
};

const getDueDateColor = (dueDate?: Date) => {
  if (!dueDate) return 'text-gray-400';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) {
    return 'text-red-500'; // Overdue
  }
  if (due.getTime() === today.getTime()) {
    return 'text-blue-600'; // Today
  }
  return 'text-gray-500'; // Upcoming
};

const getPriorityColor = (priority?: 1 | 2 | 3 | 4) => {
  switch (priority) {
    case 1:
      return 'text-red-600';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-blue-500';
    case 4:
      return 'text-gray-400';
    default:
      return 'hidden';
  }
};

interface KaryTaskItemProps {
  task: Task;
  allTags: Tag[];
  isSelected: boolean;
  level: number;
  isParent: boolean;
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

const KaryTaskItem: React.FC<KaryTaskItemProps> = ({
  task,
  allTags,
  isSelected,
  level,
  isParent,
  isExpanded,
  onSelect,
  onToggleComplete,
  onToggleExpand,
}) => {
  const taskTags = (task.tags ?? [])
    .map((tagId) => allTags.find((t) => t.id === tagId))
    .filter(Boolean) as Tag[];

  const handleItemClick = () => {
    if (!isSelected) {
      onSelect(task.id);
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(task.id);
  };

  const isContextParent = isParent && task.dueDate === undefined;

  return (
    <div
      onClick={handleItemClick}
      className={`group relative flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'bg-indigo-50 border border-indigo-200 shadow-sm' 
          : 'hover:bg-gray-50 border border-transparent'
      }`}
      style={{ marginLeft: `${level * 20}px` }}
    >
      {/* Expand/Collapse Button */}
      <div className="flex items-center justify-center w-6 h-6">
        {isParent ? (
          <button
            onClick={handleExpandClick}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-4 h-4" />
        )}
      </div>

      {/* Checkbox */}
      <div className="flex items-center justify-center w-6 h-6">
        <Checkbox
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          ariaLabel={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                task.completed 
                  ? 'text-gray-400 line-through' 
                  : 'text-gray-900'
              } ${isContextParent ? 'text-gray-500' : ''}`}
            >
              {task.title}
            </p>
            
            {/* Source Link */}
            {task.source && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">Source:</span>
                <a
                  href={task.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {task.source.text}
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Task Metadata */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Tags */}
            {taskTags.length > 0 && (
              <div className="flex items-center gap-1">
                {taskTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${tag.color}/10 text-${tag.color} border border-${tag.color}/20`}
                  >
                    {tag.name}
                  </span>
                ))}
                {taskTags.length > 2 && (
                  <span className="text-xs text-gray-500">+{taskTags.length - 2}</span>
                )}
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div
                className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                  getDueDateColor(task.dueDate) === 'text-red-500'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : getDueDateColor(task.dueDate) === 'text-blue-600'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <ClockIcon className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </div>
            )}

            {/* Priority Flag */}
            {task.priority && (
              <div className="p-1">
                <FlagIcon className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default KaryTaskItem;
