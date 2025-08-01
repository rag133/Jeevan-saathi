import React, { useState, useRef, useEffect } from 'react';
import { Milestone, MilestoneStatus, Goal } from '~/modules/abhyasa/types';
import * as Icons from '~/components/Icons';

const getStatusColor = (status: MilestoneStatus) => {
  switch (status) {
    case MilestoneStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    case MilestoneStatus.IN_PROGRESS:
      return 'bg-blue-100 text-blue-800';
    case MilestoneStatus.ABANDONED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface MilestoneItemProps {
  milestone: Milestone;
  parentGoal?: Goal;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({
  milestone,
  parentGoal,
  isSelected,
  onSelect,
  onEdit,
}) => {
  const ParentIcon = parentGoal ? Icons[parentGoal.icon] : Icons.TargetIcon;
  return (
    <li
      onClick={onSelect}
      className={`p-4 rounded-lg shadow-sm border flex flex-col gap-2 cursor-pointer transition-all duration-150 group ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-md bg-white'
          : 'bg-white hover:shadow-md hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-md font-bold text-gray-900 flex-1 pr-2">{milestone.title}</h3>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(milestone.status)} flex-shrink-0`}
        >
          {milestone.status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        {parentGoal && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ParentIcon className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">{parentGoal.title}</span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
          aria-label={`Edit ${milestone.title}`}
        >
          <Icons.Edit3Icon className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
};

type MilestoneFilter = MilestoneStatus | 'All';

interface MilestoneListProps {
  milestones: Milestone[];
  goals: Goal[];
  selectedMilestoneId: string | null;
  onSelectMilestone: (id: string) => void;
  activeFilter: MilestoneFilter;
  onSetFilter: (filter: MilestoneFilter) => void;
  onAddMilestoneClick: () => void;
  onEditMilestone: (milestone: Milestone) => void;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  goals,
  selectedMilestoneId,
  onSelectMilestone,
  activeFilter,
  onSetFilter,
  onAddMilestoneClick,
  onEditMilestone,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs: { label: string; filter: MilestoneFilter }[] = [
    { label: 'All', filter: 'All' },
    { label: 'In Progress', filter: MilestoneStatus.IN_PROGRESS },
    { label: 'Not Started', filter: MilestoneStatus.NOT_STARTED },
  ];

  const menuItems: { label: string; filter: MilestoneFilter }[] = [
    { label: 'Completed', filter: MilestoneStatus.COMPLETED },
    { label: 'Abandoned', filter: MilestoneStatus.ABANDONED },
  ];

  const handleFilterSelect = (filter: MilestoneFilter) => {
    onSetFilter(filter);
    setIsMenuOpen(false);
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-gray-50/80 flex flex-col">
      <header className="flex justify-between items-center mb-4 flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-800">Milestones</h1>
        <button
          onClick={onAddMilestoneClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Icons.PlusIcon className="w-4 h-4" />
          <span>New Milestone</span>
        </button>
      </header>
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.filter}
              onClick={() => handleFilterSelect(tab.filter)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                activeFilter === tab.filter
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-gray-200"
          >
            <Icons.MoreHorizontalIcon className="w-5 h-5 text-gray-600" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
              <ul className="py-1">
                {menuItems.map((item) => (
                  <li key={item.filter}>
                    <button
                      onClick={() => handleFilterSelect(item.filter)}
                      className={`w-full text-left px-4 py-2 text-sm ${activeFilter === item.filter ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {milestones.length > 0 ? (
          <ul className="space-y-3">
            {milestones.map((m) => (
              <MilestoneItem
                key={m.id}
                milestone={m}
                parentGoal={goals.find((g) => g.id === m.parentGoalId)}
                isSelected={m.id === selectedMilestoneId}
                onSelect={() => onSelectMilestone(m.id)}
                onEdit={() => onEditMilestone(m)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Icons.FlagIcon className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-4 font-semibold">No milestones in this view.</p>
            <p className="text-sm">Try another filter or add a new milestone.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneList;
