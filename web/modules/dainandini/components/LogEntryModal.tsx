import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Log, Focus, ChecklistItem, LogType, logTypeDetails, LogTemplate } from '~/modules/dainandini/types';
import Modal from '~/components/Modal';
import * as Icons from '~/components/Icons';
import DateTimePicker from '~/components/DateTimePicker';
import { WysiwygMarkdownEditor } from '~/components/common/WysiwygMarkdownEditor';

const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const Pill: React.FC<{
  text: string;
  icon: keyof typeof Icons;
  colorClass: string;
  onClick?: () => void;
  onRemove?: () => void;
}> = ({ text, icon, colorClass, onClick, onRemove }) => {
  const IconComponent = Icons[icon];
  const content = (
    <span
      className={`flex items-center gap-1.5 rounded-full pl-2.5 pr-1 py-1 text-xs font-semibold ${colorClass}`}
    >
      <IconComponent className="w-4 h-4" />
      <span>{text}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="font-mono text-lg leading-none hover:opacity-75 focus:outline-none"
        >
          &times;
        </button>
      )}
    </span>
  );
  return onClick ? (
    <button type="button" onClick={onClick}>
      {content}
    </button>
  ) : (
    content
  );
};

const StarRatingInput: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({
  rating,
  setRating,
}) => (
  <div className="flex items-center gap-1 py-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
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

const processPlaceholders = (text: string, date: Date): string => {
  return text.replace(
    /{{date}}/gi,
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );
};

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (logData: Partial<Omit<Log, 'id' | 'createdAt'>>) => void;
  allFoci: Focus[];
  template?: LogTemplate | null;
  initialFocusId?: string;
  initialDate?: Date;
  initialTitle?: string;
  initialDescription?: string;
}

const LogEntryModal: React.FC<LogEntryModalProps> = ({
  isOpen,
  onClose,
  onAddLog,
  allFoci,
  template,
  initialFocusId,
  initialDate: propInitialDate,
  initialTitle,
  initialDescription,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(3);
  const [checklistItems, setChecklistItems] = useState<Pick<ChecklistItem, 'text' | 'completed'>[]>(
    []
  );
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [activeLogType, setActiveLogType] = useState<LogType>(LogType.TEXT);
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [popup, setPopup] = useState<{ items: Focus[]; highlightedIndex: number } | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLUListElement>(null);

  const resetForm = useCallback(() => {
    const initialDate = propInitialDate || new Date();
    const defaultFocusId = initialFocusId || template?.focusId || 'general';
    const defaultFocus = allFoci.find((f) => f.id === defaultFocusId) || allFoci[0] || null;

    setTitle(initialTitle ?? (template ? processPlaceholders(template.title, initialDate) : ''));
    setDescription(initialDescription ?? template?.description ?? '');
    setRating(template?.rating || 3);
    setChecklistItems(template?.checklist || []);
    setNewChecklistItem('');
    setSelectedDate(initialDate);
    setSelectedFocus(defaultFocus);

    if (defaultFocus) {
      const preferredLogType = template?.logType || defaultFocus.allowedLogTypes[0];
      setActiveLogType(preferredLogType);
    }
  }, [allFoci, template, initialFocusId, propInitialDate, initialTitle, initialDescription]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDatePickerOpen &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
      if (popup && popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen, popup]);

  const handleFocusSelect = (focus: Focus) => {
    setSelectedFocus(focus);
    if (!focus.allowedLogTypes.includes(activeLogType)) {
      setActiveLogType(focus.allowedLogTypes[0]);
    }
    if (title.match(/~([\w\s-]*)$/)) {
      setTitle(title.substring(0, title.lastIndexOf('~')));
    }
    setPopup(null);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    const match = value.match(/~([\w\s-]*)$/);
    if (match) {
      const filter = match[1].toLowerCase();
      const items = allFoci.filter((f) => f.name.toLowerCase().includes(filter));
      setPopup(items.length > 0 ? { items, highlightedIndex: 0 } : null);
    } else {
      setPopup(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (popup) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPopup((p) =>
          p ? { ...p, highlightedIndex: (p.highlightedIndex + 1) % p.items.length } : null
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPopup((p) =>
          p
            ? { ...p, highlightedIndex: (p.highlightedIndex - 1 + p.items.length) % p.items.length }
            : null
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleFocusSelect(popup.items[popup.highlightedIndex]);
      } else if (e.key === 'Escape') {
        setPopup(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFocus || !title.trim()) return;

    const logData: Partial<Omit<Log, 'id' | 'createdAt'>> = {
      title,
      description,
      focusId: selectedFocus.id,
      logType: activeLogType,
      logDate: selectedDate,
    };

    if (activeLogType === LogType.RATING) logData.rating = rating;
    if (activeLogType === LogType.CHECKLIST) {
      const finalItems = newChecklistItem.trim()
        ? [...checklistItems, { text: newChecklistItem.trim(), completed: false }]
        : checklistItems;
      logData.checklist = finalItems
        .filter((item) => item.text.trim() !== '')
        .map((item) => ({ ...item, id: crypto.randomUUID() }));
    }

    console.log("Submitting log data:", logData);
    onAddLog(logData);
    onClose();
  };

  const formatDatePill = (date: Date): string => {
    let dateString: string;
    if (isSameDay(date, new Date())) {
      dateString = 'Today';
    } else {
      dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
    if (hasTime) {
      const timeString = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${dateString} at ${timeString}`;
    }

    return dateString;
  };

  const handleAddChecklistItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newChecklistItem.trim()) {
      e.preventDefault();
      setChecklistItems([...checklistItems, { text: newChecklistItem.trim(), completed: false }]);
      setNewChecklistItem('');
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const renderFormContent = () => {
    switch (activeLogType) {
      case LogType.RATING:
        return <StarRatingInput rating={rating} setRating={setRating} />;
      case LogType.CHECKLIST:
        return (
          <div className="space-y-2 pt-2">
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {checklistItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700 pr-2">
                  <Icons.CheckSquareIcon className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(index)}
                    className="text-red-400 hover:text-red-600 font-bold"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyDown={handleAddChecklistItem}
              placeholder="Add item and press Enter..."
              className="w-full bg-gray-50 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        );
      case LogType.TEXT:
      default:
        return (
          <WysiwygMarkdownEditor
            value={description}
            onChange={setDescription}
            placeholder="Add a description... (optional) (Markdown supported)"
            minHeight="120px"
          />
        );
    }
  };

  if (!isOpen || !selectedFocus) return null;

  return (
    <Modal title={template ? `New Log from: ${template.name}` : 'Add New Log'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 relative">
        <div className="flex items-center justify-center p-1 rounded-lg bg-gray-100 space-x-1">
          {selectedFocus.allowedLogTypes.map((type) => {
            const details = logTypeDetails[type];
            const Icon = Icons[details.icon];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveLogType(type)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeLogType === type ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:bg-gray-200/50'}`}
              >
                <Icon className="w-4 h-4" />
                {details.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Pill
            text={selectedFocus.name}
            icon={selectedFocus.icon}
            colorClass={`bg-${selectedFocus.color}/20 text-${selectedFocus.color}`}
            onClick={() => setPopup({ items: allFoci, highlightedIndex: 0 })}
          />
          <div className="relative" ref={datePickerRef}>
            <Pill
              text={formatDatePill(selectedDate)}
              icon="CalendarIcon"
              colorClass="bg-gray-200 text-gray-800"
              onClick={() => setIsDatePickerOpen(true)}
            />
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 z-30">
                <DateTimePicker
                  currentDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsDatePickerOpen(false);
                  }}
                  onClear={() => {}}
                  onClose={() => setIsDatePickerOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
          placeholder="Title your log entry..."
          className="w-full bg-gray-50 px-3 py-2 text-gray-800 font-semibold placeholder-gray-500 outline-none rounded-md focus:ring-2 focus:ring-blue-500"
        />

        {popup && (
          <ul
            ref={popupRef}
            className="absolute mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-56 overflow-y-auto"
          >
            {popup.items.map((item, index) => {
              const Icon = Icons[item.icon];
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleFocusSelect(item)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm ${index === popup.highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    <Icon className={`w-4 h-4 text-${item.color}`} />
                    <span className="flex-1 truncate">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {renderFormContent()}

        <div className="flex items-center justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-100 mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            Log Entry
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LogEntryModal;
