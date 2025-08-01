import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Goal, Milestone, Habit, GoalStatus, HabitLog } from '~/modules/abhyasa/types';
import * as Icons from '~/components/Icons';
import DateTimePicker from '~/modules/kary/components/DateTimePicker';
import GoalJourney from './GoalJourney';
import { Focus, Log } from '~/modules/dainandini/types';
import HabitLogItem from './HabitLogItem';

const goalStatusItems: { id: GoalStatus; name: string; color: string; icon: keyof typeof Icons }[] =
  [
    {
      id: GoalStatus.NOT_STARTED,
      name: 'Not Started',
      color: 'text-gray-500',
      icon: 'SunriseIcon',
    },
    { id: GoalStatus.IN_PROGRESS, name: 'In Progress', color: 'text-blue-500', icon: 'RepeatIcon' },
    {
      id: GoalStatus.COMPLETED,
      name: 'Completed',
      color: 'text-green-500',
      icon: 'CheckSquareIcon',
    },
    { id: GoalStatus.ABANDONED, name: 'Abandoned', color: 'text-red-500', icon: 'Trash2Icon' },
  ];

const getStatusDetails = (status: GoalStatus) => {
  return goalStatusItems.find((item) => item.id === status) || goalStatusItems[0];
};

interface GoalDetailProps {
  goal: Goal | null;
  milestones: Milestone[];
  habits: Habit[];
  habitLogs: HabitLog[];
  allFoci: Focus[];
  allLogs: Log[];
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onAddMilestone: () => void;
  onLinkMilestone: () => void;
  onAddHabit: () => void;
  onLinkHabit: () => void;
  onAddHabitToMilestone: (milestoneId: string) => void;
  onLinkHabitToMilestone: (milestoneId: string) => void;
  onEditGoal: (goal: Goal) => void;
  onOpenLogModal: (goal: Goal) => void;
}

const GoalDetail: React.FC<GoalDetailProps> = (props) => {
  const {
    goal,
    milestones,
    habits,
    habitLogs,
    allFoci,
    allLogs,
    onUpdateGoal,
    onDeleteGoal,
    onAddMilestone,
    onLinkMilestone,
    onAddHabit,
    onLinkHabit,
    onAddHabitToMilestone,
    onLinkHabitToMilestone,
    onEditGoal,
    onOpenLogModal,
  } = props;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [popup, setPopup] = useState<'date' | 'status' | 'more' | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRefs = {
    date: useRef<HTMLButtonElement>(null),
    status: useRef<HTMLButtonElement>(null),
    more: useRef<HTMLButtonElement>(null),
  };

  const goalLogs = useMemo(() => {
    if (!goal) return [];
    return allLogs
      .filter((log) => log.goalId === goal.id)
      .sort((a, b) => b.logDate.getTime() - a.logDate.getTime());
  }, [goal, allLogs]);

  useEffect(() => {
    if (goal) {
      setTitleInput(goal.title);
      setDescriptionInput(goal.description || '');
      setIsEditingTitle(false);
      setIsEditingDescription(false);
    }
  }, [goal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        const isTriggerClick = Object.values(triggerRefs).some((ref) =>
          ref.current?.contains(event.target as Node)
        );
        if (!isTriggerClick) setPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [triggerRefs]);

  if (!goal) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Icons.TargetIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h2 className="mt-4 text-xl font-medium">Select a goal</h2>
          <p className="text-sm">Choose a goal from the list to see its details.</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<Goal>) => {
    onUpdateGoal(goal.id, updates);
    setPopup(null);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the goal "${goal.title}"? This will also delete all of its milestones.`
      )
    ) {
      onDeleteGoal(goal.id);
    }
    setPopup(null);
  };

  const IconComponent = Icons[goal.icon];
  const statusDetails = getStatusDetails(goal.status);
  const StatusIcon = Icons[statusDetails.icon];
  const goalFocus = allFoci.find((f) => f.id === goal.focusAreaId);
  const FocusIcon = goalFocus ? Icons[goalFocus.icon] : null;

  const renderPopup = () => {
    if (!popup) return null;
    const triggerRef = triggerRefs[popup]?.current;
    if (!triggerRef) return null;
    const rect = triggerRef.getBoundingClientRect();

    const popupStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${rect.bottom + 8}px`,
      zIndex: 50,
    };

    if (popup === 'more') {
      popupStyle.right = `${window.innerWidth - rect.right}px`;
    } else {
      popupStyle.left = `${rect.left}px`;
    }

    return (
      <div ref={popupRef} className="shadow-lg" style={popupStyle}>
        {popup === 'date' && (
          <DateTimePicker
            currentDate={goal.targetEndDate ? new Date(goal.targetEndDate) : null}
            onSelect={(date) => handleUpdate({ targetEndDate: date })}
            onClear={() => handleUpdate({ targetEndDate: undefined })}
            onClose={() => setPopup(null)}
          />
        )}
        {popup === 'status' && (
          <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">
            {goalStatusItems.map((item) => {
              const ItemIcon = Icons[item.icon];
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
        {popup === 'more' && (
          <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">
            <li>
              <button
                onClick={() => {
                  onEditGoal(goal);
                  setPopup(null);
                }}
                className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Icons.Edit3Icon className="w-4 h-4" />
                <span>Edit Goal</span>
              </button>
            </li>
            <li>
              <button
                onClick={handleDelete}
                className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Icons.Trash2Icon className="w-4 h-4" />
                <span>Delete Goal</span>
              </button>
            </li>
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-white p-6 flex flex-col h-full">
      <header className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <IconComponent className="w-10 h-10 text-gray-500 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={() => handleUpdate({ title: titleInput })}
                autoFocus
                className="text-3xl font-bold text-gray-800 w-full bg-gray-100 rounded px-2 py-1"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-3xl font-bold text-gray-800 cursor-text"
              >
                {goal.title}
              </h1>
            )}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <button
                ref={triggerRefs.status}
                onClick={() => setPopup((p) => (p === 'status' ? null : 'status'))}
                className="flex items-center gap-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
              >
                <StatusIcon className={`w-4 h-4 ${statusDetails.color}`} />
                <span className={statusDetails.color}>{statusDetails.name}</span>
              </button>
              <button
                ref={triggerRefs.date}
                onClick={() => setPopup((p) => (p === 'date' ? null : 'date'))}
                className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded px-2 py-1"
              >
                <Icons.CalendarIcon className="w-4 h-4" />
                <span>
                  {goal.targetEndDate
                    ? `Target: ${new Date(goal.targetEndDate).toLocaleDateString()}`
                    : 'Set Target Date'}
                </span>
              </button>
              {goalFocus && FocusIcon && (
                <div className="flex items-center gap-2 text-sm font-medium bg-gray-100 rounded-full pl-1 pr-3 py-1">
                  <FocusIcon
                    className={`w-5 h-5 p-0.5 rounded-full bg-white text-${goalFocus.color}`}
                  />
                  <span className="text-gray-700">{goalFocus.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          ref={triggerRefs.more}
          onClick={() => setPopup((p) => (p === 'more' ? null : 'more'))}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800"
        >
          <Icons.MoreHorizontalIcon className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="mb-8">
          <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wider mb-2">
            Description
          </h3>
          {isEditingDescription ? (
            <textarea
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              onBlur={() => handleUpdate({ description: descriptionInput })}
              autoFocus
              rows={4}
              className="prose max-w-none w-full bg-gray-100 rounded p-2"
            />
          ) : (
            <div
              onClick={() => setIsEditingDescription(true)}
              className="prose max-w-none text-gray-700 cursor-text p-2 -m-2 rounded hover:bg-gray-50"
            >
              {goal.description || (
                <span className="italic text-gray-400">No description. Click to add.</span>
              )}
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wider">
              Journal
            </h3>
            <button
              onClick={() => onOpenLogModal(goal)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
            >
              <Icons.BookOpenIcon className="w-3.5 h-3.5" />
              Add to Journal
            </button>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg space-y-3 border">
            {goalLogs.length > 0 ? (
              <ul className="space-y-2">
                {goalLogs.map((log) => (
                  <HabitLogItem key={log.id} log={log} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                No journal entries for this goal yet.
              </p>
            )}
          </div>
        </div>

        <GoalJourney
          milestones={milestones}
          habits={habits}
          habitLogs={habitLogs}
          onAddMilestone={onAddMilestone}
          onLinkMilestone={onLinkMilestone}
          onAddHabit={onAddHabit}
          onLinkHabit={onLinkHabit}
          onAddHabitToMilestone={onAddHabitToMilestone}
          onLinkHabitToMilestone={onLinkHabitToMilestone}
        />
      </div>
      {renderPopup()}
    </div>
  );
};

export default GoalDetail;
