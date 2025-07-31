import React, { useState, useRef, useEffect } from 'react';
import { Task, Tag } from '../types';
import * as Icons from './Icons';
import Checkbox from './Checkbox';
import DateTimePicker from './DateTimePicker';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TaskDetailProps {
    task: Task | null;
    allTags: Tag[];
    onToggleComplete: (id: string) => void;
    onUpdateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
}

type PopupType = 'date' | 'priority' | 'tags';

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
    
    // Check if the date is valid
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

const TaskDetail: React.FC<TaskDetailProps> = ({ task, allTags, onToggleComplete, onUpdateTask }) => {
    const [activePopup, setActivePopup] = useState<PopupType | null>(null);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [descriptionInput, setDescriptionInput] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleInput, setTitleInput] = useState('');

    const popupRef = useRef<HTMLDivElement>(null);
    const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
    const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
    const triggerRefs = {
        date: useRef<HTMLButtonElement>(null),
        priority: useRef<HTMLButtonElement>(null),
        tags: useRef<HTMLButtonElement>(null),
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                // Also check if the click was on one of the triggers
                const isTriggerClick = Object.values(triggerRefs).some(ref => ref.current?.contains(event.target as Node));
                if (!isTriggerClick) {
                    setActivePopup(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [triggerRefs]);
    
    useEffect(() => {
        // When task changes, reset editing state and update description
        if (task) {
            setDescriptionInput(task.description || '');
            setTitleInput(task.title || '');
        }
        setIsEditingDescription(false);
        setIsEditingTitle(false);
    }, [task?.id]);

    useEffect(() => {
        if (isEditingDescription) {
            descriptionTextareaRef.current?.focus();
        }
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
    
    const taskTags = (task.tags ?? []).map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean) as Tag[];
    const priorityColor = getPriorityColor(task.priority);
    const availableTags = allTags.filter(t => !(task.tags || []).includes(t.id));

    const handleUpdate = (updates: Partial<Omit<Task, 'id'>>) => {
        onUpdateTask(task.id, updates);
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

    const handleAddTag = (tagId: string) => {
        const newTags = [...(task.tags || []), tagId];
        handleUpdate({ tags: newTags });
    };

    const handleRemoveTag = (tagId: string) => {
        const newTags = (task.tags || []).filter(id => id !== tagId);
        handleUpdate({ tags: newTags });
    };

    const renderPopup = () => {
        if (!activePopup) return null;

        const triggerRef = triggerRefs[activePopup]?.current;
        if (!triggerRef) return null;

        const rect = triggerRef.getBoundingClientRect();
        const popupStyle: React.CSSProperties = {
            position: 'absolute',
            top: `${rect.bottom + 8}px`,
            left: `${rect.left}px`,
            zIndex: 50,
        };
        
        return (
            <div ref={popupRef} style={popupStyle} className="shadow-lg">
                {activePopup === 'date' && (
                    <DateTimePicker
                        currentDate={task.dueDate ? new Date(task.dueDate) : null}
                        onSelect={(date) => handleUpdate({ dueDate: date })}
                        onClear={() => handleUpdate({ dueDate: undefined })}
                        onClose={() => setActivePopup(null)}
                    />
                )}
                {activePopup === 'priority' && (
                     <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 overflow-y-auto">
                        {priorityItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleUpdate({ priority: parseInt(item.id, 10) as Task['priority']})}
                                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    <Icons.FlagIcon className={`w-4 h-4 ${item.color}`} />
                                    <span className="flex-1 truncate">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {activePopup === 'tags' && (
                    <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-48 max-h-56 overflow-y-auto">
                        {availableTags.length > 0 ? availableTags.map((tag) => (
                            <li key={tag.id}>
                                <button
                                    onClick={() => handleAddTag(tag.id)}
                                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                    <span className={`w-2.5 h-2.5 rounded-full bg-${tag.color}`}></span>
                                    <span className="flex-1 truncate">{tag.name}</span>
                                </button>
                            </li>
                        )) : <li className="px-3 py-2 text-sm text-gray-500">No more tags</li>}
                    </ul>
                )}
            </div>
        );
    }

    return (
        <div className="flex-1 bg-white/80 p-6 flex flex-col h-full">
            <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Checkbox
                        checked={task.completed}
                        onChange={() => onToggleComplete(task.id)}
                        ariaLabel={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <button 
                        ref={triggerRefs.date}
                        onClick={() => setActivePopup(p => p === 'date' ? null : 'date')}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded px-2 py-1"
                    >
                        <Icons.CalendarIcon className="w-4 h-4"/>
                        <span>{task.dueDate ? formatDetailDate(new Date(task.dueDate)) : 'Date and Reminder'}</span>
                    </button>
                </div>
                 <button 
                    ref={triggerRefs.priority}
                    onClick={() => setActivePopup(p => p === 'priority' ? null : 'priority')}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <Icons.FlagIcon className={`w-5 h-5 ${priorityColor}`}/>
                </button>
            </header>

            <div className="flex-1 flex flex-col min-h-0 pr-2">
                <div className="flex-shrink-0">
                    <div className="flex items-start gap-2 mb-4">
                        <div className="flex-1 min-w-0">
                            {isEditingTitle ? (
                                <textarea
                                    ref={titleTextareaRef}
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleTitleSave();
                                        }
                                        if (e.key === 'Escape') {
                                            e.preventDefault();
                                            setTitleInput(task?.title || '');
                                            setIsEditingTitle(false);
                                        }
                                    }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                    className="w-full text-2xl font-bold text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden py-1 px-2"
                                    rows={1}
                                />
                            ) : (
                                <h1 onClick={() => setIsEditingTitle(true)} className={`text-2xl font-bold text-gray-800 cursor-text ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h1>
                            )}
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full flex-shrink-0" aria-label="More options">
                            <Icons.ListIcon className="w-5 h-5"/>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-6">
                        {taskTags.map(tag => (
                            <TagPill key={tag.id} tag={tag} onRemove={handleRemoveTag} />
                        ))}
                        <button 
                            ref={triggerRefs.tags}
                            onClick={() => setActivePopup(p => p === 'tags' ? null : 'tags')}
                            className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-500 transition-colors"
                            aria-label="Add tag"
                        >
                            <Icons.PlusIcon className="w-4 h-4" />
                        </button>
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
                            className="prose max-w-none flex-1 overflow-y-auto p-3 -m-3 rounded-md cursor-text hover:bg-gray-100/70 transition-colors"
                            onClick={() => setIsEditingDescription(true)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') setIsEditingDescription(true); }}
                            aria-label="Task description"
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {task.description || '*No description provided. Click to add more details...*'}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
            {renderPopup()}
        </div>
    );
};

export default TaskDetail;