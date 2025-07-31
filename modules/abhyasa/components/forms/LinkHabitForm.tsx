


import React, { useState } from 'react';
import { Habit } from '../../types';
import Checkbox from '../../../../components/common/Checkbox';
import * as Icons from '../../../../components/Icons';

interface LinkHabitFormProps {
    habits: Habit[];
    onLink: (habitId: string) => void;
    onClose: () => void;
}

const LinkHabitForm: React.FC<LinkHabitFormProps> = ({ habits, onLink, onClose }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleToggle = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        selectedIds.forEach(id => onLink(id));
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="max-h-64 overflow-y-auto border rounded-md p-2 mb-4">
                {habits.length > 0 ? (
                    <ul className="space-y-2">
                        {habits.map(h => {
                            const Icon = Icons[h.icon];
                            return (
                                <li 
                                    key={h.id}
                                    onClick={() => handleToggle(h.id)}
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedIds.has(h.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    <Checkbox checked={selectedIds.has(h.id)} onChange={() => {}} />
                                    <Icon className={`w-5 h-5 text-${h.color}`} />
                                    <span>{h.title}</span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-4">No unlinked habits available.</p>
                )}
            </div>
            <div className="flex justify-end pt-4">
                <button type="submit" disabled={selectedIds.size === 0} className="btn-primary disabled:bg-blue-300">
                    Link {selectedIds.size} Habit{selectedIds.size !== 1 && 's'}
                </button>
            </div>
             <style>{`
                .btn-primary { padding: 0.5rem 1rem; font-weight: 600; border-radius: 0.375rem; background-color: #4299e1; color: white; transition: background-color 0.2s; }
                .btn-primary:hover { background-color: #3182ce; }
            `}</style>
        </form>
    );
};

export default LinkHabitForm;