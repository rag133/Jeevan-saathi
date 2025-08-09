import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Focus, Log } from '~/modules/dainandini/types';
import * as Icons from '~/components/Icons';
import LogItem from './LogItem';
import DateTimePicker from '~/modules/kary/components/DateTimePicker';

const getMonthYearText = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const getWeekGrid = (viewDate: Date): Date[] => {
  const date = new Date(viewDate);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = date.getDate() - day;
  const startOfWeek = new Date(date.setDate(diff));

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });
};

interface CalendarViewProps {
  allFoci: Focus[];
  logs: Log[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  filteredLogs: Log[];
  onToggleKaryTask: (taskId: string) => void;
  selectedLogId: string | null;
  onSelectLog: (id: string) => void;
  onAddLogClick: () => void;
  calendarViewMode: 'focus' | 'timeline';
  onSetCalendarViewMode: (mode: 'focus' | 'timeline') => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  allFoci,
  logs,
  selectedDate,
  onDateSelect,
  filteredLogs,
  onToggleKaryTask,
  selectedLogId,
  onSelectLog,
  onAddLogClick,
  calendarViewMode,
  onSetCalendarViewMode,
}) => {
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDatePickerOpen &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen]);

  const daysWithLogs = useMemo(() => {
    const dates = new Set<string>();
    logs.forEach((log) => {
      dates.add(new Date(log.logDate).toDateString());
    });
    return dates;
  }, [logs]);

  const weekGrid = useMemo(() => getWeekGrid(viewDate), [viewDate]);

  const groupedCalendarLogs = useMemo(() => {
    if (!filteredLogs.length) return new Map<string, Log[]>();

    const groups = new Map<string, Log[]>();

    allFoci.forEach((focus) => {
      groups.set(focus.name, []);
    });
    groups.set('Uncategorized', []);

    filteredLogs.forEach((log) => {
      const focus = allFoci.find((f) => f.id === log.focusId);
      const groupName = focus ? focus.name : 'Uncategorized';
      if (!groups.has(groupName)) {
        // Safeguard for logs with deleted foci
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(log);
    });

    for (const [key, value] of groups.entries()) {
      if (value.length === 0) {
        groups.delete(key);
      }
    }

    return groups;
  }, [filteredLogs, allFoci]);

  const groupEntries = Array.from(groupedCalendarLogs.entries());

  const handlePrevWeek = () =>
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  const handleNextWeek = () =>
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  const handleGoToToday = () => {
    const today = new Date();
    setViewDate(today);
    onDateSelect(today);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Icons.CalendarIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-gray-100 shadow-inner">
                <button
                  onClick={() => onSetCalendarViewMode('focus')}
                  title="Group by Focus"
                  className={`p-1.5 rounded-md transition-all ${calendarViewMode === 'focus' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  <Icons.SummaryIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onSetCalendarViewMode('timeline')}
                  title="Timeline View"
                  className={`p-1.5 rounded-md transition-all ${calendarViewMode === 'timeline' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  <Icons.ListIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="relative" ref={datePickerRef}>
                <button
                  onClick={() => setIsDatePickerOpen((o) => !o)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Open date picker"
                >
                  <Icons.CalendarIcon className="w-5 h-5 text-gray-600" />
                </button>
                {isDatePickerOpen && (
                  <div className="absolute top-full right-0 mt-2 z-30">
                    <DateTimePicker
                      currentDate={selectedDate}
                      onSelect={(date) => {
                        setViewDate(date);
                        onDateSelect(date);
                        setIsDatePickerOpen(false);
                      }}
                      onClear={() => {}}
                      onClose={() => setIsDatePickerOpen(false)}
                    />
                  </div>
                )}
              </div>
              <button
                onClick={onAddLogClick}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Icons.PlusIcon className="w-5 h-5" />
                <span>Add Log</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6 pb-4">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">{getMonthYearText(viewDate)}</h2>
            <div className="flex items-center gap-4">
              {/* Description Toggle Switch */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Show Details</span>
                <button
                  onClick={() => setShowDescriptions(!showDescriptions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    showDescriptions ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={showDescriptions}
                  title={showDescriptions ? 'Hide Descriptions' : 'Show Descriptions'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showDescriptions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoToToday}
                  title="Go to Today"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Today
                </button>
                <button onClick={handlePrevWeek} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Icons.ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={handleNextWeek} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Icons.ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekGrid.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const hasLogs = daysWithLogs.has(day.toDateString());

            let buttonClass =
              'w-full text-center p-3 rounded-lg transition-all duration-200 border-2';

            if (isSelected) {
              buttonClass += ' bg-indigo-600 text-white font-semibold border-indigo-600 shadow-lg';
            } else if (isToday) {
              buttonClass += ' border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-50';
            } else {
              buttonClass += ' border-transparent text-gray-700 hover:bg-gray-100';
            }

            return (
              <div key={i}>
                <button onClick={() => onDateSelect(day)} className={buttonClass}>
                  <span className="text-xs uppercase text-gray-400 font-semibold">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span
                    className={`block text-xl mt-1 font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}
                  >
                    {day.getDate()}
                  </span>
                  {hasLogs && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 mx-auto ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                    ></div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log List */}
      <div className="flex-1 overflow-y-auto border-t border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 sticky top-0 bg-white/90 backdrop-blur-sm py-2 z-10">
            {selectedDate
              ? `Logs for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
              : 'Select a date to see logs'}
          </h2>
          {calendarViewMode === 'timeline' ? (
            filteredLogs.length > 0 ? (
              <div className="space-y-3">
                {filteredLogs.map((log) => {
                  const focus = allFoci.find((f) => f.id === log.focusId);
                  return (
                    <LogItem
                      key={log.id}
                      log={log}
                      focus={focus}
                      isSelected={selectedLogId === log.id}
                      onSelect={onSelectLog}
                      onToggleKaryTask={onToggleKaryTask}
                      showDescription={showDescriptions}
                    />
                  );
                })}
              </div>
            ) : (
              selectedDate && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.CalendarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No logs on this day</h3>
                  <p className="text-gray-500">Start by adding your first log entry</p>
                </div>
              )
            )
          ) : groupEntries.length > 0 ? (
            <div className="space-y-6">
              {groupEntries.map(([groupTitle, logsInGroup]) => {
                const focusForGroup = allFoci.find((f) => f.name === groupTitle);
                const IconComponent = focusForGroup ? Icons[focusForGroup.icon] : Icons.ListIcon;

                return (
                  <div key={groupTitle}>
                    <div className="flex items-center gap-2.5 mb-3">
                      {focusForGroup && (
                        <IconComponent
                          className={`w-5 h-5 text-${focusForGroup.color || 'gray-500'}`}
                        />
                      )}
                      <h3 className="text-md font-semibold text-gray-600">{groupTitle}</h3>
                    </div>
                    <div className="space-y-3">
                      {logsInGroup.map((log) => (
                        <LogItem
                          key={log.id}
                          log={log}
                          onToggleKaryTask={onToggleKaryTask}
                          isSelected={selectedLogId === log.id}
                          onSelect={onSelectLog}
                          showDescription={showDescriptions}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            selectedDate && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.CalendarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No logs on this day</h3>
                <p className="text-gray-500">Start by adding your first log entry</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
