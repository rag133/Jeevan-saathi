import { dataService } from './dataService';
import { LogEntry, LogTemplate, Tab } from '../types';

export class DainandiniService {
  // Log Entry operations
  async getLogEntries(): Promise<LogEntry[]> {
    return dataService.getLogEntries();
  }

  async createLogEntry(entry: Omit<LogEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<LogEntry> {
    return dataService.createLogEntry(entry);
  }

  async updateLogEntry(id: string, updates: Partial<LogEntry>): Promise<void> {
    return dataService.updateLogEntry(id, updates);
  }

  async deleteLogEntry(id: string): Promise<void> {
    return dataService.deleteLogEntry(id);
  }

  // Log Template operations
  async getLogTemplates(): Promise<LogTemplate[]> {
    return dataService.getLogTemplates();
  }

  async createLogTemplate(template: Omit<LogTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<LogTemplate> {
    return dataService.createLogTemplate(template);
  }

  async updateLogTemplate(id: string, updates: Partial<LogTemplate>): Promise<void> {
    return dataService.updateLogTemplate(id, updates);
  }

  async deleteLogTemplate(id: string): Promise<void> {
    return dataService.deleteLogTemplate(id);
  }

  // Tab operations
  async getTabs(): Promise<Tab[]> {
    return dataService.getTabs();
  }

  async createTab(tab: Omit<Tab, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tab> {
    return dataService.createTab(tab);
  }

  async updateTab(id: string, updates: Partial<Tab>): Promise<void> {
    return dataService.updateTab(id, updates);
  }

  async deleteTab(id: string): Promise<void> {
    return dataService.deleteTab(id);
  }

  // Date-based queries
  async getLogEntriesByDate(date: Date): Promise<LogEntry[]> {
    const entries = await this.getLogEntries();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= targetDate && entryDate < nextDate;
    });
  }

  async getLogEntriesByDateRange(startDate: Date, endDate: Date): Promise<LogEntry[]> {
    const entries = await this.getLogEntries();
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  }

  // Analytics and statistics
  async getLogEntryCount(startDate?: Date, endDate?: Date): Promise<number> {
    let entries = await this.getLogEntries();
    
    if (startDate && endDate) {
      entries = await this.getLogEntriesByDateRange(startDate, endDate);
    }
    
    return entries.length;
  }

  async getMostUsedTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
    const entries = await this.getLogEntries();
    const tagCounts: { [key: string]: number } = {};
    
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async getLogEntryStats(startDate?: Date, endDate?: Date): Promise<{
    totalEntries: number;
    averageEntriesPerDay: number;
    mostActiveDay: string;
    mostUsedTags: string[];
  }> {
    let entries = await this.getLogEntries();
    
    if (startDate && endDate) {
      entries = await this.getLogEntriesByDateRange(startDate, endDate);
    }
    
    const totalEntries = entries.length;
    const days = startDate && endDate 
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    const averageEntriesPerDay = totalEntries / days;
    
    // Find most active day
    const dayCounts: { [key: string]: number } = {};
    entries.forEach(entry => {
      const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';
    
    // Get most used tags
    const tagCounts: { [key: string]: number } = {};
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const mostUsedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    return {
      totalEntries,
      averageEntriesPerDay,
      mostActiveDay,
      mostUsedTags
    };
  }

  // Subscriptions
  subscribeToLogEntries(callback: (entries: LogEntry[]) => void): () => void {
    return dataService.subscribeToLogEntries(callback);
  }

  subscribeToLogTemplates(callback: (templates: LogTemplate[]) => void): () => void {
    return dataService.subscribeToLogTemplates(callback);
  }

  subscribeToTabs(callback: (tabs: Tab[]) => void): () => void {
    return dataService.subscribeToTabs(callback);
  }
}

export const dainandiniService = new DainandiniService();
