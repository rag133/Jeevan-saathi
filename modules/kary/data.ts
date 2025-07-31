import { List, Task, ListFolder, Tag, TagFolder } from './types';
import { LogType } from '../dainandini/types';

// --- Smart Lists ---
// The 'count' for smart lists will be calculated dynamically in App.tsx
export const smartLists: Omit<List, 'count'>[] = [
  { id: 'inbox', name: 'Inbox', icon: 'InboxIcon' },
  { id: 'today', name: 'Today', icon: 'TodayIcon' },
  { id: 'upcoming', name: 'Upcoming', icon: 'Next7DaysIcon' },
];

// --- List Folders & Custom Lists ---
export const listFolders: ListFolder[] = [];

export const customLists: List[] = [];


// --- Tag Folders & Tags ---
export const tagFolders: TagFolder[] = [];

export const tags: Tag[] = [];


// --- Tasks ---
export const tasks: Task[] = [];