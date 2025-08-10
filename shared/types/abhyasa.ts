import * as Icons from '../components/Icons';

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

export enum HabitTargetComparison {
  AT_LEAST = 'at-least',
  LESS_THAN = 'less-than',
  EXACTLY = 'exactly',
  ANY_VALUE = 'any-value',
}

export enum HabitStatus {
  YET_TO_START = 'Yet to Start',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned',
}

export interface Habit {
  id: string;
  createdAt: Date;
  title: string;
  description?: string;
  icon: keyof typeof Icons;
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
}

export enum HabitLogStatus {
  DONE = 'done',
  PARTIAL = 'partial',
  NONE = 'none', // Default when no log is entered for that day
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO String for date YYYY-MM-DD
  value?: number; // For COUNT or DURATION logs
  completedChecklistItems?: string[]; // IDs of completed checklist items
  // Status is calculated, not stored
}

// --- Goal Types ---
export enum GoalStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned',
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  targetEndDate?: Date;
  status: GoalStatus;
  icon: keyof typeof Icons;
  focusAreaId?: string;
}

// --- Milestone Types ---
export enum MilestoneStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ABANDONED = 'Abandoned',
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
}

// --- Quick Win Types ---
export enum QuickWinStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
}

export interface QuickWin {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  status: QuickWinStatus;
  createdAt: Date;
}

// --- Abhyasa Module Selection ---
export type AbhyasaSelection =
  | { type: 'goals' }
  | { type: 'milestones' }
  | { type: 'calendar' }
  | { type: 'all-habits' }
  | { type: 'quick-wins' };
