import React, { useState, useRef, useEffect } from 'react';
import { Habit, HabitStatus } from '../../types';
import * as Icons from '../../../../components/Icons';

const getStatusColor = (status: HabitStatus) => {
    switch (status) {
        case HabitStatus.COMPLETED: return 'bg-green-100 text-green-800';
        case HabitStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
        case HabitStatus.ABANDONED: return 'bg-red-100 text-red-800';
        case HabitStatus.YET_TO_START: return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface HabitItemProps {
    habit: Habit;
    isSelected: boolean;
    onSelect: () => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, isSelected, onSelect }) => {
    const Icon = Icons[habit.icon];
    return (
        <li 
            onClick={onSelect}
            className={`p-3 rounded-lg shadow-sm border flex items-start gap-4 cursor-pointer transition-all duration-150 ${
                isSelected ? `ring-2 ring-blue-500 shadow-md bg-white` : `bg-white hover:shadow-md hover:border-gray-300`
            }`}
        >
            <div className={`p-2 rounded-lg bg-${habit.color}/20 flex-shrink-0`}>
                <Icon className={`w-6 h-6 text-${habit.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 truncate">{habit.title}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(habit.status)}`}>{habit.status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{habit.description}</p>
            </div>
        </li>
    );
};


export type HabitFilter = HabitStatus | 'All';

interface HabitListProps {
    habits: Habit[];
    selectedHabitId: string | null;
    onSelectHabit: (id: string) => void;
    activeFilter: HabitFilter;
    onSetFilter: (filter: HabitFilter) => void;
    onAddHabitClick: () => void;
}

const HabitList: React.FC<HabitListProps> = ({ habits, selectedHabitId, onSelectHabit, activeFilter, onSetFilter, onAddHabitClick }) => {
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

    const tabs: {label: string; filter: HabitFilter}[] = [
        { label: 'All', filter: 'All' },
        { label: 'In Progress', filter: HabitStatus.IN_PROGRESS },
        { label: 'Yet to Start', filter: HabitStatus.YET_TO_START },
    ];

    const menuItems: {label: string; filter: HabitFilter}[] = [
        { label: 'Completed', filter: HabitStatus.COMPLETED },
        { label: 'Abandoned', filter: HabitStatus.ABANDONED },
    ];

    const handleFilterSelect = (filter: HabitFilter) => {
        onSetFilter(filter);
        setIsMenuOpen(false);
    };

    return (
        <div className="w-full h-full p-4 overflow-y-auto bg-gray-50/80 flex flex-col">
            <header className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h1 className="text-xl font-semibold text-gray-800">All Habits</h1>
                 <button onClick={onAddHabitClick} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Icons.PlusIcon className="w-4 h-4" />
                    <span>New Habit</span>
                </button>
            </header>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
                    {tabs.map(tab => (
                        <button
                            key={tab.filter}
                            onClick={() => handleFilterSelect(tab.filter)}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                activeFilter === tab.filter ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(o => !o)} className="p-2 rounded-lg hover:bg-gray-200">
                        <Icons.MoreHorizontalIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                            <ul className="py-1">
                                {menuItems.map(item => (
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
                {habits.length > 0 ? (
                    <ul className="space-y-3">
                        {habits.map(habit => <HabitItem key={habit.id} habit={habit} isSelected={habit.id === selectedHabitId} onSelect={() => onSelectHabit(habit.id)} />)}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <Icons.TargetIcon className="w-12 h-12 mx-auto text-gray-300" />
                        <p className="mt-4 font-semibold">No habits in this view.</p>
                        <p className="text-sm">Try another filter or add a new habit.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitList;