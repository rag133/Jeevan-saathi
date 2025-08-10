import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { taskService, listService, tagService, listFolderService, tagFolderService } from '@jeevan-saathi/shared/services/dataService';
import { getCurrentUser } from '@jeevan-saathi/shared/services/authService';
import type { Task, List, Tag, ListFolder, TagFolder } from '@jeevan-saathi/shared/types';

export type SortOption = 'created' | 'dueDate' | 'priority' | 'title';
export type SortDirection = 'asc' | 'desc';
export type FilterOption = 'all' | 'completed' | 'uncompleted' | 'overdue' | 'dueToday' | 'dueThisWeek';

type KaryState = {
  tasks: Task[];
  lists: List[];
  tags: Tag[];
  listFolders: ListFolder[];
  tagFolders: TagFolder[];
  loading: boolean;
  error: string | null;
  // Search, filter, and sort state
  searchQuery: string;
  filterOption: FilterOption;
  sortOption: SortOption;
  sortDirection: SortDirection;
  // Methods
  fetchKaryData: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addList: (list: Omit<List, 'id'>) => Promise<void>;
  updateList: (listId: string, updates: Partial<List>) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  updateTag: (tagId: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  addListFolder: (folder: Omit<ListFolder, 'id'>) => Promise<void>;
  updateListFolder: (folderId: string, updates: Partial<ListFolder>) => Promise<void>;
  deleteListFolder: (folderId: string) => Promise<void>;
  addTagFolder: (folder: Omit<TagFolder, 'id'>) => Promise<void>;
  updateTagFolder: (folderId: string, updates: Partial<TagFolder>) => Promise<void>;
  deleteTagFolder: (folderId: string) => Promise<void>;
  getDefaultList: () => List | null;
  setDefaultList: (listId: string) => Promise<void>;
  cleanupDuplicateInboxes: () => Promise<void>;
  cleanupDuplicateLists: () => Promise<void>;
  // Search, filter, and sort methods
  setSearchQuery: (query: string) => void;
  setFilterOption: (option: FilterOption) => void;
  setSortOption: (option: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  getFilteredAndSortedTasks: (tasks: Task[], searchQueryOverride?: string, filterOptionOverride?: FilterOption, sortOptionOverride?: SortOption, sortDirectionOverride?: SortDirection) => Task[];
};

export const useKaryStore = create<KaryState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      lists: [],
      tags: [],
      listFolders: [],
      tagFolders: [],
      loading: false,
      error: null,
      searchQuery: '',
      filterOption: 'all',
      sortOption: 'created',
      sortDirection: 'desc',
      fetchKaryData: async () => {
        set({ loading: true, error: null });
        try {
          // Check if user is authenticated before making requests
          const user = getCurrentUser();
          if (!user || !user.uid) {
            console.warn('Cannot fetch kary data: user not authenticated');
            set({ loading: false, error: 'User not authenticated' });
            return;
          }

          const [tasks, lists, tags, listFolders, tagFolders] = await Promise.all([
            taskService.getAll(),
            listService.getAll(),
            tagService.getAll(),
            listFolderService.getAll(),
            tagFolderService.getAll(),
          ]);
          set({ tasks, lists, tags, listFolders, tagFolders, loading: false });
        } catch (error) {
          console.error('Error fetching kary data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ error: errorMessage, loading: false });
        }
      },
      addTask: async (task) => {
        const optimisticTask = { ...task, id: `temp-${Date.now()}`, createdAt: new Date() } as Task;
        const previousTasks = get().tasks;
        set({ tasks: [...previousTasks, optimisticTask] });
        try {
          const newId = await taskService.add(task);
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === optimisticTask.id ? { ...t, id: newId } : t)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, tasks: previousTasks });
        }
      },
      updateTask: async (taskId, updates) => {
        const previousTasks = get().tasks;
        const updatedTasks = previousTasks.map((t) =>
          t.id === taskId ? { ...t, ...updates } : t
        );
        set({ tasks: updatedTasks });
        try {
          await taskService.update(taskId, updates);
        } catch (error) {
          set({ error: (error as Error).message, tasks: previousTasks });
        }
      },
      deleteTask: async (taskId) => {
        const previousTasks = get().tasks;
        const updatedTasks = previousTasks.filter((t) => t.id !== taskId);
        set({ tasks: updatedTasks });
        try {
          await taskService.delete(taskId);
        } catch (error) {
          set({ error: (error as Error).message, tasks: previousTasks });
        }
      },
      addList: async (list) => {
        const optimisticList = { ...list, id: `temp-${Date.now()}` } as List;
        const previousLists = get().lists;
        
        // Prevent creating duplicate lists with the same name (case-insensitive)
        const existingListWithSameName = previousLists.find(l => 
          l.name.toLowerCase() === list.name.toLowerCase()
        );
        
        if (existingListWithSameName) {
          set({ error: `A list with the name "${list.name}" already exists` });
          return;
        }
        
        // If this list is being set as default, remove default from other lists
        let updatedLists = [...previousLists, optimisticList];
        if (list.isDefault) {
          updatedLists = updatedLists.map((l) => ({ ...l, isDefault: l.id === optimisticList.id }));
        }
        
        set({ lists: updatedLists });
        try {
          const newId = await listService.add(list);
          set((state) => ({
            lists: state.lists.map((l) => (l.id === optimisticList.id ? { ...l, id: newId } : l)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, lists: previousLists });
        }
      },
      updateList: async (listId, updates) => {
        const previousLists = get().lists;
        let updatedLists = previousLists.map((l) =>
          l.id === listId ? { ...l, ...updates } : l
        );
        
        // If this list is being set as default, remove default from other lists
        if (updates.isDefault) {
          updatedLists = updatedLists.map((l) => ({ ...l, isDefault: l.id === listId }));
        }
        
        set({ lists: updatedLists });
        try {
          await listService.update(listId, updates);
        } catch (error) {
          set({ error: (error as Error).message, lists: previousLists });
        }
      },
      deleteList: async (listId) => {
        const previousLists = get().lists;
        const updatedLists = previousLists.filter((l) => l.id !== listId);
        set({ lists: updatedLists });
        try {
          await listService.delete(listId);
        } catch (error) {
          set({ error: (error as Error).message, lists: previousLists });
        }
      },
      addTag: async (tag) => {
        const optimisticTag = { ...tag, id: `temp-${Date.now()}` } as Tag;
        const previousTags = get().tags;
        set({ tags: [...previousTags, optimisticTag] });
        try {
          const newId = await tagService.add(tag);
          set((state) => ({
            tags: state.tags.map((t) => (t.id === optimisticTag.id ? { ...t, id: newId } : t)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, tags: previousTags });
        }
      },
      updateTag: async (tagId, updates) => {
        const previousTags = get().tags;
        const updatedTags = previousTags.map((t) =>
          t.id === tagId ? { ...t, ...updates } : t
        );
        set({ tags: updatedTags });
        try {
          await tagService.update(tagId, updates);
        } catch (error) {
          set({ error: (error as Error).message, tags: previousTags });
        }
      },
      deleteTag: async (tagId) => {
        const previousTags = get().tags;
        const updatedTags = previousTags.filter((t) => t.id !== tagId);
        set({ tags: updatedTags });
        try {
          await tagService.delete(tagId);
        } catch (error) {
          set({ error: (error as Error).message, tags: previousTags });
        }
      },
      addListFolder: async (folder) => {
        const optimisticFolder = { ...folder, id: `temp-${Date.now()}` } as ListFolder;
        const previousFolders = get().listFolders;
        set({ listFolders: [...previousFolders, optimisticFolder] });
        try {
          const newId = await listFolderService.add(folder);
          set((state) => ({
            listFolders: state.listFolders.map((f) =>
              f.id === optimisticFolder.id ? { ...f, id: newId } : f
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message, listFolders: previousFolders });
        }
      },
      updateListFolder: async (folderId, updates) => {
        const previousFolders = get().listFolders;
        const updatedFolders = previousFolders.map((f) =>
          f.id === folderId ? { ...f, ...updates } : f
        );
        set({ listFolders: updatedFolders });
        try {
          await listFolderService.update(folderId, updates);
        } catch (error) {
          set({ error: (error as Error).message, listFolders: previousFolders });
        }
      },
      deleteListFolder: async (folderId) => {
        const previousFolders = get().listFolders;
        const updatedFolders = previousFolders.filter((f) => f.id !== folderId);
        set({ listFolders: updatedFolders });
        try {
          await listFolderService.delete(folderId);
        } catch (error) {
          set({ error: (error as Error).message, listFolders: previousFolders });
        }
      },
      addTagFolder: async (folder) => {
        const optimisticFolder = { ...folder, id: `temp-${Date.now()}` } as TagFolder;
        const previousFolders = get().tagFolders;
        set({ tagFolders: [...previousFolders, optimisticFolder] });
        try {
          const newId = await tagFolderService.add(folder);
          set((state) => ({
            tagFolders: state.tagFolders.map((f) =>
              f.id === optimisticFolder.id ? { ...f, id: newId } : f
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message, tagFolders: previousFolders });
        }
      },
      updateTagFolder: async (folderId, updates) => {
        const previousFolders = get().tagFolders;
        const updatedFolders = previousFolders.map((f) =>
          f.id === folderId ? { ...f, ...updates } : f
        );
        set({ tagFolders: updatedFolders });
        try {
          await tagFolderService.update(folderId, updates);
        } catch (error) {
          set({ error: (error as Error).message, tagFolders: previousFolders });
        }
      },
      deleteTagFolder: async (folderId) => {
        const previousFolders = get().tagFolders;
        const updatedFolders = previousFolders.filter((f) => f.id !== folderId);
        set({ tagFolders: updatedFolders });
        try {
          await tagFolderService.delete(folderId);
        } catch (error) {
          set({ error: (error as Error).message, tagFolders: previousFolders });
        }
      },
      getDefaultList: () => {
        const defaultList = get().lists.find((list) => list.isDefault);
        return defaultList || null;
      },
      setDefaultList: async (listId) => {
        const previousLists = get().lists;
        const updatedLists = previousLists.map((list) => ({
          ...list,
          isDefault: list.id === listId,
        }));
        set({ lists: updatedLists });
        try {
          // Update all lists to remove default flag from others
          const updatePromises = previousLists.map((list) => 
            listService.update(list.id, { isDefault: list.id === listId })
          );
          await Promise.all(updatePromises);
        } catch (error) {
          set({ error: (error as Error).message, lists: previousLists });
        }
      },
      cleanupDuplicateInboxes: async () => {
        const previousLists = get().lists;
        const inboxLists = previousLists.filter(list => list.id === 'inbox');
        
        if (inboxLists.length > 1) {
          // Keep the first Inbox (usually the oldest one) and delete the rest
          const [firstInbox, ...duplicateInboxes] = inboxLists;
          
          try {
            // Delete duplicate Inboxes from database
            await Promise.all(duplicateInboxes.map(inbox => listService.delete(inbox.id)));
            
            // Update local state to remove duplicates
            const cleanedLists = previousLists.filter(list => list.id !== 'inbox' || list.id === firstInbox.id);
            set({ lists: cleanedLists });
          } catch (error) {
            set({ error: (error as Error).message });
          }
        }
      },
      cleanupDuplicateLists: async () => {
        const previousLists = get().lists;
        const listsByName = new Map<string, List[]>();
        
        // Group lists by name (case-insensitive)
        previousLists.forEach(list => {
          const nameKey = list.name.toLowerCase();
          if (!listsByName.has(nameKey)) {
            listsByName.set(nameKey, []);
          }
          listsByName.get(nameKey)!.push(list);
        });
        
        // Find duplicates and clean them up
        const listsToDelete: List[] = [];
        const listsToKeep: List[] = [];
        
        for (const [name, lists] of listsByName) {
          if (lists.length > 1) {
            // Keep the first list (usually the oldest one) and mark others for deletion
            const [firstList, ...duplicates] = lists;
            listsToKeep.push(firstList);
            listsToDelete.push(...duplicates);
          } else {
            listsToKeep.push(lists[0]);
          }
        }
        
        if (listsToDelete.length > 0) {
          try {
            // Delete duplicate lists from database
            await Promise.all(listsToDelete.map(list => listService.delete(list.id)));
            
            // Update local state to remove duplicates
            set({ lists: listsToKeep });
            
            console.log(`Cleaned up ${listsToDelete.length} duplicate lists`);
          } catch (error) {
            set({ error: (error as Error).message });
          }
        }
      },
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterOption: (option) => set({ filterOption: option }),
      setSortOption: (option) => set({ sortOption: option }),
      setSortDirection: (direction) => set({ sortDirection: direction }),
      getFilteredAndSortedTasks: (tasks, searchQueryOverride?: string, filterOptionOverride?: FilterOption, sortOptionOverride?: SortOption, sortDirectionOverride?: SortDirection) => {
        const currentState = get();
        const query = searchQueryOverride ?? currentState.searchQuery;
        const filter = filterOptionOverride ?? currentState.filterOption;
        const sort = sortOptionOverride ?? currentState.sortOption;
        const direction = sortDirectionOverride ?? currentState.sortDirection;
        
        // Apply search filter
        let filteredTasks = tasks;
        if (query.trim()) {
          const searchQuery = query.toLowerCase();
          filteredTasks = tasks.filter(task => 
            task.title.toLowerCase().includes(searchQuery) ||
            task.description?.toLowerCase().includes(searchQuery)
          );
        }
        
        // Apply filter options
        switch (filter) {
          case 'completed':
            filteredTasks = filteredTasks.filter(task => task.completed);
            break;
          case 'uncompleted':
            filteredTasks = filteredTasks.filter(task => !task.completed);
            break;
          case 'overdue':
            filteredTasks = filteredTasks.filter(task => 
              task.dueDate && 
              new Date(task.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) &&
              !task.completed
            );
            break;
          case 'dueToday':
            filteredTasks = filteredTasks.filter(task => 
              task.dueDate && 
              new Date(task.dueDate).toDateString() === new Date().toDateString()
            );
            break;
          case 'dueThisWeek':
            const today = new Date();
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + 7);
            filteredTasks = filteredTasks.filter(task => 
              task.dueDate && 
              new Date(task.dueDate) >= today &&
              new Date(task.dueDate) <= endOfWeek
            );
            break;
          default:
            // 'all' - no additional filtering
            break;
        }
        
        // Apply sorting
        const sortedTasks = [...filteredTasks].sort((a, b) => {
          let comparison = 0;
          
          switch (sort) {
            case 'created':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
            case 'dueDate':
              if (!a.dueDate && !b.dueDate) comparison = 0;
              else if (!a.dueDate) comparison = 1;
              else if (!b.dueDate) comparison = -1;
              else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
              break;
            case 'priority':
              const priorityA = a.priority || 0;
              const priorityB = b.priority || 0;
              comparison = priorityB - priorityA; // Higher priority first
              break;
            case 'title':
              comparison = a.title.localeCompare(b.title);
              break;
          }
          
          return direction === 'asc' ? comparison : -comparison;
        });
        
        return sortedTasks;
      },
    }),
    { name: 'kary-store' }
  )
);