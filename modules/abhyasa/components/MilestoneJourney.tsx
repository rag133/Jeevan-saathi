import React from 'react';
import { Habit, HabitLog, HabitLogStatus } from '../types';
import * as Icons from '../../../components/Icons';

const getHabitStatusForToday = (
  habit: Habit,
  habitLogs: HabitLog[]
): { text: string; color: string; icon: keyof typeof Icons } => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLog = habitLogs.find((log) => log.habitId === habit.id && log.date === todayStr);

  if (todaysLog?.status === HabitLogStatus.COMPLETED) {
    return { text: 'Completed', color: 'green', icon: 'CheckSquareIcon' };
  }
  if (todaysLog) {
    return { text: 'In Progress', color: 'blue', icon: 'RepeatIcon' };
  }
  return { text: 'Pending', color: 'gray', icon: 'ClockIcon' };
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const HabitPill: React.FC<{ habit: Habit; habitLogs: HabitLog[] }> = ({ habit, habitLogs }) => {
  const Icon = Icons[habit.icon];
  const todayStatus = getHabitStatusForToday(habit, habitLogs);
  const StatusIcon = Icons[todayStatus.icon];
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-200`}>
      <Icon className={`w-6 h-6 text-${habit.color}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-gray-800`}>{habit.title}</p>
        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
          <Icons.CalendarIcon className="w-3 h-3" />
          <span>{formatDate(habit.createdAt)}</span>
          {habit.endDate && (
            <>
              {' '}
              <Icons.ChevronRightIcon className="w-3 h-3" />{' '}
              <span>{formatDate(habit.endDate)}</span>
            </>
          )}
        </div>
      </div>
      <div
        className={`flex items-center gap-1.5 text-xs font-semibold text-${todayStatus.color}-600 ml-auto px-2 py-1 rounded-full bg-${todayStatus.color}-100`}
      >
        <StatusIcon
          className={`w-3 h-3 ${todayStatus.icon === 'RepeatIcon' ? 'animate-spin' : ''}`}
        />
        <span>{todayStatus.text}</span>
      </div>
    </div>
  );
};

interface MilestoneJourneyProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  onAddHabit: () => void;
  onLinkHabit: () => void;
}

const MilestoneJourney: React.FC<MilestoneJourneyProps> = ({
  habits,
  habitLogs,
  onAddHabit,
  onLinkHabit,
}) => {
  return (
    <div className="relative pl-5">
      <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-gray-200 rounded-full"></div>

      <div className="relative mb-8">
        <div className="absolute left-4 top-2 w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 bg-gray-700">
          <Icons.CheckSquareIcon className="w-4 h-4 text-white" />
        </div>
        <div className="ml-10 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-bold text-lg text-gray-800">Habits for this Milestone</h4>

          <div className="mt-4 pt-3 border-t border-dashed">
            {habits.length > 0 ? (
              <div className="space-y-2">
                {habits.map((habit) => (
                  <HabitPill key={habit.id} habit={habit} habitLogs={habitLogs} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic py-1">
                No habits linked. Add habits to make progress on this milestone.
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-dashed">
            <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Actions</h5>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={onAddHabit}
                className="text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-2"
              >
                <Icons.PlusIcon className="w-4 h-4 text-white bg-gray-700 rounded-full p-0.5" />
                Add New Habit
              </button>
              <button
                onClick={onLinkHabit}
                className="text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-2"
              >
                <Icons.TagIcon className="w-4 h-4" />
                Link Existing Habit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneJourney;
