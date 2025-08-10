import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { db, auth } from './firebase';
import { Task, List, Tag, ListFolder, TagFolder, Goal, Habit, HabitLog, Milestone, QuickWin, LogEntry, LogTemplate, Tab } from '../types';

// Data Service Class
class DataService {
  private currentUser: User | null = null;

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  // Helper method to get current user ID
  private getCurrentUserId(): string {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }
    return this.currentUser.uid;
  }

  // Helper method to get user collection reference (same as web app)
  private getUserCollection(collectionName: string) {
    const userId = this.getCurrentUserId();
    return collection(db, 'users', userId, collectionName);
  }

  // Helper method to convert Firestore timestamp to Date
  private convertTimestamp(timestamp: any): Date {
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    return timestamp;
  }

  // Helper method to convert data from Firestore
  private convertFromFirestore<T>(doc: any): T {
    const data = doc.data();
    if (!data) return doc as T;

    // Convert timestamps to dates
    const converted: any = {};
    Object.keys(data).forEach(key => {
      if (key === 'createdAt' || key === 'updatedAt' || key === 'dueDate' || key === 'targetDate' || key === 'date') {
        converted[key] = this.convertTimestamp(data[key]);
      } else {
        converted[key] = data[key];
      }
    });

    return { id: doc.id, ...converted } as T;
  }

  // Helper method to convert data for Firestore
  private convertToFirestore<T extends object>(data: T): any {
    const converted: any = {};
    Object.keys(data).forEach(key => {
      if (key === 'id') return; // Skip ID field
      if (key === 'createdAt' || key === 'updatedAt' || key === 'dueDate' || key === 'targetDate' || key === 'date') {
        converted[key] = data[key as keyof T] || serverTimestamp();
      } else {
        converted[key] = data[key as keyof T];
      }
    });
    return converted;
  }

  // Task Methods - Updated to use subcollections
  async getTasks(): Promise<Task[]> {
    try {
      const q = query(
        this.getUserCollection('tasks'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<Task>(doc));
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  async getTask(taskId: string): Promise<Task | null> {
    try {
      const docRef = doc(this.getUserCollection('tasks'), taskId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return this.convertFromFirestore<Task>(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting task:', error);
      throw error;
    }
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    try {
      const taskWithUserId = {
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('tasks'), this.convertToFirestore(taskWithUserId));
      return { id: docRef.id, ...taskWithUserId } as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('tasks'), taskId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('tasks'), taskId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // List Methods - Updated to use subcollections
  async getLists(): Promise<List[]> {
    try {
      const q = query(
        this.getUserCollection('lists'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<List>(doc));
    } catch (error) {
      console.error('Error getting lists:', error);
      throw error;
    }
  }

  async createList(listData: Partial<List>): Promise<List> {
    try {
      const listWithUserId = {
        ...listData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('lists'), this.convertToFirestore(listWithUserId));
      return { id: docRef.id, ...listWithUserId } as List;
    } catch (error) {
      console.error('Error creating list:', error);
      throw error;
    }
  }

  async updateList(listId: string, updates: Partial<List>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('lists'), listId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating list:', error);
      throw error;
    }
  }

  async deleteList(listId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('lists'), listId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting list:', error);
      throw error;
    }
  }

  // Tag Methods - Updated to use subcollections
  async getTags(): Promise<Tag[]> {
    try {
      const q = query(
        this.getUserCollection('tags'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<Tag>(doc));
    } catch (error) {
      console.error('Error getting tags:', error);
      throw error;
    }
  }

  async createTag(tagData: Partial<Tag>): Promise<Tag> {
    try {
      const tagWithUserId = {
        ...tagData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('tags'), this.convertToFirestore(tagWithUserId));
      return { id: docRef.id, ...tagWithUserId } as Tag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  async updateTag(tagId: string, updates: Partial<Tag>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('tags'), tagId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  }

  async deleteTag(tagId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('tags'), tagId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  // List Folder Methods - Updated to use subcollections
  async getListFolders(): Promise<ListFolder[]> {
    try {
      const q = query(
        this.getUserCollection('listFolders'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<ListFolder>(doc));
    } catch (error) {
      console.error('Error getting list folders:', error);
      throw error;
    }
  }

  async createListFolder(folderData: Partial<ListFolder>): Promise<ListFolder> {
    try {
      const folderWithUserId = {
        ...folderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('listFolders'), this.convertToFirestore(folderWithUserId));
      return { id: docRef.id, ...folderWithUserId } as ListFolder;
    } catch (error) {
      console.error('Error creating list folder:', error);
      throw error;
    }
  }

  async updateListFolder(folderId: string, updates: Partial<ListFolder>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('listFolders'), folderId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating list folder:', error);
      throw error;
    }
  }

  async deleteListFolder(folderId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('listFolders'), folderId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting list folder:', error);
      throw error;
    }
  }

  // Tag Folder Methods - Updated to use subcollections
  async getTagFolders(): Promise<TagFolder[]> {
    try {
      const q = query(
        this.getUserCollection('tagFolders'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<TagFolder>(doc));
    } catch (error) {
      console.error('Error getting tag folders:', error);
      throw error;
    }
  }

  async createTagFolder(folderData: Partial<TagFolder>): Promise<TagFolder> {
    try {
      const folderWithUserId = {
        ...folderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('tagFolders'), this.convertToFirestore(folderWithUserId));
      return { id: docRef.id, ...folderWithUserId } as TagFolder;
    } catch (error) {
      console.error('Error creating tag folder:', error);
      throw error;
    }
  }

  async updateTagFolder(folderId: string, updates: Partial<TagFolder>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('tagFolders'), folderId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating tag folder:', error);
      throw error;
    }
  }

  async deleteTagFolder(folderId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('tagFolders'), folderId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting tag folder:', error);
      throw error;
    }
  }

  // Goal Methods - Updated to use subcollections
  async getGoals(): Promise<Goal[]> {
    try {
      const q = query(
        this.getUserCollection('goals'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<Goal>(doc));
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  }

  async createGoal(goalData: Partial<Goal>): Promise<Goal> {
    try {
      const goalWithUserId = {
        ...goalData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('goals'), this.convertToFirestore(goalWithUserId));
      return { id: docRef.id, ...goalWithUserId } as Goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('goals'), goalId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('goals'), goalId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  // Habit Methods - Updated to use subcollections
  async getHabits(): Promise<Habit[]> {
    try {
      const q = query(
        this.getUserCollection('habits'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<Habit>(doc));
    } catch (error) {
      console.error('Error getting habits:', error);
      throw error;
    }
  }

  async createHabit(habitData: Partial<Habit>): Promise<Habit> {
    try {
      const habitWithUserId = {
        ...habitData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('habits'), this.convertToFirestore(habitWithUserId));
      return { id: docRef.id, ...habitWithUserId } as Habit;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('habits'), habitId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('habits'), habitId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // Habit Log Methods - Updated to use subcollections
  async getHabitLogs(): Promise<HabitLog[]> {
    try {
      const q = query(
        this.getUserCollection('habitLogs'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<HabitLog>(doc));
    } catch (error) {
      console.error('Error getting habit logs:', error);
      throw error;
    }
  }

  async createHabitLog(logData: Partial<HabitLog>): Promise<HabitLog> {
    try {
      const logWithUserId = {
        ...logData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('habitLogs'), this.convertToFirestore(logWithUserId));
      return { id: docRef.id, ...logWithUserId } as HabitLog;
    } catch (error) {
      console.error('Error creating habit log:', error);
      throw error;
    }
  }

  async updateHabitLog(logId: string, updates: Partial<HabitLog>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('habitLogs'), logId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating habit log:', error);
      throw error;
    }
  }

  async deleteHabitLog(logId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('habitLogs'), logId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting habit log:', error);
      throw error;
    }
  }

  // Milestone Methods - Updated to use subcollections
  async getMilestones(): Promise<Milestone[]> {
    try {
      const q = query(
        this.getUserCollection('milestones'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<Milestone>(doc));
    } catch (error) {
      console.error('Error getting milestones:', error);
      throw error;
    }
  }

  async createMilestone(milestoneData: Partial<Milestone>): Promise<Milestone> {
    try {
      const milestoneWithUserId = {
        ...milestoneData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('milestones'), this.convertToFirestore(milestoneWithUserId));
      return { id: docRef.id, ...milestoneWithUserId } as Milestone;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  }

  async updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('milestones'), milestoneId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  }

  async deleteMilestone(milestoneId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('milestones'), milestoneId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  }

  // Quick Win Methods - Updated to use subcollections
  async getQuickWins(): Promise<QuickWin[]> {
    try {
      const q = query(
        this.getUserCollection('quickWins'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<QuickWin>(doc));
    } catch (error) {
      console.error('Error getting quick wins:', error);
      throw error;
    }
  }

  async createQuickWin(quickWinData: Partial<QuickWin>): Promise<QuickWin> {
    try {
      const quickWinWithUserId = {
        ...quickWinData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('quickWins'), this.convertToFirestore(quickWinWithUserId));
      return { id: docRef.id, ...quickWinWithUserId } as QuickWin;
    } catch (error) {
      console.error('Error creating quick win:', error);
      throw error;
    }
  }

  async updateQuickWin(quickWinId: string, updates: Partial<QuickWin>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('quickWins'), quickWinId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating quick win:', error);
      throw error;
    }
  }

  async deleteQuickWin(quickWinId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('quickWins'), quickWinId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting quick win:', error);
      throw error;
    }
  }

  // Log Entry Methods - Updated to use subcollections
  async getLogEntries(): Promise<LogEntry[]> {
    try {
      const q = query(
        this.getUserCollection('logEntries'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<LogEntry>(doc));
    } catch (error) {
      console.error('Error getting log entries:', error);
      throw error;
    }
  }

  // Log Template Methods - Updated to use subcollections
  async getLogTemplates(): Promise<LogTemplate[]> {
    try {
      const q = query(
        this.getUserCollection('logTemplates'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<LogTemplate>(doc));
    } catch (error) {
      console.error('Error getting log templates:', error);
      throw error;
    }
  }

  // Tab Methods - Updated to use subcollections
  async getTabs(): Promise<Tab[]> {
    try {
      const q = query(
        this.getUserCollection('tabs'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFromFirestore<Tab>(doc));
    } catch (error) {
      console.error('Error getting tabs:', error);
      throw error;
    }
  }

  async createTab(tabData: Partial<Tab>): Promise<Tab> {
    try {
      const tabWithUserId = {
        ...tabData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('tabs'), this.convertToFirestore(tabWithUserId));
      return { id: docRef.id, ...tabWithUserId } as Tab;
    } catch (error) {
      console.error('Error creating tab:', error);
      throw error;
    }
  }

  async updateTab(tabId: string, updates: Partial<Tab>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('tabs'), tabId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating tab:', error);
      throw error;
    }
  }

  async deleteTab(tabId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('tabs'), tabId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting tab:', error);
      throw error;
    }
  }

  // Log Entry CRUD Methods - Updated to use subcollections
  async createLogEntry(entryData: Partial<LogEntry>): Promise<LogEntry> {
    try {
      const entryWithUserId = {
        ...entryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('logEntries'), this.convertToFirestore(entryWithUserId));
      return { id: docRef.id, ...entryWithUserId } as LogEntry;
    } catch (error) {
      console.error('Error creating log entry:', error);
      throw error;
    }
  }

  async updateLogEntry(entryId: string, updates: Partial<LogEntry>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('logEntries'), entryId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating log entry:', error);
      throw error;
    }
  }

  async deleteLogEntry(entryId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('logEntries'), entryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting log entry:', error);
      throw error;
    }
  }

  // Log Template CRUD Methods - Updated to use subcollections
  async createLogTemplate(templateData: Partial<LogTemplate>): Promise<LogTemplate> {
    try {
      const templateWithUserId = {
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const docRef = await addDoc(this.getUserCollection('logTemplates'), this.convertToFirestore(templateWithUserId));
      return { id: docRef.id, ...templateWithUserId } as LogTemplate;
    } catch (error) {
      console.error('Error creating log template:', error);
      throw error;
    }
  }

  async updateLogTemplate(templateId: string, updates: Partial<LogTemplate>): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('logTemplates'), templateId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      await updateDoc(docRef, this.convertToFirestore(updateData));
    } catch (error) {
      console.error('Error updating log template:', error);
      throw error;
    }
  }

  async deleteLogTemplate(templateId: string): Promise<void> {
    try {
      const docRef = doc(this.getUserCollection('logTemplates'), templateId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting log template:', error);
      throw error;
    }
  }

  // Real-time subscription methods - Updated to use subcollections
  subscribeToTasks(callback: (tasks: Task[]) => void) {
    const q = query(
      this.getUserCollection('tasks'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => this.convertFromFirestore<Task>(doc));
      callback(tasks);
    });
  }

  subscribeToLists(callback: (lists: List[]) => void) {
    const q = query(
      this.getUserCollection('lists'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const lists = querySnapshot.docs.map(doc => this.convertFromFirestore<List>(doc));
      callback(lists);
    });
  }

  subscribeToTags(callback: (tags: Tag[]) => void) {
    const q = query(
      this.getUserCollection('tags'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const tags = querySnapshot.docs.map(doc => this.convertFromFirestore<Tag>(doc));
      callback(tags);
    });
  }

  subscribeToLogEntries(callback: (entries: LogEntry[]) => void) {
    const q = query(
      this.getUserCollection('logEntries'),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const entries = querySnapshot.docs.map(doc => this.convertFromFirestore<LogEntry>(doc));
      callback(entries);
    });
  }

  subscribeToLogTemplates(callback: (templates: LogTemplate[]) => void) {
    const q = query(
      this.getUserCollection('logTemplates'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const templates = querySnapshot.docs.map(doc => this.convertFromFirestore<LogTemplate>(doc));
      callback(templates);
    });
  }

  subscribeToTabs(callback: (tabs: Tab[]) => void) {
    const q = query(
      this.getUserCollection('tabs'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const tabs = querySnapshot.docs.map(doc => this.convertFromFirestore<Tab>(doc));
      callback(tabs);
    });
  }

  subscribeToGoals(callback: (goals: Goal[]) => void) {
    const q = query(
      this.getUserCollection('goals'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const goals = querySnapshot.docs.map(doc => this.convertFromFirestore<Goal>(doc));
      callback(goals);
    });
  }

  subscribeToHabits(callback: (habits: Habit[]) => void) {
    const q = query(
      this.getUserCollection('habits'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const habits = querySnapshot.docs.map(doc => this.convertFromFirestore<Habit>(doc));
      callback(habits);
    });
  }

  subscribeToHabitLogs(callback: (logs: HabitLog[]) => void) {
    const q = query(
      this.getUserCollection('habitLogs'),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const logs = querySnapshot.docs.map(doc => this.convertFromFirestore<HabitLog>(doc));
      callback(logs);
    });
  }
}

// Export singleton instance
export const dataService = new DataService();
