import React from 'react';
import * as Icons from '~/components/Icons';

type AbhyasaModalType = 'goal' | 'milestone' | 'habit' | 'quick-win';
type AbhyasaViewType = 'goals' | 'milestones' | 'calendar' | 'all-habits' | 'quick-wins';

interface SidebarHeaderProps {
  title: string;
  onAdd: () => void;
  icon: keyof typeof Icons;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, onAdd, icon }) => {
  const IconComponent = Icons[icon];
  
  return (
    <div className="px-3 pt-6 pb-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
      <button 
        onClick={onAdd}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
        aria-label={`Add new ${title}`}
      >
        <Icons.PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

interface SidebarItemProps {
  name: string;
  icon: keyof typeof Icons;
  isSelected: boolean;
  onSelect: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ name, icon, isSelected, onSelect }) => {
  const IconComponent = Icons[icon];
  return (
    <li>
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isSelected
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className="w-5 h-5 flex items-center justify-center text-gray-500">
          <IconComponent className="w-4 h-4" />
        </div>
        <span className="flex-1 truncate text-left">{name}</span>
      </button>
    </li>
  );
};

interface AbhyasaSidebarProps {
  onOpenModal: (type: AbhyasaModalType) => void;
  onSelectView: (type: AbhyasaViewType) => void;
  activeView: AbhyasaViewType;
  isMobile: boolean;
  isSidebarOpen: boolean;
}

const AbhyasaSidebar: React.FC<AbhyasaSidebarProps> = ({
  onOpenModal,
  onSelectView,
  activeView,
  isMobile,
  isSidebarOpen,
}) => {
  return (
    <aside
      className={`w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col
        ${isMobile ? 'fixed inset-y-0 left-0 z-20 transition-transform duration-300 ease-in-out' : ''}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
      `}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Icons.TargetIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Abhyasa</h1>
            <p className="text-xs text-gray-500">Master your habits & goals</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {/* Goals Section */}
        <div className="mb-6">
          <SidebarHeader title="Goals" onAdd={() => onOpenModal('goal')} icon="TargetIcon" />
          <ul className="space-y-1">
            <SidebarItem
              name="All Goals"
              icon="TargetIcon"
              isSelected={activeView === 'goals'}
              onSelect={() => onSelectView('goals')}
            />
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Milestones Section */}
        <div className="mb-6">
          <SidebarHeader title="Milestones" onAdd={() => onOpenModal('milestone')} icon="FlagIcon" />
          <ul className="space-y-1">
            <SidebarItem
              name="All Milestones"
              icon="FlagIcon"
              isSelected={activeView === 'milestones'}
              onSelect={() => onSelectView('milestones')}
            />
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Habits Section */}
        <div className="mb-6">
          <SidebarHeader title="Habits" onAdd={() => onOpenModal('habit')} icon="RepeatIcon" />
          <ul className="space-y-1">
            <SidebarItem
              name="Calendar View"
              icon="CalendarIcon"
              isSelected={activeView === 'calendar'}
              onSelect={() => onSelectView('calendar')}
            />
            <SidebarItem
              name="All Habits"
              icon="ListIcon"
              isSelected={activeView === 'all-habits'}
              onSelect={() => onSelectView('all-habits')}
            />
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Quick Wins Section */}
        <div className="mb-6">
          <SidebarHeader title="Quick Wins" onAdd={() => onOpenModal('quick-win')} icon="StarIcon" />
          <ul className="space-y-1">
            <SidebarItem
              name="List"
              icon="StarIcon"
              isSelected={activeView === 'quick-wins'}
              onSelect={() => onSelectView('quick-wins')}
            />
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default AbhyasaSidebar;
