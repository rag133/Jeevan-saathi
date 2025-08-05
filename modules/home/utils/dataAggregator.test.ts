import { describe, it, expect } from 'vitest';
import { convertToCalendarItems } from './dataAggregator';
import { HabitStatus, HabitType, HabitFrequencyType } from '~/modules/abhyasa/types';
import type { Habit } from '~/modules/abhyasa/types';

describe('convertToCalendarItems', () => {
  it('should only show habits with IN_PROGRESS status for their date range', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    const habits: Habit[] = [
      {
        id: '1',
        title: 'Active Habit',
        status: HabitStatus.IN_PROGRESS,
        startDate: today,
        endDate: dayAfterTomorrow, // 3 days
        createdAt: new Date('2024-01-01'),
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.DAILY },
        color: 'green-500',
        icon: 'TargetIcon',
        reminders: ['09:00'],
      },
      {
        id: '2',
        title: 'Completed Habit',
        status: HabitStatus.COMPLETED,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.DAILY },
        color: 'green-500',
        icon: 'TargetIcon',
        reminders: ['10:00'],
      },
    ];

    const result = convertToCalendarItems([], habits, [], [], [], []);
    
    // Should create 1 item per day for 3 days for the active habit
    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('Active Habit');
    expect(result[0].type).toBe('habit');
    expect(result[1].title).toBe('Active Habit');
    expect(result[2].title).toBe('Active Habit');
  });

  it('should show habits without end dates for all future dates', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const habits: Habit[] = [
      {
        id: '1',
        title: 'Ongoing Habit',
        status: HabitStatus.IN_PROGRESS,
        startDate: today,
        // No end date - should show for all future dates
        createdAt: new Date('2024-01-01'),
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.DAILY },
        color: 'green-500',
        icon: 'TargetIcon',
        reminders: ['09:00'],
      },
    ];

    const result = convertToCalendarItems([], habits, [], [], [], []);
    
    // Should create items for many days (1 year from today)
    expect(result.length).toBeGreaterThan(300); // At least 300 days
    expect(result[0].title).toBe('Ongoing Habit');
    expect(result[0].type).toBe('habit');
    
    // Check that items are created for future dates
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const hasFutureItem = result.some(item => item.id.includes(futureDateStr));
    expect(hasFutureItem).toBe(true);
  });

  it('should create multiple calendar items for habits with multiple reminders for each day in date range', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    
    const habits: Habit[] = [
      {
        id: '1',
        title: 'Multi-reminder Habit',
        status: HabitStatus.IN_PROGRESS,
        startDate: today,
        endDate: dayAfterTomorrow, // 3 days
        createdAt: new Date('2024-01-01'),
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.DAILY },
        color: 'green-500',
        icon: 'TargetIcon',
        reminders: ['09:00', '14:00', '18:00'],
      },
    ];

    const result = convertToCalendarItems([], habits, [], [], [], []);
    
    // Should create 3 reminders × 3 days = 9 items
    expect(result).toHaveLength(9);
    
    // Check that IDs are unique for each day and reminder
    const ids = result.map(item => item.id);
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
    
    expect(ids).toContain(`habit-1-${todayStr}-0`);
    expect(ids).toContain(`habit-1-${todayStr}-1`);
    expect(ids).toContain(`habit-1-${todayStr}-2`);
    expect(ids).toContain(`habit-1-${tomorrowStr}-0`);
    expect(ids).toContain(`habit-1-${tomorrowStr}-1`);
    expect(ids).toContain(`habit-1-${tomorrowStr}-2`);
    expect(ids).toContain(`habit-1-${dayAfterTomorrowStr}-0`);
    expect(ids).toContain(`habit-1-${dayAfterTomorrowStr}-1`);
    expect(ids).toContain(`habit-1-${dayAfterTomorrowStr}-2`);
    
    // Check that times are set correctly for first day
    const firstDayItems = result.filter(item => item.id.includes(todayStr));
    expect(firstDayItems[0].date.getHours()).toBe(9);
    expect(firstDayItems[0].date.getMinutes()).toBe(0);
    expect(firstDayItems[1].date.getHours()).toBe(14);
    expect(firstDayItems[1].date.getMinutes()).toBe(0);
    expect(firstDayItems[2].date.getHours()).toBe(18);
    expect(firstDayItems[2].date.getMinutes()).toBe(0);
  });

  it('should use default time (9 AM) for habits without reminders for each day in date range', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    const day3 = new Date(today);
    day3.setDate(today.getDate() + 3);
    const day4 = new Date(today);
    day4.setDate(today.getDate() + 4);
    
    const habits: Habit[] = [
      {
        id: '1',
        title: 'No Reminder Habit',
        status: HabitStatus.IN_PROGRESS,
        startDate: today,
        endDate: day4, // 5 days
        createdAt: new Date('2024-01-01'),
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.DAILY },
        color: 'green-500',
        icon: 'TargetIcon',
        reminders: [],
      },
    ];

    const result = convertToCalendarItems([], habits, [], [], [], []);
    
    // Should create 1 item per day for 5 days
    expect(result).toHaveLength(5);
    
    // Check that IDs are unique for each day
    const ids = result.map(item => item.id);
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
    const day3Str = day3.toISOString().split('T')[0];
    const day4Str = day4.toISOString().split('T')[0];
    
    expect(ids).toContain(`habit-1-${todayStr}`);
    expect(ids).toContain(`habit-1-${tomorrowStr}`);
    expect(ids).toContain(`habit-1-${dayAfterTomorrowStr}`);
    expect(ids).toContain(`habit-1-${day3Str}`);
    expect(ids).toContain(`habit-1-${day4Str}`);
    
    // Check that all items have 9 AM time
    result.forEach(item => {
      expect(item.date.getHours()).toBe(9);
      expect(item.date.getMinutes()).toBe(0);
    });
  });

  it('should not show habits that are not yet started or have ended', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const habits: Habit[] = [
      {
        id: '1',
        title: 'Future Habit',
        status: HabitStatus.IN_PROGRESS,
        startDate: tomorrow,
        createdAt: new Date('2024-01-01'),
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.DAILY },
        color: 'green-500',
        icon: 'TargetIcon',
        reminders: ['09:00'],
      },
      {
        id: '2',
        title: 'Ended Habit',
        status: HabitStatus.IN_PROGRESS,
        startDate: yesterday,
        endDate: yesterday,
        createdAt: new Date('2024-01-01'),
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.DAILY },
        color: 'green-500',
        icon: 'TargetIcon',
        reminders: ['09:00'],
      },
    ];

    const result = convertToCalendarItems([], habits, [], [], [], []);
    
    // Future habit should not show because start date is in the future
    // Ended habit should not show because end date is in the past
    expect(result).toHaveLength(0);
  });
}); 