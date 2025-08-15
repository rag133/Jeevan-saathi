export interface ListFolder {
  id: string;
  name: string;
}

export interface TagFolder {
  id: string;
  name: string;
}

export interface List {
  id: string;
  name: string;
  icon: keyof typeof import('./components/Icons');
  count?: number;
  color?: string;
  folderId?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // e.g. 'red-500'
  icon?: keyof typeof import('./components/Icons');
  folderId?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  tags?: string[]; // Array of Tag IDs
  description?: string;
  priority?: 'P1' | 'P2' | 'P3' | 'P4' | ''; // String format to match mobile
  subtasks?: Subtask[]; // Array of subtasks
  source?: {
    text: string;
    url: string;
  };
}

export type Selection = { type: 'list'; id: string } | { type: 'tag'; id: string };
