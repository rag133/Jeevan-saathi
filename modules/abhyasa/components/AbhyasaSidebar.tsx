import React from 'react';
import * as Icons from '../../../components/Icons';

type AbhyasaModalType = 'goal' | 'milestone' | 'habit' | 'quick-win';
type AbhyasaViewType = 'goals' | 'milestones' | 'calendar' | 'all-habits' | 'quick-wins';


interface SidebarHeaderProps {
    title: string;
    onAdd: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, onAdd }) => (
    <div className="px-4 pt-4 pb-2 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
        <button className="text-gray-400 hover:text-gray-700" onClick={onAdd} aria-label={`Add new ${title}`}>
            <Icons.PlusIcon className="w-4 h-4" />
        </button>
    </div>
);

interface SidebarItemProps {
    name: string;
    icon: keyof typeof Icons;
    isSelected: boolean;
    onSelect: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ name, icon, isSelected, onSelect }) => {
    const IconComponent = Icons[icon];
    return (
        <li className="px-2">
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); onSelect(); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'
                }`}
            >
                <IconComponent className="w-5 h-5" />
                <span className="flex-1 truncate">{name}</span>
            </a>
        </li>
    );
};

interface AbhyasaSidebarProps {
    onOpenModal: (type: AbhyasaModalType) => void;
    onSelectView: (type: AbhyasaViewType) => void;
    activeView: AbhyasaViewType;
}

const AbhyasaSidebar: React.FC<AbhyasaSidebarProps> = ({
    onOpenModal,
    onSelectView,
    activeView
}) => {
    return (
        <aside className="w-72 flex-shrink-0 bg-gray-100/80 border-r border-gray-200 p-2 flex flex-col">
            <nav className="flex-1 overflow-y-auto">
                <div className="px-4 pt-4 pb-2 flex items-center gap-3 text-gray-800">
                    <Icons.TargetIcon className="w-6 h-6 text-indigo-500" />
                    <h1 className="text-xl font-bold">Abhyasa</h1>
                </div>

                <SidebarHeader title="Goals" onAdd={() => onOpenModal('goal')} />
                <ul>
                    <SidebarItem name="All Goals" icon="TargetIcon" isSelected={activeView === 'goals'} onSelect={() => onSelectView('goals')} />
                </ul>

                <SidebarHeader title="Milestones" onAdd={() => onOpenModal('milestone')} />
                <ul>
                     <SidebarItem name="All Milestones" icon="FlagIcon" isSelected={activeView === 'milestones'} onSelect={() => onSelectView('milestones')} />
                </ul>

                <SidebarHeader title="Habits" onAdd={() => onOpenModal('habit')} />
                 <ul>
                     <SidebarItem name="Calendar View" icon="CalendarIcon" isSelected={activeView === 'calendar'} onSelect={() => onSelectView('calendar')} />
                     <SidebarItem name="All Habits" icon="ListIcon" isSelected={activeView === 'all-habits'} onSelect={() => onSelectView('all-habits')} />
                </ul>

                <SidebarHeader title="Quick Wins" onAdd={() => onOpenModal('quick-win')} />
                 <ul>
                     <SidebarItem name="List" icon="StarIcon" isSelected={activeView === 'quick-wins'} onSelect={() => onSelectView('quick-wins')} />
                </ul>
            </nav>
        </aside>
    );
};

export default AbhyasaSidebar;