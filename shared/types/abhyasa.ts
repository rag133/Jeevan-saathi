// Icon type - each platform can define their own icon system
// This allows web and mobile to use their own icon naming conventions
export type IconName = string;

// --- Habit Types ---
export enum HabitType {
  BINARY = 'binary',
  COUNT = 'count',
  DURATION = 'duration',
  CHECKLIST = 'checklist',
}

export enum HabitFrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly', // x times per week
  MONTHLY = 'monthly', // x times per month
  SPECIFIC_DAYS = 'specific_days',
}

export type HabitFrequency =
  | { type: HabitFrequencyType.DAILY }
  | { type: HabitFrequencyType.WEEKLY; times: number }
  | { type: HabitFrequencyType.MONTHLY; times: number }
  | { type: HabitFrequencyType.SPECIFIC_DAYS; days: number[] }; // 0=Sun, 1=Mon, ...

export interface HabitChecklistItem {
  id: string;
  text: string;
}

// Unified comparison types that work for both web and mobile
export enum HabitTargetComparison {
  // Primary comparison types
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  EQUAL = 'equal',
  
  // Aliases for backward compatibility
  AT_LEAST = 'at_least', // Alias for GREATER_THAN_OR_EQUAL
  EXACTLY = 'exactly',   // Alias for EQUAL
  ANY_VALUE = 'any_value', // Special case for any non-zero value
  
  // Legacy mobile app aliases
  'at-least' = 'at_least',
  'less-than' = 'less_than',
  'exactly' = 'exactly',
  'any-value' = 'any_value'
}

// Unified habit status that works for both web and mobile
export enum HabitStatus {
  // Primary status types (web app standard)
  YET_TO_START = 'Yet to Start',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned',
  
  // Mobile app status types (aliases for compatibility)
  ACTIVE = 'In Progress', // Alias for IN_PROGRESS
  PAUSED = 'Yet to Start', // Alias for YET_TO_START
  ARCHIVED = 'Abandoned', // Alias for ABANDONED
}

export interface Habit {
  id: string;
  createdAt: Date;
  title: string;
  description?: string;
  icon: IconName;
  color: string; // e.g., 'blue-500'
  frequency: HabitFrequency;
  type: HabitType;
  status: HabitStatus;
  // Daily Target
  dailyTarget?: number;
  dailyTargetComparison?: HabitTargetComparison;
  // Total Target (over the entire habit duration)
  totalTarget?: number;
  totalTargetComparison?: HabitTargetComparison;
  checklist?: HabitChecklistItem[]; // For CHECKLIST
  milestoneId?: string;
  goalId?: string;
  focusAreaId?: string;
  startDate: Date;
  endDate?: Date;
  reminders?: string[];
  userId?: string; // For mobile app compatibility
}

// Unified habit log status that works for both web and mobile
export enum HabitLogStatus {
  // Primary status types (web app standard)
  DONE = 'done',
  PARTIAL = 'partial',
  NONE = 'none', // Default when no log is entered for that day
  
  // Legacy status aliases for backward compatibility
  COMPLETED = 'done', // Alias for DONE
  SKIPPED = 'none',   // Alias for NONE
  FAILED = 'none',    // Alias for NONE
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO String for date YYYY-MM-DD (web app standard)
  value?: number; // For COUNT or DURATION logs
  completedChecklistItems?: string[]; // IDs of completed checklist items
  
  // Additional fields for enhanced functionality
  notes?: string; // Optional notes for the log entry
  userId?: string; // User ID for consistency
  createdAt?: Date; // Creation timestamp
  updatedAt?: Date; // Last update timestamp
  
  // Legacy fields for backward compatibility
  count?: number; // Alias for value (mobile app compatibility)
  status?: HabitLogStatus; // Explicit status field (legacy)
  
  // Status is calculated, not stored - this field is for legacy compatibility only
}

// --- Goal Types ---
export enum GoalStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned',
  
  // Mobile app compatibility aliases
  ACTIVE = 'In Progress', // Alias for IN_PROGRESS
  PAUSED = 'Not Started', // Alias for NOT_STARTED
  CANCELLED = 'Abandoned', // Alias for ABANDONED
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  targetEndDate?: Date;
  status: GoalStatus;
  icon: IconName;
  focusAreaId?: string;
  userId?: string; // For mobile app compatibility
}

// --- Milestone Types ---
export enum MilestoneStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned',
  
  // Mobile app compatibility aliases
  PLANNED = 'Not Started', // Alias for NOT_STARTED
  CANCELLED = 'Abandoned', // Alias for ABANDONED
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  parentGoalId: string;
  startDate: Date;
  targetEndDate?: Date;
  status: MilestoneStatus;
  focusAreaId?: string;
  userId?: string; // For mobile app compatibility
}

// --- Quick Win Types ---
export enum QuickWinStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  
  // Mobile app compatibility aliases
  PLANNED = 'Pending', // Alias for PENDING
  CANCELLED = 'Pending', // Alias for PENDING
}

export interface QuickWin {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: QuickWinStatus;
  createdAt: Date;
  userId?: string; // For mobile app compatibility
}

// --- Abhyasa Module Selection ---
export type AbhyasaSelection =
  | { type: 'goals' }
  | { type: 'milestones' }
  | { type: 'calendar' }
  | { type: 'all-habits' }
  | { type: 'quick-wins' }
  | { type: 'habits' }; // Mobile app compatibility
