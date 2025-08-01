import React from 'react';
import { Habit, HabitLog, HabitLogStatus, HabitType } from '../types';

interface CalendarHeatmapProps {
  habit: Habit;
  logs: HabitLog[];
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ habit, logs }) => {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const logsMap = new Map<string, HabitLog>();
  logs.forEach((log) => {
    logsMap.set(new Date(log.date).toDateString(), log);
  });

  const getCellColor = (log: HabitLog | undefined) => {
    if (!log) return 'bg-gray-100';

    const baseColor = habit.color.split('-')[0];

    switch (log.status) {
      case HabitLogStatus.COMPLETED:
        return `bg-${baseColor}-500`;
      case HabitLogStatus.PARTIALLY_COMPLETED:
        if (habit.type === HabitType.COUNT || habit.type === HabitType.DURATION) {
          const percentage = Math.min(1, (log.value || 0) / (habit.dailyTarget || 1));
          if (percentage > 0.66) return `bg-${baseColor}-400`;
          if (percentage > 0.33) return `bg-${baseColor}-300`;
          return `bg-${baseColor}-200`;
        }
        return `bg-${baseColor}-300`;
      case HabitLogStatus.SKIPPED:
        return 'bg-gray-300';
      default:
        return 'bg-gray-100';
    }
  };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);
  const firstDay = startDate.getDay();
  startDate.setDate(startDate.getDate() - firstDay);

  const weeks: Date[][] = [];
  for (let i = 0; i < 53; i++) {
    const week: Date[] = [];
    for (let j = 0; j < 7; j++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i * 7 + j);
      week.push(date);
    }
    weeks.push(week);
  }

  const monthLabels = weeks.reduce(
    (acc, week, i) => {
      const firstDayOfMonth =
        week[0].getDate() === 1 || (i > 0 && weeks[i - 1][0].getMonth() !== week[0].getMonth());
      if (firstDayOfMonth && week[0].getTime() < today.getTime()) {
        acc.push({ month: week[0].toLocaleDateString('en-US', { month: 'short' }), weekIndex: i });
      }
      return acc;
    },
    [] as { month: string; weekIndex: number }[]
  );

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-around text-xs text-gray-400">
        <span>M</span>
        <span className="mt-1">W</span>
        <span className="mt-1">F</span>
      </div>
      <div className="relative overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {monthLabels.find((m) => m.weekIndex === weekIndex) && (
                <div
                  className="text-xs text-gray-400 absolute -top-4"
                  style={{ left: `${weekIndex * 16}px` }}
                >
                  {monthLabels.find((m) => m.weekIndex === weekIndex)?.month}
                </div>
              )}
              {week.map((day, dayIndex) => {
                if (dayIndex % 2 === 0 && dayIndex !== 0) return null; // Only show Mon, Wed, Fri rows
                if (day.getTime() > today.getTime())
                  return (
                    <div key={day.toISOString()} className="w-3 h-3 rounded-sm bg-transparent" />
                  );

                const log = logsMap.get(day.toDateString());
                const colorClass = getCellColor(log);
                return (
                  <div
                    key={day.toISOString()}
                    className={`w-3 h-3 rounded-sm ${colorClass}`}
                    title={`${day.toDateString()}: ${log ? log.status : 'No log'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
