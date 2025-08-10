import { dataService } from './dataService';
import { Task, List, Tag, ListFolder, TagFolder } from '../types';

// Kary Service Class - Updated to use shared data service
class KaryService {
  // Task Methods
  async getTasks(): Promise<Task[]> {
    try {
      return await dataService.getTasks();
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      return await dataService.getTasks();
    } catch (error) {
      console.error('Error getting all tasks:', error);
      return [];
    }
  }

  async getTask(taskId: string): Promise<Task | null> {
    try {
      return await dataService.getTask(taskId);
    } catch (error) {
      console.error('Error getting task:', error);
      throw error;
    }
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    try {
      return await dataService.createTask(taskData);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async addTask(taskData: Partial<Task>): Promise<Task> {
    try {
      return await dataService.createTask(taskData);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      await dataService.updateTask(taskId, updates);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await dataService.deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // List Methods
  async getLists(): Promise<List[]> {
    try {
      return await dataService.getLists();
    } catch (error) {
      console.error('Error getting lists:', error);
      throw error;
    }
  }

  async getAllLists(): Promise<List[]> {
    try {
      return await dataService.getLists();
    } catch (error) {
      console.error('Error getting all lists:', error);
      return [];
    }
  }

  async createList(listData: Partial<List>): Promise<List> {
    try {
      return await dataService.createList(listData);
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  }

  async addList(listData: Partial<List>): Promise<List> {
    try {
      return await dataService.createList(listData);
    } catch (error) {
      console.error('Error adding list:', error);
      throw error;
    }
  }

  async updateList(listId: string, updates: Partial<List>): Promise<void> {
    try {
      await dataService.updateList(listId, updates);
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  }

  async deleteList(listId: string): Promise<void> {
    try {
      await dataService.deleteList(listId);
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  }

  // Tag Methods
  async getTags(): Promise<Tag[]> {
    try {
      return await dataService.getTags();
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  }

  async getAllTags(): Promise<Tag[]> {
    try {
      return await dataService.getTags();
    } catch (error) {
      console.error('Error getting all tags:', error);
      return [];
    }
  }

  async createTag(tagData: Partial<Tag>): Promise<Tag> {
    try {
      return await dataService.createTag(tagData);
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  async addTag(tagData: Partial<Tag>): Promise<Tag> {
    try {
      return await dataService.createTag(tagData);
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  }

  async updateTag(tagId: string, updates: Partial<Tag>): Promise<void> {
    try {
      await dataService.updateTag(tagId, updates);
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  }

  async deleteTag(tagId: string): Promise<void> {
    try {
      await dataService.deleteTag(tagId);
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  // List Folder Methods
  async getListFolders(): Promise<ListFolder[]> {
    try {
      return await dataService.getListFolders();
    } catch (error) {
      console.error('Error getting list folders:', error);
      throw error;
    }
  }

  async getAllListFolders(): Promise<ListFolder[]> {
    try {
      return await dataService.getListFolders();
    } catch (error) {
      console.error('Error getting all list folders:', error);
      return [];
    }
  }

  async createListFolder(folderData: Partial<ListFolder>): Promise<ListFolder> {
    try {
      return await dataService.createListFolder(folderData);
    } catch (error) {
      console.error('Error creating list folder:', error);
      throw error;
    }
  }

  async addListFolder(folderData: Partial<ListFolder>): Promise<ListFolder> {
    try {
      return await dataService.createListFolder(folderData);
    } catch (error) {
      console.error('Error adding list folder:', error);
      throw error;
    }
  }

  async updateListFolder(folderId: string, updates: Partial<ListFolder>): Promise<void> {
    try {
      await dataService.updateListFolder(folderId, updates);
    } catch (error) {
      console.error('Error updating list folder:', error);
      throw error;
    }
  }

  async deleteListFolder(folderId: string): Promise<void> {
    try {
      await dataService.deleteListFolder(folderId);
    } catch (error) {
      console.error('Error deleting list folder:', error);
      throw error;
    }
  }

  // Tag Folder Methods
  async getTagFolders(): Promise<TagFolder[]> {
    try {
      return await dataService.getTagFolders();
    } catch (error) {
      console.error('Error getting tag folders:', error);
      throw error;
    }
  }

  async getAllTagFolders(): Promise<TagFolder[]> {
    try {
      return await dataService.getTagFolders();
    } catch (error) {
      console.error('Error getting all tag folders:', error);
      return [];
    }
  }

  async createTagFolder(folderData: Partial<TagFolder>): Promise<TagFolder> {
    try {
      return await dataService.createTagFolder(folderData);
    } catch (error) {
      console.error('Error creating tag folder:', error);
      throw error;
    }
  }

  async addTagFolder(folderData: Partial<TagFolder>): Promise<TagFolder> {
    try {
      return await dataService.createTagFolder(folderData);
    } catch (error) {
      console.error('Error adding tag folder:', error);
      throw error;
    }
  }

  async updateTagFolder(folderId: string, updates: Partial<TagFolder>): Promise<void> {
    try {
      await dataService.updateTagFolder(folderId, updates);
    } catch (error) {
      console.error('Error updating tag folder:', error);
      throw error;
    }
  }

  async deleteTagFolder(folderId: string): Promise<void> {
    try {
      await dataService.deleteTagFolder(folderId);
    } catch (error) {
      console.error('Error deleting tag folder:', error);
      throw error;
    }
  }

  async setDefaultList(listId: string): Promise<void> {
    try {
      // Update all lists to remove default status
      const allLists = await this.getLists();
      for (const list of allLists) {
        if (list.id !== listId) {
          await this.updateList(list.id, { isDefault: false });
        }
      }
      // Set the selected list as default
      await this.updateList(listId, { isDefault: true });
    } catch (error) {
      console.error('Error setting default list:', error);
      throw error;
    }
  }

  async cleanupDuplicateInboxes(): Promise<void> {
    try {
      const lists = await this.getLists();
      const inboxes = lists.filter(list => list.isInbox);
      if (inboxes.length > 1) {
        // Keep the first inbox, delete the rest
        for (let i = 1; i < inboxes.length; i++) {
          await this.deleteList(inboxes[i].id);
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate inboxes:', error);
      throw error;
    }
  }

  async cleanupDuplicateLists(): Promise<void> {
    try {
      const lists = await this.getLists();
      const seenNames = new Set();
      for (const list of lists) {
        if (seenNames.has(list.name)) {
          await this.deleteList(list.id);
        } else {
          seenNames.add(list.name);
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate lists:', error);
      throw error;
    }
  }

  // Real-time subscription methods
  subscribeToTasks(callback: (tasks: Task[]) => void) {
    return dataService.subscribeToTasks(callback);
  }

  subscribeToLists(callback: (lists: List[]) => void) {
    return dataService.subscribeToLists(callback);
  }

  subscribeToTags(callback: (tags: Tag[]) => void) {
    return dataService.subscribeToTags(callback);
  }

  // Utility methods
  async getTasksByList(listId: string): Promise<Task[]> {
    try {
      const allTasks = await this.getTasks();
      return allTasks.filter(task => task.listId === listId);
    } catch (error) {
      console.error('Error getting tasks by list:', error);
      throw error;
    }
  }

  async getTasksByTag(tagId: string): Promise<Task[]> {
    try {
      const allTasks = await this.getTasks();
      return allTasks.filter(task => task.tags && task.tags.includes(tagId));
    } catch (error) {
      console.error('Error getting tasks by tag:', error);
      throw error;
    }
  }

  async searchTasks(searchTerm: string): Promise<Task[]> {
    try {
      const allTasks = await this.getTasks();
      const lowerSearchTerm = searchTerm.toLowerCase();
      return allTasks.filter(task => 
        task.title.toLowerCase().includes(lowerSearchTerm) ||
        task.description?.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const karyService = new KaryService();
