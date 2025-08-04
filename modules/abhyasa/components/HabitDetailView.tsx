import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Habit,
  HabitLog,
  HabitLogStatus,
  HabitStatus,
  HabitType,
  HabitFrequency,
  HabitFrequencyType,
  HabitTargetComparison,
} from '~/modules/abhyasa/types';
import * as Icons from '~/components/Icons';
import { Log } from '~/modules/dainandini/types';

import HabitLogItem from './HabitLogItem';
import { calculateHabitStats } from '~/modules/abhyasa/utils/habitStats';
import HabitCalendar from './HabitCalendar';

interface HabitDetailViewProps {
  habit: Habit | null;
  onEditHabit: (habit: Habit) => void;
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
  onAddHabitLog: (logData: Omit<HabitLog, 'id'>) => void;
  onDeleteHabitLog: (habitId: string, date: Date) => void;
  onSkipHabitLog?: (habitId: string, date: Date) => void;
  selectedDate: Date;
  allLogs: Log[];
  habitLogs: HabitLog[];
  onOpenLogModal: (habit: Habit) => void;
  onBack?: () => void; // Optional back button for mobile
}

const habitStatusItems: {
  id: HabitStatus;
  name: string;
  color: string;
  icon: keyof typeof Icons;
}[] = [
  {
    id: HabitStatus.YET_TO_START,
    name: 'Yet to Start',
    color: 'text-gray-500',
    icon: 'SunriseIcon',
  },
  { id: HabitStatus.IN_PROGRESS, name: 'In Progress', color: 'text-blue-500', icon: 'RepeatIcon' },
  {
    id: HabitStatus.COMPLETED,
    name: 'Completed',
    color: 'text-green-500',
    icon: 'CheckSquareIcon',
  },
  { id: HabitStatus.ABANDONED, name: 'Abandoned', color: 'text-red-500', icon: 'Trash2Icon' },
];

const getStatusDetails = (status: HabitStatus) => {
  return habitStatusItems.find((item) => item.id === status) || habitStatusItems[0];
};

const HabitDetailView: React.FC<HabitDetailViewProps> = ({
  habit,
  onEditHabit,
  onUpdateHabit,
  onAddHabitLog,
  onDeleteHabitLog,
  onSkipHabitLog,
  selectedDate,
  allLogs,
  habitLogs,
  onOpenLogModal,
  onBack,
}) => {
  const [popup, setPopup] = useState<'status' | 'logAction' | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const logActionTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        logActionTriggerRef.current &&
        !logActionTriggerRef.current.contains(event.target as Node)
      ) {
        setPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const habitLogsFromJournal = useMemo(() => {
    if (!habit) return [];
    return allLogs
      .filter((log) => log.habitId === habit.id)
      .sort((a, b) => b.logDate.getTime() - a.logDate.getTime());
  }, [habit, allLogs]);

  const selectedDateLog = useMemo(() => {
    if (!habit) return null;
    const dateString = selectedDate.toISOString().split('T')[0];
    return habitLogs.find(log => log.habitId === habit.id && log.date === dateString) || null;
  }, [habit, habitLogs, selectedDate]);

  const totalProgress = useMemo(() => {
    if (!habit) return 0;
    let progress = 0;

    // Group logs by date to get the final state for each day
    // This ensures we don't double-count if there are multiple logs for the same date
    const logsByDate = new Map<string, HabitLog>();
    habitLogs.forEach(log => {
      // Keep the most recent log for each date
      logsByDate.set(log.date, log);
    });

    // Calculate progress based on final state of each day
    if (habit.type === HabitType.COUNT || habit.type === HabitType.DURATION) {
      progress = Array.from(logsByDate.values()).reduce((sum, log) => {
        // Only count if the log has a value
        return sum + (log.value || 0);
      }, 0);
    } else if (habit.type === HabitType.BINARY) {
      progress = Array.from(logsByDate.values()).filter((log) => 
        log.status === HabitLogStatus.COMPLETED
      ).length;
    } else if (habit.type === HabitType.CHECKLIST) {
      progress = Array.from(logsByDate.values()).reduce(
        (sum, log) => sum + (log.completedChecklistItems?.length || 0),
        0
      );
    }
    return progress;
  }, [habit, habitLogs]);

  const stats = useMemo(() => {
    if (!habit) return { currentStreak: 0, bestStreak: 0, completionRate: 0, totalCompletions: 0 };
    return calculateHabitStats(habit, habitLogs);
  }, [habit, habitLogs]);

  const handleUpdate = (updates: Partial<Habit>) => {
    if (habit) {
      onUpdateHabit(habit.id, updates);
    }
    setPopup(null);
  };

  const handleSkipLog = () => {
    if (habit) {
      if (onSkipHabitLog) {
        onSkipHabitLog(habit.id, selectedDate);
      } else {
        // Fallback to old behavior
        onAddHabitLog({
          habitId: habit.id,
          date: selectedDate.toISOString().split('T')[0],
          status: HabitLogStatus.SKIPPED,
        });
      }
    }
    setPopup(null);
  };

  const handleResetLog = () => {
    if (habit) {
      // Delete the log for this habit and date
      onDeleteHabitLog(habit.id, selectedDate);
    }
    setPopup(null);
  };

  const handleNotDoneLog = () => {
    if (habit) {
      onAddHabitLog({
        habitId: habit.id,
        date: selectedDate.toISOString().split('T')[0],
        status: HabitLogStatus.MISSED,
      });
    }
    setPopup(null);
  };

  const handleAddJournalEntry = () => {
    console.log('Add to Journal button clicked');
    if (habit) {
      onOpenLogModal(habit);
    }
  };

  const formatFrequency = (freq: HabitFrequency) => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    switch (freq.type) {
      case HabitFrequencyType.DAILY:
        return 'Daily';
      case HabitFrequencyType.WEEKLY:
        return `${freq.times} time${freq.times > 1 ? 's' : ''} per week`;
      case HabitFrequencyType.MONTHLY:
        return `${freq.times} time${freq.times > 1 ? 's' : ''} per month`;
      case HabitFrequencyType.SPECIFIC_DAYS:
        return `On ${freq.days.map((d) => weekDays[d]).join(', ')}`;
      default:
        return 'Not set';
    }
  };

  const formatTarget = (h: Habit) => {
    const unit = h.type === HabitType.DURATION ? 'minutes' : 'times';
    const comparisonText = (comparison?: HabitTargetComparison) =>
      ({
        [HabitTargetComparison.AT_LEAST]: 'At least',
        [HabitTargetComparison.EXACTLY]: 'Exactly',
        [HabitTargetComparison.LESS_THAN]: 'Less than',
        [HabitTargetComparison.ANY_VALUE]: 'Any value',
      })[comparison || HabitTargetComparison.AT_LEAST];

    const targetStrings: string[] = [];

    if (h.dailyTarget) {
      targetStrings.push(
        `${comparisonText(h.dailyTargetComparison)} ${h.dailyTarget} ${unit} per day`
      );
    }

    if (h.totalTarget) {
      targetStrings.push(
        `${comparisonText(h.totalTargetComparison)} ${h.totalTarget} ${unit} in total`
      );
    }

    if (targetStrings.length === 0) {
      return 'No specific target.';
    }

    return targetStrings.join(' and ');
  };

  const getLogActionButtonText = () => {
    if (!selectedDateLog) return 'Yet to mark';
    
    switch (selectedDateLog.status) {
      case HabitLogStatus.COMPLETED:
        return 'Done';
      case HabitLogStatus.SKIPPED:
        return 'Skipped';
      case HabitLogStatus.MISSED:
        return 'Not Done';
      case HabitLogStatus.PARTIALLY_COMPLETED:
        // Check if it should actually be "Done" for counter/timer habits
        if (habit && selectedDateLog.value !== undefined) {
          if (habit.type === HabitType.COUNT || habit.type === HabitType.DURATION) {
            const target = habit.dailyTarget || 1;
            const comparison = habit.dailyTargetComparison || HabitTargetComparison.AT_LEAST;
            
            let isTargetMet = false;
            switch (comparison) {
              case HabitTargetComparison.AT_LEAST:
                isTargetMet = selectedDateLog.value >= target;
                break;
              case HabitTargetComparison.EXACTLY:
                isTargetMet = selectedDateLog.value === target;
                break;
              case HabitTargetComparison.LESS_THAN:
                isTargetMet = selectedDateLog.value < target;
                break;
              case HabitTargetComparison.ANY_VALUE:
                isTargetMet = selectedDateLog.value > 0;
                break;
            }
            
            if (isTargetMet) {
              return 'Done';
            }
          }
        }
        
        // Check if it should actually be "Done" for checklist habits
        if (habit && habit.type === HabitType.CHECKLIST && selectedDateLog.completedChecklistItems) {
          const total = habit.checklist?.length || 0;
          const completedCount = selectedDateLog.completedChecklistItems.length;
          
          if (total > 0 && completedCount === total) {
            return 'Done';
          }
        }
        
        return 'Partially Done';
      default:
        return 'Yet to mark';
    }
  };

  const getLogActionButtonColor = () => {
    if (!selectedDateLog) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    
    // Check if it should actually be green for counter/timer habits
    if (habit && selectedDateLog.value !== undefined) {
      if (habit.type === HabitType.COUNT || habit.type === HabitType.DURATION) {
        const target = habit.dailyTarget || 1;
        const comparison = habit.dailyTargetComparison || HabitTargetComparison.AT_LEAST;
        
        let isTargetMet = false;
        switch (comparison) {
          case HabitTargetComparison.AT_LEAST:
            isTargetMet = selectedDateLog.value >= target;
            break;
          case HabitTargetComparison.EXACTLY:
            isTargetMet = selectedDateLog.value === target;
            break;
          case HabitTargetComparison.LESS_THAN:
            isTargetMet = selectedDateLog.value < target;
            break;
          case HabitTargetComparison.ANY_VALUE:
            isTargetMet = selectedDateLog.value > 0;
            break;
        }
        
        if (isTargetMet) {
          return 'bg-green-100 text-green-700 hover:bg-green-200';
        }
      }
    }
    
    // Check if it should actually be green for checklist habits
    if (habit && habit.type === HabitType.CHECKLIST && selectedDateLog.completedChecklistItems) {
      const total = habit.checklist?.length || 0;
      const completedCount = selectedDateLog.completedChecklistItems.length;
      
      if (total > 0 && completedCount === total) {
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      }
    }
    
    switch (selectedDateLog.status) {
      case HabitLogStatus.COMPLETED:
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case HabitLogStatus.SKIPPED:
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case HabitLogStatus.MISSED:
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      case HabitLogStatus.PARTIALLY_COMPLETED:
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  if (!habit) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Icons.TargetIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-medium">Select a habit</h2>
          <p className="text-sm">Choose a habit from the list to see its progress and details.</p>
        </div>
      </div>
    );
  }

  const IconComponent = Icons[habit.icon] || Icons.TargetIcon;
  const statusDetails = getStatusDetails(habit.status);
  const StatusIcon = Icons[statusDetails.icon] || Icons.TargetIcon;

  return (
    <div className="flex-1 bg-white p-6 flex flex-col h-full">
      <header className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-start gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full mr-2"
              aria-label="Back to habit list"
            >
              <Icons.ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          <IconComponent className={`w-12 h-12 text-${habit.color}`} />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{habit.title}</h1>
            <p className="text-gray-500 mt-1">{habit.description}</p>
          </div>
        </div>
        <button
          onClick={() => onEditHabit(habit)}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800"
        >
          <Icons.Edit3Icon className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1 relative">
              <button
                ref={triggerRef}
                onClick={() => setPopup((p) => (p === 'status' ? null : 'status'))}
                className="flex items-center gap-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
              >
                <StatusIcon className={`w-4 h-4 ${statusDetails.color}`} />
                <span className={statusDetails.color}>{statusDetails.name}</span>
              </button>
              {popup && (
                <div ref={popupRef} className="absolute shadow-lg z-20 top-full mt-2 left-0">
                  {popup === 'status' && (
                    <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">
                      {habitStatusItems.map((item) => {
                        const ItemIcon = Icons[item.icon] || Icons.TargetIcon;
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => handleUpdate({ status: item.id })}
                              className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"
                            >
                              <ItemIcon className={`w-4 h-4 ${item.color}`} />
                              <span>{item.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Log for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </label>
            <div className="mt-2 relative">
              <button
                ref={logActionTriggerRef}
                onClick={() => setPopup((p) => (p === 'logAction' ? null : 'logAction'))}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${getLogActionButtonColor()}`}
              >
                <span>{getLogActionButtonText()}</span>
                <Icons.ChevronDownIcon className="w-4 h-4" />
              </button>
                             {popup === 'logAction' && (
                 <div ref={popupRef} className="absolute shadow-lg z-20 top-full mt-2 left-0">
                   <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">
                     <li>
                       <button
                         onClick={handleNotDoneLog}
                         className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 text-red-700"
                       >
                         <Icons.TargetIcon className="w-4 h-4" />
                         <span>Not Done</span>
                       </button>
                     </li>
                     <li>
                       <button
                         onClick={handleSkipLog}
                         className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 text-yellow-700"
                       >
                         <Icons.ArrowLeftIcon className="w-4 h-4" />
                         <span>Skip</span>
                       </button>
                     </li>
                     <li>
                       <button
                         onClick={handleResetLog}
                         className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                       >
                         <Icons.RepeatIcon className="w-4 h-4" />
                         <span>Reset</span>
                       </button>
                     </li>
                   </ul>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Details</label>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-3 border">
            <div className="flex items-center gap-2">
              <Icons.RepeatIcon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-700 text-sm">Frequency:</span>
              <span className="text-sm text-gray-600">{formatFrequency(habit.frequency)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.TargetIcon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-700 text-sm">Goal:</span>
              <span className="text-sm text-gray-600">{formatTarget(habit)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-700 text-sm">Timeline:</span>
              <span className="text-sm text-gray-600">
                {new Date(habit.startDate).toLocaleDateString()}
                {habit.endDate ? ` to ${new Date(habit.endDate).toLocaleDateString()}` : ''}
              </span>
            </div>
            {habit.totalTarget && (
              <div className="flex items-center gap-2">
                <Icons.TrendingUpIcon className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-700 text-sm">Total Progress:</span>
                <span className="text-sm text-gray-600">
                  {totalProgress} / {habit.totalTarget}{' '}
                  {habit.type === HabitType.DURATION ? 'minutes' : 'times'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-500">Journal</label>
            <button
              onClick={handleAddJournalEntry}
              className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors flex items-center gap-1.5"
            >
              <Icons.BookOpenIcon className="w-3.5 h-3.5" />
              Add to Journal
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg space-y-3 border">
            {habitLogsFromJournal.length > 0 ? (
              <ul className="space-y-2">
                {habitLogsFromJournal.map((log) => (
                  <HabitLogItem key={log.id} log={log} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                No journal entries for this habit yet.
              </p>
            )}
          </div>
        </div>

        {/* Statistics section */}
        <div>
          <label className="text-sm font-medium text-gray-500">Statistics</label>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-3 border">
            <div className="flex items-center gap-2">
              <Icons.ActivityIcon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-700 text-sm">Current Streak:</span>
              <span className="text-sm text-gray-600">
                {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.AwardIcon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-700 text-sm">Best Streak:</span>
              <span className="text-sm text-gray-600">
                {stats.bestStreak} day{stats.bestStreak !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.CheckCircleIcon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-700 text-sm">Completion Rate:</span>
              <span className="text-sm text-gray-600">{stats.completionRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.BarChart2Icon className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-gray-700 text-sm">Total Completions:</span>
              <span className="text-sm text-gray-600">
                {stats.totalCompletions} {habit.type === HabitType.DURATION ? 'minutes' : 'times'}
              </span>
            </div>
          </div>
        </div>

        {/* Habit Calendar */}
        <HabitCalendar habit={habit} habitLogs={habitLogs} selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default HabitDetailView;
