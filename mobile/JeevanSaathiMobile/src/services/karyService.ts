import { dataService } from './dataService';
import { Task, List, TaskLog } from '../types';

export class KaryService {
  // List operations
  async getLists(): Promise<List[]> {
    return dataService.getDocuments<List>('lists');
  }

  async getList(listId: string): Promise<List | null> {
    return dataService.getDocument<List>('lists', listId);
  }

  async createList(list: Omit<List, 'id'>): Promise<string> {
    return dataService.addDocument<List>('lists', list);
  }

  async updateList(listId: string, updates: Partial<List>): Promise<void> {
    return dataService.updateDocument<List>('lists', listId, updates);
  }

  async deleteList(listId: string): Promise<void> {
    return dataService.deleteDocument('lists', listId);
  }

  // Task operations
  async getTasks(listId?: string): Promise<Task[]> {
    if (listId) {
      return dataService.getDocuments<Task>('tasks');
    }
    return dataService.getDocuments<Task>('tasks');
  }

  async getTask(taskId: string): Promise<Task | null> {
    return dataService.getDocument<Task>('tasks', taskId);
  }

  async createTask(task: Omit<Task, 'id'>): Promise<string> {
    return dataService.addDocument<Task>('tasks', task);
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    return dataService.updateDocument<Task>('tasks', taskId, updates);
  }

  async deleteTask(taskId: string): Promise<void> {
    return dataService.deleteDocument('tasks', taskId);
  }

  // Task log operations
  async getTaskLogs(taskId?: string): Promise<TaskLog[]> {
    if (taskId) {
      return dataService.getDocuments<TaskLog>('taskLogs');
    }
    return dataService.getDocuments<TaskLog>('taskLogs');
  }

  async createTaskLog(log: Omit<TaskLog, 'id'>): Promise<string> {
    return dataService.addDocument<TaskLog>('taskLogs', log);
  }

  // Real-time subscriptions
  subscribeToLists(callback: (lists: List[]) => void) {
    return dataService.subscribeToCollection<List>('lists', callback);
  }

  subscribeToTasks(callback: (tasks: Task[]) => void) {
    return dataService.subscribeToCollection<Task>('tasks', callback);
  }

  subscribeToTask(taskId: string, callback: (task: Task | null) => void) {
    return dataService.subscribeToDocument<Task>('tasks', taskId, callback);
  }

  // Search and filtering
  async searchTasks(query: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description?.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter(task => task.status === status);
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter(task => task.priority === priority);
  }
}

export const karyService = new KaryService();
export default karyService;
