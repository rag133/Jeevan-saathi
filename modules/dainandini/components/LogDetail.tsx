import React, { useState, useEffect, useRef } from 'react';
import { Log, Focus, ChecklistItem, LogType, logTypeDetails } from '~/modules/dainandini/types';
import * as Icons from '~/components/Icons';
import Checkbox from '~/components/common/Checkbox';
import DateTimePicker from '~/components/DateTimePicker';

const StarRatingInput: React.FC<{ rating: number; onSetRating: (rating: number) => void }> = ({
  rating,
  onSetRating,
}) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onSetRating(star)}
        className="p-1 rounded-full text-yellow-400 hover:text-yellow-500 transition-colors"
        aria-label={`Set rating to ${star}`}
      >
        <Icons.StarIcon
          className={`w-6 h-6 transition-colors ${rating >= star ? 'fill-yellow-400' : 'fill-gray-300 hover:fill-yellow-200'}`}
        />
      </button>
    ))}
  </div>
);

interface LogDetailProps {
  log: Log | null;
  foci: Focus[];
  onUpdateLog: (logId: string, updates: Partial<Log>) => void;
  onDeleteLog: (logId: string) => void;
}

const LogDetail: React.FC<LogDetailProps> = ({ log, foci, onUpdateLog, onDeleteLog }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionInput, setDescriptionInput] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [activePopup, setActivePopup] = useState<'focus' | 'date' | null>(null);

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRefs = {
    focus: useRef<HTMLButtonElement>(null),
    date: useRef<HTMLButtonElement>(null),
  };

  useEffect(() => {
    if (log) {
      setTitleInput(log.title);
      setDescriptionInput(log.description || '');
      setChecklist(log.checklist || []);
      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setActivePopup(null);
    }
  }, [log]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        const isTriggerClick = Object.values(triggerRefs).some((ref) =>
          ref.current?.contains(event.target as Node)
        );
        if (!isTriggerClick) setActivePopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [triggerRefs]);

  useEffect(() => {
    if (isEditingTitle && titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
      titleTextareaRef.current.focus();
      titleTextareaRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus();
    }
  }, [isEditingDescription]);

  const handleUpdate = (updates: Partial<Log>) => {
    if (log) {
      onUpdateLog(log.id, updates);
    }
    setActivePopup(null);
  };

  const handleTitleSave = () => {
    if (log && titleInput.trim() && titleInput.trim() !== log.title) {
      onUpdateLog(log.id, { title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    if (log && descriptionInput.trim() !== (log.description || '')) {
      onUpdateLog(log.id, { description: descriptionInput.trim() });
    }
    setIsEditingDescription(false);
  };

  const handleRatingUpdate = (rating: number) => {
    if (log) onUpdateLog(log.id, { rating });
  };

  const handleChecklistUpdate = (updatedChecklist: ChecklistItem[]) => {
    if (log) {
      setChecklist(updatedChecklist); // optimistically update local state
      onUpdateLog(log.id, { checklist: updatedChecklist });
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    const updated = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    handleChecklistUpdate(updated);
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: newChecklistItem.trim(),
        completed: false,
      };
      handleChecklistUpdate([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const renderPopup = () => {
    if (!activePopup || !log) return null;
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
            currentDate={log.logDate ? new Date(log.logDate) : new Date()}
            onSelect={(date) => handleUpdate({ logDate: date })}
            onClear={() => setActivePopup(null)}
            onClose={() => setActivePopup(null)}
          />
        )}
        {activePopup === 'focus' && (
          <ul className="bg-white rounded-lg shadow-xl border border-gray-200 w-56 max-h-64 overflow-y-auto">
            {foci.map((focus) => {
              const FocusIcon = Icons[focus.icon];
              return (
                <li key={focus.id}>
                  <button
                    onClick={() => handleUpdate({ focusId: focus.id })}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    <FocusIcon className={`w-5 h-5 text-${focus.color}`} />
                    <span className="flex-1 truncate">{focus.name}</span>
                    {log.focusId === focus.id && (
                      <Icons.CheckSquareIcon className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  if (!log) {
    return (
      <div className="flex-1 bg-white/80 flex items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <Icons.BookOpenIcon className="w-12 h-12 mx-auto text-gray-300" />
          <h2 className="mt-2 text-lg font-medium">Select a log</h2>
          <p className="text-sm">Choose an entry from the list to view or edit its details.</p>
        </div>
      </div>
    );
  }

  const logFocus = foci.find((f) => f.id === log.focusId);
  const LogIcon = logFocus ? Icons[logFocus.icon] : Icons.ListIcon;
  const LogTypeIcon = Icons[logTypeDetails[log.logType].icon];

  return (
    <div className="flex-1 bg-white/90 p-6 flex flex-col h-full">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          {logFocus && (
            <button
              ref={triggerRefs.focus}
              onClick={() => setActivePopup((p) => (p === 'focus' ? null : 'focus'))}
              className={`flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full pl-1 pr-3 py-1 hover:bg-gray-200 transition-colors`}
            >
              <LogIcon className={`w-5 h-5 p-0.5 rounded-full bg-white text-${logFocus.color}`} />
              {logFocus.name}
            </button>
          )}
          <button
            ref={triggerRefs.date}
            onClick={() => setActivePopup((p) => (p === 'date' ? null : 'date'))}
            className="flex items-center gap-2 text-sm text-gray-500 hover:bg-gray-100 p-1 rounded-md transition-colors"
          >
            <Icons.CalendarIcon className="w-4 h-4" />
            {new Date(log.logDate).toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </button>
        </div>
        <button
          onClick={() => onDeleteLog(log.id)}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Delete log"
        >
          <Icons.Trash2Icon className="w-5 h-5 text-gray-500 hover:text-red-600" />
        </button>
      </header>

      <div className="flex-1 flex flex-col overflow-y-auto pr-2 -mr-2">
        <div className="flex items-start gap-3 mb-6">
          <LogTypeIcon className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
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
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full text-2xl font-bold text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden py-1 px-2"
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-2xl font-bold text-gray-800 cursor-text"
              >
                {log.title}
              </h1>
            )}
          </div>
        </div>

        {log.logType === LogType.RATING && (
          <div className="mb-6">
            <StarRatingInput rating={log.rating || 0} onSetRating={handleRatingUpdate} />
          </div>
        )}

        <div className="prose max-w-none text-gray-800 mb-6 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wider mb-2">
            Description
          </h3>
          {isEditingDescription ? (
            <textarea
              ref={descriptionTextareaRef}
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              onBlur={handleDescriptionSave}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsEditingDescription(false);
                }
              }}
              className="w-full flex-1 text-base p-2 text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
              placeholder="Add more details..."
            />
          ) : (
            <div
              className="p-2 -m-2 rounded-md cursor-text hover:bg-gray-100/70 h-full"
              onClick={() => setIsEditingDescription(true)}
            >
              {descriptionInput.trim() ? (
                <p className="whitespace-pre-wrap">{descriptionInput}</p>
              ) : (
                <p className="text-gray-400 italic">No description provided. Click to add.</p>
              )}
            </div>
          )}
        </div>

        {log.logType === LogType.CHECKLIST && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wider mb-3">
              Checklist
            </h3>
            <ul className="space-y-2">
              {checklist.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-1 rounded-md hover:bg-gray-100"
                >
                  <Checkbox
                    checked={item.completed}
                    onChange={() => handleToggleChecklistItem(item.id)}
                  />
                  <span
                    className={`flex-1 text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddChecklistItem} className="mt-2">
              <div className="relative">
                <Icons.PlusIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add a checklist item"
                  className="w-full pl-9 pr-3 py-2 bg-gray-100/70 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:shadow-sm rounded-md outline-none transition"
                />
              </div>
            </form>
          </div>
        )}
      </div>
      {renderPopup()}
    </div>
  );
};

export default LogDetail;
