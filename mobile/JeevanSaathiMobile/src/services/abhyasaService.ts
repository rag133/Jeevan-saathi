import { dataService } from './dataService';
import { Habit, Goal, Milestone, QuickWin, HabitLog } from '../types';

export class AbhyasaService {
  // Goal operations
  async getGoals(): Promise<Goal[]> {
    return dataService.getDocuments<Goal>('goals');
  }

  async getGoal(goalId: string): Promise<Goal | null> {
    return dataService.getDocument<Goal>('goals', goalId);
  }

  async createGoal(goal: Omit<Goal, 'id'>): Promise<string> {
    return dataService.addDocument<Goal>('goals', goal);
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    return dataService.updateDocument<Goal>('goals', goalId, updates);
  }

  async deleteGoal(goalId: string): Promise<void> {
    return dataService.deleteDocument('goals', goalId);
  }

  // Habit operations
  async getHabits(): Promise<Habit[]> {
    return dataService.getDocuments<Habit>('habits');
  }

  async getHabit(habitId: string): Promise<Habit | null> {
    return dataService.getDocument<Habit>('habits', habitId);
  }

  async createHabit(habit: Omit<Habit, 'id'>): Promise<string> {
    return dataService.addDocument<Habit>('habits', habit);
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    return dataService.updateDocument<Habit>('habits', habitId, updates);
  }

  async deleteHabit(habitId: string): Promise<void> {
    return dataService.deleteDocument('habits', habitId);
  }

  // Habit logging
  async getHabitLogs(habitId?: string): Promise<HabitLog[]> {
    if (habitId) {
      return dataService.getDocuments<HabitLog>('habitLogs');
    }
    return dataService.getDocuments<HabitLog>('habitLogs');
  }

  async createHabitLog(log: Omit<HabitLog, 'id'>): Promise<string> {
    return dataService.addDocument<HabitLog>('habitLogs', log);
  }

  async updateHabitLog(logId: string, updates: Partial<HabitLog>): Promise<void> {
    return dataService.updateDocument<HabitLog>('habitLogs', logId, updates);
  }

  // Milestone operations
  async getMilestones(goalId?: string): Promise<Milestone[]> {
    if (goalId) {
      return dataService.getDocuments<Milestone>('milestones');
    }
    return dataService.getDocuments<Milestone>('milestones');
  }

  async createMilestone(milestone: Omit<Milestone, 'id'>): Promise<string> {
    return dataService.addDocument<Milestone>('milestones', milestone);
  }

  async updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<void> {
    return dataService.updateDocument<Milestone>('milestones', milestoneId, updates);
  }

  // Quick Win operations
  async getQuickWins(): Promise<QuickWin[]> {
    return dataService.getDocuments<QuickWin>('quickWins');
  }

  async createQuickWin(quickWin: Omit<QuickWin, 'id'>): Promise<string> {
    return dataService.addDocument<QuickWin>('quickWins', quickWin);
  }

  // Real-time subscriptions
  subscribeToGoals(callback: (goals: Goal[]) => void) {
    return dataService.subscribeToCollection<Goal>('goals', callback);
  }

  subscribeToHabits(callback: (habits: Habit[]) => void) {
    return dataService.subscribeToCollection<Habit>('habits', callback);
  }

  subscribeToHabitLogs(callback: (logs: HabitLog[]) => void) {
    return dataService.subscribeToCollection<HabitLog>('habitLogs', callback);
  }

  // Analytics and insights
  async getHabitStreak(habitId: string): Promise<number> {
    const logs = await this.getHabitLogs(habitId);
    // Calculate streak logic here
    return 0; // Placeholder
  }

  async getGoalProgress(goalId: string): Promise<number> {
    const goal = await this.getGoal(goalId);
    const milestones = await this.getMilestones(goalId);
    
    if (!goal || milestones.length === 0) return 0;
    
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    return (completedMilestones / milestones.length) * 100;
  }

  // Search and filtering
  async searchHabits(query: string): Promise<Habit[]> {
    const habits = await this.getHabits();
    return habits.filter(habit => 
      habit.name.toLowerCase().includes(query.toLowerCase()) ||
      habit.description?.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getHabitsByCategory(category: string): Promise<Habit[]> {
    const habits = await this.getHabits();
    return habits.filter(habit => habit.category === category);
  }

  async getActiveHabits(): Promise<Habit[]> {
    const habits = await this.getHabits();
    return habits.filter(habit => habit.status === 'active');
  }
}

export const abhyasaService = new AbhyasaService();
export default abhyasaService;
