import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon } from '../../../components/Icons';

// --- Utility Functions ---
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

const getCalendarGrid = (viewDate: Date | null | undefined): Date[] => {
  // Handle all possible invalid cases
  if (
    !viewDate ||
    typeof viewDate !== 'object' ||
    !(viewDate instanceof Date) ||
    isNaN(viewDate.getTime())
  ) {
    viewDate = new Date();
  }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const grid: Date[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - (startDayOfWeek - i));
    grid.push(date);
  }
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    grid.push(new Date(year, month, i));
  }
  while (grid.length < 42) {
    const lastDay = grid[grid.length - 1];
    const nextDay = new Date(lastDay);
    nextDay.setDate(lastDay.getDate() + 1);
    grid.push(nextDay);
  }
  return grid;
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="3"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// --- Component ---
interface DateTimePickerProps {
  currentDate: Date | null;
  onSelect: (date: Date) => void;
  onClear: () => void;
  onClose: () => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ currentDate, onSelect, onClear }) => {
  // Ensure we always have a valid Date object
  const getValidDate = (date: Date | null): Date => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  };

  const [viewDate, setViewDate] = useState<Date>(getValidDate(currentDate));
  const [selectedDate, setSelectedDate] = useState<Date>(getValidDate(currentDate));
  const [timeValue, setTimeValue] = useState('12:00');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('PM');
  const [isTimeViewOpen, setIsTimeViewOpen] = useState(false);

  useEffect(() => {
    const d = currentDate;
    const hasTime = d && (d.getHours() !== 0 || d.getMinutes() !== 0);
    setIsTimeViewOpen(hasTime);

    if (hasTime && d) {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const newPeriod = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours || 12; // Convert 0 to 12
      setTimeValue(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
      setTimePeriod(newPeriod);
    } else {
      setTimeValue('12:00');
      setTimePeriod('PM');
    }

    const newDate = getValidDate(currentDate);
    setSelectedDate(newDate);
    setViewDate(newDate);
  }, [currentDate]);

  const formattedTimeOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 24 * 2; i++) {
      const hours = Math.floor(i / 2);
      const minutes = (i % 2) * 30;
      const period = hours >= 12 ? 'PM' : 'AM';
      let displayHours = hours % 12;
      if (displayHours === 0) displayHours = 12;
      const timeString = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      options.push({ time: timeString, period: period as 'AM' | 'PM' });
    }
    return options;
  }, []);

  const calendarGrid = useMemo(() => {
    // Extra safety check before calling getCalendarGrid
    if (
      !viewDate ||
      typeof viewDate !== 'object' ||
      !(viewDate instanceof Date) ||
      isNaN(viewDate.getTime())
    ) {
      return getCalendarGrid(new Date());
    }
    return getCalendarGrid(viewDate);
  }, [viewDate]);

  const handlePrevMonth = () =>
    setViewDate((prev) => {
      if (!prev) return new Date();
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  const handleNextMonth = () =>
    setViewDate((prev) => {
      if (!prev) return new Date();
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  const handleGoToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };
  const handleDateClick = (day: Date) => setSelectedDate(day);

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/[^0-9]/g, '').slice(0, 4);

    if (digits.length === 0) {
      setTimeValue('');
      return;
    }

    let displayValue = digits;
    if (digits.length > 2) {
      const hour = digits.slice(0, -2);
      const minute = digits.slice(-2);
      displayValue = `${hour}:${minute}`;
    }
    setTimeValue(displayValue);
  };

  const handleTimeInputBlur = () => {
    if (!timeValue.trim()) {
      setTimeValue('12:00');
      return;
    }
    const digits = timeValue.replace(/[^0-9]/g, '');
    let hour, minute;

    if (digits.length <= 2) {
      hour = parseInt(digits, 10) || 12;
      minute = 0;
    } else {
      hour = parseInt(digits.slice(0, -2), 10) || 12;
      minute = parseInt(digits.slice(-2), 10) || 0;
    }

    if (hour > 12) hour = 12;
    if (hour === 0) hour = 12;
    if (minute > 59) minute = 59;

    setTimeValue(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
  };

  const handleTimeSelectFromDropdown = (time: string, period: 'AM' | 'PM') => {
    setTimeValue(time);
    setTimePeriod(period);
  };

  const handleOk = () => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    newDate.setHours(0, 0, 0, 0);

    if (isTimeViewOpen && timeValue) {
      const parts = timeValue.split(':');
      let hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1] || '0', 10);

      if (!isNaN(hour) && !isNaN(minute)) {
        if (timePeriod === 'PM' && hour < 12) {
          hour += 12;
        } else if (timePeriod === 'AM' && hour === 12) {
          hour = 0;
        }
        newDate.setHours(hour, minute, 0, 0);
      }
    }

    onSelect(newDate);
  };

  const handleClearTime = () => {
    setIsTimeViewOpen(false);
    setTimeValue('12:00');
    setTimePeriod('PM');
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 p-4 font-sans text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold">{getMonthYearText(viewDate)}</span>
        <div className="flex items-center space-x-2 text-gray-500">
          <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleGoToToday}
            title="Go to Today"
            className="w-5 h-5 border border-gray-400 rounded-full hover:bg-gray-100"
          ></button>
          <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
          <div
            key={d}
            className="w-9 h-9 flex items-center justify-center text-gray-400 font-semibold"
          >
            {d}
          </div>
        ))}
        {calendarGrid.map((day, i) => {
          const isCurrentMonth = day.getMonth() === viewDate.getMonth();
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          let buttonClass =
            'w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-150';
          if (isSelected) buttonClass += ' bg-blue-600 text-white font-semibold';
          else if (isToday)
            buttonClass += ' border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50';
          else if (isCurrentMonth) buttonClass += ' text-gray-700 hover:bg-gray-100';
          else buttonClass += ' text-gray-300 hover:bg-gray-100';

          return (
            <div key={day.toISOString()} className="flex justify-center items-center">
              <button onClick={() => handleDateClick(day)} className={buttonClass}>
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-3">
        {!isTimeViewOpen ? (
          <button
            type="button"
            onClick={() => setIsTimeViewOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-gray-50 hover:bg-gray-100 text-sm text-blue-600 font-semibold"
          >
            <ClockIcon className="w-5 h-5" />
            Add time
          </button>
        ) : (
          <div>
            <div className="p-2 rounded-md bg-gray-50 border relative">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <input
                  type="text"
                  value={timeValue}
                  onChange={handleTimeInputChange}
                  onBlur={handleTimeInputBlur}
                  placeholder="12:00"
                  className="font-medium bg-transparent outline-none w-24 text-lg text-blue-600"
                />
                <div className="flex border border-gray-300 rounded-md ml-auto">
                  <button
                    type="button"
                    onClick={() => setTimePeriod('AM')}
                    className={`px-3 py-1 text-sm font-semibold rounded-l-md transition-colors ${timePeriod === 'AM' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimePeriod('PM')}
                    className={`px-3 py-1 text-sm font-semibold rounded-r-md transition-colors border-l border-gray-300 ${timePeriod === 'PM' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
                  >
                    PM
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearTime}
                className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-600"
                title="Remove time"
              >
                &times;
              </button>
            </div>
            <ul className="max-h-36 overflow-y-auto mt-2">
              {formattedTimeOptions.map(({ time, period }) => {
                const isSelected = time === timeValue && period === timePeriod;
                return (
                  <li key={`${time}-${period}`}>
                    <button
                      type="button"
                      onClick={() => handleTimeSelectFromDropdown(time, period)}
                      className={`w-full flex justify-between items-center text-left px-3 py-1.5 text-sm rounded-md ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-800'}`}
                    >
                      <span>
                        {time}{' '}
                        <span className={isSelected ? 'text-blue-600' : 'text-gray-500'}>
                          {period}
                        </span>
                      </span>
                      {isSelected && <CheckIcon className="w-4 h-4 text-blue-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300"
        >
          Clear
        </button>
        <button
          onClick={handleOk}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default DateTimePicker;
