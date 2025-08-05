import type { Task } from '~/modules/kary/types';
import type { Habit, HabitLog } from '~/modules/abhyasa/types';
import type { Log } from '~/modules/dainandini/types';

export enum CalendarItemType {
  TASK = 'task',
  HABIT = 'habit',
  HABIT_LOG = 'habit_log',
  LOG = 'log',
}

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  duration: number;  // minutes
}

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  description?: string;
  date: Date;
  color: string;
  icon: string;
  completed?: boolean;
  // Time-based scheduling properties
  startTime?: string; // HH:MM format
  endTime?: string;   // HH:MM format
  duration?: number;  // minutes
  timeSlot?: TimeSlot;
  // Original data references
  originalData: Task | Habit | HabitLog | Log;
}

export interface DragOperation {
  itemId: string;
  originalDate: Date;
  newDate: Date;
  timestamp: number;
}

export interface HomeState {
  calendarItems: CalendarItem[];
  selectedItem: CalendarItem | null;
  selectedDate: Date;
  loading: boolean;
  error: string | null;
  dragHistory: DragOperation[];
  isDragging: boolean;
  // Time-based scheduling state
  timeSlots: TimeSlot[];
  showTimeSlots: boolean;
  // Filter state
  itemTypeFilters: Set<CalendarItemType>;
}

export interface HomeActions {
  fetchHomeData: () => Promise<void>;
  selectItem: (item: CalendarItem | null) => void;
  selectDate: (date: Date) => void;
  refreshData: () => Promise<void>;
  // Real-time sync
  setupRealTimeSync: () => () => void; // Returns cleanup function
  // Drag and Drop Actions
  startDrag: () => void;
  endDrag: () => void;
  moveItemToDate: (itemId: string, newDate: Date) => Promise<void>;
  undoLastDrag: () => Promise<void>;
  clearDragHistory: () => void;
  // Time-based scheduling actions
  updateItemTime: (itemId: string, startTime: string, endTime: string) => Promise<void>;
  toggleTimeSlots: () => void;
  generateTimeSlots: (startHour: number, endHour: number, interval: number) => void;
  checkTimeConflicts: (date: Date, startTime: string, endTime: string, excludeItemId?: string) => CalendarItem[];
  // Helper functions
  calculateDuration: (startTime: string, endTime: string) => number;
  // Filter actions
  toggleItemTypeFilter: (type: CalendarItemType) => void;
}

export type HomeStore = HomeState & HomeActions; 