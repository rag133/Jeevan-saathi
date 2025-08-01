import React from 'react';
import { Milestone, Habit, MilestoneStatus, HabitLog, HabitStatus } from '../types';
import * as Icons from '../../../components/Icons';

const getMilestoneStatusClasses = (status: MilestoneStatus) => {
  switch (status) {
    case MilestoneStatus.COMPLETED:
      return {
        bg: 'bg-green-500',
        text: 'text-white',
        border: 'border-green-500',
        icon: 'CheckSquareIcon',
      };
    case MilestoneStatus.IN_PROGRESS:
      return {
        bg: 'bg-blue-500',
        text: 'text-white',
        border: 'border-blue-500',
        icon: 'RepeatIcon',
      };
    case MilestoneStatus.ABANDONED:
      return { bg: 'bg-red-500', text: 'text-white', border: 'border-red-500', icon: 'Trash2Icon' };
    default: // NOT_STARTED
      return { bg: 'bg-white', text: 'text-gray-500', border: 'border-gray-400', icon: 'FlagIcon' };
  }
};

const getHabitStatusDetails = (status: HabitStatus) => {
  const colorMap: Record<HabitStatus, string> = {
    [HabitStatus.COMPLETED]: 'green',
    [HabitStatus.IN_PROGRESS]: 'blue',
    [HabitStatus.ABANDONED]: 'red',
    [HabitStatus.YET_TO_START]: 'gray',
  };
  const color = colorMap[status] || 'gray';
  return {
    name: status,
    colorClass: `bg-${color}-100 text-${color}-800`,
  };
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const HabitPill: React.FC<{ habit: Habit }> = ({ habit }) => {
  const Icon = Icons[habit.icon];
  const statusDetails = getHabitStatusDetails(habit.status);
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-200`}>
      <Icon className={`w-6 h-6 text-${habit.color}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-gray-800`}>{habit.title}</p>
        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
          <Icons.CalendarIcon className="w-3 h-3" />
          <span>{formatDate(habit.startDate)}</span>
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
        className={`text-xs font-semibold ml-auto px-2 py-1 rounded-full ${statusDetails.colorClass}`}
      >
        <span>{statusDetails.name}</span>
      </div>
    </div>
  );
};

interface GoalJourneyProps {
  milestones: Milestone[];
  habits: Habit[];
  habitLogs: HabitLog[];
  onAddMilestone: () => void;
  onLinkMilestone: () => void;
  onAddHabit: () => void;
  onLinkHabit: () => void;
  onAddHabitToMilestone: (milestoneId: string) => void;
  onLinkHabitToMilestone: (milestoneId: string) => void;
}

const GoalJourney: React.FC<GoalJourneyProps> = ({
  milestones,
  habits,
  habitLogs,
  onAddMilestone,
  onLinkMilestone,
  onAddHabit,
  onLinkHabit,
  onAddHabitToMilestone,
  onLinkHabitToMilestone,
}) => {
  const habitsWithoutMilestone = habits.filter((h) => !h.milestoneId);
  const sortedMilestones = [...milestones].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  return (
    <div className="relative pl-5">
      {/* The main timeline vertical bar */}
      <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-gray-200 rounded-full"></div>

      {sortedMilestones.map((milestone) => {
        const milestoneHabits = habits.filter((h) => h.milestoneId === milestone.id);
        const statusClasses = getMilestoneStatusClasses(milestone.status);
        const StatusIcon = Icons[statusClasses.icon];

        return (
          <div key={milestone.id} className="relative mb-8">
            {/* Milestone Node */}
            <div
              className={`absolute left-4 top-2 w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 ${statusClasses.bg}`}
            >
              <StatusIcon className={`w-4 h-4 ${statusClasses.text}`} />
            </div>

            {/* Milestone Card */}
            <div className="ml-10 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg text-gray-800">{milestone.title}</h4>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <Icons.CalendarIcon className="w-3 h-3" />
                    <span>{formatDate(milestone.startDate)}</span>
                    <Icons.ChevronRightIcon className="w-3 h-3 text-gray-400" />
                    <span>
                      {milestone.targetEndDate
                        ? formatDate(milestone.targetEndDate)
                        : 'No Target Date'}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700`}
                >
                  {milestone.status}
                </span>
              </div>

              {milestone.description && (
                <p className="text-sm text-gray-600 mt-2">{milestone.description}</p>
              )}

              {milestoneHabits.length > 0 && (
                <div className="mt-4 pt-3 border-t border-dashed">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Linked Habits
                  </h5>
                  <div className="space-y-2">
                    {milestoneHabits.length > 0 ? (
                      milestoneHabits.map((habit) => <HabitPill key={habit.id} habit={habit} />)
                    ) : (
                      <p className="text-xs text-gray-500 italic py-1">
                        No specific habits for this milestone.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => onAddHabitToMilestone(milestone.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    >
                      <Icons.PlusIcon className="w-3 h-3" />
                      Add Habit
                    </button>
                    <button
                      onClick={() => onLinkHabitToMilestone(milestone.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                    >
                      <Icons.TagIcon className="w-3 h-3" />
                      Link Habit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Finish Line Actions */}
      <div className="relative mb-8">
        <div className="absolute left-4 top-2 w-8 h-8 rounded-full flex items-center justify-center transform -translate-x-1/2 bg-gray-700">
          <Icons.FlagIcon className="w-4 h-4 text-white" />
        </div>
        <div className="ml-10 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-bold text-lg text-gray-800">Finish Line</h4>

          {habitsWithoutMilestone.length > 0 && (
            <div className="mt-4 pt-3 border-t border-dashed">
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">General Habits</h5>
              <div className="space-y-2">
                {habitsWithoutMilestone.map((habit) => (
                  <HabitPill key={habit.id} habit={habit} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-dashed">
            <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Goal Actions</h5>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={onAddMilestone}
                className="text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-2"
              >
                <Icons.PlusIcon className="w-4 h-4 text-white bg-gray-700 rounded-full p-0.5" />
                Add Milestone
              </button>
              <button
                onClick={onLinkMilestone}
                className="text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-2"
              >
                <Icons.TagIcon className="w-4 h-4" />
                Link Milestone
              </button>
              <button
                onClick={onAddHabit}
                className="text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-2"
              >
                <Icons.PlusIcon className="w-4 h-4 text-white bg-gray-700 rounded-full p-0.5" />
                Add General Habit
              </button>
              <button
                onClick={onLinkHabit}
                className="text-sm font-semibold text-gray-700 hover:text-black flex items-center gap-2"
              >
                <Icons.TagIcon className="w-4 h-4" />
                Link General Habit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalJourney;
