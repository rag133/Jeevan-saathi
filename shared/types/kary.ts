import * as Icons from '../components/Icons';

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
  icon: keyof typeof Icons;
  count?: number;
  color?: string;
  folderId?: string | null;
  isDefault?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string; // e.g. 'red-500'
  icon?: keyof typeof Icons;
  folderId?: string | null;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completionDate?: Date;
  parentId?: string; // ID of the parent task
  dueDate?: Date;
  reminder?: boolean;
  tags?: string[]; // Array of Tag IDs
  description?: string;
  priority?: 1 | 2 | 3 | 4;
  source?: {
    text: string;
    url: string;
  };
}

export type Selection = { type: 'list'; id: string } | { type: 'tag'; id: string };
