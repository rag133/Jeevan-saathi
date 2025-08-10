import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { habitService, habitLogService, goalService, milestoneService, quickWinService } from '../services/dataService';
import type { Habit, HabitLog, Goal, Milestone, QuickWin } from '../types';

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
        const optimisticHabit = { ...habit, id: `temp-${Date.now()}`, createdAt: new Date() } as Habit;
        const previousHabits = get().habits;
        set({ habits: [...previousHabits, optimisticHabit] });
        try {
          const newId = await habitService.add(habit);
          set((state) => ({
            habits: state.habits.map((h) => (h.id === optimisticHabit.id ? { ...h, id: newId } : h)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, habits: previousHabits });
        }
      },
      updateHabit: async (habitId, updates) => {
        const previousHabits = get().habits;
        const updatedHabits = previousHabits.map((h) =>
          h.id === habitId ? { ...h, ...updates } : h
        );
        set({ habits: updatedHabits });
        try {
          await habitService.update(habitId, updates);
        } catch (error) {
          set({ error: (error as Error).message, habits: previousHabits });
        }
      },
      deleteHabit: async (habitId) => {
        const previousHabits = get().habits;
        const updatedHabits = previousHabits.filter((h) => h.id !== habitId);
        set({ habits: updatedHabits });
        try {
          await habitService.delete(habitId);
        } catch (error) {
          set({ error: (error as Error).message, habits: previousHabits });
        }
      },
      addHabitLog: async (log) => {
        const optimisticLog = { ...log, id: `temp-${Date.now()}` } as HabitLog;
        const previousLogs = get().habitLogs;
        set({ habitLogs: [...previousLogs, optimisticLog] });
        try {
          const newId = await habitLogService.add(log);
          set((state) => ({
            habitLogs: state.habitLogs.map((l) => (l.id === optimisticLog.id ? { ...l, id: newId } : l)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, habitLogs: previousLogs });
        }
      },
      updateHabitLog: async (logId, updates) => {
        const previousLogs = get().habitLogs;
        const updatedLogs = previousLogs.map((l) =>
          l.id === logId ? { ...l, ...updates } : l
        );
        set({ habitLogs: updatedLogs });
        try {
          await habitLogService.update(logId, updates);
        } catch (error) {
          set({ error: (error as Error).message, habitLogs: previousLogs });
        }
      },
      deleteHabitLog: async (logId) => {
        const previousLogs = get().habitLogs;
        const updatedLogs = previousLogs.filter((l) => l.id !== logId);
        set({ habitLogs: updatedLogs });
        try {
          await habitLogService.delete(logId);
        } catch (error) {
          set({ error: (error as Error).message, habitLogs: previousLogs });
        }
      },
      addGoal: async (goal) => {
        const optimisticGoal = { ...goal, id: `temp-${Date.now()}`, startDate: new Date() } as Goal;
        const previousGoals = get().goals;
        set({ goals: [...previousGoals, optimisticGoal] });
        try {
          const newId = await goalService.add(goal);
          set((state) => ({
            goals: state.goals.map((g) => (g.id === optimisticGoal.id ? { ...g, id: newId } : g)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, goals: previousGoals });
        }
      },
      updateGoal: async (goalId, updates) => {
        const previousGoals = get().goals;
        const updatedGoals = previousGoals.map((g) =>
          g.id === goalId ? { ...g, ...updates } : g
        );
        set({ goals: updatedGoals });
        try {
          await goalService.update(goalId, updates);
        } catch (error) {
          set({ error: (error as Error).message, goals: previousGoals });
        }
      },
      deleteGoal: async (goalId) => {
        const previousGoals = get().goals;
        const updatedGoals = previousGoals.filter((g) => g.id !== goalId);
        set({ goals: updatedGoals });
        try {
          await goalService.delete(goalId);
        } catch (error) {
          set({ error: (error as Error).message, goals: previousGoals });
        }
      },
      addMilestone: async (milestone) => {
        const optimisticMilestone = { ...milestone, id: `temp-${Date.now()}` } as Milestone;
        const previousMilestones = get().milestones;
        set({ milestones: [...previousMilestones, optimisticMilestone] });
        try {
          const newId = await milestoneService.add(milestone);
          set((state) => ({
            milestones: state.milestones.map((m) =>
              m.id === optimisticMilestone.id ? { ...m, id: newId } : m
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message, milestones: previousMilestones });
        }
      },
      updateMilestone: async (milestoneId, updates) => {
        const previousMilestones = get().milestones;
        const updatedMilestones = previousMilestones.map((m) =>
          m.id === milestoneId ? { ...m, ...updates } : m
        );
        set({ milestones: updatedMilestones });
        try {
          await milestoneService.update(milestoneId, updates);
        } catch (error) {
          set({ error: (error as Error).message, milestones: previousMilestones });
        }
      },
      deleteMilestone: async (milestoneId) => {
        const previousMilestones = get().milestones;
        const updatedMilestones = previousMilestones.filter((m) => m.id !== milestoneId);
        set({ milestones: updatedMilestones });
        try {
          await milestoneService.delete(milestoneId);
        } catch (error) {
          set({ error: (error as Error).message, milestones: previousMilestones });
        }
      },
      addQuickWin: async (win) => {
        const optimisticWin = { ...win, id: `temp-${Date.now()}`, createdAt: new Date() } as QuickWin;
        const previousWins = get().quickWins;
        set({ quickWins: [...previousWins, optimisticWin] });
        try {
          const newId = await quickWinService.add(win);
          set((state) => ({
            quickWins: state.quickWins.map((w) => (w.id === optimisticWin.id ? { ...w, id: newId } : w)),
          }));
        } catch (error) {
          set({ error: (error as Error).message, quickWins: previousWins });
        }
      },
      updateQuickWin: async (winId, updates) => {
        const previousWins = get().quickWins;
        const updatedWins = previousWins.map((w) =>
          w.id === winId ? { ...w, ...updates } : w
        );
        set({ quickWins: updatedWins });
        try {
          await quickWinService.update(winId, updates);
        } catch (error) {
          set({ error: (error as Error).message, quickWins: previousWins });
        }
      },
      deleteQuickWin: async (winId) => {
        const previousWins = get().quickWins;
        const updatedWins = previousWins.filter((w) => w.id !== winId);
        set({ quickWins: updatedWins });
        try {
          await quickWinService.delete(winId);
        } catch (error) {
          set({ error: (error as Error).message, quickWins: previousWins });
        }
      },
    }),
    { name: 'abhyasa-store' }
  )
);
