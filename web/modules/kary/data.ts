import { List, Task, ListFolder, Tag, TagFolder } from '~/modules/kary/types';
import { LogType } from '~/modules/dainandini/types';

// --- Smart Lists ---
// The 'count' for smart lists will be calculated dynamically in App.tsx
export const smartLists: Omit<List, 'count'>[] = [
  { id: 'today', name: 'Today', icon: 'TodayIcon' },
  { id: 'upcoming', name: 'Upcoming', icon: 'Next7DaysIcon' },
];

// --- List Folders & Custom Lists ---
export const listFolders: ListFolder[] = [];

export const customLists: List[] = [
  { 
    id: 'inbox', 
    name: 'Inbox', 
    icon: 'InboxIcon', 
    isDefault: true 
  }
];

// --- Tag Folders & Tags ---
export const tagFolders: TagFolder[] = [];

export const tags: Tag[] = [];

// --- Tasks ---
export const tasks: Task[] = [];
