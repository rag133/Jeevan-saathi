import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { logService, logTemplateService, focusService } from '../services/dataService';
import type { Log, LogTemplate, Focus } from '../types';

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
          // TODO: Initialize default foci when data is available
          // For now, just set the existing foci
          set({ logs, logTemplates, foci, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },
      addLog: async (log) => {
        const optimisticLog = { ...log, id: `temp-${Date.now()}`, createdAt: new Date() } as Log;
        const previousLogs = get().logs;
        set({ logs: [...previousLogs, optimisticLog] });
        try {
          const newId = await logService.add(log);
          set((state) => ({
            logs: state.logs.map((l) => (l.id === optimisticLog.id ? { ...l, id: newId } : l)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, logs: previousLogs });
        }
      },
      updateLog: async (logId, updates) => {
        const previousLogs = get().logs;
        const updatedLogs = previousLogs.map((l) =>
          l.id === logId ? { ...l, ...updates } : l
        );
        set({ logs: updatedLogs });
        try {
          await logService.update(logId, updates);
        } catch (error) {
          set({ error: (error as Error).message, logs: previousLogs });
        }
      },
      deleteLog: async (logId) => {
        const previousLogs = get().logs;
        const updatedLogs = previousLogs.filter((l) => l.id !== logId);
        set({ logs: updatedLogs });
        try {
          await logService.delete(logId);
        } catch (error) {
          set({ error: (error as Error).message, logs: previousLogs });
        }
      },
      addLogTemplate: async (template) => {
        const optimisticTemplate = { ...template, id: `temp-${Date.now()}` } as LogTemplate;
        const previousTemplates = get().logTemplates;
        set({ logTemplates: [...previousTemplates, optimisticTemplate] });
        try {
          const newId = await logTemplateService.add(template);
          set((state) => ({
            logTemplates: state.logTemplates.map((t) =>
              t.id === optimisticTemplate.id ? { ...t, id: newId } : t
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message, logTemplates: previousTemplates });
        }
      },
      updateLogTemplate: async (templateId, updates) => {
        const previousTemplates = get().logTemplates;
        const updatedTemplates = previousTemplates.map((t) =>
          t.id === templateId ? { ...t, ...updates } : t
        );
        set({ logTemplates: updatedTemplates });
        try {
          await logTemplateService.update(templateId, updates);
        } catch (error) {
          set({ error: (error as Error).message, logTemplates: previousTemplates });
        }
      },
      deleteLogTemplate: async (templateId) => {
        const previousTemplates = get().logTemplates;
        const updatedTemplates = previousTemplates.filter((t) => t.id !== templateId);
        set({ logTemplates: updatedTemplates });
        try {
          await logTemplateService.delete(templateId);
        } catch (error) {
          set({ error: (error as Error).message, logTemplates: previousTemplates });
        }
      },
      addFocus: async (focus) => {
        // Check if focus with same name already exists
        const existingFoci = get().foci;
        const existingFocus = existingFoci.find(f => f.name === focus.name);
        if (existingFocus) {
          console.warn(`Focus with name "${focus.name}" already exists`);
          return;
        }
        
        const optimisticFocus = { ...focus, id: `temp-${Date.now()}` } as Focus;
        set({ foci: [...existingFoci, optimisticFocus] });
        try {
          const newId = await focusService.add(focus);
          set((state) => ({
            foci: state.foci.map((f) => (f.id === optimisticFocus.id ? { ...f, id: newId } : f)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, foci: existingFoci });
        }
      },
      updateFocus: async (focusId, updates) => {
        const previousFoci = get().foci;
        const updatedFoci = previousFoci.map((f) =>
          f.id === focusId ? { ...f, ...updates } : f
        );
        set({ foci: updatedFoci });
        try {
          await focusService.update(focusId, updates);
        } catch (error) {
          set({ error: (error as Error).message, foci: previousFoci });
        }
      },
      deleteFocus: async (focusId) => {
        const previousFoci = get().foci;
        const updatedFoci = previousFoci.filter((f) => f.id !== focusId);
        set({ foci: updatedFoci });
        try {
          await focusService.delete(focusId);
        } catch (error) {
          set({ error: (error as Error).message, foci: previousFoci });
        }
      },
    }),
    { name: 'dainandini-store' }
  )
);