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
    (set, get) => ({
      tasks: [],
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
        set({ lists: [...previousLists, optimisticList] });
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
        const updatedLists = previousLists.map((l) =>
          l.id === listId ? { ...l, ...updates } : l
        );
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
    }),
    { name: 'kary-store' }
  )
);