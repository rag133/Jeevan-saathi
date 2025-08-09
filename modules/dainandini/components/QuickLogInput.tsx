import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Focus, LogType, logTypeDetails } from '../types';
import * as Icons from '~/components/Icons';
import LoadingSpinner from '~/components/common/LoadingSpinner';
import DateTimePicker from '~/modules/kary/components/DateTimePicker';

interface QuickLogInputProps {
  foci: Focus[];
  onAddLog: (logData: {
    title: string;
    focusId: string;
    logType: LogType;
    logDate: Date;
    description?: string;
  }) => void;
  defaultFocusId?: string;
  defaultDate?: Date;
  placeholder?: string;
}

type PopupType = 'focus' | 'logType' | 'date';
type PopupItem = {
  id: string;
  name: string;
  icon?: keyof typeof Icons;
  color?: string;
};

const formatDatePill = (date: Date): string => {
  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '';
  }

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  const timeString = hasTime
    ? `, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    : '';

  today.setHours(0, 0, 0, 0);
  const dateToFormat = new Date(d);
  dateToFormat.setHours(0, 0, 0, 0);

  let dateString = '';
  if (dateToFormat.getTime() === today.getTime()) {
    dateString = 'Today';
  } else if (dateToFormat.getTime() === tomorrow.getTime()) {
    dateString = 'Tomorrow';
  } else {
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    if (dateToFormat > today && dateToFormat < nextWeek) {
      dateString = d.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  return `${dateString}${timeString}`;
};

const QuickLogInput: React.FC<QuickLogInputProps> = ({
  foci,
  onAddLog,
  defaultFocusId,
  defaultDate,
  placeholder = "Add a quick log..."
}) => {
  const [text, setText] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<Focus | null>(
    defaultFocusId ? foci.find(f => f.id === defaultFocusId) || null : null
  );
  const [selectedLogType, setSelectedLogType] = useState<LogType>(LogType.TEXT);
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate || new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [popup, setPopup] = useState<{
    type: PopupType;
    items: PopupItem[];
    highlightedIndex: number;
  } | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  // Focus selection by typing state
  const [focusSuggestions, setFocusSuggestions] = useState<Focus[]>([]);
  const [showFocusSuggestions, setShowFocusSuggestions] = useState(false);
  const [focusSearchTerm, setFocusSearchTerm] = useState('');
  const [focusSuggestionIndex, setFocusSuggestionIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Set default focus to 'general' if none selected and we're in today view
  useEffect(() => {
    if (!selectedFocus && foci.length > 0) {
      const generalFocus = foci.find(f => f.id === 'general');
      if (generalFocus) {
        setSelectedFocus(generalFocus);
      } else {
        setSelectedFocus(foci[0]);
      }
    }
  }, [foci, selectedFocus]);

  // Handle focus suggestions when typing
  useEffect(() => {
    if (text.includes('~')) {
      const lastTildeIndex = text.lastIndexOf('~');
      const afterTilde = text.slice(lastTildeIndex + 1);
      
      if (afterTilde.includes(' ')) {
        // Space after ~ means we're done with focus selection
        setShowFocusSuggestions(false);
        setFocusSuggestions([]);
        return;
      }
      
      const searchTerm = afterTilde.toLowerCase();
      setFocusSearchTerm(searchTerm);
      
      if (searchTerm.length > 0) {
        const filtered = foci.filter(focus => 
          focus.name.toLowerCase().includes(searchTerm)
        );
        setFocusSuggestions(filtered);
        setFocusSuggestionIndex(0);
        setShowFocusSuggestions(filtered.length > 0);
      } else {
        setFocusSuggestions(foci);
        setFocusSuggestionIndex(0);
        setShowFocusSuggestions(true);
      }
    } else {
      setShowFocusSuggestions(false);
      setFocusSuggestions([]);
    }
  }, [text, foci]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selectedFocus) return;

    setIsCreating(true);
    try {
      await onAddLog({
        title: text.trim(),
        focusId: selectedFocus.id,
        logType: selectedLogType,
        logDate: selectedDate,
        description: '',
      });
      setText('');
      // Reset to default focus for next log
      if (defaultFocusId) {
        const defaultFocus = foci.find(f => f.id === defaultFocusId);
        if (defaultFocus) setSelectedFocus(defaultFocus);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const openPopup = (type: PopupType, items: PopupItem[]) => {
    setPopup({ type, items, highlightedIndex: 0 });
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setPopup(null);
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
  };

  const handleSelect = (item: PopupItem) => {
    if (popup?.type === 'focus') {
      const focus = foci.find(f => f.id === item.id);
      if (focus) {
        setSelectedFocus(focus);
        // Update log type to match focus allowed types if current type is not allowed
        if (!focus.allowedLogTypes.includes(selectedLogType)) {
          setSelectedLogType(focus.allowedLogTypes[0]);
        }
      }
    } else if (popup?.type === 'logType') {
      setSelectedLogType(item.id as LogType);
    }
    setPopup(null);
  };

  const handleFocusSuggestionSelect = (focus: Focus) => {
    setSelectedFocus(focus);
    // Update log type to match focus allowed types if current type is not allowed
    if (!focus.allowedLogTypes.includes(selectedLogType)) {
      setSelectedLogType(focus.allowedLogTypes[0]);
    }
    
    // Remove the ~focusname from the text completely
    const lastTildeIndex = text.lastIndexOf('~');
    if (lastTildeIndex !== -1) {
      const beforeTilde = text.slice(0, lastTildeIndex);
      const afterTilde = text.slice(lastTildeIndex);
      const spaceIndex = afterTilde.indexOf(' ');
      
      let newText;
      if (spaceIndex !== -1) {
        // There's text after the focus name, keep it
        newText = beforeTilde + afterTilde.slice(spaceIndex);
      } else {
        // No text after focus name, just keep what was before ~
        newText = beforeTilde;
      }
      
      setText(newText.trim());
    }
    
    setShowFocusSuggestions(false);
    setFocusSuggestions([]);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle focus suggestions navigation
    if (showFocusSuggestions && focusSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusSuggestionIndex(prev => 
            prev < focusSuggestions.length - 1 ? prev + 1 : 0
          );
          return;
        case 'ArrowUp':
          e.preventDefault();
          setFocusSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : focusSuggestions.length - 1
          );
          return;
        case 'Enter':
          e.preventDefault();
          if (focusSuggestions[focusSuggestionIndex]) {
            handleFocusSuggestionSelect(focusSuggestions[focusSuggestionIndex]);
          }
          return;
        case 'Escape':
          setShowFocusSuggestions(false);
          setFocusSuggestions([]);
          return;
        case 'Tab':
          e.preventDefault();
          if (focusSuggestions[focusSuggestionIndex]) {
            handleFocusSuggestionSelect(focusSuggestions[focusSuggestionIndex]);
          }
          return;
      }
    }

    // Handle popup navigation
    if (!popup) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setPopup(prev =>
          prev
            ? {
                ...prev,
                highlightedIndex: (prev.highlightedIndex + 1) % prev.items.length,
              }
            : null
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setPopup(prev =>
          prev
            ? {
                ...prev,
                highlightedIndex:
                  prev.highlightedIndex === 0
                    ? prev.items.length - 1
                    : prev.highlightedIndex - 1,
              }
            : null
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (popup) {
          handleSelect(popup.items[popup.highlightedIndex]);
        }
        break;
      case 'Escape':
        setPopup(null);
        break;
    }
  };

  const focusItems: PopupItem[] = foci.map(focus => ({
    id: focus.id,
    name: focus.name,
    icon: focus.icon,
    color: focus.color,
  }));

  const logTypeItems: PopupItem[] = Object.entries(logTypeDetails).map(([type, details]) => ({
    id: type,
    name: details.name,
    icon: details.icon,
  }));

  return (
    <div className="relative" ref={containerRef}>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-300 focus-within:border-blue-500 rounded-lg shadow-sm transition-colors"
      >
        {/* Top section - Input field */}
        <div className="p-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent text-gray-800 placeholder-gray-500 py-2 outline-none text-base"
              disabled={isCreating}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Bottom section - Action buttons and options */}
        <div className="flex items-center justify-between px-3 pb-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-gray-500">
            {/* Date picker button */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen((o) => !o)}
                className="flex items-center gap-1.5 p-2 rounded hover:bg-gray-200 transition-colors"
                title="Select date"
              >
                <Icons.CalendarIcon
                  className={`w-4 h-4 ${selectedDate ? 'text-green-600' : 'text-gray-500'}`}
                />
                {selectedDate && (
                  <span className="text-xs text-green-600 font-medium">
                    {formatDatePill(selectedDate)}
                  </span>
                )}
              </button>
              {isDatePickerOpen && (
                <div className="absolute bottom-full left-0 mb-2 z-30">
                  <DateTimePicker
                    currentDate={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsDatePickerOpen(false);
                    }}
                    onClear={() => {
                      setSelectedDate(new Date());
                      setIsDatePickerOpen(false);
                    }}
                    onClose={() => setIsDatePickerOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Log type button */}
            <button
              type="button"
              onClick={() => openPopup('logType', logTypeItems)}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Select log type"
            >
              {React.createElement(logTypeDetails[selectedLogType].icon, { 
                className: `w-4 h-4 ${selectedLogType ? 'text-blue-600' : 'text-gray-500'}` 
              })}
            </button>

            {/* Focus area button */}
            <button
              type="button"
              onClick={() => openPopup('focus', focusItems)}
              className="flex items-center gap-1.5 p-2 rounded hover:bg-gray-200 transition-colors"
              title="Select focus area"
            >
              {selectedFocus ? (
                <>
                  {React.createElement(Icons[selectedFocus.icon], {
                    className: `w-4 h-4 text-${selectedFocus.color}`,
                  })}
                  <span className="text-xs text-gray-700 font-medium">{selectedFocus.name}</span>
                </>
              ) : (
                <Icons.TargetIcon className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* More options button (placeholder for future features) */}
            <button
              type="button"
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="More options"
            >
              <Icons.MoreHorizontalIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Add button */}
          <button
            type="submit"
            disabled={isCreating || !text.trim() || !selectedFocus}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {isCreating ? <LoadingSpinner /> : 'Add'}
          </button>
        </div>
      </form>

      {/* Focus suggestions dropdown */}
      {showFocusSuggestions && focusSuggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-30 max-h-56 overflow-y-auto">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            Type ~ to select focus area
          </div>
          {focusSuggestions.map((focus, index) => (
            <button
              key={focus.id}
              onClick={() => handleFocusSuggestionSelect(focus)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 ${
                index === focusSuggestionIndex ? 'bg-blue-100' : ''
              }`}
            >
              {React.createElement(Icons[focus.icon], {
                className: `w-4 h-4 text-${focus.color}`,
              })}
              <span className="flex-1 truncate">{focus.name}</span>
              {index === focusSuggestionIndex && (
                <span className="text-blue-600 text-xs">Press Enter or Tab</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Popup menus */}
      {popup && (
        <ul className="absolute bottom-full left-0 mb-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-56 overflow-y-auto">
          {popup.items.map((item, index) => (
            <li key={item.id}>
              <button
                onClick={() => handleSelect(item)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm ${index === popup.highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              >
                {item.icon &&
                  React.createElement(Icons[item.icon], {
                    className: `w-4 h-4 ${item.color ? `text-${item.color}` : 'text-gray-500'}`,
                  })}
                {!item.icon &&
                  item.color && (
                    <span className={`w-2.5 h-2.5 rounded-full bg-${item.color}`}></span>
                  )}
                <span className="flex-1 truncate">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuickLogInput;
