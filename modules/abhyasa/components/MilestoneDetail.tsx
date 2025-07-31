import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Milestone, Habit, Goal, MilestoneStatus, HabitLog, HabitStatus } from '../types';
import * as Icons from '../../../components/Icons';
import DateTimePicker from '../../kary/components/DateTimePicker';
import { Focus, Log } from '../../dainandini/types';
import HabitLogItem from './HabitLogItem';

const milestoneStatusItems: {id: MilestoneStatus, name: string, color: string, icon: keyof typeof Icons}[] = [
    { id: MilestoneStatus.NOT_STARTED, name: 'Not Started', color: 'text-gray-500', icon: 'SunriseIcon' },
    { id: MilestoneStatus.IN_PROGRESS, name: 'In Progress', color: 'text-blue-500', icon: 'RepeatIcon' },
    { id: MilestoneStatus.COMPLETED, name: 'Completed', color: 'text-green-500', icon: 'CheckSquareIcon' },
    { id: MilestoneStatus.ABANDONED, name: 'Abandoned', color: 'text-red-500', icon: 'Trash2Icon' },
];

const getStatusDetails = (status: MilestoneStatus) => {
    return milestoneStatusItems.find(item => item.id === status) || milestoneStatusItems[0];
};

const getHabitStatusDetails = (status: HabitStatus) => {
    const colorMap: Record<HabitStatus, string> = {
        [HabitStatus.COMPLETED]: 'green',
        [HabitStatus.IN_PROGRESS]: 'blue',
        [HabitStatus.ABANDONED]: 'red',
        [HabitStatus.YET_TO_START]: 'gray',
    };
    const color = colorMap[status] || 'gray';
    return {
        name: status,
        colorClass: `bg-${color}-100 text-${color}-800`,
    };
};

const HabitCard: React.FC<{ habit: Habit }> = ({ habit }) => {
    const Icon = Icons[habit.icon];
    const statusDetails = getHabitStatusDetails(habit.status);

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-4 hover:bg-gray-100 transition-colors">
            <div className={`p-2 rounded-lg bg-${habit.color}/20 flex-shrink-0`}>
                <Icon className={`w-6 h-6 text-${habit.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{habit.title}</p>
                {habit.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{habit.description}</p>}
            </div>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusDetails.colorClass} flex-shrink-0`}>{habit.status}</span>
        </div>
    );
};

interface MilestoneDetailProps {
    milestone: Milestone | null;
    parentGoal: Goal | undefined | null;
    habits: Habit[];
    habitLogs: HabitLog[];
    allFoci: Focus[];
    allLogs: Log[];
    onUpdateMilestone: (id: string, updates: Partial<Milestone>) => void;
    onDeleteMilestone: (id: string) => void;
    onAddHabit: (milestoneId: string) => void;
    onLinkHabit: (milestoneId: string) => void;
    onOpenLogModal: (milestone: Milestone) => void;
    onEditMilestone: (milestone: Milestone) => void;
}

const MilestoneDetail: React.FC<MilestoneDetailProps> = (props) => {
    const { milestone, parentGoal, habits, allFoci, allLogs, onUpdateMilestone, onDeleteMilestone, onAddHabit, onLinkHabit, onOpenLogModal, onEditMilestone } = props;
    
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [descriptionInput, setDescriptionInput] = useState('');
    const [popup, setPopup] = useState<'date' | 'status' | 'more' | null>(null);

    const popupRef = useRef<HTMLDivElement>(null);
    const triggerRefs = {
        date: useRef<HTMLButtonElement>(null),
        status: useRef<HTMLButtonElement>(null),
        more: useRef<HTMLButtonElement>(null),
    };

    const milestoneLogs = useMemo(() => {
        if (!milestone) return [];
        return allLogs.filter(log => log.milestoneId === milestone.id).sort((a,b) => b.logDate.getTime() - a.logDate.getTime());
    }, [milestone, allLogs]);

    useEffect(() => {
        if (milestone) {
            setTitleInput(milestone.title);
            setDescriptionInput(milestone.description || '');
            setIsEditingTitle(false);
            setIsEditingDescription(false);
        }
    }, [milestone]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                const isTriggerClick = Object.values(triggerRefs).some(ref => ref.current?.contains(event.target as Node));
                if (!isTriggerClick) setPopup(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [triggerRefs]);

    if (!milestone) {
        return (
            <div className="flex-1 bg-white flex items-center justify-center p-6">
                <div className="text-center text-gray-500">
                    <Icons.FlagIcon className="w-16 h-16 mx-auto text-gray-300" />
                    <h2 className="mt-4 text-xl font-medium">Select a milestone</h2>
                    <p className="text-sm">Choose a milestone from the list to see its details.</p>
                </div>
            </div>
        );
    }
    
    const handleUpdate = (updates: Partial<Milestone>) => {
        onUpdateMilestone(milestone.id, updates);
        setPopup(null);
    };

    const handleDelete = () => {
        if(window.confirm(`Are you sure you want to delete the milestone "${milestone.title}"?`)) {
            onDeleteMilestone(milestone.id);
        }
        setPopup(null);
    };

    const statusDetails = getStatusDetails(milestone.status);
    const StatusIcon = Icons[statusDetails.icon];
    const ParentIcon = parentGoal ? Icons[parentGoal.icon] : Icons.TargetIcon;
    const milestoneFocus = allFoci.find(f => f.id === milestone.focusAreaId);
    const FocusIcon = milestoneFocus ? Icons[milestoneFocus.icon] : null;


    const renderPopup = () => {
        if (!popup) return null;
        const triggerRef = triggerRefs[popup]?.current;
        if (!triggerRef) return null;
        const rect = triggerRef.getBoundingClientRect();
        
        const popupStyle: React.CSSProperties = {
            position: 'absolute',
            top: `${rect.bottom + 8}px`,
            zIndex: 50,
        };

        if (popup === 'more') {
            popupStyle.right = `${window.innerWidth - rect.right}px`;
        } else {
            popupStyle.left = `${rect.left}px`;
        }
        
        return (
            <div ref={popupRef} className="shadow-lg" style={popupStyle}>
                {popup === 'date' && <DateTimePicker currentDate={milestone.targetEndDate ? new Date(milestone.targetEndDate) : null} onSelect={(date) => handleUpdate({ targetEndDate: date })} onClear={() => handleUpdate({ targetEndDate: undefined })} onClose={() => setPopup(null)} />}
                {popup === 'status' && (
                    <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">
                        {milestoneStatusItems.map(item => {
                            const ItemIcon = Icons[item.icon];
                            return (
                                <li key={item.id}>
                                    <button onClick={() => handleUpdate({ status: item.id })} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100">
                                        <ItemIcon className={`w-4 h-4 ${item.color}`} />
                                        <span>{item.name}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {popup === 'more' && (
                     <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">
                        <li><button onClick={() => { onEditMilestone(milestone); setPopup(null); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"><Icons.Edit3Icon className="w-4 h-4" /><span>Edit Milestone</span></button></li>
                        <li><button onClick={handleDelete} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Icons.Trash2Icon className="w-4 h-4" /><span>Delete Milestone</span></button></li>
                    </ul>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 bg-white p-6 flex flex-col h-full">
            <header className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Icons.FlagIcon className="w-10 h-10 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        {isEditingTitle ? <input value={titleInput} onChange={e => setTitleInput(e.target.value)} onBlur={() => handleUpdate({ title: titleInput })} autoFocus className="text-3xl font-bold text-gray-800 w-full bg-gray-100 rounded px-2 py-1"/> : <h1 onClick={() => setIsEditingTitle(true)} className="text-3xl font-bold text-gray-800 cursor-text">{milestone.title}</h1>}
                        <div className="flex items-center gap-4 mt-2">
                             <button ref={triggerRefs.status} onClick={() => setPopup(p => p === 'status' ? null : 'status')} className="flex items-center gap-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">
                                <StatusIcon className={`w-4 h-4 ${statusDetails.color}`} />
                                <span className={statusDetails.color}>{statusDetails.name}</span>
                            </button>
                             <button ref={triggerRefs.date} onClick={() => setPopup(p => p === 'date' ? null : 'date')} className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded px-2 py-1"><Icons.CalendarIcon className="w-4 h-4"/><span>{milestone.targetEndDate ? `Target: ${new Date(milestone.targetEndDate).toLocaleDateString()}` : 'Set Target Date'}</span></button>
                        </div>
                    </div>
                </div>
                <button ref={triggerRefs.more} onClick={() => setPopup(p => p === 'more' ? null : 'more')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800">
                    <Icons.MoreHorizontalIcon className="w-5 h-5" />
                </button>
            </header>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {parentGoal && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Part of Goal</label>
                            <div className="flex items-center gap-2 mt-1 p-2 bg-gray-100 rounded-md border">
                                <ParentIcon className="w-5 h-5 text-indigo-500" />
                                <span className="font-semibold text-gray-700">{parentGoal.title}</span>
                            </div>
                        </div>
                    )}
                    {milestoneFocus && FocusIcon && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Focus Area</label>
                            <div className="flex items-center gap-2 mt-1 p-2 bg-gray-100 rounded-md border">
                                <FocusIcon className={`w-5 h-5 text-${milestoneFocus.color}`} />
                                <span className="font-semibold text-gray-700">{milestoneFocus.name}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-8">
                    <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wider mb-2">Description</h3>
                    {isEditingDescription ? <textarea value={descriptionInput} onChange={e => setDescriptionInput(e.target.value)} onBlur={() => handleUpdate({ description: descriptionInput })} autoFocus rows={4} className="prose max-w-none w-full bg-gray-100 rounded p-2"/> : <div onClick={() => setIsEditingDescription(true)} className="prose max-w-none text-gray-700 cursor-text p-2 -m-2 rounded hover:bg-gray-50">{milestone.description || <span className="italic text-gray-400">No description. Click to add.</span>}</div>}
                </div>
                
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wider">Linked Habits</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => onAddHabit(milestone.id)} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                                <Icons.PlusIcon className="w-3.5 h-3.5"/> Add New
                            </button>
                            <button onClick={() => onLinkHabit(milestone.id)} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                                <Icons.TagIcon className="w-3.5 h-3.5"/> Link Existing
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {habits.length > 0 ? (
                            habits.map(habit => <HabitCard key={habit.id} habit={habit} />)
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed rounded-lg text-gray-500">
                                <Icons.CheckSquareIcon className="w-8 h-8 mx-auto text-gray-300 mb-2"/>
                                <p className="font-semibold">No habits linked yet.</p>
                                <p className="text-sm">Add or link habits to make progress on this milestone.</p>
                            </div>
                        )}
                    </div>
                </div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wider">Journal</h3>
                        <button
                            onClick={() => onOpenLogModal(milestone)}
                            className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors flex items-center gap-1.5"
                        >
                            <Icons.BookOpenIcon className="w-3.5 h-3.5"/>
                            Add to Journal
                        </button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3 border">
                        {milestoneLogs.length > 0 ? (
                            <ul className="space-y-2">
                                {milestoneLogs.map(log => <HabitLogItem key={log.id} log={log} />)}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-2">No journal entries for this milestone yet.</p>
                        )}
                    </div>
                </div>
            </div>
            {renderPopup()}
        </div>
    );
};

export default MilestoneDetail;
