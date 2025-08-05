import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Habit,
  HabitLog,
  HabitFrequencyType,
  HabitType,
  HabitChecklistItem,
} from '~/modules/abhyasa/types';
import * as Icons from '~/components/Icons';
import { Focus } from '~/modules/dainandini/types';
import Checkbox from '~/components/common/Checkbox';
import DateTimePicker from '~/modules/kary/components/DateTimePicker';
import { shouldShowHabitOnDate, calculateHabitStatus } from '~/modules/abhyasa/utils/habitStats';

const isSameDay = (d1?: Date | null, d2?: Date | null): boolean => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

// --- Sub-components ---

const WeekScroller: React.FC<{
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}> = ({ selectedDate, onDateSelect, onPrevWeek, onNextWeek }) => {
  const weekDays = useMemo(() => {
    const viewDate = new Date(selectedDate);
    const dayOfWeek = viewDate.getDay(); // 0 = Sunday
    const startOfWeek = new Date(viewDate);
    startOfWeek.setDate(viewDate.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }, [selectedDate]);

  return (
    <div className="flex justify-between items-center px-4">
      <button onClick={onPrevWeek} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <Icons.ChevronLeftIcon className="w-5 h-5" />
      </button>
      {weekDays.map((day) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        return (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            className={`flex flex-col items-center justify-center w-12 h-16 rounded-lg transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white shadow-md'
                : isToday
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xs font-medium">
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="text-xl font-bold">{day.getDate()}</span>
          </button>
        );
      })}
      <button onClick={onNextWeek} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
        <Icons.ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

interface HabitListItemProps {
  habit: Habit;
  log: HabitLog | null;
  onLog: (logData: Omit<HabitLog, 'id'>) => void;
  onSelect: (habitId: string) => void;
  isSelected: boolean;
  date: Date;
  allFoci: Focus[];
}

const HabitListItem: React.FC<HabitListItemProps> = ({ habit, log, onLog, onSelect, isSelected, date, allFoci }) => {
  const [count, setCount] = useState(log?.value || 0);
  const [durationH, setDurationH] = useState(log?.value ? Math.floor(log.value / 60) : 0);
  const [durationM, setDurationM] = useState(log?.value ? log.value % 60 : 0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(log?.completedChecklistItems || [])
  );
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);

  useEffect(() => {
    setCount(log?.value || 0);
    setDurationH(log?.value ? Math.floor(log.value / 60) : 0);
    setDurationM(log?.value ? log.value % 60 : 0);
    setCheckedItems(new Set(log?.completedChecklistItems || []));
  }, [log]);

  const calculatedStatus = useMemo(() => {
    return calculateHabitStatus(habit, log);
  }, [habit, log]);

  const isGoalMet = calculatedStatus.status === 'done';

  const getHabitStatusColor = () => {
    if (!log) return 'bg-white hover:bg-gray-50';
    
    switch (calculatedStatus.status) {
      case 'done':
        return 'bg-green-50 hover:bg-green-100';
      case 'partial':
        return 'bg-orange-50 hover:bg-orange-100';
      case 'none':
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  const getSelectionStyle = () => {
    if (isSelected) {
      return 'border-2 border-blue-500 shadow-md';
    }
    return 'border border-gray-200';
  };

  const handleLog = (value?: number, completedItems?: string[]) => {
    onLog({
      habitId: habit.id,
      date: date.toISOString().split('T')[0],
      value,
      completedChecklistItems: completedItems,
    });
  };

  const handleChecklistToggle = (itemId: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) newCheckedItems.delete(itemId);
    else newCheckedItems.add(itemId);

    handleLog(undefined, Array.from(newCheckedItems));
  };

  const renderLoggingControl = () => {
    let controlElement: JSX.Element | null = null;

    switch (habit.type) {
      case HabitType.BINARY:
        controlElement = (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLog();
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
              calculatedStatus.status === 'done'
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-gray-200/50 border-gray-300 text-gray-400 hover:border-green-500'
            }`}
          >
            <Icons.CheckSquareIcon className="w-5 h-5" />
          </button>
        );
        break;
      case HabitType.COUNT:
        const showDailyTarget =
          habit.dailyTargetComparison !== 'any-value' &&
          habit.dailyTarget !== undefined;
        controlElement = (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                const newVal = Math.max(0, count - 1);
                setCount(newVal);
                handleLog(newVal);
              }}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              -
            </button>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              onBlur={() => handleLog(count)}
              className="w-12 text-center text-lg font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
            />
            {showDailyTarget && <span className="text-gray-500">/ {habit.dailyTarget}</span>}
            <button
              onClick={() => {
                const newVal = count + 1;
                setCount(newVal);
                handleLog(newVal);
              }}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              +
            </button>
          </div>
        );
        break;
      case HabitType.DURATION:
        const handleDurationBlur = () => {
          const totalMinutes = durationH * 60 + durationM;
          handleLog(totalMinutes);
        };
        controlElement = (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              type="number"
              value={durationH}
              onChange={(e) => setDurationH(parseInt(e.target.value) || 0)}
              onBlur={handleDurationBlur}
              className="w-10 text-center text-lg font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
            />{' '}
            <span className="text-gray-500 text-sm">h</span>
            <input
              type="number"
              value={durationM}
              onChange={(e) => setDurationM(parseInt(e.target.value) || 0)}
              onBlur={handleDurationBlur}
              className="w-10 text-center text-lg font-bold bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none"
            />{' '}
            <span className="text-gray-500 text-sm">m</span>
            <span className="text-gray-500 text-sm">/ {habit.dailyTarget} m</span>
          </div>
        );
        break;
      case HabitType.CHECKLIST:
        const total = habit.checklist?.length || 0;
        const completedCount = checkedItems.size;
        controlElement = (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsChecklistExpanded(!isChecklistExpanded);
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${
              completedCount === total && total > 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Icons.CheckSquareIcon className="w-4 h-4" />
            <span>
              {completedCount}/{total}
            </span>
            <Icons.ChevronDownIcon
              className={`w-4 h-4 transition-transform ${isChecklistExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        );
        break;
    }

    return controlElement;
  };

  const IconComponent = Icons[habit.icon];
  const focus = allFoci.find((f) => f.id === habit.focusAreaId);

  return (
    <li
      className={`rounded-lg transition-colors ${getHabitStatusColor()} ${getSelectionStyle()}`}
    >
      <div onClick={() => onSelect(habit.id)} className="flex items-center p-3 cursor-pointer">
        <div className={`p-3 rounded-lg bg-${habit.color}/30`}>
          <IconComponent className={`w-6 h-6 text-${habit.color}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="font-semibold text-gray-800">{habit.title}</p>
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
            {focus ? (
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-semibold bg-${focus.color}/30 text-${focus.color}`}
              >
                {focus.name}
              </span>
            ) : (
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600`}
              >
                Habit
              </span>
            )}
            {habit.reminders?.[0] && (
              <>
                <Icons.BellIcon className="w-3 h-3 text-gray-400" />
                <span>{habit.reminders[0]}</span>
              </>
            )}
          </div>
        </div>
        {renderLoggingControl()}
      </div>
      {habit.type === HabitType.CHECKLIST && isChecklistExpanded && (
        <div className="pl-16 pr-4 pb-3">
          <ul className="space-y-2 border-t pt-2">
            {habit.checklist?.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <Checkbox
                  checked={checkedItems.has(item.id)}
                  onChange={() => handleChecklistToggle(item.id)}
                />
                <span
                  className={`flex-1 text-sm ${checkedItems.has(item.id) ? 'line-through text-gray-400' : ''}`}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

// --- Main Component ---
interface HabitDashboardProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  allFoci: Focus[];
  onAddHabitLog: (logData: Omit<HabitLog, 'id'>) => void;
  onDeleteHabitLog: (habitId: string, date: Date) => void;
  onSelectHabit: (id: string) => void;
  selectedHabitId: string | null;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const HabitDashboard: React.FC<HabitDashboardProps> = ({
  habits = [],
  habitLogs,
  allFoci,
  onAddHabitLog,
  onDeleteHabitLog,
  onSelectHabit,
  selectedHabitId,
  selectedDate,
  onDateSelect,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const habitsForSelectedDay = useMemo(() => {
    return (habits ?? []).filter((habit) => {
      return shouldShowHabitOnDate(habit, selectedDate, habitLogs);
    });
  }, [habits, selectedDate, habitLogs]);

  const logsByHabitId = useMemo(() => {
    const map = new Map<string, HabitLog>();
    const dateStr = selectedDate.toISOString().split('T')[0];
    habitLogs
      .filter((log) => log.date === dateStr)
      .forEach((log) => {
        map.set(log.habitId, log);
      });
    return map;
  }, [habitLogs, selectedDate]);

  const getHeaderText = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(selectedDate, today)) return 'Today';
    if (isSameDay(selectedDate, yesterday)) return 'Yesterday';
    return selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateSelect(newDate);
  };
  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateSelect(newDate);
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50/80">
      <header className="p-4 flex justify-between items-center flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">{getHeaderText()}</h1>
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setIsDatePickerOpen((o) => !o)}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <Icons.CalendarIcon className="w-5 h-5 text-gray-600" />
          </button>
          {isDatePickerOpen && (
            <div className="absolute top-full right-0 mt-2 z-30">
              <DateTimePicker
                currentDate={selectedDate}
                onSelect={(date) => {
                  onDateSelect(date);
                  setIsDatePickerOpen(false);
                }}
                onClear={() => {}}
                onClose={() => setIsDatePickerOpen(false)}
              />
            </div>
          )}
        </div>
      </header>

      <div className="py-4 flex-shrink-0">
        <WeekScroller
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {habitsForSelectedDay.length > 0 ? (
          <ul className="space-y-3">
            {habitsForSelectedDay.map((habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                log={logsByHabitId.get(habit.id) || null}
                onLog={onAddHabitLog}
                onSelect={onSelectHabit}
                isSelected={habit.id === selectedHabitId}
                date={selectedDate}
                allFoci={allFoci}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-gray-500 flex flex-col items-center">
            <Icons.CheckSquareIcon className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-semibold">No habits scheduled for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitDashboard;