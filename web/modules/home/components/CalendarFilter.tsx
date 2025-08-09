import React from 'react';
import * as Icons from '~/components/Icons';
import { CalendarItemType } from '../types';

interface CalendarFilterProps {
  activeFilters: Set<CalendarItemType>;
  onFilterChange: (type: CalendarItemType, isActive: boolean) => void;
}

const filterOptions = [
  {
    type: CalendarItemType.TASK,
    label: 'Tasks',
    icon: 'CheckSquareIcon',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    type: CalendarItemType.HABIT,
    label: 'Habits',
    icon: 'TargetIcon',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    type: CalendarItemType.LOG,
    label: 'Journal',
    icon: 'BookOpenIcon',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
];

const CalendarFilter: React.FC<CalendarFilterProps> = ({
  activeFilters,
  onFilterChange,
}) => {
  const IconComponent = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700 mr-2">Show:</span>
      {filterOptions.map((option) => {
        const isActive = activeFilters.has(option.type);
        return (
          <button
            key={option.type}
            onClick={() => onFilterChange(option.type, !isActive)}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border transition-colors ${
              isActive
                ? `${option.bgColor} ${option.borderColor} ${option.color}`
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {IconComponent(option.icon)}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default CalendarFilter; 