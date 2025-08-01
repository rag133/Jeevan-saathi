import React, { useState, useEffect } from 'react';
import { Habit, HabitLog, HabitLogStatus, HabitType, HabitTargetComparison } from '~/modules/abhyasa/types';
import * as Icons from '~/components/Icons';
import Checkbox from '~/components/common/Checkbox';

interface HabitTrackerProps {
  habit: Habit;
  log: HabitLog | null;
  date: Date;
  onLog: (logData: Omit<HabitLog, 'id'>) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habit, log, date, onLog }) => {
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
  }, [log]);

  const isCompleted = log?.status === HabitLogStatus.COMPLETED;

  const handleLog = (status: HabitLogStatus, value?: number, completedItems?: string[]) => {
    onLog({
      habitId: habit.id,
      date: date.toISOString().split('T')[0],
      status,
      value,
      completedChecklistItems: completedItems,
    });
  };

  const handleChecklistToggle = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);

    const isComplete = newCheckedItems.size === (habit.checklist?.length || 0);
    handleLog(
      isComplete ? HabitLogStatus.COMPLETED : HabitLogStatus.PARTIALLY_COMPLETED,
      undefined,
      Array.from(newCheckedItems)
    );
  };

  const handleCounterLog = () => {
    const target = habit.dailyTarget || 1;
    const comparison = habit.dailyTargetComparison || HabitTargetComparison.AT_LEAST;

    let status: HabitLogStatus;

    switch (comparison) {
      case HabitTargetComparison.AT_LEAST:
        status = count >= target ? HabitLogStatus.COMPLETED : HabitLogStatus.PARTIALLY_COMPLETED;
        break;
      case HabitTargetComparison.LESS_THAN:
        status = count < target ? HabitLogStatus.COMPLETED : HabitLogStatus.MISSED;
        break;
      case HabitTargetComparison.EXACTLY:
        status = count === target ? HabitLogStatus.COMPLETED : HabitLogStatus.PARTIALLY_COMPLETED;
        break;
      case HabitTargetComparison.ANY_VALUE:
        status = count > 0 ? HabitLogStatus.COMPLETED : HabitLogStatus.MISSED;
        break;
      default:
        status = HabitLogStatus.PARTIALLY_COMPLETED;
    }

    handleLog(status, count);
  };

  if (isCompleted) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-semibold p-4 bg-green-50 rounded-lg">
        <Icons.CheckSquareIcon className="w-6 h-6" />
        <span>
          Done for{' '}
          {new Date(date).toDateString() === new Date().toDateString() ? 'today' : 'the day'}!
        </span>
      </div>
    );
  }

  switch (habit.type) {
    case HabitType.BINARY:
      return (
        <button
          onClick={() => handleLog(HabitLogStatus.COMPLETED)}
          className={`w-full py-2 text-lg font-bold rounded-lg transition-colors bg-${habit.color}/20 text-${habit.color} hover:bg-${habit.color}/30`}
        >
          Done
        </button>
      );

    case HabitType.COUNT:
      const showDailyTarget =
        habit.dailyTargetComparison !== HabitTargetComparison.ANY_VALUE &&
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
            onClick={() =>
              handleLog(
                durationH * 60 + durationM >= (habit.dailyTarget || 1)
                  ? HabitLogStatus.COMPLETED
                  : HabitLogStatus.PARTIALLY_COMPLETED,
                durationH * 60 + durationM
              )
            }
            className={`ml-auto px-4 py-2 font-semibold rounded-lg bg-${habit.color}/80 text-white hover:bg-${habit.color}`}
          >
            Log
          </button>
        </div>
      );

    case HabitType.CHECKLIST:
      return (
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
      );
    default:
      return null;
  }
};

export default HabitTracker;
