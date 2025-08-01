import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { logService, logTemplateService, focusService } from '~/services/dataService';
import type { Log, LogTemplate, Focus } from './types';

type DainandiniState = {
  logs: Log[];
  logTemplates: LogTemplate[];
  foci: Focus[];
  loading: boolean;
  error: string | null;
  fetchDainandiniData: () => Promise<void>;
  addLog: (log: Omit<Log, 'id' | 'createdAt'>) => Promise<void>;
  updateLog: (logId: string, updates: Partial<Log>) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  addLogTemplate: (template: Omit<LogTemplate, 'id'>) => Promise<void>;
  updateLogTemplate: (templateId: string, updates: Partial<LogTemplate>) => Promise<void>;
  deleteLogTemplate: (templateId: string) => Promise<void>;
  addFocus: (focus: Omit<Focus, 'id'>) => Promise<void>;
  updateFocus: (focusId: string, updates: Partial<Focus>) => Promise<void>;
  deleteFocus: (focusId: string) => Promise<void>;
};

export const useDainandiniStore = create<DainandiniState>()(
  devtools(
    (set, get) => ({
      logs: [],
      logTemplates: [],
      foci: [],
      loading: false,
      error: null,
      fetchDainandiniData: async () => {
        set({ loading: true, error: null });
        try {
          const [logs, logTemplates, foci] = await Promise.all([
            logService.getAll(),
            logTemplateService.getAll(),
            focusService.getAll(),
          ]);
          set({ logs, logTemplates, foci, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },
      addLog: async (log) => {
        const currentLogs = get().logs;
        const optimisticLog = { ...log, id: 'temp-id', createdAt: new Date() } as Log;
        set({ logs: [...currentLogs, optimisticLog] });
        try {
          const newId = await logService.add(log);
          const newLog = { ...log, id: newId, createdAt: new Date() } as Log;
          set({ logs: [...currentLogs, newLog] });
        } catch (error) {
          set({ error: (error as Error).message, logs: currentLogs });
        }
      },
      updateLog: async (logId, updates) => {
        const currentLogs = get().logs;
        const updatedLogs = currentLogs.map((l) => (l.id === logId ? { ...l, ...updates } : l));
        set({ logs: updatedLogs });
        try {
          await logService.update(logId, updates);
        } catch (error) {
          set({ error: (error as Error).message, logs: currentLogs });
        }
      },
      deleteLog: async (logId) => {
        const currentLogs = get().logs;
        const updatedLogs = currentLogs.filter((l) => l.id !== logId);
        set({ logs: updatedLogs });
        try {
          await logService.delete(logId);
        } catch (error) {
          set({ error: (error as Error).message, logs: currentLogs });
        }
      },
      addLogTemplate: async (template) => {
        const currentTemplates = get().logTemplates;
        const optimisticTemplate = { ...template, id: 'temp-id' } as LogTemplate;
        set({ logTemplates: [...currentTemplates, optimisticTemplate] });
        try {
          const newId = await logTemplateService.add(template);
          const newTemplate = { ...template, id: newId } as LogTemplate;
          set({ logTemplates: [...currentTemplates, newTemplate] });
        } catch (error) {
          set({ error: (error as Error).message, logTemplates: currentTemplates });
        }
      },
      updateLogTemplate: async (templateId, updates) => {
        const currentTemplates = get().logTemplates;
        const updatedTemplates = currentTemplates.map((t) => (t.id === templateId ? { ...t, ...updates } : t));
        set({ logTemplates: updatedTemplates });
        try {
          await logTemplateService.update(templateId, updates);
        } catch (error) {
          set({ error: (error as Error).message, logTemplates: currentTemplates });
        }
      },
      deleteLogTemplate: async (templateId) => {
        const currentTemplates = get().logTemplates;
        const updatedTemplates = currentTemplates.filter((t) => t.id !== templateId);
        set({ logTemplates: updatedTemplates });
        try {
          await logTemplateService.delete(templateId);
        } catch (error) {
          set({ error: (error as Error).message, logTemplates: currentTemplates });
        }
      },
      addFocus: async (focus) => {
        const currentFoci = get().foci;
        const optimisticFocus = { ...focus, id: 'temp-id' } as Focus;
        set({ foci: [...currentFoci, optimisticFocus] });
        try {
          const newId = await focusService.add(focus);
          const newFocus = { ...focus, id: newId } as Focus;
          set({ foci: [...currentFoci, newFocus] });
        } catch (error) {
          set({ error: (error as Error).message, foci: currentFoci });
        }
      },
      updateFocus: async (focusId, updates) => {
        const currentFoci = get().foci;
        const updatedFoci = currentFoci.map((f) => (f.id === focusId ? { ...f, ...updates } : f));
        set({ foci: updatedFoci });
        try {
          await focusService.update(focusId, updates);
        } catch (error) {
          set({ error: (error as Error).message, foci: currentFoci });
        }
      },
      deleteFocus: async (focusId) => {
        const currentFoci = get().foci;
        const updatedFoci = currentFoci.filter((f) => f.id !== focusId);
        set({ foci: updatedFoci });
        try {
          await focusService.delete(focusId);
        } catch (error) {
          set({ error: (error as Error).message, foci: currentFoci });
        }
      },
    }),
    { name: 'dainandini-store' }
  )
);
