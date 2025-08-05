import React, { useMemo } from 'react';
import * as Icons from '~/components/Icons';
import { useHomeStore } from '../homeStore';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';

interface QuickActionsPanelProps {
  onAddTask?: () => void;
  onAddHabitLog?: () => void;
  onAddJournalEntry?: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onAddTask,
  onAddHabitLog,
  onAddJournalEntry,
}) => {
  const { selectedDate, calendarItems } = useHomeStore();

  // Today's items
  const todayItems = useMemo(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    return calendarItems.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startOfDay && itemDate <= endOfDay;
    });
  }, [calendarItems, selectedDate]);

  // Progress calculations
  const progressStats = useMemo(() => {
    const todayTasks = todayItems.filter(item => item.type === CalendarItemType.TASK);
    const todayHabits = todayItems.filter(item => item.type === CalendarItemType.HABIT_LOG);
    const todayLogs = todayItems.filter(item => item.type === CalendarItemType.LOG);

    const completedTasks = todayTasks.filter(item => item.completed).length;
    const completedHabits = todayHabits.filter(item => item.completed).length;
    const totalTasks = todayTasks.length;
    const totalHabits = todayHabits.length;

    return {
      tasksCompleted: completedTasks,
      totalTasks,
      tasksProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      habitsCompleted: completedHabits,
      totalHabits,
      habitsProgress: totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0,
      journalEntries: todayLogs.length,
    };
  }, [todayItems]);

  // Quick action buttons
  const quickActions = [
    {
      label: 'Add Task',
      icon: 'PlusIcon',
      onClick: onAddTask,
      color: 'blue',
    },
    {
      label: 'Log Habit',
      icon: 'CheckSquareIcon',
      onClick: onAddHabitLog,
      color: 'green',
    },
    {
      label: 'Add Entry',
      icon: 'Edit3Icon',
      onClick: onAddJournalEntry,
      color: 'purple',
    },
  ];

  const getIconComponent = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.PlusIcon;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Today's Focus */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Icons.TargetIcon className="w-4 h-4 mr-2 text-blue-600" />
          Today&apos;s Focus
        </h3>
        
        {todayItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Icons.CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No items scheduled for today</p>
            <p className="text-xs text-gray-400 mt-1">Add some tasks or habits to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <div className={`w-2 h-2 rounded-full mr-3 bg-${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.type === CalendarItemType.TASK ? 'Task' :
                     item.type === CalendarItemType.HABIT_LOG ? 'Habit' : 'Journal'}
                  </p>
                </div>
                {item.completed && (
                  <Icons.CheckIcon className="w-4 h-4 text-green-500 ml-2" />
                )}
              </div>
            ))}
            {todayItems.length > 3 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{todayItems.length - 3} more items
              </p>
            )}
          </div>
        )}
      </div>

      {/* Progress Indicators */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Icons.TrendingUpIcon className="w-4 h-4 mr-2 text-green-600" />
          Today&apos;s Progress
        </h3>
        
        <div className="space-y-3">
          {/* Tasks Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">Tasks</span>
              <span className="text-xs text-gray-500">
                {progressStats.tasksCompleted}/{progressStats.totalTasks}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressStats.tasksProgress}%` }}
              />
            </div>
          </div>

          {/* Habits Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">Habits</span>
              <span className="text-xs text-gray-500">
                {progressStats.habitsCompleted}/{progressStats.totalHabits}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressStats.habitsProgress}%` }}
              />
            </div>
          </div>

          {/* Journal Entries */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-700">Journal Entries</span>
            <span className="text-xs text-gray-500">{progressStats.journalEntries}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Icons.MagicWandIcon className="w-4 h-4 mr-2 text-yellow-600" />
          Quick Actions
        </h3>
        
        <div className="space-y-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`w-full flex items-center p-3 rounded-md border border-gray-200 hover:border-${action.color}-300 hover:bg-${action.color}-50 transition-colors duration-200`}
            >
              <div className={`w-8 h-8 rounded-md bg-${action.color}-100 flex items-center justify-center mr-3`}>
                {getIconComponent(action.icon)}
              </div>
              <span className="text-sm font-medium text-gray-900">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Streak Counter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Icons.HeartIcon className="w-4 h-4 mr-2 text-orange-600" />
          Current Streaks
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-700">Task Completion</span>
            <span className="text-xs font-medium text-orange-600">7 days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-700">Habit Tracking</span>
            <span className="text-xs font-medium text-orange-600">5 days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-700">Journal Writing</span>
            <span className="text-xs font-medium text-orange-600">3 days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel; 