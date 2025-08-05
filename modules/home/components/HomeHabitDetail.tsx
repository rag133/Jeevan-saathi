import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as Icons from '~/components/Icons';
import {
  Habit,
  HabitLog,
  HabitStatus,
  HabitType,
  HabitFrequency,
  HabitFrequencyType,
  HabitTargetComparison,
} from '~/modules/abhyasa/types';
import type { CalendarItem } from '../types';
import { useAbhyasaStore } from '~/modules/abhyasa/abhyasaStore';
import { useDainandiniStore } from '~/modules/dainandini/dainandiniStore';
import { calculateHabitStats } from '~/modules/abhyasa/utils/habitStats';
import HabitCalendar from '~/modules/abhyasa/components/HabitCalendar';
import HabitLogItem from '~/modules/abhyasa/components/HabitLogItem';
import HomeHabitLogging from './HomeHabitLogging';
import AddLogModal from './AddLogModal';
import { useHomeStore } from '../homeStore';

interface HomeHabitDetailProps {
  selectedItem: CalendarItem;
  onClose: () => void;
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

const HomeHabitDetail: React.FC<HomeHabitDetailProps> = ({ selectedItem, onClose }) => {
  const habit = selectedItem.originalData as Habit;
  const abhyasaStore = useAbhyasaStore();
  const dainandiniStore = useDainandiniStore();
  
  const [popup, setPopup] = useState<'status' | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  // Get related data
  const allLogs = dainandiniStore.logs;
  const habitLogs = abhyasaStore.habitLogs;
  const selectedDate = selectedItem.date;

  const habitLogsFromJournal = useMemo(() => {
    return allLogs
      .filter((log) => log.habitId === habit.id)
      .sort((a, b) => b.logDate.getTime() - a.logDate.getTime());
  }, [habit.id, allLogs]);

  const selectedDateLog = useMemo(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    // Find the most recent log for this habit and date
    const logsForDate = habitLogs.filter(log => 
      log.habitId === habit.id && log.date === dateString
    );
    // Return the most recent log (last one in the array)
    return logsForDate.length > 0 ? logsForDate[logsForDate.length - 1] : null;
  }, [habit.id, habitLogs, selectedDate]);

  const totalProgress = useMemo(() => {
    let progress = 0;

    // Group logs by date to get the final state for each day
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
      progress = Array.from(logsByDate.values()).length; // Count all logs as completed
    } else if (habit.type === HabitType.CHECKLIST) {
      progress = Array.from(logsByDate.values()).reduce(
        (sum, log) => sum + (log.completedChecklistItems?.length || 0),
        0
      );
    }
    return progress;
  }, [habit, habitLogs]);

  const stats = useMemo(() => {
    return calculateHabitStats(habit, habitLogs);
  }, [habit, habitLogs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setTitleInput(habit.title || '');
    setDescriptionInput(habit.description || '');
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setPopup(null);
  }, [habit.id]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  const handleUpdate = (updates: Partial<Habit>) => {
    abhyasaStore.updateHabit(habit.id, updates);
    setPopup(null);
  };

  const handleTitleSave = () => {
    if (titleInput.trim() && titleInput.trim() !== habit.title) {
      abhyasaStore.updateHabit(habit.id, { title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    if (descriptionInput !== (habit.description || '')) {
      abhyasaStore.updateHabit(habit.id, { description: descriptionInput.trim() });
    }
    setIsEditingDescription(false);
  };

  const handleAddJournalEntry = () => {
    setShowLogModal(true);
  };

  const handleLogModalClose = () => {
    setShowLogModal(false);
  };



  const handleHabitLog = async (logData: Omit<HabitLog, 'id'>) => {
    // Optimistic update - update the home store immediately
    const homeStore = useHomeStore.getState();
    
    // Update the selected item optimistically
    if (homeStore.selectedItem && homeStore.selectedItem.id.includes(`habit-${habit.id}`)) {
      const updatedItem = {
        ...homeStore.selectedItem,
        completed: true, // Mark as completed immediately
      };
      homeStore.selectItem(updatedItem);
    }
    
    // Update calendar items optimistically
    const updatedCalendarItems = homeStore.calendarItems.map(item => 
      item.id.includes(`habit-${habit.id}`) && 
      item.date.toISOString().split('T')[0] === logData.date
        ? { ...item, completed: true }
        : item
    );
    
    homeStore.setCalendarItems(updatedCalendarItems);
    
    // Perform the actual update
    await abhyasaStore.addHabitLog(logData);
  };

  const handleDeleteHabitLog = async (logId: string) => {
    // Optimistic update - update the home store immediately
    const homeStore = useHomeStore.getState();
    
    // Update the selected item optimistically
    if (homeStore.selectedItem && homeStore.selectedItem.id.includes(`habit-${habit.id}`)) {
      const updatedItem = {
        ...homeStore.selectedItem,
        completed: false, // Mark as not completed immediately
      };
      homeStore.selectItem(updatedItem);
    }
    
    // Update calendar items optimistically
    const updatedCalendarItems = homeStore.calendarItems.map(item => 
      item.id.includes(`habit-${habit.id}`) && 
      item.date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
        ? { ...item, completed: false }
        : item
    );
    
    homeStore.setCalendarItems(updatedCalendarItems);
    
    // Perform the actual update
    await abhyasaStore.deleteHabitLog(logId);
  };

  // Force refresh when habit logs change to ensure real-time sync
  useEffect(() => {
    // This ensures the component re-renders when habit logs change
  }, [habitLogs]);

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
    const comparisonText = (comparison?: HabitTargetComparison) => {
      const comparisonMap = {
        [HabitTargetComparison.AT_LEAST]: 'At least',
        [HabitTargetComparison.EXACTLY]: 'Exactly',
        [HabitTargetComparison.LESS_THAN]: 'Less than',
        [HabitTargetComparison.ANY_VALUE]: 'Any value',
      };
      return comparisonMap[comparison || HabitTargetComparison.AT_LEAST];
    };

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

  const formatReminders = (reminders?: string[]) => {
    if (!reminders || reminders.length === 0) {
      return 'No reminders set';
    }
    return reminders.map(time => {
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }).join(', ');
  };

  const renderHabitLogging = () => {
    return (
      <HomeHabitLogging
        key={`${habit.id}-${selectedDate.toISOString().split('T')[0]}-${selectedDateLog?.id || 'no-log'}`}
        habit={habit}
        log={selectedDateLog}
        date={selectedDate}
        onLog={handleHabitLog}
        onDeleteLog={handleDeleteHabitLog}
      />
    );
  };

  const IconComponent = Icons[habit.icon] || Icons.TargetIcon;
  const statusDetails = getStatusDetails(habit.status);
  const StatusIcon = Icons[statusDetails.icon] || Icons.TargetIcon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-start gap-4">
          <IconComponent className={`w-12 h-12 text-${habit.color}`} />
          <div className="flex-1">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTitleSave();
                  }
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setTitleInput(habit.title || '');
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full text-3xl font-bold text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-3xl font-bold text-gray-800 cursor-text"
              >
                {habit.title}
              </h1>
            )}
            {isEditingDescription ? (
              <textarea
                ref={descriptionInputRef}
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setDescriptionInput(habit.description || '');
                    setIsEditingDescription(false);
                  }
                }}
                className="w-full mt-1 text-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-1 resize-none"
                rows={2}
                placeholder="Add description..."
              />
            ) : (
              <p
                onClick={() => setIsEditingDescription(true)}
                className="text-gray-500 mt-1 cursor-text"
              >
                {habit.description || 'Click to add description...'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPopup('status')}
            className="flex items-center gap-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
          >
            <StatusIcon className={`w-4 h-4 ${statusDetails.color}`} />
            <span className={statusDetails.color}>{statusDetails.name}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Icons.XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Habit Logging */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-500 mb-3 block">
          Log for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </label>
        {renderHabitLogging()}
      </div>

      {/* Details */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-500 mb-3 block">Details</label>
        <div className="p-4 bg-gray-50 rounded-lg space-y-3 border">
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
          <div className="flex items-center gap-2">
            <Icons.BellIcon className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-700 text-sm">Reminders:</span>
            <span className="text-sm text-gray-600">{formatReminders(habit.reminders)}</span>
          </div>
          {habit.totalTarget && (
            <div className="flex items-center gap-2">
              <Icons.TrendingUpIcon className="w-4 h-4 text-gray-400" />
                             <span className="font-semibold text-gray-700 text-sm">Goal Progress:</span>
               <span className="text-sm text-gray-600">
                 {totalProgress} / {habit.totalTarget}{' '}
                 {habit.type === HabitType.DURATION ? 'minutes' : 'times'}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* Journal */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
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

      {/* Statistics */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-500 mb-3 block">Statistics</label>
        <div className="p-4 bg-gray-50 rounded-lg space-y-3 border">
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
                         <span className="font-semibold text-gray-700 text-sm">Days Completed:</span>
             <span className="text-sm text-gray-600">
               {stats.daysCompleted} days
             </span>
          </div>
        </div>
      </div>

      {/* Habit Calendar */}
      <HabitCalendar habit={habit} habitLogs={habitLogs} selectedDate={selectedDate} />

             {/* Status Popup */}
       {popup === 'status' && (
         <div ref={popupRef} className="absolute shadow-lg z-20 top-full mt-2 left-0">
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
         </div>
       )}

               {showLogModal && (
          <AddLogModal
            isOpen={showLogModal}
            onClose={handleLogModalClose}
            selectedDate={selectedDate}
            habitContext={{
              habitId: habit.id,
              habitTitle: habit.title
            }}
          />
        )}
    </div>
  );
};

export default HomeHabitDetail; 