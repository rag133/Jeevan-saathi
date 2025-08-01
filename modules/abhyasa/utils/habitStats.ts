import { Habit, HabitLog, HabitLogStatus, HabitFrequencyType, HabitType } from '../types';

interface HabitStats {
    currentStreak: number;
    bestStreak: number;
    completionRate: number;
    totalCompletions: number;
}

// Helper to get logs for a specific date
const getLogForDate = (logs: HabitLog[], date: Date): HabitLog | undefined => {
    const dateString = date.toISOString().split('T')[0];
    return logs.find(log => log.date === dateString);
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
            // For weekly/monthly, any day within the habit's overall active period is considered active
            // The 'times' per week/month is handled by completion rate/total completions, not daily activity.
            return true;
        case HabitFrequencyType.SPECIFIC_DAYS:
            return habit.frequency.days.includes(date.getDay());
        default:
            return false;
    }
};

export const calculateHabitStats = (habit: Habit, allHabitLogs: HabitLog[], today: Date = new Date()): HabitStats => {
    if (!habit) {
        return { currentStreak: 0, bestStreak: 0, completionRate: 0, totalCompletions: 0 };
    }

    const logs = allHabitLogs.filter(log => log.habitId === habit.id);

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    let completedDays = 0;
    let expectedDaysForCompletionRate = 0;

    // Calculate total completions
    let totalCompletions = 0;
    if (habit.type === HabitType.COUNT || habit.type === HabitType.DURATION) {
        totalCompletions = logs.reduce((sum, log) => sum + (log.value || 0), 0);
    } else if (habit.type === HabitType.BINARY || habit.type === HabitType.CHECKLIST) {
        totalCompletions = logs.filter(log => log.status === HabitLogStatus.COMPLETED).length;
    }

    // Calculate streaks and completion rate
    const startDate = new Date(habit.startDate);
    startDate.setHours(0, 0, 0, 0);
    const todayNoTime = new Date(today);
    todayNoTime.setHours(0, 0, 0, 0);

    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    // Iterate from start date up to (and including) today
    while (currentDate <= todayNoTime) {
        if (isDateActiveForHabit(currentDate, habit)) {
            const log = getLogForDate(logs, currentDate);

            if (log && log.status === HabitLogStatus.COMPLETED) {
                tempStreak++;
                completedDays++;
                expectedDaysForCompletionRate++;
            } else if (log && log.status === HabitLogStatus.SKIPPED) {
                // Skipped days do not break streak, and do not count as completed for completion rate
                // They also don't count as expected for the denominator of completion rate
                // No change to tempStreak, no change to completedDays, no change to expectedDaysForCompletionRate
            } else {
                // Missed or no log for an active day
                bestStreak = Math.max(bestStreak, tempStreak);
                tempStreak = 0; // Streak broken
                expectedDaysForCompletionRate++;
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // After loop, update bestStreak one last time to catch the final streak
    bestStreak = Math.max(bestStreak, tempStreak);

    // Calculate current streak by iterating backwards from today
    let checkDate = new Date(todayNoTime);
    let currentStreakCount = 0;
    let foundBreakForCurrentStreak = false;
    while (checkDate >= startDate && !foundBreakForCurrentStreak) {
        if (isDateActiveForHabit(checkDate, habit)) {
            const log = getLogForDate(logs, checkDate);
            if (log && (log.status === HabitLogStatus.COMPLETED || log.status === HabitLogStatus.SKIPPED)) {
                // If it's completed or skipped, it contributes to the current streak
                // Only count completed for the actual streak number, skipped just maintains it.
                if (log.status === HabitLogStatus.COMPLETED) {
                    currentStreakCount++;
                }
            } else {
                // Missed or no log, current streak broken
                foundBreakForCurrentStreak = true;
            }
        }
        checkDate.setDate(checkDate.getDate() - 1);
    }
    currentStreak = currentStreakCount;

    const completionRate = expectedDaysForCompletionRate > 0 ? (completedDays / expectedDaysForCompletionRate) * 100 : 0;

    return {
        currentStreak,
        bestStreak,
        completionRate: parseFloat(completionRate.toFixed(2)),
        totalCompletions,
    };
};