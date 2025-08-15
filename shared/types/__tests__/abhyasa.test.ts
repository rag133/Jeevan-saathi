import { 
  HabitType, 
  HabitLogStatus, 
  HabitStatus, 
  HabitTargetComparison,
  Habit,
  HabitLog
} from '../abhyasa';

describe('Shared Abhyasa Types', () => {
  describe('HabitType enum', () => {
    it('should have all expected habit types', () => {
      expect(HabitType.BINARY).toBe('binary');
      expect(HabitType.COUNT).toBe('count');
      expect(HabitType.DURATION).toBe('duration');
      expect(HabitType.CHECKLIST).toBe('checklist');
    });
  });

  describe('HabitLogStatus enum', () => {
    it('should have primary status types', () => {
      expect(HabitLogStatus.DONE).toBe('done');
      expect(HabitLogStatus.PARTIAL).toBe('partial');
      expect(HabitLogStatus.NONE).toBe('none');
    });

    it('should have legacy aliases for backward compatibility', () => {
      expect(HabitLogStatus.COMPLETED).toBe('done');
      expect(HabitLogStatus.SKIPPED).toBe('none');
      expect(HabitLogStatus.FAILED).toBe('none');
    });
  });

  describe('HabitStatus enum', () => {
    it('should have primary status types', () => {
      expect(HabitStatus.YET_TO_START).toBe('Yet to Start');
      expect(HabitStatus.IN_PROGRESS).toBe('In Progress');
      expect(HabitStatus.COMPLETED).toBe('Completed');
      expect(HabitStatus.ABANDONED).toBe('Abandoned');
    });

    it('should have mobile app compatibility aliases', () => {
      expect(HabitStatus.ACTIVE).toBe('In Progress');
      expect(HabitStatus.PAUSED).toBe('Yet to Start');
      expect(HabitStatus.ARCHIVED).toBe('Abandoned');
    });
  });

  describe('HabitTargetComparison enum', () => {
    it('should have primary comparison types', () => {
      expect(HabitTargetComparison.GREATER_THAN).toBe('greater_than');
      expect(HabitTargetComparison.GREATER_THAN_OR_EQUAL).toBe('greater_than_or_equal');
      expect(HabitTargetComparison.LESS_THAN).toBe('less_than');
      expect(HabitTargetComparison.LESS_THAN_OR_EQUAL).toBe('less_than_or_equal');
      expect(HabitTargetComparison.EQUAL).toBe('equal');
    });

    it('should have aliases for backward compatibility', () => {
      expect(HabitTargetComparison.AT_LEAST).toBe('at_least');
      expect(HabitTargetComparison.EXACTLY).toBe('exactly');
      expect(HabitTargetComparison.ANY_VALUE).toBe('any_value');
    });

    it('should have legacy mobile app aliases', () => {
      expect(HabitTargetComparison['at-least']).toBe('at_least');
      expect(HabitTargetComparison['less-than']).toBe('less_than');
      expect(HabitTargetComparison['exactly']).toBe('exactly');
      expect(HabitTargetComparison['any-value']).toBe('any_value');
    });
  });

  describe('Habit interface', () => {
    it('should have all required fields', () => {
      const habit: Habit = {
        id: 'test-id',
        createdAt: new Date(),
        title: 'Test Habit',
        icon: '🎯',
        color: 'blue-500',
        frequency: { type: 'daily' },
        type: HabitType.BINARY,
        status: HabitStatus.IN_PROGRESS,
        startDate: new Date(),
      };

      expect(habit.id).toBe('test-id');
      expect(habit.title).toBe('Test Habit');
      expect(habit.type).toBe(HabitType.BINARY);
      expect(habit.status).toBe(HabitStatus.IN_PROGRESS);
    });

    it('should support optional fields', () => {
      const habit: Habit = {
        id: 'test-id',
        createdAt: new Date(),
        title: 'Test Habit',
        icon: '🎯',
        color: 'blue-500',
        frequency: { type: 'daily' },
        type: HabitType.COUNT,
        status: HabitStatus.IN_PROGRESS,
        startDate: new Date(),
        dailyTarget: 5,
        dailyTargetComparison: HabitTargetComparison.AT_LEAST,
        description: 'Test description',
        endDate: new Date(),
        reminders: ['09:00'],
        userId: 'user-123',
      };

      expect(habit.dailyTarget).toBe(5);
      expect(habit.dailyTargetComparison).toBe(HabitTargetComparison.AT_LEAST);
      expect(habit.description).toBe('Test description');
      expect(habit.userId).toBe('user-123');
    });
  });

  describe('HabitLog interface', () => {
    it('should have all required fields', () => {
      const log: HabitLog = {
        id: 'log-id',
        habitId: 'habit-id',
        date: '2024-01-01',
      };

      expect(log.id).toBe('log-id');
      expect(log.habitId).toBe('habit-id');
      expect(log.date).toBe('2024-01-01');
    });

    it('should support optional fields', () => {
      const log: HabitLog = {
        id: 'log-id',
        habitId: 'habit-id',
        date: '2024-01-01',
        value: 5,
        completedChecklistItems: ['item-1', 'item-2'],
        notes: 'Test note',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        count: 5, // Legacy field
        status: HabitLogStatus.DONE, // Legacy field
      };

      expect(log.value).toBe(5);
      expect(log.completedChecklistItems).toEqual(['item-1', 'item-2']);
      expect(log.notes).toBe('Test note');
      expect(log.userId).toBe('user-123');
      expect(log.count).toBe(5);
      expect(log.status).toBe(HabitLogStatus.DONE);
    });
  });

  describe('Status compatibility', () => {
    it('should allow mobile app status values to map to web app values', () => {
      // Mobile app uses ACTIVE, should map to IN_PROGRESS
      expect(HabitStatus.ACTIVE).toBe(HabitStatus.IN_PROGRESS);
      
      // Mobile app uses PAUSED, should map to YET_TO_START
      expect(HabitStatus.PAUSED).toBe(HabitStatus.YET_TO_START);
      
      // Mobile app uses ARCHIVED, should map to ABANDONED
      expect(HabitStatus.ARCHIVED).toBe(HabitStatus.ABANDONED);
    });

    it('should allow legacy log status values to map to primary values', () => {
      // Legacy COMPLETED should map to DONE
      expect(HabitLogStatus.COMPLETED).toBe(HabitLogStatus.DONE);
      
      // Legacy SKIPPED should map to NONE
      expect(HabitLogStatus.SKIPPED).toBe(HabitLogStatus.NONE);
      
      // Legacy FAILED should map to NONE
      expect(HabitLogStatus.FAILED).toBe(HabitLogStatus.NONE);
    });
  });
});
