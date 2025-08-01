import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useKaryStore } from './karyStore';
import { taskService, listService, tagService, listFolderService, tagFolderService } from '~/services/dataService';

// Mock dataService functions
vi.mock('~/services/dataService', () => ({
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
    act(() => {
      useKaryStore.setState({
        tasks: [],
        lists: [],
        tags: [],
        listFolders: [],
        tagFolders: [],
        loading: false,
        error: null,
      });
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

    await act(async () => {
      await fetchKaryData();
    });

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

  it('should handle error when fetching Kary data', async () => {
    const errorMessage = 'Failed to fetch data';
    vi.mocked(taskService.getAll).mockRejectedValue(new Error(errorMessage));

    const { fetchKaryData } = useKaryStore.getState();

    await act(async () => {
      await fetchKaryData();
    });

    const { loading, error } = useKaryStore.getState();

    expect(loading).toBe(false);
    expect(error).toBe(errorMessage);
  });

  it('should add a task optimistically and then confirm persistence', async () => {
    const newTask = { title: 'New Task', listId: 'l1' };
    const mockNewId = 'new-task-id';
    vi.mocked(taskService.add).mockResolvedValue(mockNewId);

    const { addTask } = useKaryStore.getState();

    const promise = act(async () => {
      await addTask(newTask as any);
    });

    // Optimistic update check
    let { tasks } = useKaryStore.getState();
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe(newTask.title);
    expect(tasks[0].id).toMatch(/^temp-/);

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

    await act(async () => {
      await addTask(newTask as any);
    });

    const { tasks, error } = useKaryStore.getState();
    expect(tasks.length).toBe(0); // Should rollback to empty
    expect(error).toBe(errorMessage);
  });

  it('should update a task optimistically and then confirm persistence', async () => {
    const existingTask = { id: '1', title: 'Old Title', listId: 'l1' };
    act(() => {
      useKaryStore.setState({ tasks: [existingTask] });
    });

    const updates = { title: 'Updated Title' };
    vi.mocked(taskService.update).mockResolvedValue(undefined);

    const { updateTask } = useKaryStore.getState();

    const promise = act(async () => {
      await updateTask(existingTask.id, updates);
    });

    // Optimistic update check
    let { tasks } = useKaryStore.getState();
    expect(tasks[0].title).toBe(updates.title);

    await promise;

    // Persistence confirmation
    tasks = useKaryStore.getState().tasks;
    expect(tasks[0].title).toBe(updates.title);
    expect(taskService.update).toHaveBeenCalledWith(existingTask.id, updates);
  });

  it('should rollback task update on error', async () => {
    const existingTask = { id: '1', title: 'Old Title', listId: 'l1' };
    act(() => {
      useKaryStore.setState({ tasks: [existingTask] });
    });

    const updates = { title: 'Updated Title' };
    const errorMessage = 'Failed to update task';
    vi.mocked(taskService.update).mockRejectedValue(new Error(errorMessage));

    const { updateTask } = useKaryStore.getState();

    await act(async () => {
      await updateTask(existingTask.id, updates);
    });

    const { tasks, error } = useKaryStore.getState();
    expect(tasks[0].title).toBe(existingTask.title); // Should rollback to original
    expect(error).toBe(errorMessage);
  });

  it('should delete a task optimistically and then confirm persistence', async () => {
    const existingTask = { id: '1', title: 'Task to Delete', listId: 'l1' };
    act(() => {
      useKaryStore.setState({ tasks: [existingTask] });
    });

    vi.mocked(taskService.delete).mockResolvedValue(undefined);

    const { deleteTask } = useKaryStore.getState();

    const promise = act(async () => {
      await deleteTask(existingTask.id);
    });

    // Optimistic update check
    let { tasks } = useKaryStore.getState();
    expect(tasks.length).toBe(0);

    await promise;

    // Persistence confirmation
    tasks = useKaryStore.getState().tasks;
    expect(tasks.length).toBe(0);
    expect(taskService.delete).toHaveBeenCalledWith(existingTask.id);
  });

  it('should rollback task deletion on error', async () => {
    const existingTask = { id: '1', title: 'Task to Delete', listId: 'l1' };
    act(() => {
      useKaryStore.setState({ tasks: [existingTask] });
    });

    const errorMessage = 'Failed to delete task';
    vi.mocked(taskService.delete).mockRejectedValue(new Error(errorMessage));

    const { deleteTask } = useKaryStore.getState();

    await act(async () => {
      await deleteTask(existingTask.id);
    });

    const { tasks, error } = useKaryStore.getState();
    expect(tasks.length).toBe(1); // Should rollback to original
    expect(tasks[0]).toEqual(existingTask);
    expect(error).toBe(errorMessage);
  });

  it('should add a list optimistically and then confirm persistence', async () => {
    const newList = { name: 'New List' };
    const mockNewId = 'new-list-id';
    vi.mocked(listService.add).mockResolvedValue(mockNewId);

    const { addList } = useKaryStore.getState();

    const promise = act(async () => {
      await addList(newList as any);
    });

    // Optimistic update check
    let { lists } = useKaryStore.getState();
    expect(lists.length).toBe(1);
    expect(lists[0].name).toBe(newList.name);
    expect(lists[0].id).toMatch(/^temp-/);

    await promise;

    // Persistence confirmation
    lists = useKaryStore.getState().lists;
    expect(lists.length).toBe(1);
    expect(lists[0].id).toBe(mockNewId);
    expect(listService.add).toHaveBeenCalledWith(newList);
  });

  it('should rollback list addition on error', async () => {
    const newList = { name: 'New List' };
    const errorMessage = 'Failed to add list';
    vi.mocked(listService.add).mockRejectedValue(new Error(errorMessage));

    const { addList } = useKaryStore.getState();

    await act(async () => {
      await addList(newList as any);
    });

    const { lists, error } = useKaryStore.getState();
    expect(lists.length).toBe(0); // Should rollback to empty
    expect(error).toBe(errorMessage);
  });

  it('should update a list optimistically and then confirm persistence', async () => {
    const existingList = { id: '1', name: 'Old Name' };
    act(() => {
      useKaryStore.setState({ lists: [existingList] });
    });

    const updates = { name: 'Updated Name' };
    vi.mocked(listService.update).mockResolvedValue(undefined);

    const { updateList } = useKaryStore.getState();

    const promise = act(async () => {
      await updateList(existingList.id, updates);
    });

    // Optimistic update check
    let { lists } = useKaryStore.getState();
    expect(lists[0].name).toBe(updates.name);

    await promise;

    // Persistence confirmation
    lists = useKaryStore.getState().lists;
    expect(lists[0].name).toBe(updates.name);
    expect(listService.update).toHaveBeenCalledWith(existingList.id, updates);
  });

  it('should rollback list update on error', async () => {
    const existingList = { id: '1', name: 'Old Name' };
    act(() => {
      useKaryStore.setState({ lists: [existingList] });
    });

    const updates = { name: 'Updated Name' };
    const errorMessage = 'Failed to update list';
    vi.mocked(listService.update).mockRejectedValue(new Error(errorMessage));

    const { updateList } = useKaryStore.getState();

    await act(async () => {
      await updateList(existingList.id, updates);
    });

    const { lists, error } = useKaryStore.getState();
    expect(lists[0].name).toBe(existingList.name); // Should rollback to original
    expect(error).toBe(errorMessage);
  });

  it('should delete a list optimistically and then confirm persistence', async () => {
    const existingList = { id: '1', name: 'List to Delete' };
    act(() => {
      useKaryStore.setState({ lists: [existingList] });
    });

    vi.mocked(listService.delete).mockResolvedValue(undefined);

    const { deleteList } = useKaryStore.getState();

    const promise = act(async () => {
      await deleteList(existingList.id);
    });

    // Optimistic update check
    let { lists } = useKaryStore.getState();
    expect(lists.length).toBe(0);

    await promise;

    // Persistence confirmation
    lists = useKaryStore.getState().lists;
    expect(lists.length).toBe(0);
    expect(listService.delete).toHaveBeenCalledWith(existingList.id);
  });

  it('should rollback list deletion on error', async () => {
    const existingList = { id: '1', name: 'List to Delete' };
    act(() => {
      useKaryStore.setState({ lists: [existingList] });
    });

    const errorMessage = 'Failed to delete list';
    vi.mocked(listService.delete).mockRejectedValue(new Error(errorMessage));

    const { deleteList } = useKaryStore.getState();

    await act(async () => {
      await deleteList(existingList.id);
    });

    const { lists, error } = useKaryStore.getState();
    expect(lists.length).toBe(1); // Should rollback to original
    expect(lists[0]).toEqual(existingList);
    expect(error).toBe(errorMessage);
  });

  it('should add a tag optimistically and then confirm persistence', async () => {
    const newTag = { name: 'New Tag', color: 'blue' };
    const mockNewId = 'new-tag-id';
    vi.mocked(tagService.add).mockResolvedValue(mockNewId);

    const { addTag } = useKaryStore.getState();

    const promise = act(async () => {
      await addTag(newTag as any);
    });

    // Optimistic update check
    let { tags } = useKaryStore.getState();
    expect(tags.length).toBe(1);
    expect(tags[0].name).toBe(newTag.name);
    expect(tags[0].id).toMatch(/^temp-/);

    await promise;

    // Persistence confirmation
    tags = useKaryStore.getState().tags;
    expect(tags.length).toBe(1);
    expect(tags[0].id).toBe(mockNewId);
    expect(tagService.add).toHaveBeenCalledWith(newTag);
  });

  it('should rollback tag addition on error', async () => {
    const newTag = { name: 'New Tag', color: 'blue' };
    const errorMessage = 'Failed to add tag';
    vi.mocked(tagService.add).mockRejectedValue(new Error(errorMessage));

    const { addTag } = useKaryStore.getState();

    await act(async () => {
      await addTag(newTag as any);
    });

    const { tags, error } = useKaryStore.getState();
    expect(tags.length).toBe(0); // Should rollback to empty
    expect(error).toBe(errorMessage);
  });

  it('should update a tag optimistically and then confirm persistence', async () => {
    const existingTag = { id: '1', name: 'Old Tag', color: 'red' };
    act(() => {
      useKaryStore.setState({ tags: [existingTag] });
    });

    const updates = { name: 'Updated Tag' };
    vi.mocked(tagService.update).mockResolvedValue(undefined);

    const { updateTag } = useKaryStore.getState();

    const promise = act(async () => {
      await updateTag(existingTag.id, updates);
    });

    // Optimistic update check
    let { tags } = useKaryStore.getState();
    expect(tags[0].name).toBe(updates.name);

    await promise;

    // Persistence confirmation
    tags = useKaryStore.getState().tags;
    expect(tags[0].name).toBe(updates.name);
    expect(tagService.update).toHaveBeenCalledWith(existingTag.id, updates);
  });

  it('should rollback tag update on error', async () => {
    const existingTag = { id: '1', name: 'Old Tag', color: 'red' };
    act(() => {
      useKaryStore.setState({ tags: [existingTag] });
    });

    const updates = { name: 'Updated Tag' };
    const errorMessage = 'Failed to update tag';
    vi.mocked(tagService.update).mockRejectedValue(new Error(errorMessage));

    const { updateTag } = useKaryStore.getState();

    await act(async () => {
      await updateTag(existingTag.id, updates);
    });

    const { tags, error } = useKaryStore.getState();
    expect(tags[0].name).toBe(existingTag.name); // Should rollback to original
    expect(error).toBe(errorMessage);
  });

  it('should delete a tag optimistically and then confirm persistence', async () => {
    const existingTag = { id: '1', name: 'Tag to Delete', color: 'green' };
    act(() => {
      useKaryStore.setState({ tags: [existingTag] });
    });

    vi.mocked(tagService.delete).mockResolvedValue(undefined);

    const { deleteTag } = useKaryStore.getState();

    const promise = act(async () => {
      await deleteTag(existingTag.id);
    });

    // Optimistic update check
    let { tags } = useKaryStore.getState();
    expect(tags.length).toBe(0);

    await promise;

    // Persistence confirmation
    tags = useKaryStore.getState().tags;
    expect(tags.length).toBe(0);
    expect(tagService.delete).toHaveBeenCalledWith(existingTag.id);
  });

  it('should rollback tag deletion on error', async () => {
    const existingTag = { id: '1', name: 'Tag to Delete', color: 'green' };
    act(() => {
      useKaryStore.setState({ tags: [existingTag] });
    });

    const errorMessage = 'Failed to delete tag';
    vi.mocked(tagService.delete).mockRejectedValue(new Error(errorMessage));

    const { deleteTag } = useKaryStore.getState();

    await act(async () => {
      await deleteTag(existingTag.id);
    });

    const { tags, error } = useKaryStore.getState();
    expect(tags.length).toBe(1); // Should rollback to original
    expect(tags[0]).toEqual(existingTag);
    expect(error).toBe(errorMessage);
  });

  it('should add a list folder optimistically and then confirm persistence', async () => {
    const newListFolder = { name: 'New List Folder' };
    const mockNewId = 'new-list-folder-id';
    vi.mocked(listFolderService.add).mockResolvedValue(mockNewId);

    const { addListFolder } = useKaryStore.getState();

    const promise = act(async () => {
      await addListFolder(newListFolder as any);
    });

    // Optimistic update check
    let { listFolders } = useKaryStore.getState();
    expect(listFolders.length).toBe(1);
    expect(listFolders[0].name).toBe(newListFolder.name);
    expect(listFolders[0].id).toMatch(/^temp-/);

    await promise;

    // Persistence confirmation
    listFolders = useKaryStore.getState().listFolders;
    expect(listFolders.length).toBe(1);
    expect(listFolders[0].id).toBe(mockNewId);
    expect(listFolderService.add).toHaveBeenCalledWith(newListFolder);
  });

  it('should rollback list folder addition on error', async () => {
    const newListFolder = { name: 'New List Folder' };
    const errorMessage = 'Failed to add list folder';
    vi.mocked(listFolderService.add).mockRejectedValue(new Error(errorMessage));

    const { addListFolder } = useKaryStore.getState();

    await act(async () => {
      await addListFolder(newListFolder as any);
    });

    const { listFolders, error } = useKaryStore.getState();
    expect(listFolders.length).toBe(0); // Should rollback to empty
    expect(error).toBe(errorMessage);
  });

  it('should update a list folder optimistically and then confirm persistence', async () => {
    const existingListFolder = { id: '1', name: 'Old List Folder' };
    act(() => {
      useKaryStore.setState({ listFolders: [existingListFolder] });
    });

    const updates = { name: 'Updated List Folder' };
    vi.mocked(listFolderService.update).mockResolvedValue(undefined);

    const { updateListFolder } = useKaryStore.getState();

    const promise = act(async () => {
      await updateListFolder(existingListFolder.id, updates);
    });

    // Optimistic update check
    let { listFolders } = useKaryStore.getState();
    expect(listFolders[0].name).toBe(updates.name);

    await promise;

    // Persistence confirmation
    listFolders = useKaryStore.getState().listFolders;
    expect(listFolders[0].name).toBe(updates.name);
    expect(listFolderService.update).toHaveBeenCalledWith(existingListFolder.id, updates);
  });

  it('should rollback list folder update on error', async () => {
    const existingListFolder = { id: '1', name: 'Old List Folder' };
    act(() => {
      useKaryStore.setState({ listFolders: [existingListFolder] });
    });

    const updates = { name: 'Updated List Folder' };
    const errorMessage = 'Failed to update list folder';
    vi.mocked(listFolderService.update).mockRejectedValue(new Error(errorMessage));

    const { updateListFolder } = useKaryStore.getState();

    await act(async () => {
      await updateListFolder(existingListFolder.id, updates);
    });

    const { listFolders, error } = useKaryStore.getState();
    expect(listFolders[0].name).toBe(existingListFolder.name); // Should rollback to original
    expect(error).toBe(errorMessage);
  });

  it('should delete a list folder optimistically and then confirm persistence', async () => {
    const existingListFolder = { id: '1', name: 'List Folder to Delete' };
    act(() => {
      useKaryStore.setState({ listFolders: [existingListFolder] });
    });

    vi.mocked(listFolderService.delete).mockResolvedValue(undefined);

    const { deleteListFolder } = useKaryStore.getState();

    const promise = act(async () => {
      await deleteListFolder(existingListFolder.id);
    });

    // Optimistic update check
    let { listFolders } = useKaryStore.getState();
    expect(listFolders.length).toBe(0);

    await promise;

    // Persistence confirmation
    listFolders = useKaryStore.getState().listFolders;
    expect(listFolders.length).toBe(0);
    expect(listFolderService.delete).toHaveBeenCalledWith(existingListFolder.id);
  });

  it('should rollback list folder deletion on error', async () => {
    const existingListFolder = { id: '1', name: 'List Folder to Delete' };
    act(() => {
      useKaryStore.setState({ listFolders: [existingListFolder] });
    });

    const errorMessage = 'Failed to delete list folder';
    vi.mocked(listFolderService.delete).mockRejectedValue(new Error(errorMessage));

    const { deleteListFolder } = useKaryStore.getState();

    await act(async () => {
      await deleteListFolder(existingListFolder.id);
    });

    const { listFolders, error } = useKaryStore.getState();
    expect(listFolders.length).toBe(1); // Should rollback to original
    expect(listFolders[0]).toEqual(existingListFolder);
    expect(error).toBe(errorMessage);
  });

  it('should add a tag folder optimistically and then confirm persistence', async () => {
    const newTagFolder = { name: 'New Tag Folder' };
    const mockNewId = 'new-tag-folder-id';
    vi.mocked(tagFolderService.add).mockResolvedValue(mockNewId);

    const { addTagFolder } = useKaryStore.getState();

    const promise = act(async () => {
      await addTagFolder(newTagFolder as any);
    });

    // Optimistic update check
    let { tagFolders } = useKaryStore.getState();
    expect(tagFolders.length).toBe(1);
    expect(tagFolders[0].name).toBe(newTagFolder.name);
    expect(tagFolders[0].id).toMatch(/^temp-/);

    await promise;

    // Persistence confirmation
    tagFolders = useKaryStore.getState().tagFolders;
    expect(tagFolders.length).toBe(1);
    expect(tagFolders[0].id).toBe(mockNewId);
    expect(tagFolderService.add).toHaveBeenCalledWith(newTagFolder);
  });

  it('should rollback tag folder addition on error', async () => {
    const newTagFolder = { name: 'New Tag Folder' };
    const errorMessage = 'Failed to add tag folder';
    vi.mocked(tagFolderService.add).mockRejectedValue(new Error(errorMessage));

    const { addTagFolder } = useKaryStore.getState();

    await act(async () => {
      await addTagFolder(newTagFolder as any);
    });

    const { tagFolders, error } = useKaryStore.getState();
    expect(tagFolders.length).toBe(0); // Should rollback to empty
    expect(error).toBe(errorMessage);
  });

  it('should update a tag folder optimistically and then confirm persistence', async () => {
    const existingTagFolder = { id: '1', name: 'Old Tag Folder' };
    act(() => {
      useKaryStore.setState({ tagFolders: [existingTagFolder] });
    });

    const updates = { name: 'Updated Tag Folder' };
    vi.mocked(tagFolderService.update).mockResolvedValue(undefined);

    const { updateTagFolder } = useKaryStore.getState();

    const promise = act(async () => {
      await updateTagFolder(existingTagFolder.id, updates);
    });

    // Optimistic update check
    let { tagFolders } = useKaryStore.getState();
    expect(tagFolders[0].name).toBe(updates.name);

    await promise;

    // Persistence confirmation
    tagFolders = useKaryStore.getState().tagFolders;
    expect(tagFolders[0].name).toBe(updates.name);
    expect(tagFolderService.update).toHaveBeenCalledWith(existingTagFolder.id, updates);
  });

  it('should rollback tag folder update on error', async () => {
    const existingTagFolder = { id: '1', name: 'Old Tag Folder' };
    act(() => {
      useKaryStore.setState({ tagFolders: [existingTagFolder] });
    });

    const updates = { name: 'Updated Tag Folder' };
    const errorMessage = 'Failed to update tag folder';
    vi.mocked(tagFolderService.update).mockRejectedValue(new Error(errorMessage));

    const { updateTagFolder } = useKaryStore.getState();

    await act(async () => {
      await updateTagFolder(existingTagFolder.id, updates);
    });

    const { tagFolders, error } = useKaryStore.getState();
    expect(tagFolders[0].name).toBe(existingTagFolder.name); // Should rollback to original
    expect(error).toBe(errorMessage);
  });

  it('should delete a tag folder optimistically and then confirm persistence', async () => {
    const existingTagFolder = { id: '1', name: 'Tag Folder to Delete' };
    act(() => {
      useKaryStore.setState({ tagFolders: [existingTagFolder] });
    });

    vi.mocked(tagFolderService.delete).mockResolvedValue(undefined);

    const { deleteTagFolder } = useKaryStore.getState();

    const promise = act(async () => {
      await deleteTagFolder(existingTagFolder.id);
    });

    // Optimistic update check
    let { tagFolders } = useKaryStore.getState();
    expect(tagFolders.length).toBe(0);

    await promise;

    // Persistence confirmation
    tagFolders = useKaryStore.getState().tagFolders;
    expect(tagFolders.length).toBe(0);
    expect(tagFolderService.delete).toHaveBeenCalledWith(existingTagFolder.id);
  });

  it('should rollback tag folder deletion on error', async () => {
    const existingTagFolder = { id: '1', name: 'Tag Folder to Delete' };
    act(() => {
      useKaryStore.setState({ tagFolders: [existingTagFolder] });
    });

    const errorMessage = 'Failed to delete tag folder';
    vi.mocked(tagFolderService.delete).mockRejectedValue(new Error(errorMessage));

    const { deleteTagFolder } = useKaryStore.getState();

    await act(async () => {
      await deleteTagFolder(existingTagFolder.id);
    });

    const { tagFolders, error } = useKaryStore.getState();
    expect(tagFolders.length).toBe(1); // Should rollback to original
    expect(tagFolders[0]).toEqual(existingTagFolder);
    expect(error).toBe(errorMessage);
  });
});
