import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useKaryStore } from '@jeevan-saathi/shared/stores/karyStore';
import { taskService, listService, tagService, listFolderService, tagFolderService } from '@jeevan-saathi/shared/services/dataService';

// Mock dataService functions
vi.mock('@jeevan-saathi/shared/services/dataService', () => ({
  taskService: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  listService: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  tagService: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  listFolderService: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  tagFolderService: {
    getAll: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useKaryStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useKaryStore.setState({
      tasks: [],
      lists: [],
      tags: [],
      listFolders: [],
      tagFolders: [],
      loading: false,
      error: null,
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  it('should fetch all Kary data successfully', async () => {
    const mockTasks = [{ id: '1', title: 'Task 1' }];
    const mockLists = [{ id: 'l1', name: 'List 1' }];
    const mockTags = [{ id: 't1', name: 'Tag 1' }];
    const mockListFolders = [{ id: 'lf1', name: 'List Folder 1' }];
    const mockTagFolders = [{ id: 'tf1', name: 'Tag Folder 1' }];

    vi.mocked(taskService.getAll).mockResolvedValue(mockTasks as any);
    vi.mocked(listService.getAll).mockResolvedValue(mockLists as any);
    vi.mocked(tagService.getAll).mockResolvedValue(mockTags as any);
    vi.mocked(listFolderService.getAll).mockResolvedValue(mockListFolders as any);
    vi.mocked(tagFolderService.getAll).mockResolvedValue(mockTagFolders as any);

    const { fetchKaryData, loading, error } = useKaryStore.getState();

    expect(loading).toBe(false);
    expect(error).toBeNull();

    await fetchKaryData();

    const { tasks, lists, tags, listFolders, tagFolders, loading: newLoading, error: newError } = useKaryStore.getState();

    expect(taskService.getAll).toHaveBeenCalledTimes(1);
    expect(listService.getAll).toHaveBeenCalledTimes(1);
    expect(tagService.getAll).toHaveBeenCalledTimes(1);
    expect(listFolderService.getAll).toHaveBeenCalledTimes(1);
    expect(tagFolderService.getAll).toHaveBeenCalledTimes(1);

    expect(tasks).toEqual(mockTasks);
    expect(lists).toEqual(mockLists);
    expect(tags).toEqual(mockTags);
    expect(listFolders).toEqual(mockListFolders);
    expect(tagFolders).toEqual(mockTagFolders);
    expect(newLoading).toBe(false);
    expect(newError).toBeNull();
  });

  it('should handle error when fetching Kary data fails', async () => {
    const errorMessage = 'Failed to fetch data';
    vi.mocked(taskService.getAll).mockRejectedValue(new Error(errorMessage));

    const { fetchKaryData } = useKaryStore.getState();

    await fetchKaryData();

    const { loading, error } = useKaryStore.getState();

    expect(loading).toBe(false);
    expect(error).toBe(errorMessage);
  });

  it('should add a task optimistically and then confirm persistence', async () => {
    const newTask = { title: 'New Task', listId: 'l1' };
    const mockNewId = 'new-task-id';

    vi.mocked(taskService.add).mockResolvedValue(mockNewId);

    const { addTask } = useKaryStore.getState();

    const promise = addTask(newTask as any);

    // Optimistic update check
    let { tasks } = useKaryStore.getState();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe(newTask.title);

    await promise;

    // Persistence confirmation
    tasks = useKaryStore.getState().tasks;
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe(mockNewId);
    expect(taskService.add).toHaveBeenCalledWith(newTask);
  });

  it('should rollback task addition on error', async () => {
    const newTask = { title: 'New Task', listId: 'l1' };
    const errorMessage = 'Failed to add task';

    vi.mocked(taskService.add).mockRejectedValue(new Error(errorMessage));

    const { addTask } = useKaryStore.getState();

    await addTask(newTask as any);

    const { tasks, error } = useKaryStore.getState();
    expect(tasks.length).toBe(0); // Should rollback to empty
    expect(error).toBe(errorMessage);
  });
});
