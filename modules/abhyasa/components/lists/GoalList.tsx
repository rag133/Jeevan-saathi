

import React, { useState, useRef, useEffect } from 'react';
import { Goal, GoalStatus } from '../../types';
import * as Icons from '../../../../components/Icons';

const getStatusColor = (status: GoalStatus) => {
    switch (status) {
        case GoalStatus.COMPLETED: return 'bg-green-100 text-green-800';
        case GoalStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
        case GoalStatus.ABANDONED: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface GoalItemProps {
    goal: Goal;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, isSelected, onSelect, onEdit }) => {
    const Icon = Icons[goal.icon];
    return (
        <li 
            onClick={onSelect}
            className={`p-4 rounded-lg shadow-sm border flex items-start gap-4 cursor-pointer transition-all duration-150 group ${
                isSelected ? 'ring-2 ring-blue-500 shadow-md bg-white' : 'bg-white hover:shadow-md hover:border-gray-300'
            }`}
        >
            <Icon className="w-8 h-8 text-gray-500 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">{goal.title}</h3>
                     <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(goal.status)}`}>{goal.status}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                            aria-label={`Edit ${goal.title}`}
                        >
                            <Icons.Edit3Icon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{goal.description}</p>
                {goal.targetEndDate && (
                    <p className="text-xs text-gray-500 mt-2">Target: {new Date(goal.targetEndDate).toLocaleDateString()}</p>
                )}
            </div>
        </li>
    );
};

type GoalFilter = GoalStatus | 'All';

interface GoalListProps {
    goals: Goal[];
    selectedGoalId: string | null;
    onSelectGoal: (id: string) => void;
    activeFilter: GoalFilter;
    onSetFilter: (filter: GoalFilter) => void;
    onAddGoalClick: () => void;
    onEditGoal: (goal: Goal) => void;
}

const GoalList: React.FC<GoalListProps> = ({ goals, selectedGoalId, onSelectGoal, activeFilter, onSetFilter, onAddGoalClick, onEditGoal }) => {
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

    const tabs: {label: string; filter: GoalFilter}[] = [
        { label: 'All', filter: 'All' },
        { label: 'In Progress', filter: GoalStatus.IN_PROGRESS },
        { label: 'Not Started', filter: GoalStatus.NOT_STARTED },
    ];

    const menuItems: {label: string; filter: GoalFilter}[] = [
        { label: 'Completed', filter: GoalStatus.COMPLETED },
        { label: 'Abandoned', filter: GoalStatus.ABANDONED },
    ];

    const handleFilterSelect = (filter: GoalFilter) => {
        onSetFilter(filter);
        setIsMenuOpen(false);
    };

    return (
        <div className="w-full h-full p-4 overflow-y-auto bg-gray-50/80 flex flex-col">
            <header className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h1 className="text-xl font-semibold text-gray-800">Goals</h1>
                 <button onClick={onAddGoalClick} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Icons.PlusIcon className="w-4 h-4" />
                    <span>New Goal</span>
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
                {goals.length > 0 ? (
                    <ul className="space-y-3">
                        {goals.map(goal => <GoalItem key={goal.id} goal={goal} isSelected={goal.id === selectedGoalId} onSelect={() => onSelectGoal(goal.id)} onEdit={() => onEditGoal(goal)} />)}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <Icons.TargetIcon className="w-12 h-12 mx-auto text-gray-300" />
                        <p className="mt-4 font-semibold">No goals in this view.</p>
                        <p className="text-sm">Try another filter or add a new goal.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalList;