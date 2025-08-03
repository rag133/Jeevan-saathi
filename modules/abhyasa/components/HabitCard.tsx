import React from 'react';
import { Habit, HabitLog, HabitLogStatus } from '~/modules/abhyasa/types';
import * as Icons from '~/components/Icons';
import HabitTracker from './HabitTracker';
import { useAbhyasaStore } from '~/modules/abhyasa/abhyasaStore';
import { FaStepForward } from 'react-icons/fa';

interface HabitCardProps {
  habit: Habit;
  log: HabitLog | null;
  onLog: (logData: Omit<HabitLog, 'id'>) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, log, onLog, onSelect, isSelected }) => {
  const isSkipped = log?.status === HabitLogStatus.SKIPPED;
  const IconComponent = isSkipped ? FaStepForward : Icons[habit.icon];
  const color = isSkipped ? 'yellow-500' : habit.color;
  const { updateHabitLog, deleteHabitLog } = useAbhyasaStore();

  const handleSkip = (habitId: string, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    if (log) {
      updateHabitLog(log.id, { status: HabitLogStatus.SKIPPED });
    } else {
      onLog({
        habitId,
        date: dateString,
        status: HabitLogStatus.SKIPPED,
      });
    }
  };

  const handleReset = (habitId: string, date: Date) => {
    if (log) {
      deleteHabitLog(log.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(habit.id)}
      className={`p-3 md:p-4 rounded-lg shadow-sm border-l-4 transition-all duration-200 cursor-pointer ${
        isSelected
          ? `border-${color} bg-white shadow-lg`
          : `border-gray-300 bg-white hover:shadow-md`
      }`}
    >
      <div className="flex items-start gap-4">
        <IconComponent className={`w-8 h-8 flex-shrink-0 text-${color}`} />
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-bold text-gray-800">{habit.title}</h3>
          {habit.description && <p className="text-sm text-gray-500 mt-1">{habit.description}</p>}
        </div>
      </div>
      <div className="mt-4">
        <HabitTracker
          habit={habit}
          log={log}
          onLog={onLog}
          date={new Date()}
          onSkip={handleSkip}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};

export default HabitCard;
