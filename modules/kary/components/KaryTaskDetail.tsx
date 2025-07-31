import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Task, Tag, List } from '../types';
import * as Icons from '../../../components/Icons';
import Checkbox from '../../../components/common/Checkbox';
import DateTimePicker from './DateTimePicker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SubtaskItem from './SubtaskItem';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { Log } from '../../dainandini/types';
import TaskLogItem from './TaskLogItem';
import { NewTaskData } from '../views/KaryView';

interface KaryTaskDetailProps {
    selectedTaskId: string | null;
    tasks: Task[];
    allTags: Tag[];
    allLists: List[];
    allLogs: Log[];
    childrenTasks: Task[];
    onToggleComplete: (id: string) => void;
    onUpdateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
    onDeleteTask: (taskId: string) => void;
    onDuplicateTask: (taskId: string) => void;
    onSelectTask: (taskId: string) => void;
    onAddTask: (taskData: NewTaskData, list?: List | null, parentId?: string) => void;
    onOpenLogModal: (task: Task) => void;
}

type PopupType = 'date' | 'priority' | 'tags' | 'more' | 'list';

interface PopupItem {
    id: string;
    name: string;
    icon?: keyof typeof Icons;
    color?: string;
};

const priorityItems: PopupItem[] = [
    { id: '1', name: 'Urgent (P1)', color: 'text-red-600', icon: 'FlagIcon' },
    { id: '2', name: 'High (P2)', color: 'text-orange-500', icon: 'FlagIcon' },
    { id: '3', name: 'Medium (P3)', color: 'text-blue-500', icon: 'FlagIcon' },
    { id: '4', name: 'Low (P4)', color: 'text-gray-500', icon: 'FlagIcon' },
];

const getPriorityColor = (priority?: 1 | 2 | 3 | 4) => {
    switch (priority) {
        case 1: return 'text-red-600';
        case 2: return 'text-orange-500';
        case 3: return 'text-blue-500';
        case 4: return 'text-gray-500';
        default: return 'text-gray-400';
    }
};

const formatDetailDate = (date: Date) => {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return '';
    }
    
    const dateString = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    if (hasTime) {
        const timeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${dateString} at ${timeString}`;
    }
    return dateString;
};

const TagPill: React.FC<{tag: Tag, onRemove: (tagId: string) => void}> = ({ tag, onRemove }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <span 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative group inline-flex items-center pl-2.5 pr-2 py-1 text-xs font-medium rounded-full bg-${tag.color}/20 text-${tag.color}`}
        >
            <span>{tag.name}</span>
            {isHovered && (
                <button 
                    onClick={() => onRemove(tag.id)} 
                    className="absolute -right-1 -top-1 w-4 h-4 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove ${tag.name} tag`}
                >
                    &times;
                </button>
            )}
        </span>
    );
};

const KaryTaskDetail: React.FC<KaryTaskDetailProps> = ({
    selectedTaskId,
    tasks,
    allTags,
    allLists,
    allLogs,
    childrenTasks,
    onToggleComplete,
    onUpdateTask,
    onDeleteTask,
    onDuplicateTask,
    onSelectTask,
    onAddTask,
    onOpenLogModal,
}) => {
    const task = useMemo(() => tasks.find(t => t.id === selectedTaskId) || null, [selectedTaskId, tasks]);
    const [activePopup, setActivePopup] = useState<PopupType | null>(null);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [descriptionInput, setDescriptionInput] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    const popupRef = useRef<HTMLDivElement>(null);
    const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
    const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
    const triggerRefs = {
        date: useRef<HTMLButtonElement>(null),
        priority: useRef<HTMLButtonElement>(null),
        tags: useRef<HTMLButtonElement>(null),
        more: useRef<HTMLButtonElement>(null),
        list: useRef<HTMLButtonElement>(null),
    };

    const taskLogs = useMemo(() => {
        if (!task) return [];
        return allLogs.filter(log => log.taskId === task.id).sort((a,b) => b.logDate.getTime() - a.logDate.getTime());
    }, [task, allLogs]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                const isTriggerClick = Object.values(triggerRefs).some(ref => ref.current?.contains(event.target as Node));
                if (!isTriggerClick) setActivePopup(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [triggerRefs]);
    
    useEffect(() => {
        if (task) {
            setDescriptionInput(task.description || '');
            setTitleInput(task.title || '');
        }
        setIsEditingDescription(false);
        setIsEditingTitle(false);
        setNewSubtaskTitle('');
        setActivePopup(null);
    }, [task?.id]);

    useEffect(() => {
        if (isEditingDescription) descriptionTextareaRef.current?.focus();
    }, [isEditingDescription]);

    useEffect(() => {
        if (isEditingTitle && titleTextareaRef.current) {
            titleTextareaRef.current.focus();
            titleTextareaRef.current.select();
            const target = titleTextareaRef.current;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
        }
    }, [isEditingTitle]);

    if (!task) {
        return (
            <div className="flex-1 bg-white/80 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">Select a task to see its details</p>
                    <p className="text-sm">or create a new one!</p>
                </div>
            </div>
        );
    }
    
    const currentList = allLists.find(l => l.id === task.listId);
    const taskTags = (task.tags ?? []).map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean) as Tag[];
    const priorityColor = getPriorityColor(task.priority);
    const availableTags = allTags.filter(t => !(task.tags || []).includes(t.id));

    const handleUpdate = (updates: Partial<Omit<Task, 'id'>>) => {
        console.log('Updating task:', task?.id, updates);
        if (task?.id) {
            onUpdateTask(task.id, updates);
        }
        setActivePopup(null);
    };

    const handleTitleSave = () => {
        if (task && titleInput.trim() && titleInput.trim() !== task.title) {
            onUpdateTask(task.id, { title: titleInput.trim() });
        }
        setIsEditingTitle(false);
    };
    
    const handleDescriptionSave = () => {
        if (task && descriptionInput !== (task.description || '')) {
            onUpdateTask(task.id, { description: descriptionInput.trim() });
        }
        setIsEditingDescription(false);
    };

    const handleAddTag = (tagId: string) => handleUpdate({ tags: [...(task.tags || []), tagId] });
    const handleRemoveTag = (tagId: string) => handleUpdate({ tags: (task.tags || []).filter(id => id !== tagId) });
    
    const handleSubtaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (task && newSubtaskTitle.trim()) {
            const taskData: NewTaskData = { title: newSubtaskTitle.trim(), tagNames: [], priority: null, dueDate: null };
            onAddTask(taskData, null, task.id);
            setNewSubtaskTitle('');
        }
    };
    
    const handleDeleteConfirm = () => {
        if (window.confirm('Are you sure you want to delete this task? This will also delete all of its subtasks.')) {
            onDeleteTask(task.id);
        }
        setActivePopup(null);
    };

    const handleToggleChecklist = (lineIndex: number, newCheckedState: boolean) => {
        if (!task || !task.description) return;

        const lines = task.description.split('\n');
        if (lineIndex >= lines.length) return;

        const line = lines[lineIndex];
        
        let newLine = line;
        if (newCheckedState) {
            newLine = line.replace(/\[ \]/, '[x]');
        } else {
            newLine = line.replace(/\[x\]/i, '[ ]');
        }

        if (newLine !== line) {
            lines[lineIndex] = newLine;
            const newDescription = lines.join('\n');
            onUpdateTask(task.id, { description: newDescription });
        }
    };

    const renderPopup = () => {
        if (!activePopup) return null;
        const triggerRef = triggerRefs[activePopup]?.current;
        if (!triggerRef) return null;

        const rect = triggerRef.getBoundingClientRect();
        
        const popupStyle: React.CSSProperties = {
            position: 'absolute',
            top: `${rect.bottom + 8}px`,
            zIndex: 50,
        };

        if (activePopup === 'priority' || activePopup === 'more') {
            popupStyle.right = `${window.innerWidth - rect.right}px`;
        } else {
            popupStyle.left = `${rect.left}px`;
        }
        
        return (
            <div ref={popupRef} style={popupStyle} className="shadow-lg">
                {activePopup === 'date' && <DateTimePicker currentDate={task.dueDate ? new Date(task.dueDate) : null} onSelect={(date) => handleUpdate({ dueDate: date, reminder: true })} onClear={() => handleUpdate({ dueDate: undefined, reminder: false })} onClose={() => setActivePopup(null)} />}
                {activePopup === 'priority' && <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">{priorityItems.map((item) => <li key={item.id}><button onClick={() => handleUpdate({ priority: parseInt(item.id, 10) as Task['priority']})} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"><Icons.FlagIcon className={`w-4 h-4 ${item.color}`} /><span>{item.name}</span></button></li>)}</ul>}
                {activePopup === 'tags' && <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 max-h-56 overflow-y-auto">{availableTags.length > 0 ? availableTags.map((tag) => <li key={tag.id}><button onClick={() => handleAddTag(tag.id)} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"><span className={`w-2.5 h-2.5 rounded-full bg-${tag.color}`}></span><span className="flex-1 truncate">{tag.name}</span></button></li>) : <li className="px-3 py-2 text-sm text-gray-500">No more tags</li>}</ul>}
                {activePopup === 'list' && (
                    <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-56 max-h-64 overflow-y-auto">
                        {allLists
                            .filter(l => l.id !== 'today' && l.id !== 'upcoming')
                            .map((list) => {
                                const ListIcon = Icons[list.icon];
                                return (
                                    <li key={list.id}>
                                        <button
                                            onClick={() => handleUpdate({ listId: list.id })}
                                            className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"
                                        >
                                            <ListIcon className={`w-4 h-4 ${list.color ? `text-${list.color}` : 'text-gray-500'}`} />
                                            <span className="flex-1 truncate">{list.name}</span>
                                            {task.listId === list.id && <Icons.CheckSquareIcon className="w-4 h-4 text-blue-600" />}
                                        </button>
                                    </li>
                                );
                            })}
                    </ul>
                )}
                {activePopup === 'more' && (
                     <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">
                        <li>
                            <button onClick={() => { onDuplicateTask(task.id); setActivePopup(null); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Icons.CopyIcon className="w-4 h-4" />
                                <span>Duplicate Task</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={handleDeleteConfirm} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                <Icons.Trash2Icon className="w-4 h-4" />
                                <span>Delete Task</span>
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 bg-white/80 p-6 flex flex-col h-full">
            <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-4 flex-wrap">
                    <Checkbox checked={task.completed} onChange={() => onToggleComplete(task.id)} ariaLabel={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`} />
                    <button ref={triggerRefs.date} onClick={() => setActivePopup(p => p === 'date' ? null : 'date')} className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded px-2 py-1"><Icons.CalendarIcon className="w-4 h-4"/><span>{task.dueDate ? formatDetailDate(new Date(task.dueDate)) : 'Date and Reminder'}</span></button>
                    {task.dueDate && (
                         <button onClick={() => handleUpdate({ reminder: !task.reminder })} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Toggle reminder">
                            <Icons.BellIcon className={`w-5 h-5 transition-colors ${task.reminder ? 'text-blue-600' : 'text-gray-400'}`} />
                        </button>
                    )}
                </div>
                <button ref={triggerRefs.priority} onClick={() => setActivePopup(p => p === 'priority' ? null : 'priority')} className="p-2 hover:bg-gray-100 rounded-full"><Icons.FlagIcon className={`w-5 h-5 ${priorityColor}`}/></button>
            </header>

            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-2">
                <div className="flex-shrink-0">
                    <div className="flex items-start gap-2 mb-4">
                        <div className="flex-1 min-w-0">{isEditingTitle ? (<textarea ref={titleTextareaRef} value={titleInput} onChange={(e) => setTitleInput(e.target.value)} onBlur={handleTitleSave} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleTitleSave(); } if (e.key === 'Escape') { e.preventDefault(); setTitleInput(task?.title || ''); setIsEditingTitle(false); } }} onInput={(e) => { const target = e.target as HTMLTextAreaElement; target.style.height = 'auto'; target.style.height = `${target.scrollHeight}px`; }} className="w-full text-2xl font-bold text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden py-1 px-2" rows={1}/>) : (<h1 onClick={() => setIsEditingTitle(true)} className={`text-2xl font-bold text-gray-800 cursor-text ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h1>)}</div>
                        <button ref={triggerRefs.more} onClick={() => setActivePopup(p => p === 'more' ? null : 'more')} className="p-2 text-gray-400 hover:text-gray-600 rounded-full flex-shrink-0" aria-label="More options"><Icons.MoreHorizontalIcon className="w-5 h-5"/></button>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-500 w-20 flex-shrink-0">
                                <Icons.ListIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">List</span>
                            </div>
                            {currentList && (
                                <button
                                    ref={triggerRefs.list}
                                    onClick={() => setActivePopup(p => p === 'list' ? null : 'list')}
                                    className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md px-3 py-1"
                                >
                                    {React.createElement(Icons[currentList.icon], { className: `w-4 h-4 ${currentList.color ? `text-${currentList.color}` : ''}`})}
                                    <span>{currentList.name}</span>
                                    <Icons.ChevronDownIcon className="w-4 h-4 text-gray-500" />
                                </button>
                            )}
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex items-center gap-2 text-gray-500 w-20 flex-shrink-0 pt-1">
                                <Icons.TagIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">Tags</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap flex-1">
                                {taskTags.map(tag => <TagPill key={tag.id} tag={tag} onRemove={handleRemoveTag} />)}
                                <button ref={triggerRefs.tags} onClick={() => setActivePopup(p => p === 'tags' ? null : 'tags')} className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-500 transition-colors" aria-label="Add tag">
                                    <Icons.PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-2 flex-1 flex flex-col min-h-0">
                     {isEditingDescription ? (
                         <textarea
                            ref={descriptionTextareaRef}
                            value={descriptionInput}
                            onChange={(e) => setDescriptionInput(e.target.value)}
                            onBlur={handleDescriptionSave}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    setDescriptionInput(task?.description || '');
                                    setIsEditingDescription(false);
                                }
                            }}
                            className="w-full flex-1 p-3 text-sm text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                            placeholder="Add more details... (Markdown supported)"
                        />
                    ) : (
                        <div
                            className="prose max-w-none flex-1 -m-3 p-3 rounded-md hover:bg-gray-100/70 transition-colors"
                            onClick={(e) => {
                                const target = e.target as HTMLElement;
                                const isInteractive = target.closest('a, button, input');
                                if (!isInteractive) {
                                    setIsEditingDescription(true);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') setIsEditingDescription(true); }}
                            aria-label="Task description"
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    li: (allProps: any) => {
                                        const { children, checked, node, ...props } = allProps;
                                        const isTaskListItem = typeof checked === 'boolean';
                                        if (isTaskListItem && node?.position) {
                                            const lineIndex = node.position.start.line - 1;
                                            return (
                                                <li {...props} className="task-list-item-prose flex items-start">
                                                     <span className="inline-block mt-1 mr-2" onClick={e => e.stopPropagation()}>
                                                        <Checkbox
                                                            checked={checked}
                                                            onChange={() => handleToggleChecklist(lineIndex, !checked)}
                                                        />
                                                     </span>
                                                    <div className="flex-1 prose-p:my-0 prose-ul:my-0 prose-ol:my-0">{children}</div>
                                                </li>
                                            );
                                        }
                                        return <li {...props}>{children}</li>;
                                    },
                                }}
                            >
                                {task.description || '*No description provided. Click to add more details...*'}
                            </ReactMarkdown>
                        </div>
                    )}
                    
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2"><Icons.CheckSquareIcon className="w-5 h-5 text-gray-500" /><h3 className="text-md font-semibold text-gray-700">Subtasks</h3></div>
                        </div>
                        <ul className="space-y-1">
                            {childrenTasks.map(subtask => (
                                <SubtaskItem
                                    key={subtask.id}
                                    task={subtask}
                                    onToggleComplete={onToggleComplete}
                                    onSelect={onSelectTask}
                                />
                            ))}
                        </ul>
                        <form onSubmit={handleSubtaskSubmit} className="mt-2">
                            <div className="relative"><Icons.PlusIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" /><input type="text" value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)} placeholder="Add a subtask" className="w-full pl-9 pr-3 py-2 bg-gray-100/70 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:shadow-sm rounded-md outline-none transition duration-200"/></div>
                        </form>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2"><Icons.BookOpenIcon className="w-5 h-5 text-gray-500" /><h3 className="text-md font-semibold text-gray-700">Journal</h3></div>
                             <button
                                onClick={() => onOpenLogModal(task)}
                                className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                title="Add an entry for this task to your journal"
                            >
                                <Icons.PlusIcon className="w-3.5 h-3.5"/>
                                <span>Add Entry</span>
                            </button>
                        </div>
                        <ul className="space-y-2">
                           {taskLogs.map(log => <TaskLogItem key={log.id} log={log} />)}
                           {taskLogs.length === 0 && <p className="text-sm text-gray-500 text-center py-2">No journal entries for this task yet.</p>}
                        </ul>
                    </div>

                </div>
            </div>
            {renderPopup()}
        </div>
    );
};

export default KaryTaskDetail;