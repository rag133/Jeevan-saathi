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

export interface Task {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  tags?: string[]; // Array of Tag IDs
  description?: string;
  priority?: 1 | 2 | 3 | 4;
  source?: {
    text: string;
    url: string;
  };
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export type Selection = { type: 'list'; id: string } | { type: 'tag'; id: string };
