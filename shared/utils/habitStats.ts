import type { Habit, HabitLog } from '../types/abhyasa';
import { HabitLogStatus, HabitType, HabitTargetComparison } from '../types/abhyasa';

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  daysCompleted: number;
  goalProgress: number;
}

export interface CalculatedStatus {
  status: HabitLogStatus;
  progress: number; // 0-1 for partial completion
  isComplete: boolean;
}

// Centralized status calculation service - used by both web and mobile apps
export const calculateHabitStatus = (
  habit: Habit,
  log: HabitLog | null
): CalculatedStatus => {
  if (!log) {
    return { status: HabitLogStatus.NONE, progress: 0, isComplete: false };
  }

  switch (habit.type) {
    case HabitType.BINARY:
      // Binary habits are either done or not done
      return { status: HabitLogStatus.DONE, progress: 1, isComplete: true };

    case HabitType.COUNT:
      return calculateCountStatus(habit, log);

    case HabitType.DURATION:
      return calculateDurationStatus(habit, log);

    case HabitType.CHECKLIST:
      return calculateChecklistStatus(habit, log);

    default:
      return { status: HabitLogStatus.NONE, progress: 0, isComplete: false };
  }
};

const calculateCountStatus = (habit: Habit, log: HabitLog): CalculatedStatus => {
  const value = log.value || 0;
  const target = habit.dailyTarget || 1;
  const comparison = habit.dailyTargetComparison || HabitTargetComparison.GREATER_THAN_OR_EQUAL;

  let isComplete = false;
  let progress = 0;

  switch (comparison) {
    case HabitTargetComparison.GREATER_THAN_OR_EQUAL:
      isComplete = value >= target;
      progress = Math.min(1, value / target);
      break;
    case HabitTargetComparison.LESS_THAN:
      isComplete = value < target;
      progress = value > 0 ? 1 : 0;
      break;
    case HabitTargetComparison.EQUAL:
      isComplete = value === target;
      progress = value > 0 ? Math.min(1, value / target) : 0;
      break;
    case HabitTargetComparison.GREATER_THAN:
      isComplete = value > target;
      progress = value > target ? 1 : Math.min(1, value / target);
      break;
    case HabitTargetComparison.LESS_THAN_OR_EQUAL:
      isComplete = value <= target;
      progress = value > 0 ? Math.min(1, value / target) : 0;
      break;
  }

  const status = isComplete ? HabitLogStatus.DONE : 
                 value > 0 ? HabitLogStatus.PARTIAL : 
                 HabitLogStatus.NONE;

  return { status, progress, isComplete };
};

const calculateDurationStatus = (habit: Habit, log: HabitLog): CalculatedStatus => {
  const value = log.value || 0;
  const target = habit.dailyTarget || 1;
  const comparison = habit.dailyTargetComparison || HabitTargetComparison.GREATER_THAN_OR_EQUAL;

  let isComplete = false;
  let progress = 0;

  switch (comparison) {
    case HabitTargetComparison.GREATER_THAN_OR_EQUAL:
      isComplete = value >= target;
      progress = Math.min(1, value / target);
      break;
    case HabitTargetComparison.LESS_THAN:
      isComplete = value < target;
      progress = value > 0 ? 1 : 0;
      break;
    case HabitTargetComparison.EQUAL:
      isComplete = value === target;
      progress = value > 0 ? Math.min(1, value / target) : 0;
      break;
    case HabitTargetComparison.GREATER_THAN:
      isComplete = value > target;
      progress = value > target ? 1 : Math.min(1, value / target);
      break;
    case HabitTargetComparison.LESS_THAN_OR_EQUAL:
      isComplete = value <= target;
      progress = value > 0 ? Math.min(1, value / target) : 0;
      break;
  }

  const status = isComplete ? HabitLogStatus.DONE : 
                 value > 0 ? HabitLogStatus.PARTIAL : 
                 HabitLogStatus.NONE;

  return { status, progress, isComplete };
};

const calculateChecklistStatus = (habit: Habit, log: HabitLog): CalculatedStatus => {
  const completedItems = log.completedChecklistItems || [];
  const totalItems = habit.checklist?.length || 0;

  if (totalItems === 0) {
    return { status: HabitLogStatus.NONE, progress: 0, isComplete: false };
  }

  const completedCount = completedItems.length;
  const progress = completedCount / totalItems;
  const isComplete = completedCount === totalItems;

  let status: HabitLogStatus;
  if (isComplete) {
    status = HabitLogStatus.DONE;
  } else if (completedCount > 0) {
    status = HabitLogStatus.PARTIAL;
  } else {
    status = HabitLogStatus.NONE;
  }

  return { status, progress, isComplete };
};

// Helper function to check if a habit should be shown on a specific date
export const shouldShowHabitOnDate = (habit: Habit, date: Date): boolean => {
  const startDate = new Date(habit.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = habit.endDate ? new Date(habit.endDate) : null;
  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
  }
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // Check if date is within habit's active period
  if (checkDate < startDate || (endDate && checkDate > endDate)) {
    return false;
  }

  // Check frequency-based logic
  switch (habit.frequency.type) {
    case 'daily':
      return true;
    
    case 'weekly':
      // For weekly habits, check if it's the right day of the week
      const dayOfWeek = checkDate.getDay();
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() - startDate.getDay());
      const weeksSinceStart = Math.floor((checkDate.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weeksSinceStart >= 0;
    
    case 'monthly':
      // For monthly habits, check if it's the right day of the month
      const dayOfMonth = checkDate.getDate();
      const startDayOfMonth = startDate.getDate();
      return dayOfMonth === startDayOfMonth;
    
    case 'specific_days':
      // For specific days habits, check if current day is in the allowed days
      if (habit.frequency.days && Array.isArray(habit.frequency.days)) {
        const currentDayNumber = checkDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        return habit.frequency.days.includes(currentDayNumber);
      }
      return false;
    
    default:
      return true;
  }
};

// Helper function to get log for a specific date
export const getLogForDate = (logs: HabitLog[], date: Date): HabitLog | null => {
  const dateString = date.toISOString().split('T')[0];
  const logsForDate = logs.filter(log => log.date === dateString);
  
  // Return the most recent log for the date
  return logsForDate.length > 0 ? logsForDate[logsForDate.length - 1] : null;
};

// Calculate comprehensive habit statistics
export const calculateHabitStats = (
  habit: Habit,
  allHabitLogs: HabitLog[],
  today: Date = new Date()
): HabitStats => {
  if (!habit) {
    return { currentStreak: 0, bestStreak: 0, completionRate: 0, daysCompleted: 0, goalProgress: 0 };
  }

  const logs = allHabitLogs.filter((log) => log.habitId === habit.id);

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  let completedDays = 0;
  let expectedDaysForCompletionRate = 0;

  // Calculate goal progress (Total Accumulated Value)
  let goalProgress = 0;
  
  // Group logs by date to get the final state for each day
  const logsByDate = new Map<string, HabitLog>();
  logs.forEach(log => {
    logsByDate.set(log.date, log);
  });

  if (habit.type === HabitType.COUNT || habit.type === HabitType.DURATION) {
    goalProgress = Array.from(logsByDate.values()).reduce((sum, log) => {
      return sum + (log.value || 0);
    }, 0);
  } else if (habit.type === HabitType.BINARY) {
    goalProgress = Array.from(logsByDate.values()).filter((log) => {
      const status = calculateHabitStatus(habit, log);
      return status.status === HabitLogStatus.DONE;
    }).length;
  } else if (habit.type === HabitType.CHECKLIST) {
    goalProgress = Array.from(logsByDate.values()).reduce(
      (sum, log) => sum + (log.completedChecklistItems?.length || 0),
      0
    );
  }

  // Calculate days completed (Total Completed Days)
  const daysCompleted = Array.from(logsByDate.values()).filter((log) => {
    const status = calculateHabitStatus(habit, log);
    return status.status === HabitLogStatus.DONE;
  }).length;

  // Calculate streaks and completion rate
  const startDate = new Date(habit.startDate);
  startDate.setHours(0, 0, 0, 0);
  const todayNoTime = new Date(today);
  todayNoTime.setHours(0, 0, 0, 0);

  const currentDate = new Date(startDate);

  // Iterate from start date up to (and including) today
  while (currentDate <= todayNoTime) {
    if (shouldShowHabitOnDate(habit, currentDate)) {
      const log = getLogForDate(logs, currentDate);
      const status = calculateHabitStatus(habit, log || null);

      if (status.status === HabitLogStatus.DONE) {
        tempStreak++;
        completedDays++;
        expectedDaysForCompletionRate++;
      } else {
        // Any non-DONE status breaks the streak
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 0;
        expectedDaysForCompletionRate++;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // After loop, update bestStreak one last time to catch the final streak
  bestStreak = Math.max(bestStreak, tempStreak);

  // Calculate current streak by iterating backwards from today
  const checkDate = new Date(todayNoTime);
  let currentStreakCount = 0;
  let foundBreakForCurrentStreak = false;
  
  while (checkDate >= startDate && !foundBreakForCurrentStreak) {
    if (shouldShowHabitOnDate(habit, checkDate)) {
      const log = getLogForDate(logs, checkDate);
      const status = calculateHabitStatus(habit, log || null);
      
      if (status.status === HabitLogStatus.DONE) {
        currentStreakCount++;
      } else {
        // Any non-DONE status breaks the current streak
        foundBreakForCurrentStreak = true;
      }
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  currentStreak = currentStreakCount;

  const completionRate =
    expectedDaysForCompletionRate > 0 ? (completedDays / expectedDaysForCompletionRate) * 100 : 0;

  return {
    currentStreak,
    bestStreak,
    completionRate: parseFloat(completionRate.toFixed(2)),
    daysCompleted,
    goalProgress,
  };
};
