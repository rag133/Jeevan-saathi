import React, { useState, useEffect } from 'react';
import { Habit, HabitLog, HabitType } from '~/modules/abhyasa/types';
import { calculateHabitStatus } from '~/modules/abhyasa/utils/habitStats';
import * as Icons from '~/components/Icons';
import Checkbox from '~/components/common/Checkbox';

interface HomeHabitLoggingProps {
  habit: Habit;
  log: HabitLog | null;
  date: Date;
  onLog: (logData: Omit<HabitLog, 'id'>) => void;
  onDeleteLog?: (logId: string) => void;
}

const HomeHabitLogging: React.FC<HomeHabitLoggingProps> = ({ 
  habit, 
  log, 
  date, 
  onLog, 
  onDeleteLog 
}) => {
  const [count, setCount] = useState(log?.value || 0);
  const [durationH, setDurationH] = useState(log?.value ? Math.floor(log.value / 60) : 0);
  const [durationM, setDurationM] = useState(log?.value ? log.value % 60 : 0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(log?.completedChecklistItems || [])
  );

  useEffect(() => {
    setCount(log?.value || 0);
    setDurationH(log?.value ? Math.floor(log.value / 60) : 0);
    setDurationM(log?.value ? log.value % 60 : 0);
    setCheckedItems(new Set(log?.completedChecklistItems || []));
  }, [log?.id, log?.value, log?.completedChecklistItems, habit.id, date]);

  const calculatedStatus = calculateHabitStatus(habit, log);
  const isCompleted = calculatedStatus.status === 'done';

  const handleLog = (value?: number, completedItems?: string[]) => {
    onLog({
      habitId: habit.id,
      date: date.toISOString().split('T')[0],
      value,
      completedChecklistItems: completedItems,
    });
  };

  const handleToggle = () => {
    if (isCompleted && log && onDeleteLog) {
      // If completed, delete the log to mark as NONE
      onDeleteLog(log.id);
    } else {
      // If not completed, add a log to mark as DONE
      handleLog();
    }
  };

  const handleChecklistToggle = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);

    handleLog(undefined, Array.from(newCheckedItems));
  };

  const handleCounterLog = () => {
    handleLog(count);
  };

  const handleDurationLog = () => {
    const totalMinutes = durationH * 60 + durationM;
    handleLog(totalMinutes);
  };

  // For checklist habits, always show the checklist items, even when completed
  if (habit.type === HabitType.CHECKLIST) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {habit.checklist?.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50">
              <Checkbox
                checked={checkedItems.has(item.id)}
                onChange={() => handleChecklistToggle(item.id)}
              />
              <span
                className={`flex-1 ${checkedItems.has(item.id) ? 'line-through text-gray-400' : ''}`}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
        
        {/* Show completion message at the bottom if completed */}
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600 font-semibold p-3 bg-green-50 rounded-lg">
            <Icons.CheckSquareIcon className="w-5 h-5" />
            <span className="flex-1">
              Done for{' '}
              {new Date(date).toDateString() === new Date().toDateString() ? 'today' : 'the day'}!
            </span>
            <button
              onClick={handleToggle}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Undo
            </button>
          </div>
        )}
      </div>
    );
  }

  // If already completed, show completion message with toggle option
  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-semibold p-4 bg-green-50 rounded-lg">
        <Icons.CheckSquareIcon className="w-6 h-6" />
        <span className="flex-1">
          Done for{' '}
          {new Date(date).toDateString() === new Date().toDateString() ? 'today' : 'the day'}!
        </span>
        <button
          onClick={handleToggle}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Undo
        </button>
      </div>
    );
  }

  // Show different UI based on habit type for logging
  switch (habit.type) {
    case HabitType.BINARY:
      return (
        <button
          onClick={handleToggle}
          className={`w-full py-2 text-lg font-bold rounded-lg transition-colors bg-${habit.color}/20 text-${habit.color} hover:bg-${habit.color}/30`}
        >
          Mark Done
        </button>
      );

    case HabitType.COUNT:
      const showDailyTarget =
        habit.dailyTargetComparison !== 'any-value' &&
        habit.dailyTarget !== undefined;
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCount((c) => Math.max(0, c - 1))}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            -
          </button>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 0)}
            className="w-16 text-center text-lg font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
          />
          {showDailyTarget && <span className="text-gray-500">/ {habit.dailyTarget}</span>}
          <button
            onClick={() => setCount((c) => c + 1)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            +
          </button>
          <button
            onClick={handleCounterLog}
            className={`ml-auto px-4 py-2 font-semibold rounded-lg bg-${habit.color}/80 text-white hover:bg-${habit.color}`}
          >
            Log
          </button>
        </div>
      );

    case HabitType.DURATION:
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={durationH}
            onChange={(e) => setDurationH(parseInt(e.target.value) || 0)}
            className="w-12 text-center text-lg font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
          />{' '}
          <span className="text-gray-500">h</span>
          <input
            type="number"
            value={durationM}
            onChange={(e) => setDurationM(parseInt(e.target.value) || 0)}
            className="w-12 text-center text-lg font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
          />{' '}
          <span className="text-gray-500">m</span>
          <span className="text-gray-500">/ {habit.dailyTarget} m</span>
          <button
            onClick={handleDurationLog}
            className={`ml-auto px-4 py-2 font-semibold rounded-lg bg-${habit.color}/80 text-white hover:bg-${habit.color}`}
          >
            Log
          </button>
        </div>
      );


    default:
      return null;
  }
};

export default HomeHabitLogging; 