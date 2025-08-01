import React from 'react';
import { Habit, HabitLog } from '../types';
import * as Icons from '../../../components/Icons';
import HabitTracker from './HabitTracker';

interface HabitCardProps {
  habit: Habit;
  log: HabitLog | null;
  onLog: (logData: Omit<HabitLog, 'id'>) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, log, onLog, onSelect, isSelected }) => {
  const IconComponent = Icons[habit.icon];

  return (
    <div
      onClick={() => onSelect(habit.id)}
      className={`p-4 rounded-lg shadow-sm border-l-4 transition-all duration-200 cursor-pointer ${
        isSelected
          ? `border-${habit.color} bg-white shadow-lg`
          : `border-gray-300 bg-white hover:shadow-md`
      }`}
    >
      <div className="flex items-start gap-4">
        <IconComponent className={`w-8 h-8 flex-shrink-0 text-${habit.color}`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800">{habit.title}</h3>
          {habit.description && <p className="text-sm text-gray-500 mt-1">{habit.description}</p>}
        </div>
      </div>
      <div className="mt-4">
        <HabitTracker habit={habit} log={log} onLog={onLog} date={new Date()} />
      </div>
    </div>
  );
};

export default HabitCard;
