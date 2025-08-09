// Mobile app types - adapted from shared types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  listId?: string;
  parentTaskId?: string;
  subtasks: Task[];
}

export interface List {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  taskCount: number;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  goal: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  icon: string;
  linkedGoalId?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  value: number;
  date: Date;
  notes?: string;
  createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  icon: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface LogEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  energy?: 'high' | 'medium' | 'low';
}

export interface Tab {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

