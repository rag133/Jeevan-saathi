import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { habitService, habitLogService, goalService, milestoneService, quickWinService } from '~/services/dataService';
import type { Habit, HabitLog, Goal, Milestone, QuickWin } from './types';

type AbhyasaState = {
  habits: Habit[];
  habitLogs: HabitLog[];
  goals: Goal[];
  milestones: Milestone[];
  quickWins: QuickWin[];
  loading: boolean;
  error: string | null;
  fetchAbhyasaData: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  addHabitLog: (log: Omit<HabitLog, 'id'>) => Promise<void>;
  updateHabitLog: (logId: string, updates: Partial<HabitLog>) => Promise<void>;
  deleteHabitLog: (logId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'startDate'>) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addMilestone: (milestone: Omit<Milestone, 'id'>) => Promise<void>;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  addQuickWin: (win: Omit<QuickWin, 'id' | 'createdAt'>) => Promise<void>;
  updateQuickWin: (winId: string, updates: Partial<QuickWin>) => Promise<void>;
  deleteQuickWin: (winId: string) => Promise<void>;
};

export const useAbhyasaStore = create<AbhyasaState>()(
  devtools(
    (set, get) => ({
      habits: [],
      habitLogs: [],
      goals: [],
      milestones: [],
      quickWins: [],
      loading: false,
      error: null,
      fetchAbhyasaData: async () => {
        set({ loading: true, error: null });
        try {
          const [habits, habitLogs, goals, milestones, quickWins] = await Promise.all([
            habitService.getAll(),
            habitLogService.getAll(),
            goalService.getAll(),
            milestoneService.getAll(),
            quickWinService.getAll(),
          ]);
          set({ habits, habitLogs, goals, milestones, quickWins, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },
      addHabit: async (habit) => {
        const currentHabits = get().habits;
        const optimisticHabit = { ...habit, id: 'temp-id', createdAt: new Date() } as Habit;
        set({ habits: [...currentHabits, optimisticHabit] });
        try {
          const newId = await habitService.add(habit);
          const newHabit = { ...habit, id: newId, createdAt: new Date() } as Habit;
          set({ habits: [...currentHabits, newHabit] });
        } catch (error) {
          set({ error: (error as Error).message, habits: currentHabits });
        }
      },
      updateHabit: async (habitId, updates) => {
        const currentHabits = get().habits;
        const updatedHabits = currentHabits.map((h) => (h.id === habitId ? { ...h, ...updates } : h));
        set({ habits: updatedHabits });
        try {
          await habitService.update(habitId, updates);
        } catch (error) {
          set({ error: (error as Error).message, habits: currentHabits });
        }
      },
      deleteHabit: async (habitId) => {
        const currentHabits = get().habits;
        const updatedHabits = currentHabits.filter((h) => h.id !== habitId);
        set({ habits: updatedHabits });
        try {
          await habitService.delete(habitId);
        } catch (error) {
          set({ error: (error as Error).message, habits: currentHabits });
        }
      },
      addHabitLog: async (log) => {
        const currentLogs = get().habitLogs;
        const optimisticLog = { ...log, id: 'temp-id' } as HabitLog;
        set({ habitLogs: [...currentLogs, optimisticLog] });
        try {
          const newId = await habitLogService.add(log);
          const newLog = { ...log, id: newId } as HabitLog;
          set({ habitLogs: [...currentLogs, newLog] });
        } catch (error) {
          set({ error: (error as Error).message, habitLogs: currentLogs });
        }
      },
      updateHabitLog: async (logId, updates) => {
        const currentLogs = get().habitLogs;
        const updatedLogs = currentLogs.map((l) => (l.id === logId ? { ...l, ...updates } : l));
        set({ habitLogs: updatedLogs });
        try {
          await habitLogService.update(logId, updates);
        } catch (error) {
          set({ error: (error as Error).message, habitLogs: currentLogs });
        }
      },
      deleteHabitLog: async (logId) => {
        const currentLogs = get().habitLogs;
        const updatedLogs = currentLogs.filter((l) => l.id !== logId);
        set({ habitLogs: updatedLogs });
        try {
          await habitLogService.delete(logId);
        } catch (error) {
          set({ error: (error as Error).message, habitLogs: currentLogs });
        }
      },
      addGoal: async (goal) => {
        const currentGoals = get().goals;
        const optimisticGoal = { ...goal, id: 'temp-id', startDate: new Date() } as Goal;
        set({ goals: [...currentGoals, optimisticGoal] });
        try {
          const newId = await goalService.add(goal);
          const newGoal = { ...goal, id: newId, startDate: new Date() } as Goal;
          set({ goals: [...currentGoals, newGoal] });
        } catch (error) {
          set({ error: (error as Error).message, goals: currentGoals });
        }
      },
      updateGoal: async (goalId, updates) => {
        const currentGoals = get().goals;
        const updatedGoals = currentGoals.map((g) => (g.id === goalId ? { ...g, ...updates } : g));
        set({ goals: updatedGoals });
        try {
          await goalService.update(goalId, updates);
        } catch (error) {
          set({ error: (error as Error).message, goals: currentGoals });
        }
      },
      deleteGoal: async (goalId) => {
        const currentGoals = get().goals;
        const updatedGoals = currentGoals.filter((g) => g.id !== goalId);
        set({ goals: updatedGoals });
        try {
          await goalService.delete(goalId);
        } catch (error) {
          set({ error: (error as Error).message, goals: currentGoals });
        }
      },
      addMilestone: async (milestone) => {
        const currentMilestones = get().milestones;
        const optimisticMilestone = { ...milestone, id: 'temp-id' } as Milestone;
        set({ milestones: [...currentMilestones, optimisticMilestone] });
        try {
          const newId = await milestoneService.add(milestone);
          const newMilestone = { ...milestone, id: newId } as Milestone;
          set({ milestones: [...currentMilestones, newMilestone] });
        } catch (error) {
          set({ error: (error as Error).message, milestones: currentMilestones });
        }
      },
      updateMilestone: async (milestoneId, updates) => {
        const currentMilestones = get().milestones;
        const updatedMilestones = currentMilestones.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m));
        set({ milestones: updatedMilestones });
        try {
          await milestoneService.update(milestoneId, updates);
        } catch (error) {
          set({ error: (error as Error).message, milestones: currentMilestones });
        }
      },
      deleteMilestone: async (milestoneId) => {
        const currentMilestones = get().milestones;
        const updatedMilestones = currentMilestones.filter((m) => m.id !== milestoneId);
        set({ milestones: updatedMilestones });
        try {
          await milestoneService.delete(milestoneId);
        } catch (error) {
          set({ error: (error as Error).message, milestones: currentMilestones });
        }
      },
      addQuickWin: async (win) => {
        const currentWins = get().quickWins;
        const optimisticWin = { ...win, id: 'temp-id', createdAt: new Date() } as QuickWin;
        set({ quickWins: [...currentWins, optimisticWin] });
        try {
          const newId = await quickWinService.add(win);
          const newWin = { ...win, id: newId, createdAt: new Date() } as QuickWin;
          set({ quickWins: [...currentWins, newWin] });
        } catch (error) {
          set({ error: (error as Error).message, quickWins: currentWins });
        }
      },
      updateQuickWin: async (winId, updates) => {
        const currentWins = get().quickWins;
        const updatedWins = currentWins.map((w) => (w.id === winId ? { ...w, ...updates } : w));
        set({ quickWins: updatedWins });
        try {
          await quickWinService.update(winId, updates);
        } catch (error) {
          set({ error: (error as Error).message, quickWins: currentWins });
        }
      },
      deleteQuickWin: async (winId) => {
        const currentWins = get().quickWins;
        const updatedWins = currentWins.filter((w) => w.id !== winId);
        set({ quickWins: updatedWins });
        try {
          await quickWinService.delete(winId);
        } catch (error) {
          set({ error: (error as Error).message, quickWins: currentWins });
        }
      },
    }),
    { name: 'abhyasa-store' }
  )
);
