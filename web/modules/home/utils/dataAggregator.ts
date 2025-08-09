import type { Task } from '~/modules/kary/types';
import type { Habit, HabitLog } from '~/modules/abhyasa/types';
import { HabitType, HabitStatus } from '~/modules/abhyasa/types';
import type { Log } from '~/modules/dainandini/types';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';

/**
 * Calculates completion status for a habit on a specific date
 */
export const calculateHabitCompletionForDate = (
  habit: Habit,
  habitLogs: HabitLog[],
  date: Date
): boolean => {
  const dateString = date.toISOString().split('T')[0];
  
  // Find all logs for this habit and date, then get the most recent one
  const logsForDate = habitLogs.filter(log => 
    log.habitId === habit.id && 
    log.date === dateString
  );
  
  // Get the most recent log (last one in the array)
  const log = logsForDate.length > 0 ? logsForDate[logsForDate.length - 1] : null;
  
  if (!log) {
    return false;
  }
  
  if (habit.type === HabitType.BINARY) {
    // For binary habits, any log entry means completed
    return true;
  } else if (habit.type === HabitType.CHECKLIST) {
    // For checklist habits, check if all items are completed
    const completedItemIds = log.completedChecklistItems || [];
    const totalItems = habit.checklist?.length || 0;
    
    if (totalItems === 0) return false;
    
    // Check if all checklist item IDs are in the completed items array
    const allItemIds = habit.checklist?.map(item => item.id) || [];
    const allCompleted = allItemIds.every(id => completedItemIds.includes(id));
    
    return allCompleted;
  } else if (habit.type === HabitType.COUNT || habit.type === HabitType.DURATION) {
    // For count/duration habits, check if target is met
    const value = log.value || 0;
    const target = habit.dailyTarget || 0;
    return target > 0 && value >= target;
  }
  
  return false;
};

/**
 * Converts data from all modules into unified calendar items
 */
export const convertToCalendarItems = (
  tasks: Task[],
  habits: Habit[],
  habitLogs: HabitLog[],
  logs: Log[],
  lists: any[] = [],
  focusAreas: any[] = []
): CalendarItem[] => {
  const items: CalendarItem[] = [];

  // Convert tasks
  tasks.forEach((task) => {
    // Only show tasks in calendar if they have a due date
    if (task.dueDate) {
      const list = lists.find(l => l.id === task.listId);
      items.push({
        id: `task-${task.id}`,
        type: CalendarItemType.TASK,
        title: task.title,
        description: list ? list.name : 'Inbox', // Always show list name, fallback to 'Inbox'
        date: new Date(task.dueDate),
        color: 'blue-500',
        icon: 'CheckSquareIcon',
        completed: task.completed,
        originalData: task,
      });
    }
  });

  // Convert habits - only show habits with 'In Progress' status
  habits.forEach((habit) => {
    // Only show habits that are 'In Progress'
    if (habit.status !== HabitStatus.IN_PROGRESS) {
      return;
    }

    const focusArea = focusAreas.find(f => f.id === habit.focusAreaId);
    const startDate = new Date(habit.startDate);
    const endDate = habit.endDate ? new Date(habit.endDate) : null;
    const today = new Date();
    
    // Determine the date range for this habit
    let effectiveStartDate: Date;
    let effectiveEndDate: Date;
    
    if (endDate) {
      // Habit has an end date - show from start to end date
      effectiveStartDate = new Date(startDate);
      effectiveEndDate = new Date(endDate);
    } else {
      // Habit has no end date - show for all dates (similar to Abhyasa module)
      // Start from the habit's start date or today, whichever is later
      effectiveStartDate = new Date(Math.max(startDate.getTime(), today.getTime()));
      // End date is far in the future (e.g., 1 year from today)
      effectiveEndDate = new Date(today);
      effectiveEndDate.setFullYear(today.getFullYear() + 1);
    }
    
    // Additional check: if the effective start date is in the future, don't show the habit yet
    // Compare dates by setting time to midnight for accurate comparison
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);
    const effectiveStartMidnight = new Date(effectiveStartDate);
    effectiveStartMidnight.setHours(0, 0, 0, 0);
    
    if (effectiveStartMidnight > todayMidnight) {
      return; // Skip this habit if it hasn't started yet
    }
    

    
    // Generate calendar items for each day in the habit's date range
    // Only proceed if the start date is before or equal to the end date
    // Compare dates by setting time to midnight for accurate comparison
    const effectiveEndMidnight = new Date(effectiveEndDate);
    effectiveEndMidnight.setHours(0, 0, 0, 0);
    
    if (effectiveStartMidnight > effectiveEndMidnight) {
      return; // Skip this habit if start date is after end date
    }
    
    const currentDate = new Date(effectiveStartDate);
    
    while (currentDate <= effectiveEndDate) {
      // Only create items for dates that are today or in the future
      const currentDateMidnight = new Date(currentDate);
      currentDateMidnight.setHours(0, 0, 0, 0);
      
      if (currentDateMidnight >= todayMidnight) {
        // If habit has reminders, create calendar items for each reminder time
        if (habit.reminders && habit.reminders.length > 0) {
          habit.reminders.forEach((reminderTime, index) => {
            // Parse reminder time (assuming format like "09:00" or "14:30")
            const [hours, minutes] = reminderTime.split(':').map(Number);
            const reminderDate = new Date(currentDate);
            reminderDate.setHours(hours, minutes, 0, 0);
            
            // Calculate completion status for this specific date
            const isCompleted = calculateHabitCompletionForDate(habit, habitLogs, currentDate);
            
            items.push({
              id: `habit-${habit.id}-${currentDate.toISOString().split('T')[0]}-${index}`,
              type: CalendarItemType.HABIT,
              title: habit.title,
              description: focusArea ? focusArea.name : habit.description,
              date: reminderDate,
              color: habit.color || 'green-500',
              icon: habit.icon,
              completed: isCompleted,
              originalData: habit,
            });
          });
        } else {
          // If no reminders, show once for the day at 9 AM
          const defaultTime = new Date(currentDate);
          defaultTime.setHours(9, 0, 0, 0);
          
          // Calculate completion status for this specific date
          const isCompleted = calculateHabitCompletionForDate(habit, habitLogs, currentDate);
          
          items.push({
            id: `habit-${habit.id}-${currentDate.toISOString().split('T')[0]}`,
            type: CalendarItemType.HABIT,
            title: habit.title,
            description: focusArea ? focusArea.name : habit.description,
            date: defaultTime,
            color: habit.color || 'green-500',
            icon: habit.icon,
            completed: isCompleted,
            originalData: habit,
          });
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Note: We don't create calendar items for habit logs
  // Habit logs are used to determine completion status of habits

  // Convert logs
  logs.forEach((log) => {
    items.push({
      id: `log-${log.id}`,
      type: CalendarItemType.LOG,
      title: log.title,
      description: log.description,
      date: new Date(log.logDate),
      color: 'purple-500',
      icon: 'Edit3Icon',
      completed: log.completed || false,
      originalData: log,
    });
  });

  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Filters calendar items by date range
 */
export const filterItemsByDateRange = (
  items: CalendarItem[],
  startDate: Date,
  endDate: Date
): CalendarItem[] => {
  return items.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

/**
 * Filters calendar items by type
 */
export const filterItemsByType = (
  items: CalendarItem[],
  activeFilters: Set<CalendarItemType>
): CalendarItem[] => {
  if (activeFilters.size === 0) {
    return items; // Show all items if no filters are active
  }
  
  return items.filter((item) => activeFilters.has(item.type));
};

/**
 * Gets items for a specific date
 */
export const getItemsForDate = (
  items: CalendarItem[],
  date: Date
): CalendarItem[] => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return filterItemsByDateRange(items, startOfDay, endOfDay);
};

/**
 * Gets items for a specific week
 */
export const getItemsForWeek = (
  items: CalendarItem[],
  date: Date
): CalendarItem[] => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return filterItemsByDateRange(items, startOfWeek, endOfWeek);
};

/**
 * Gets items for a specific month
 */
export const getItemsForMonth = (
  items: CalendarItem[],
  date: Date
): CalendarItem[] => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  return filterItemsByDateRange(items, startOfMonth, endOfMonth);
};

/**
 * Groups items by date
 */
export const groupItemsByDate = (items: CalendarItem[]): Map<string, CalendarItem[]> => {
  const grouped = new Map<string, CalendarItem[]>();
  
  items.forEach((item) => {
    const dateKey = item.date.toDateString();
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(item);
  });
  
  return grouped;
};

/**
 * Calculates progress statistics for a given date range
 */
export const calculateProgressStats = (
  items: CalendarItem[],
  startDate: Date,
  endDate: Date
) => {
  const filteredItems = filterItemsByDateRange(items, startDate, endDate);
  
  const tasks = filteredItems.filter(item => item.type === CalendarItemType.TASK);
  const habits = filteredItems.filter(item => item.type === CalendarItemType.HABIT);
  const logs = filteredItems.filter(item => item.type === CalendarItemType.LOG);
  
  const completedTasks = tasks.filter(item => item.completed).length;
  const completedHabits = habits.filter(item => item.completed).length;
  
  return {
    totalTasks: tasks.length,
    completedTasks,
    taskCompletionRate: tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0,
    totalHabits: habits.length,
    completedHabits,
    habitCompletionRate: habits.length > 0 ? (completedHabits / habits.length) * 100 : 0,
    journalEntries: logs.length,
    totalItems: filteredItems.length,
  };
};

/**
 * Sorts items by priority and completion status
 */
export const sortItemsByPriority = (items: CalendarItem[]): CalendarItem[] => {
  return [...items].sort((a, b) => {
    // First, sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then, sort by type priority (tasks first, then habits, then logs)
    const typePriority = {
      [CalendarItemType.TASK]: 1,
      [CalendarItemType.HABIT]: 2,
      [CalendarItemType.HABIT_LOG]: 3,
      [CalendarItemType.LOG]: 4,
    };
    
    const aPriority = typePriority[a.type];
    const bPriority = typePriority[b.type];
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // Finally, sort by date
    return a.date.getTime() - b.date.getTime();
  });
}; 