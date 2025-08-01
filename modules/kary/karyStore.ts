import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { taskService, listService, tagService, listFolderService, tagFolderService } from '~/services/dataService';
import type { Task, List, Tag, ListFolder, TagFolder } from './types';

type KaryState = {
  tasks: Task[];
  lists: List[];
  tags: Tag[];
  listFolders: ListFolder[];
  tagFolders: TagFolder[];
  loading: boolean;
  error: string | null;
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
};

export const useKaryStore = create<KaryState>()(
  devtools(
    (set, get) => ({      tasks: [],
      lists: [],
      tags: [],
      listFolders: [],
      tagFolders: [],
      loading: false,
      error: null,
      fetchKaryData: async () => {
        set({ loading: true, error: null });
        try {
          const [tasks, lists, tags, listFolders, tagFolders] = await Promise.all([
            taskService.getAll(),
            listService.getAll(),
            tagService.getAll(),
            listFolderService.getAll(),
            tagFolderService.getAll(),
          ]);
          set({ tasks, lists, tags, listFolders, tagFolders, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },
      addTask: async (task) => {
        const currentTasks = get().tasks;
        const optimisticTask = { ...task, id: 'temp-id', createdAt: new Date() } as Task;
        set({ tasks: [...currentTasks, optimisticTask] });
        try {
          const newId = await taskService.add(task);
          const newTask = { ...task, id: newId, createdAt: new Date() } as Task;
          set({ tasks: [...currentTasks, newTask] });
        } catch (error) {
          set({ error: (error as Error).message, tasks: currentTasks });
        }
      },
      updateTask: async (taskId, updates) => {
        const currentTasks = get().tasks;
        const updatedTasks = currentTasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
        set({ tasks: updatedTasks });
        try {
          await taskService.update(taskId, updates);
        } catch (error) {
          set({ error: (error as Error).message, tasks: currentTasks });
        }
      },
      deleteTask: async (taskId) => {
        const currentTasks = get().tasks;
        const updatedTasks = currentTasks.filter((t) => t.id !== taskId);
        set({ tasks: updatedTasks });
        try {
          await taskService.delete(taskId);
        } catch (error) {
          set({ error: (error as Error).message, tasks: currentTasks });
        }
      },
      addList: async (list) => {
        const currentLists = get().lists;
        const optimisticList = { ...list, id: 'temp-id' } as List;
        set({ lists: [...currentLists, optimisticList] });
        try {
          const newId = await listService.add(list);
          const newList = { ...list, id: newId } as List;
          set({ lists: [...currentLists, newList] });
        } catch (error) {
          set({ error: (error as Error).message, lists: currentLists });
        }
      },
      updateList: async (listId, updates) => {
        const currentLists = get().lists;
        const updatedLists = currentLists.map((l) => (l.id === listId ? { ...l, ...updates } : l));
        set({ lists: updatedLists });
        try {
          await listService.update(listId, updates);
        } catch (error) {
          set({ error: (error as Error).message, lists: currentLists });
        }
      },
      deleteList: async (listId) => {
        const currentLists = get().lists;
        const updatedLists = currentLists.filter((l) => l.id !== listId);
        set({ lists: updatedLists });
        try {
          await listService.delete(listId);
        } catch (error) {
          set({ error: (error as Error).message, lists: currentLists });
        }
      },
      addTag: async (tag) => {
        const currentTags = get().tags;
        const optimisticTag = { ...tag, id: 'temp-id' } as Tag;
        set({ tags: [...currentTags, optimisticTag] });
        try {
          const newId = await tagService.add(tag);
          const newTag = { ...tag, id: newId } as Tag;
          set({ tags: [...currentTags, newTag] });
        } catch (error) {
          set({ error: (error as Error).message, tags: currentTags });
        }
      },
      updateTag: async (tagId, updates) => {
        const currentTags = get().tags;
        const updatedTags = currentTags.map((t) => (t.id === tagId ? { ...t, ...updates } : t));
        set({ tags: updatedTags });
        try {
          await tagService.update(tagId, updates);
        } catch (error) {
          set({ error: (error as Error).message, tags: currentTags });
        }
      },
      deleteTag: async (tagId) => {
        const currentTags = get().tags;
        const updatedTags = currentTags.filter((t) => t.id !== tagId);
        set({ tags: updatedTags });
        try {
          await tagService.delete(tagId);
        } catch (error) {
          set({ error: (error as Error).message, tags: currentTags });
        }
      },
      addListFolder: async (folder) => {
        const currentFolders = get().listFolders;
        const optimisticFolder = { ...folder, id: 'temp-id' } as ListFolder;
        set({ listFolders: [...currentFolders, optimisticFolder] });
        try {
          const newId = await listFolderService.add(folder);
          const newFolder = { ...folder, id: newId } as ListFolder;
          set({ listFolders: [...currentFolders, newFolder] });
        } catch (error) {
          set({ error: (error as Error).message, listFolders: currentFolders });
        }
      },
      updateListFolder: async (folderId, updates) => {
        const currentFolders = get().listFolders;
        const updatedFolders = currentFolders.map((f) => (f.id === folderId ? { ...f, ...updates } : f));
        set({ listFolders: updatedFolders });
        try {
          await listFolderService.update(folderId, updates);
        } catch (error) {
          set({ error: (error as Error).message, listFolders: currentFolders });
        }
      },
      deleteListFolder: async (folderId) => {
        const currentFolders = get().listFolders;
        const updatedFolders = currentFolders.filter((f) => f.id !== folderId);
        set({ listFolders: updatedFolders });
        try {
          await listFolderService.delete(folderId);
        } catch (error) {
          set({ error: (error as Error).message, listFolders: currentFolders });
        }
      },
      addTagFolder: async (folder) => {
        const currentFolders = get().tagFolders;
        const optimisticFolder = { ...folder, id: 'temp-id' } as TagFolder;
        set({ tagFolders: [...currentFolders, optimisticFolder] });
        try {
          const newId = await tagFolderService.add(folder);
          const newFolder = { ...folder, id: newId } as TagFolder;
          set({ tagFolders: [...currentFolders, newFolder] });
        } catch (error) {
          set({ error: (error as Error).message, tagFolders: currentFolders });
        }
      },
      updateTagFolder: async (folderId, updates) => {
        const currentFolders = get().tagFolders;
        const updatedFolders = currentFolders.map((f) => (f.id === folderId ? { ...f, ...updates } : f));
        set({ tagFolders: updatedFolders });
        try {
          await tagFolderService.update(folderId, updates);
        } catch (error) {
          set({ error: (error as Error).message, tagFolders: currentFolders });
        }
      },
      deleteTagFolder: async (folderId) => {
        const currentFolders = get().tagFolders;
        const updatedFolders = currentFolders.filter((f) => f.id !== folderId);
        set({ tagFolders: updatedFolders });
        try {
          await tagFolderService.delete(folderId);
        } catch (error) {
          set({ error: (error as Error).message, tagFolders: currentFolders });
        }
      },
    }),
    { name: 'kary-store' }
  )
);
