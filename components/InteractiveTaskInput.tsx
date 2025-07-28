
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { List, Tag } from '../types';
import { extractTaskDetails, ExtractedTaskData } from '../services/geminiService';
import { FlagIcon, CalendarIcon, TagIcon, MoreHorizontalIcon } from './Icons';
import * as Icons from './Icons';
import LoadingSpinner from './LoadingSpinner';
import DateTimePicker from './DateTimePicker';

interface InteractiveTaskInputProps {
    lists: List[];
    tags: Tag[];
    onAddTask: (taskData: ExtractedTaskData, list?: List | null) => void;
    apiKey: string | null;
}

type PopupType = 'list' | 'tag' | 'priority';
type PopupItem = {
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

const getPriorityData = (priority: 1 | 2 | 3 | 4) => {
    switch (priority) {
        case 1: return { text: '!Urgent', colorClass: 'bg-red-100 text-red-800', color: 'text-red-600' };
        case 2: return { text: '!High', colorClass: 'bg-orange-100 text-orange-800', color: 'text-orange-500' };
        case 3: return { text: '!Medium', colorClass: 'bg-blue-100 text-blue-800', color: 'text-blue-500' };
        case 4: return { text: '!Low', colorClass: 'bg-gray-100 text-gray-800', color: 'text-gray-500' };
    }
};

const formatDatePill = (date: Date): string => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    const timeString = hasTime ? `, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : '';

    today.setHours(0,0,0,0);
    const dateToFormat = new Date(d);
    dateToFormat.setHours(0,0,0,0);

    let dateString = '';
    if (dateToFormat.getTime() === today.getTime()) {
        dateString = 'Today';
    } else if (dateToFormat.getTime() === tomorrow.getTime()) {
        dateString = 'Tomorrow';
    } else {
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        if(dateToFormat > today && dateToFormat < nextWeek) {
            dateString = d.toLocaleDateString('en-US', { weekday: 'long' });
        } else {
            dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    return `${dateString}${timeString}`;
};

const Pill: React.FC<{text: string; icon?: keyof typeof Icons, colorClass: string; onRemove: () => void;}> = ({ text, icon, colorClass, onRemove }) => (
    <span className={`flex items-center gap-1.5 rounded-md pl-2 pr-1 py-0.5 text-sm font-medium ${colorClass}`}>
        {icon && React.createElement(Icons[icon], { className: "w-4 h-4" })}
        <span>{text}</span>
        <button type="button" onClick={onRemove} className="font-mono text-lg leading-none hover:opacity-75 focus:outline-none">&times;</button>
    </span>
);

const InteractiveTaskInput: React.FC<InteractiveTaskInputProps> = ({ lists, tags, onAddTask, apiKey }) => {
    const [text, setText] = useState('');
    const [selectedList, setSelectedList] = useState<List | null>(null);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedPriority, setSelectedPriority] = useState<1 | 2 | 3 | 4 | null>(null);
    const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const [isCreating, setIsCreating] = useState(false);
    const [popup, setPopup] = useState<{
        type: PopupType;
        items: PopupItem[];
        highlightedIndex: number;
        isTextTriggered?: boolean;
    } | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLFormElement>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const resetInput = useCallback(() => {
        setText('');
        setSelectedList(null);
        setSelectedTags([]);
        setSelectedPriority(null);
        setSelectedDueDate(null);
        setPopup(null);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const titleFromInput = text.trim();
        if (!titleFromInput && selectedTags.length === 0 && !selectedList && !selectedPriority && !selectedDueDate) return;

        setIsCreating(true);
        try {
            const dataFromAi = await extractTaskDetails(titleFromInput, apiKey);
            
            const combinedTagNames = [...new Set([...selectedTags.map(t => t.name), ...dataFromAi.tagNames])];

            const finalTaskData: ExtractedTaskData = {
                title: dataFromAi.title || titleFromInput,
                dueDate: selectedDueDate ? selectedDueDate.toISOString() : dataFromAi.dueDate,
                tagNames: combinedTagNames,
                priority: selectedPriority ?? dataFromAi.priority,
                list: selectedList,
            };

            onAddTask(finalTaskData, selectedList);
            resetInput();
        } catch (error) {
            console.error("Failed to create task:", error);
        } finally {
            setIsCreating(false);
            inputRef.current?.focus();
        }
    };
    
    const openPopup = (type: PopupType, items: PopupItem[]) => {
        if (items.length > 0) {
            setPopup({ type, items, highlightedIndex: 0 });
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popup && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setPopup(null);
            }
            if (isDatePickerOpen && datePickerRef.current && !datePickerRef.current.contains(event.target as Node) && !containerRef.current?.contains(event.target as Node)) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popup, isDatePickerOpen]);

    const handleSelect = (item: PopupItem) => {
        if (!popup) return;
        
        switch (popup.type) {
            case 'list':
                setSelectedList(lists.find(l => l.id === item.id) || null);
                break;
            case 'tag':
                const tag = tags.find(t => t.id === item.id);
                if (tag && !selectedTags.some(t => t.id === tag.id)) {
                    setSelectedTags(prev => [...prev, tag]);
                }
                break;
            case 'priority':
                setSelectedPriority(parseInt(item.id, 10) as 1 | 2 | 3 | 4);
                break;
        }

        if (popup.isTextTriggered) {
             setText(prev => prev.substring(0, prev.lastIndexOf(popup.type === 'list' ? '~' : popup.type === 'tag' ? '#' : '!')));
        }
        
        setPopup(null);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setText(value);

        const match = value.match(/([~#!])([\w-]*)$/);

        if (match) {
            const trigger = match[1];
            const filter = match[2].toLowerCase();
            let items: PopupItem[] = [];
            let type: PopupType | null = null;

            if (trigger === '~' && !selectedList) {
                type = 'list';
                items = lists
                    .filter(l => l.name.toLowerCase().includes(filter))
                    .map(l => ({ id: l.id, name: l.name, icon: l.icon }));
            } else if (trigger === '#') {
                type = 'tag';
                const currentTagIds = new Set(selectedTags.map(t => t.id));
                items = tags
                    .filter(t => !currentTagIds.has(t.id) && t.name.toLowerCase().includes(filter))
                    .map(t => ({ id: t.id, name: t.name, color: t.color }));
            } else if (trigger === '!' && !selectedPriority) {
                type = 'priority';
                items = priorityItems.filter(p => p.id.includes(filter) || p.name.toLowerCase().includes(filter));
            }

            if (type && items.length > 0) {
                setPopup({ type, items, highlightedIndex: 0, isTextTriggered: true });
            } else {
                setPopup(null);
            }
        } else {
            setPopup(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isDatePickerOpen) return;

        if (popup) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setPopup(p => p ? { ...p, highlightedIndex: (p.highlightedIndex + 1) % p.items.length } : null);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setPopup(p => p ? { ...p, highlightedIndex: (p.highlightedIndex - 1 + p.items.length) % p.items.length } : null);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                handleSelect(popup.items[popup.highlightedIndex]);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setPopup(null);
            }
        } else {
             if (e.key === 'Backspace' && text === '') {
                if (selectedTags.length > 0) setSelectedTags(tags => tags.slice(0, -1));
                else if (selectedDueDate) setSelectedDueDate(null);
                else if (selectedList) setSelectedList(null);
                else if (selectedPriority) setSelectedPriority(null);
            }
        }
    };
    
    const priorityData = selectedPriority ? getPriorityData(selectedPriority) : null;
    const availableTags = tags.filter(t => !selectedTags.some(st => st.id === t.id));

    return (
        <div className="relative">
             <form onSubmit={handleSubmit} ref={containerRef} className="bg-white border-2 border-transparent focus-within:border-blue-500 rounded-lg shadow-sm transition-colors">
                <div className="p-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {priorityData && <Pill text={priorityData.text.substring(1)} icon="FlagIcon" colorClass={priorityData.colorClass} onRemove={() => setSelectedPriority(null)} />}
                        {selectedList && <Pill text={selectedList.name} icon={selectedList.icon} colorClass="bg-gray-200 text-gray-800" onRemove={() => setSelectedList(null)} />}
                        {selectedDueDate && <Pill text={formatDatePill(selectedDueDate)} icon="CalendarIcon" colorClass="bg-blue-100 text-blue-800" onRemove={() => setSelectedDueDate(null)} />}

                        {selectedTags.map(tag => (
                            <Pill key={tag.id} text={tag.name} colorClass={`bg-${tag.color}/20 text-${tag.color}`} onRemove={() => setSelectedTags(current => current.filter(t => t.id !== tag.id))} />
                        ))}

                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Create a task"
                            className="flex-1 min-w-[120px] bg-transparent text-gray-800 placeholder-gray-500 py-1 outline-none"
                            disabled={isCreating}
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-1 pt-2 pb-2 px-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-gray-500">
                        <div className="relative" ref={datePickerRef}>
                            <button type="button" onClick={() => setIsDatePickerOpen(o => !o)} className="flex items-center gap-1.5 p-1 rounded hover:bg-gray-200 transition-colors">
                               <Icons.CalendarIcon className={`w-5 h-5 ${selectedDueDate ? 'text-blue-600' : ''}`} />
                               {selectedDueDate && <span className="text-xs text-blue-600 font-medium">{formatDatePill(selectedDueDate)}</span>}
                            </button>
                            {isDatePickerOpen && (
                                <div className="absolute top-full left-0 mt-2 z-30">
                                    <DateTimePicker
                                        currentDate={selectedDueDate}
                                        onSelect={(date) => {
                                            setSelectedDueDate(date);
                                            setIsDatePickerOpen(false);
                                        }}
                                        onClear={() => {
                                            setSelectedDueDate(null);
                                            setIsDatePickerOpen(false);
                                        }}
                                        onClose={() => setIsDatePickerOpen(false)}
                                    />
                                </div>
                            )}
                        </div>
                        <button type="button" onClick={() => openPopup('priority', priorityItems)} className="p-1 rounded hover:bg-gray-200 transition-colors">
                            <Icons.FlagIcon className={`w-5 h-5 ${priorityData ? priorityData.color : ''}`} />
                        </button>
                        <button type="button" onClick={() => openPopup('tag', availableTags.map(t => ({ id: t.id, name: t.name, color: t.color })))} className="p-1 rounded hover:bg-gray-200 transition-colors">
                            <Icons.TagIcon className="w-5 h-5" />
                        </button>
                         <button type="button" onClick={() => openPopup('list', lists.map(l => ({ id: l.id, name: l.name, icon: l.icon, color: l.color })))} className="flex items-center gap-1.5 p-1 rounded hover:bg-gray-200 transition-colors">
                           {selectedList ? (
                               <>
                                {React.createElement(Icons[selectedList.icon] || Icons.ListIcon, {className: `w-4 h-4 ${selectedList.color ? `text-${selectedList.color}`: ''}`})}
                                <span className="text-xs text-gray-700 font-medium">{selectedList.name}</span>
                               </>
                           ) : <Icons.ListIcon className="w-5 h-5"/>}
                        </button>
                        <button type="button" className="p-1 rounded hover:bg-gray-200 transition-colors"><Icons.MoreHorizontalIcon className="w-5 h-5"/></button>
                    </div>
                    <button type="submit" disabled={isCreating || (!text.trim() && selectedTags.length === 0)} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                         {isCreating ? <LoadingSpinner /> : 'Add'}
                    </button>
                </div>
            </form>

            {popup && (
                <ul className="absolute mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-56 overflow-y-auto">
                    {popup.items.map((item, index) => (
                        <li key={item.id}>
                            <button
                                onClick={() => handleSelect(item)}
                                className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm ${index === popup.highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                {item.icon && React.createElement(Icons[item.icon], { className: `w-4 h-4 ${item.color || 'text-gray-500'}` })}
                                {!item.icon && item.color && (popup.type === 'tag' ? <span className={`w-2.5 h-2.5 rounded-full bg-${item.color}`}></span> : <Icons.FlagIcon className={`w-4 h-4 ${item.color}`} />) }
                                <span className="flex-1 truncate">{item.name}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default InteractiveTaskInput;
