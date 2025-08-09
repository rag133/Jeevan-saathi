import { dataService } from './dataService';
import { LogEntry, Template, Tab } from '../types';

export class DainandiniService {
  // Log Entry operations
  async getLogEntries(date?: string): Promise<LogEntry[]> {
    if (date) {
      return dataService.getDocuments<LogEntry>('logEntries');
    }
    return dataService.getDocuments<LogEntry>('logEntries');
  }

  async getLogEntry(entryId: string): Promise<LogEntry | null> {
    return dataService.getDocument<LogEntry>('logEntries', entryId);
  }

  async createLogEntry(entry: Omit<LogEntry, 'id'>): Promise<string> {
    return dataService.addDocument<LogEntry>('logEntries', entry);
  }

  async updateLogEntry(entryId: string, updates: Partial<LogEntry>): Promise<void> {
    return dataService.updateDocument<LogEntry>('logEntries', entryId, updates);
  }

  async deleteLogEntry(entryId: string): Promise<void> {
    return dataService.deleteDocument('logEntries', entryId);
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    return dataService.getDocuments<Template>('templates');
  }

  async getTemplate(templateId: string): Promise<Template | null> {
    return dataService.getDocument<Template>('templates', templateId);
  }

  async createTemplate(template: Omit<Template, 'id'>): Promise<string> {
    return dataService.addDocument<Template>('templates', template);
  }

  async updateTemplate(templateId: string, updates: Partial<Template>): Promise<void> {
    return dataService.updateDocument<Template>('templates', templateId, updates);
  }

  async deleteTemplate(templateId: string): Promise<void> {
    return dataService.deleteDocument('templates', templateId);
  }

  // Tab operations
  async getTabs(): Promise<Tab[]> {
    return dataService.getDocuments<Tab>('tabs');
  }

  async createTab(tab: Omit<Tab, 'id'>): Promise<string> {
    return dataService.addDocument<Tab>('tabs', tab);
  }

  async updateTab(tabId: string, updates: Partial<Tab>): Promise<void> {
    return dataService.updateDocument<Tab>('tabs', tabId, updates);
  }

  async deleteTab(tabId: string): Promise<void> {
    return dataService.deleteDocument('tabs', tabId);
  }

  // Real-time subscriptions
  subscribeToLogEntries(callback: (entries: LogEntry[]) => void) {
    return dataService.subscribeToCollection<LogEntry>('logEntries', callback);
  }

  subscribeToTemplates(callback: (templates: Template[]) => void) {
    return dataService.subscribeToCollection<Template>('templates', callback);
  }

  subscribeToTabs(callback: (tabs: Tab[]) => void) {
    return dataService.subscribeToCollection<Tab>('tabs', callback);
  }

  // Date-based operations
  async getLogEntriesByDate(date: string): Promise<LogEntry[]> {
    const entries = await this.getLogEntries();
    return entries.filter(entry => entry.date === date);
  }

  async getLogEntriesByDateRange(startDate: string, endDate: string): Promise<LogEntry[]> {
    const entries = await this.getLogEntries();
    return entries.filter(entry => 
      entry.date >= startDate && entry.date <= endDate
    );
  }

  async getTodayLogEntries(): Promise<LogEntry[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getLogEntriesByDate(today);
  }

  async getWeeklyLogEntries(): Promise<LogEntry[]> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    return this.getLogEntriesByDateRange(startDate, endDate);
  }

  // Search and filtering
  async searchLogEntries(query: string): Promise<LogEntry[]> {
    const entries = await this.getLogEntries();
    return entries.filter(entry => 
      entry.title?.toLowerCase().includes(query.toLowerCase()) ||
      entry.content?.toLowerCase().includes(query.toLowerCase()) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async getLogEntriesByTab(tabId: string): Promise<LogEntry[]> {
    const entries = await this.getLogEntries();
    return entries.filter(entry => entry.tabId === tabId);
  }

  async getLogEntriesByTag(tag: string): Promise<LogEntry[]> {
    const entries = await this.getLogEntries();
    return entries.filter(entry => 
      entry.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  // Analytics
  async getLogEntryCount(date?: string): Promise<number> {
    const entries = date ? await this.getLogEntriesByDate(date) : await this.getLogEntries();
    return entries.length;
  }

  async getMostUsedTags(): Promise<string[]> {
    const entries = await this.getLogEntries();
    const tagCount: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      entry.tags?.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }
}

export const dainandiniService = new DainandiniService();
export default dainandiniService;
