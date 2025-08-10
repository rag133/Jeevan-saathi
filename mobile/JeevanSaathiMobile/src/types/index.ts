// Mobile-specific type definitions
export interface Habit {
  id: string;
  name: string;
  title?: string;
  description?: string;
  category?: string;
  status: 'active' | 'inactive' | 'paused';
  frequency: {
    type: HabitFrequencyType;
    times?: number;
  };
  type?: HabitType;
  color?: string;
  icon?: string;
  dailyTarget?: number;
  targetCount: number;
  checklist?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  targetDate?: Date;
  targetEndDate?: Date;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: Date;
  targetEndDate?: Date;
  completedDate?: Date;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickWin {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'pending' | 'completed';
  dueDate?: Date;
  completedDate?: Date;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: Date;
  count: number;
  value?: number;
  status: 'completed' | 'missed' | 'partial';
  notes?: string;
  completedChecklistItems?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  name?: string;
  description?: string;
  listId?: string;
  parentId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  completed?: boolean;
  dueDate?: Date;
  completedDate?: Date;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isSmartList: boolean;
  taskCount: number;
  completedCount: number;
  count?: number;
  isDefault?: boolean;
  isInbox?: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogEntry {
  id: string;
  title: string;
  content: string;
  tabId: string;
  tags: string[];
  date: Date;
  mood?: number;
  weather?: string;
  location?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogTemplate {
  id: string;
  name: string;
  content: string;
  tabId: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tab {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Selection {
  id: string;
  listId?: string;
  tagId?: string;
  type: 'list' | 'tag' | 'all' | 'smart-list';
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SortOption {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  field: keyof Task;
  value: any;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
}

// Enums for status and types
export enum HabitType {
  BINARY = 'binary',
  COUNT = 'count',
  DURATION = 'duration',
  CHECKLIST = 'checklist'
}

export enum HabitFrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled'
}

export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum QuickWinStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export enum HabitLogStatus {
  COMPLETED = 'completed',
  MISSED = 'missed',
  PARTIAL = 'partial'
}

// Mobile-specific navigation and component props
export interface MobileNavigationProps {
  navigation: any;
  route: any;
}

export interface MobileComponentProps {
  theme?: MobileTheme;
  onPress?: () => void;
}

export interface MobileTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

