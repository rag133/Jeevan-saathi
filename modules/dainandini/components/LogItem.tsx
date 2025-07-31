



import React from 'react';
import { Log, ChecklistItem, LogType, Focus } from '../types';
import * as Icons from '../../../components/Icons';
import Checkbox from '../../../components/common/Checkbox';

// --- Display Components ---
const StarRatingDisplay: React.FC<{ rating?: number }> = ({ rating = 0 }) => (
    <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
            <Icons.StarIcon key={star} className={`w-5 h-5 text-yellow-400 ${rating >= star ? 'fill-current' : 'fill-transparent stroke-current'}`} />
        ))}
    </div>
);

const ChecklistDisplay: React.FC<{
    items?: ChecklistItem[];
}> = ({ items = [] }) => {
    return (
        <ul className="space-y-2 mt-2">
            {items.map(item => (
                <li key={item.id} className="flex items-center gap-3">
                    <Checkbox
                        checked={item.completed}
                        onChange={() => {}}
                        ariaLabel={item.text}
                        disabled
                    />
                    <span className={`flex-1 text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {item.text}
                    </span>
                </li>
            ))}
        </ul>
    );
};


// --- LogItem ---
interface LogItemProps {
    log: Log;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onToggleKaryTask?: (taskId: string) => void;
    focus?: Focus;
}

const LogItem: React.FC<LogItemProps> = ({ log, isSelected, onSelect, onToggleKaryTask, focus }) => {
    const FocusIcon = focus ? Icons[focus.icon] : null;
    
    return (
        <div 
            onClick={() => onSelect(log.id)}
            className={`p-4 rounded-lg shadow-sm border cursor-pointer transition-all duration-200 ${
                isSelected ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
        >
            <div className="flex justify-between items-start">
                 <div className="flex-1 pr-4">
                    <div className="flex items-start gap-3">
                        {log.taskId && onToggleKaryTask && (
                            <div className="pt-0.5">
                                <Checkbox
                                    checked={!!log.completed}
                                    onChange={() => onToggleKaryTask(log.taskId!)}
                                    ariaLabel={`Mark task ${log.title} as ${log.completed ? 'incomplete' : 'complete'}`}
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                               {log.logType === LogType.RATING && <StarRatingDisplay rating={log.rating} />}
                                <h3 className={`text-md font-semibold ${log.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{log.title}</h3>
                            </div>
                             {focus && FocusIcon && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                    <FocusIcon className={`w-3.5 h-3.5 text-${focus.color}`} />
                                    <span>{focus.name}</span>
                                </div>
                            )}
                            {log.description && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap truncate max-w-prose">{log.description}</p>}
                            {log.logType === LogType.CHECKLIST && <ChecklistDisplay items={log.checklist} />}
                        </div>
                    </div>
                </div>
                <span className="text-xs text-gray-500 mt-1 block flex-shrink-0">
                    {log.logDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'})}
                </span>
            </div>
        </div>
    );
};

export default LogItem;