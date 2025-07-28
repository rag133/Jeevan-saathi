
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
export const listFolders: ListFolder[] = [
    { id: 'folder-family', name: 'Family' },
];

export const customLists: List[] = [
  { id: 'ma&ud', name: 'MA&UD', icon: 'BuildingIcon', count: 13 },
  { id: 'communication', name: 'Communication', icon: 'TagIcon', count: 2, color: 'red-500' },
  { id: 'general-tasks', name: 'General Tasks', icon: 'ListIcon', count: 2, folderId: 'folder-family'},
  { id: 'financial-discipline', name: 'Financial Discipline', icon: 'ListIcon', count: 11, folderId: 'folder-family'},
];


// --- Tag Folders & Tags ---
export const tagFolders: TagFolder[] = [
    { id: 'tag-folder-main', name: 'Main Topics' }
];

export const tags: Tag[] = [
    { id: 'tag-1', name: 'AIProject', color: 'teal-500', icon: 'MagicWandIcon', folderId: 'tag-folder-main' },
    { id: 'tag-2', name: 'sadhana', color: 'gray-500', icon: 'HeartIcon' },
    { id: 'tag-3', name: 'work', color: 'blue-500', icon: 'BuildingIcon', folderId: 'tag-folder-main' },
    { id: 'tag-4', name: 'personal', color: 'purple-500', icon: 'TagIcon' },
    { id: 'tag-5', name: 'urgent', color: 'red-500', icon: 'FlagIcon' },
];


// --- Tasks ---
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const futureDate = new Date();
futureDate.setDate(today.getDate() + 5);
const pastDate = new Date();
pastDate.setDate(today.getDate() - 2);
const veryPastDate = new Date();
veryPastDate.setDate(today.getDate() - 5);


export const tasks: Task[] = [
  {
    id: '1',
    listId: 'inbox',
    title: 'Prepare Resume for BFSI',
    completed: false,
    createdAt: new Date(),
    description: 'Update with latest project details and tailor for banking, financial services, and insurance sector roles.',
    tags: ['tag-3', 'tag-5'],
    priority: 1,
  },
  { id: '2', listId: 'inbox', title: 'Sadhana app', completed: false, createdAt: new Date(), tags: ['tag-2'], priority: 2 },
  { id: '3', listId: 'inbox', title: 'Discuss with Rahul on Policy', completed: true, createdAt: new Date(), completionDate: pastDate, tags: ['tag-3'], priority: 1 },
  {
    id: '4',
    listId: 'inbox',
    title: 'Building a Multi-Agent AI Research Team with LangGraph and Gemini for Automated Reporting',
    completed: false,
    createdAt: new Date(),
    tags: ['tag-1'],
    priority: 3,
    source: {
        text: 'Building a Multi-Agent AI Research Team with LangGraph and Gemini for Automated Reporting',
        url: '#',
    }
  },
  // Subtasks for task '4'
  { id: 'sub-1', parentId: '4', listId: 'inbox', title: 'Research LangGraph capabilities', completed: true, createdAt: new Date(), completionDate: yesterday, tags: ['tag-1'] },
  { id: 'sub-2', parentId: '4', listId: 'inbox', title: 'Define agent roles and responsibilities', completed: false, createdAt: new Date(), dueDate: today },
  { id: 'sub-3', parentId: '4', listId: 'inbox', title: 'Setup Gemini API access for the team', completed: false, createdAt: new Date() },
  
  { id: '5', listId: 'inbox', title: "Stop Doing This - It's Destroying Your Brain Health.", completed: false, createdAt: new Date(), dueDate: today, tags: ['tag-4'], priority: 4 },
  { id: '6', listId: 'inbox', title: 'Msme score for dementia', completed: false, createdAt: new Date(), tags: ['tag-2'] },
  { id: '7', listId: 'inbox', title: 'Bath - Instagram', completed: false, createdAt: new Date(), tags: ['tag-1'], priority: 3 },
  { id: '8', listId: 'inbox', title: '101 Ways To Use AI In Your Life', completed: false, createdAt: new Date(), dueDate: today, tags: ['tag-1'], priority: 2 },
  { id: '9', listId: 'inbox', title: 'Top 6 Productivity Apps as Your LifeOS', completed: false, createdAt: new Date() },
  { id: '10', listId: 'inbox', title: 'Washroom socks', completed: false, createdAt: new Date(), dueDate: tomorrow, priority: 4 },
  { id: '11', listId: 'inbox', title: 'Submit resignation letter', completed: true, createdAt: veryPastDate, completionDate: pastDate, dueDate: pastDate, priority: 1 },
  { id: '12', listId: 'inbox', title: 'Prepare a 20 page booklet on 20 courses', completed: false, createdAt: new Date(), dueDate: futureDate, tags: ['tag-3'] },
];
