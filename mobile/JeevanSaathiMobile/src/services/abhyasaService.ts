import { dataService } from './dataService';
import { 
  Habit, 
  Goal, 
  Milestone, 
  QuickWin, 
  HabitLog 
} from '../types';

export class AbhyasaService {
  // Goal methods
  async getGoals(): Promise<Goal[]> {
    return dataService.getGoals();
  }

  async getGoal(goalId: string): Promise<Goal | null> {
    // Note: getGoal method doesn't exist in DataService, using getGoals and filtering
    const goals = await dataService.getGoals();
    return goals.find(g => g.id === goalId) || null;
  }

  async createGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    return dataService.createGoal(goal);
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    return dataService.updateGoal(goalId, updates);
  }

  async deleteGoal(goalId: string): Promise<void> {
    return dataService.deleteGoal(goalId);
  }

  // Habit methods
  async getHabits(): Promise<Habit[]> {
    return dataService.getHabits();
  }

  async getHabit(habitId: string): Promise<Habit | null> {
    const habits = await dataService.getHabits();
    return habits.find(h => h.id === habitId) || null;
  }

  async createHabit(habit: Omit<Habit, 'id'>): Promise<Habit> {
    return dataService.createHabit(habit);
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    return dataService.updateHabit(habitId, updates);
  }

  async deleteHabit(habitId: string): Promise<void> {
    return dataService.deleteHabit(habitId);
  }

  // HabitLog methods
  async getHabitLogs(habitId?: string): Promise<HabitLog[]> {
    if (habitId) {
      const logs = await dataService.getHabitLogs();
      return logs.filter(log => log.habitId === habitId);
    }
    return dataService.getHabitLogs();
  }

  async createHabitLog(log: Omit<HabitLog, 'id'>): Promise<HabitLog> {
    return dataService.createHabitLog(log);
  }

  async updateHabitLog(logId: string, updates: Partial<HabitLog>): Promise<void> {
    return dataService.updateHabitLog(logId, updates);
  }

  // Milestone methods
  async getMilestones(goalId?: string): Promise<Milestone[]> {
    if (goalId) {
      const milestones = await dataService.getMilestones();
      return milestones.filter(m => m.goalId === goalId);
    }
    return dataService.getMilestones();
  }

  async createMilestone(milestone: Omit<Milestone, 'id'>): Promise<Milestone> {
    return dataService.createMilestone(milestone);
  }

  async updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<void> {
    return dataService.updateMilestone(milestoneId, updates);
  }

  async deleteMilestone(milestoneId: string): Promise<void> {
    return dataService.deleteMilestone(milestoneId);
  }

  // QuickWin methods
  async getQuickWins(): Promise<QuickWin[]> {
    return dataService.getQuickWins();
  }

  async createQuickWin(quickWin: Omit<QuickWin, 'id'>): Promise<QuickWin> {
    return dataService.createQuickWin(quickWin);
  }

  // Subscription methods
  subscribeToGoals(callback: (goals: Goal[]) => void) {
    return dataService.subscribeToGoals(callback);
  }

  subscribeToHabits(callback: (habits: Habit[]) => void) {
    return dataService.subscribeToHabits(callback);
  }

  subscribeToHabitLogs(callback: (logs: HabitLog[]) => void) {
    return dataService.subscribeToHabitLogs(callback);
  }

  // Analytics methods (placeholder implementations)
  async getHabitStreak(habitId: string): Promise<number> {
    const logs = await this.getHabitLogs(habitId);
    // Simple streak calculation - count consecutive days
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasLog = logs.some(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === checkDate.getTime();
      });
      
      if (hasLog) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  async getGoalProgress(goalId: string): Promise<number> {
    const milestones = await this.getMilestones(goalId);
    if (milestones.length === 0) return 0;
    
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    return (completedMilestones / milestones.length) * 100;
  }

  // Search and filter methods
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
