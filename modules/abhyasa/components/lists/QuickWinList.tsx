


import React from 'react';
import { QuickWin, QuickWinStatus } from '../../types';
import Checkbox from '../../../../components/common/Checkbox';
import * as Icons from '../../../../components/Icons';

const QuickWinItem: React.FC<{ quickWin: QuickWin, onStatusChange: (id: string, status: QuickWinStatus) => void }> = ({ quickWin, onStatusChange }) => {
    const isCompleted = quickWin.status === QuickWinStatus.COMPLETED;
    const toggle = () => {
        onStatusChange(quickWin.id, isCompleted ? QuickWinStatus.PENDING : QuickWinStatus.COMPLETED);
    };
    return (
        <li className="bg-white p-3 rounded-lg shadow-sm border flex items-center gap-4">
            <Checkbox checked={isCompleted} onChange={toggle} />
            <div className="flex-1">
                <p className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{quickWin.title}</p>
                {quickWin.dueDate && <p className="text-xs text-gray-500 mt-0.5">Due: {new Date(quickWin.dueDate).toLocaleDateString()}</p>}
            </div>
        </li>
    );
};

const QuickWinList: React.FC<{ quickWins: QuickWin[], onStatusChange: (id: string, status: QuickWinStatus) => void }> = ({ quickWins, onStatusChange }) => {
    const pending = quickWins.filter(qw => qw.status === QuickWinStatus.PENDING).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
    const completed = quickWins.filter(qw => qw.status === QuickWinStatus.COMPLETED).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

    return (
        <div className="w-full h-full p-4 overflow-y-auto">
            <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Pending</h2>
            {pending.length > 0 ? (
                <ul className="space-y-2 mb-6">
                    {pending.map(qw => <QuickWinItem key={qw.id} quickWin={qw} onStatusChange={onStatusChange} />)}
                </ul>
            ) : (
                <div className="text-center text-sm text-gray-500 py-4 border-2 border-dashed rounded-lg">
                    <p>Nothing here. Well done!</p>
                </div>
            )}

            <h2 className="text-sm font-semibold text-gray-500 mb-2 uppercase mt-8">Completed</h2>
             {completed.length > 0 ? (
                <ul className="space-y-2">
                    {completed.map(qw => <QuickWinItem key={qw.id} quickWin={qw} onStatusChange={onStatusChange} />)}
                </ul>
            ) : (
                <div className="text-center text-sm text-gray-500 py-4 border-2 border-dashed rounded-lg">
                     <p>No completed wins yet.</p>
                </div>
            )}
        </div>
    );
};

export default QuickWinList;