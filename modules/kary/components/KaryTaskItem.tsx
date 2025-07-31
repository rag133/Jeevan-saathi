


import React from 'react';
import { Task, Tag } from '../types';
import Checkbox from '../../../components/common/Checkbox';
import { FlagIcon, ChevronRightIcon, ChevronDownIcon, ClockIcon } from '../../../components/Icons';

const formatDate = (date?: Date) => {
    if (!date) return '';
    
    const d = new Date(date);
    
    // Check if the date is valid
    if (isNaN(d.getTime())) {
        return '';
    }
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;

    today.setHours(0, 0, 0, 0);
    const dateToFormat = new Date(d);
    dateToFormat.setHours(0, 0, 0, 0);

    let dateString = '';
    if (dateToFormat.getTime() === today.getTime()) {
        dateString = 'Today';
    } else if (dateToFormat.getTime() === tomorrow.getTime()) {
        dateString = 'Tomorrow';
    } else {
        dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (hasTime) {
        const timeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
        return `${dateString} ${timeString}`;
    }

    return dateString;
};

const getDueDateColor = (dueDate?: Date) => {
    if (!dueDate) return 'text-gray-400';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due.getTime() < today.getTime()) {
        return 'text-red-500'; // Overdue
    }
    if (due.getTime() === today.getTime()) {
        return 'text-blue-600'; // Today
    }
    return 'text-gray-500'; // Upcoming
}

const getPriorityColor = (priority?: 1 | 2 | 3 | 4) => {
    switch (priority) {
        case 1: return 'text-red-600';
        case 2: return 'text-orange-500';
        case 3: return 'text-blue-500';
        case 4: return 'text-gray-400';
        default: return 'hidden';
    }
};

interface KaryTaskItemProps {
    task: Task;
    allTags: Tag[];
    isSelected: boolean;
    level: number;
    isParent: boolean;
    isExpanded: boolean;
    onSelect: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onToggleExpand: (id: string) => void;
}

const KaryTaskItem: React.FC<KaryTaskItemProps> = ({ 
    task, 
    allTags, 
    isSelected, 
    level,
    isParent,
    isExpanded,
    onSelect, 
    onToggleComplete,
    onToggleExpand
}) => {
    
    const taskTags = (task.tags ?? []).map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean) as Tag[];

    const handleItemClick = () => {
        if (!isSelected) {
            onSelect(task.id);
        }
    };
    
    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleExpand(task.id);
    };

    const isContextParent = isParent && task.dueDate === undefined; // a parent shown only for context in smart lists

    return (
        <li
            onClick={() => onSelect(task.id)}
            className={`flex items-center gap-2 pr-3 rounded-lg cursor-pointer transition-colors duration-150 ${
                isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
             <div className="flex items-center h-full py-3">
                {isParent ? (
                    <button onClick={handleExpandClick} className="p-0.5 rounded-full hover:bg-gray-200 -ml-5 mr-1">
                        {isExpanded ? <ChevronDownIcon className="w-4 h-4 text-gray-500"/> : <ChevronRightIcon className="w-4 h-4 text-gray-500"/>}
                    </button>
                ) : (
                    <span className="inline-block w-5 h-5 -ml-5 mr-1"></span>
                )}
                <Checkbox
                    checked={task.completed}
                    onChange={() => onToggleComplete(task.id)}
                    ariaLabel={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                />
            </div>
            <div className="flex-1 min-w-0 py-3">
                <p className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'} ${isContextParent ? 'text-gray-400' : ''}`}>{task.title}</p>
                 {task.source && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                        Source: MarkTechPost <a href={task.source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{task.source.text}</a>
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 py-3">
                {taskTags.map(tag => (
                     <span key={tag.id} className={`px-2 py-0.5 text-xs rounded-md bg-${tag.color}/20 text-${tag.color}`}>
                        #{tag.name}
                    </span>
                ))}
                {task.dueDate && 
                    <span className={`text-xs font-medium flex items-center gap-1 ${getDueDateColor(task.dueDate)}`}>
                        <ClockIcon className="w-3.5 h-3.5" />
                        {formatDate(task.dueDate)}
                    </span>
                }
                {task.priority && <FlagIcon className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />}
            </div>
        </li>
    );
};

export default KaryTaskItem;