import React, { useState, useMemo, useCallback } from 'react';
import { Habit, HabitLog, HabitLogStatus, HabitFrequencyType } from '~/modules/abhyasa/types';
import * as Icons from '~/components/Icons';

interface HabitCalendarProps {
  habit: Habit;
  habitLogs: HabitLog[];
  selectedDate: Date;
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ habit, habitLogs, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

  const monthName = firstDayOfMonth.toLocaleString('default', { month: 'long' });

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, []);

  const getHabitDayStatus = useCallback(
    (date: Date): 'completed' | 'skipped' | 'missed' | 'not-logged' | 'inactive' | 'future' => {
      const dateString = date.toISOString().split('T')[0];
      const log = habitLogs.find((l) => l.date === dateString);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateNoTime = new Date(date);
      dateNoTime.setHours(0, 0, 0, 0);

      const habitStartDate = new Date(habit.startDate);
      habitStartDate.setHours(0, 0, 0, 0);
      const habitEndDate = habit.endDate ? new Date(habit.endDate) : null;
      if (habitEndDate) habitEndDate.setHours(0, 0, 0, 0);

      // Check if date is within habit's active period
      if (dateNoTime < habitStartDate || (habitEndDate && dateNoTime > habitEndDate)) {
        return 'inactive';
      }

      // Check if habit is expected on this day based on frequency
      let isExpectedDay = false;
      switch (habit.frequency.type) {
        case HabitFrequencyType.DAILY:
          isExpectedDay = true;
          break;
        case HabitFrequencyType.WEEKLY:
        case HabitFrequencyType.MONTHLY:
          // For weekly/monthly, we assume it's expected any day within the active period
          // The 'times' per week/month is for overall completion, not daily expectation.
          isExpectedDay = true;
          break;
        case HabitFrequencyType.SPECIFIC_DAYS:
          isExpectedDay = habit.frequency.days.includes(dateNoTime.getDay());
          break;
      }

      if (!isExpectedDay) {
        return 'inactive';
      }

      // Handle future dates
      if (dateNoTime > today) {
        return 'future';
      }

      // Determine status based on log
      if (log) {
        switch (log.status) {
          case HabitLogStatus.COMPLETED:
            return 'completed';
          case HabitLogStatus.SKIPPED:
            return 'skipped';
          case HabitLogStatus.MISSED:
          case HabitLogStatus.PARTIALLY_COMPLETED:
            return 'missed';
        }
      }

      // If no log and it's an expected day in the past/today
      return 'not-logged';
    },
    [habit, habitLogs]
  );

  const days = useMemo(() => {
    const daysArray: Date[] = [];
    // Add leading empty cells for the start of the week
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(new Date(0)); // Placeholder for empty cells
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(new Date(currentYear, currentMonth, i));
    }
    return daysArray;
  }, [currentMonth, currentYear, daysInMonth, startingDayOfWeek]);

  const getDayClass = useCallback(
    (date: Date) => {
      const status = getHabitDayStatus(date);
      let baseClass = 'w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium';
      const isSelected =
        selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];

      if (date.getTime() === new Date(0).getTime()) {
        // Placeholder
        return '';
      }

      switch (status) {
        case 'completed':
          baseClass += ' bg-green-500 text-white';
          break;
        case 'skipped':
          baseClass += ' bg-yellow-500 text-white';
          break;
        case 'missed':
          baseClass += ' bg-red-500 text-white';
          break;
        case 'not-logged':
          baseClass += ' bg-orange-500 text-white';
          break;
        case 'inactive':
          baseClass += ' bg-gray-200 text-gray-400';
          break;
        case 'future':
          baseClass += ' bg-gray-100 text-gray-500';
          break;
      }

      if (isSelected) {
        baseClass += ' ring-2 ring-blue-500 ring-offset-2';
      }

      return baseClass;
    },
    [getHabitDayStatus, selectedDate]
  );

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Habit Calendar</h3>
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-200">
          <Icons.ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-lg font-semibold text-gray-800">
          {monthName} {currentYear}
        </span>
        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-200">
          <Icons.ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={`${day}-${index}`} className="text-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
        {days.map((date, index) => (
          <div key={index} className={getDayClass(date)}>
            {date.getTime() === new Date(0).getTime() ? '' : date.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitCalendar;
