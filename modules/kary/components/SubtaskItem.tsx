


import React from 'react';
import { Task } from '../types';
import Checkbox from '../../../components/common/Checkbox';
import { ClockIcon, MoreHorizontalIcon } from '../../../components/Icons';

interface SubtaskItemProps {
    task: Task;
    onToggleComplete: (id: string) => void;
    onSelect: (id: string) => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ task, onToggleComplete, onSelect }) => {
    
    const formatDate = (date?: Date) => {
        if (!date) return '';
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        today.setHours(0, 0, 0, 0);
        const dateToFormat = new Date(d);
        dateToFormat.setHours(0, 0, 0, 0);

        if (dateToFormat.getTime() === today.getTime()) return 'Today';
        if (dateToFormat.getTime() === tomorrow.getTime()) return 'Tomorrow';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return (
        <li 
            className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-gray-100 group transition-colors duration-200 cursor-pointer"
            onClick={() => onSelect(task.id)}
        >
            <Checkbox
                checked={task.completed}
                onChange={() => onToggleComplete(task.id)}
                ariaLabel={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
            />
            <span
                className={`flex-1 text-sm truncate ${
                    task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                }`}
            >
                {task.title}
            </span>
            {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {formatDate(task.dueDate)}
                </span>
            )}
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    // more options logic here
                }}
                className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" 
                aria-label="More options"
            >
                <MoreHorizontalIcon className="w-4 h-4" />
            </button>
        </li>
    );
};

export default SubtaskItem;