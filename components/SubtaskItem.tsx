import React from 'react';
import { Subtask } from '../types';

interface SubtaskItemProps {
    subtask: Subtask;
    onToggle: (id: string) => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, onToggle }) => {
    return (
        <li className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-700/50 transition-colors duration-200">
            <input
                type="checkbox"
                id={`subtask-${subtask.id}`}
                checked={subtask.completed}
                onChange={() => onToggle(subtask.id)}
                className="h-4 w-4 rounded border-slate-500 text-indigo-500 bg-slate-700 focus:ring-indigo-600 focus:ring-offset-slate-800"
            />
            <label
                htmlFor={`subtask-${subtask.id}`}
                className={`flex-1 cursor-pointer text-sm ${
                    subtask.completed ? 'text-slate-500 line-through' : 'text-slate-300'
                }`}
            >
                {subtask.text}
            </label>
        </li>
    );
};

export default SubtaskItem;
