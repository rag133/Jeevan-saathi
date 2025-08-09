import * as Icons from '~/components/Icons';

export enum LogType {
  TEXT = 'text',
  CHECKLIST = 'checklist',
  RATING = 'rating',
}

export const logTypeDetails: Record<LogType, { name: string; icon: keyof typeof Icons }> = {
  [LogType.TEXT]: { name: 'Text', icon: 'Edit3Icon' },
  [LogType.CHECKLIST]: { name: 'Checklist', icon: 'CheckSquareIcon' },
  [LogType.RATING]: { name: 'Rating', icon: 'StarIcon' },
};

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Focus {
  id: string;
  name: string;
  description?: string;
  icon: keyof typeof Icons;
  color: string;
  allowedLogTypes: LogType[];
  defaultTemplateId?: string;
}

export interface Log {
  id: string;
  focusId: string;
  logType: LogType;
  title: string;
  description?: string;
  checklist?: ChecklistItem[];
  rating?: number; // 1-5
  logDate: Date; // The date the log is for
  createdAt: Date; // The date the log was created
  habitId?: string;
  milestoneId?: string;
  goalId?: string;
  taskId?: string;
  completed?: boolean;
  taskCompletionDate?: Date;
}

export interface LogTemplate {
  id: string;
  name: string;
  icon: keyof typeof Icons;
  focusId: string;
  logType: LogType;
  title: string; // Can have placeholders like {{date}}
  description?: string;
  checklist?: Pick<ChecklistItem, 'text' | 'completed'>[];
  rating?: number;
}

export type DainandiniSelection =
  | { type: 'today' }
  | { type: 'calendar'; date?: string } // date is ISO string
  | { type: 'focus'; id: string }
  | { type: 'template'; id: string };

export type GroupedLogs = Map<string, Log[]>;
