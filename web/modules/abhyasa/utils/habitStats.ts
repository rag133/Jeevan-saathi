import { Habit, HabitLog, HabitLogStatus, HabitFrequencyType, HabitType, HabitTargetComparison } from '~/modules/abhyasa/types';

interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  daysCompleted: number;
  goalProgress: number;
}

interface CalculatedStatus {
  status: HabitLogStatus;
  progress: number; // 0-1 for partial completion
  isComplete: boolean;
}

// Centralized status calculation service
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
  const comparison = habit.dailyTargetComparison || HabitTargetComparison.AT_LEAST;

  let isComplete = false;
  let progress = 0;

  switch (comparison) {
    case HabitTargetComparison.AT_LEAST:
      isComplete = value >= target;
      progress = Math.min(1, value / target);
      break;
    case HabitTargetComparison.LESS_THAN:
      isComplete = value < target;
      progress = value > 0 ? 1 : 0;
      break;
    case HabitTargetComparison.EXACTLY:
      isComplete = value === target;
      progress = value > 0 ? Math.min(1, value / target) : 0;
      break;
    case HabitTargetComparison.ANY_VALUE:
      isComplete = value > 0;
      progress = value > 0 ? 1 : 0;
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

  const isComplete = value >= target;
  const progress = Math.min(1, value / target);
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
  const isComplete = completedCount === totalItems;
  const progress = totalItems > 0 ? completedCount / totalItems : 0;
  const status = isComplete ? HabitLogStatus.DONE : 
                 completedCount > 0 ? HabitLogStatus.PARTIAL : 
                 HabitLogStatus.NONE;

  return { status, progress, isComplete };
};

// Helper to get logs for a specific date
const getLogForDate = (logs: HabitLog[], date: Date): HabitLog | undefined => {
  const dateString = date.toISOString().split('T')[0];
  return logs.find((log) => log.date === dateString);
};

// Helper to check if a date is within the habit's active period and expected frequency
const isDateActiveForHabit = (date: Date, habit: Habit): boolean => {
  const start = new Date(habit.startDate);
  start.setHours(0, 0, 0, 0);
  const end = habit.endDate ? new Date(habit.endDate) : null;
  if (end) end.setHours(23, 59, 59, 999);

  if (date < start || (end && date > end)) {
    return false;
  }

  switch (habit.frequency.type) {
    case HabitFrequencyType.DAILY:
      return true;
    case HabitFrequencyType.WEEKLY:
    case HabitFrequencyType.MONTHLY:
      return true;
    case HabitFrequencyType.SPECIFIC_DAYS:
      return habit.frequency.days.includes(date.getDay());
    default:
      return false;
  }
};

// Helper to check if a habit should be shown on a specific date based on frequency limits
export const shouldShowHabitOnDate = (habit: Habit, date: Date, allHabitLogs: HabitLog[]): boolean => {
  const start = new Date(habit.startDate);
  start.setHours(0, 0, 0, 0);
  const end = habit.endDate ? new Date(habit.endDate) : null;
  if (end) end.setHours(23, 59, 59, 999);

  if (date < start || (end && date > end)) {
    return false;
  }

  switch (habit.frequency.type) {
    case HabitFrequencyType.DAILY:
      return true;
    case HabitFrequencyType.SPECIFIC_DAYS:
      return habit.frequency.days.includes(date.getDay());
    case HabitFrequencyType.WEEKLY: {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const logsInWeek = allHabitLogs.filter(log => {
        const logDate = new Date(log.date);
        return log.habitId === habit.id && 
               logDate >= weekStart && 
               logDate <= weekEnd;
      });

      const completedLogsInWeek = logsInWeek.filter(log => {
        const status = calculateHabitStatus(habit, log);
        return status.status === HabitLogStatus.DONE;
      });

      return completedLogsInWeek.length < habit.frequency.times;
    }
    case HabitFrequencyType.MONTHLY: {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const logsInMonth = allHabitLogs.filter(log => {
        const logDate = new Date(log.date);
        return log.habitId === habit.id && 
               logDate >= monthStart && 
               logDate <= monthEnd;
      });

      const completedLogsInMonth = logsInMonth.filter(log => {
        const status = calculateHabitStatus(habit, log);
        return status.status === HabitLogStatus.DONE;
      });

      return completedLogsInMonth.length < habit.frequency.times;
    }
    default:
      return false;
  }
};

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
    if (isDateActiveForHabit(currentDate, habit)) {
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
    if (isDateActiveForHabit(checkDate, habit)) {
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
