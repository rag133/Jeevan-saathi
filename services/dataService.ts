import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './authService';

// Import types
import type { Task, List, Tag, ListFolder, TagFolder } from '../modules/kary/types';
import type { Log, LogTemplate, Focus } from '../modules/dainandini/types';
import type { Habit, HabitLog, Goal, Milestone, QuickWin } from '../modules/abhyasa/types';

import { habits, initialGoals, initialMilestones, initialQuickWins } from '../modules/abhyasa/data';
import { customLists, listFolders, tags, tagFolders } from '../modules/kary/data';
import { initialFoci } from '../modules/dainandini/data';

// Type for Firestore documents (includes id)
type FirestoreDoc<T> = T & { id: string };

// Helper function to get user collection reference
const getUserCollection = (collectionName: string) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  return collection(db, 'users', user.uid, collectionName);
};

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
      converted[key] = convertTimestamps(converted[key]);
    } else if (Array.isArray(converted[key])) {
      converted[key] = converted[key].map((item: any) => 
        typeof item === 'object' ? convertTimestamps(item) : item
      );
    }
  });
  
  return converted;
};

// ============= KARY MODULE =============

// Tasks
export const addTask = async (taskData: Omit<Task, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Sanitize task data to prevent Firestore errors with undefined values
  const taskToAdd = {
    ...taskData,
    createdAt: new Date(),
    userId: user.uid,
    // Ensure optional fields have valid values (null or default)
    parentId: taskData.parentId || null,
    completionDate: taskData.completionDate || null,
    dueDate: taskData.dueDate || null,
    reminder: taskData.reminder || false,
    tags: taskData.tags || [],
    description: taskData.description || '',
    priority: taskData.priority || null,
    source: taskData.source || null,
  };

  const docRef = await addDoc(getUserCollection('tasks'), taskToAdd);
  return docRef.id;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
  return updateDoc(taskRef, updates);
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
  return deleteDoc(taskRef);
};

export const getUserTasks = async (): Promise<FirestoreDoc<Task>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('tasks'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

// Lists
export const addList = async (listData: Omit<List, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const listToAdd = {
    ...listData,
    createdAt: new Date(),
    userId: user.uid,
    folderId: listData.folderId || null,
  };

  const docRef = await addDoc(getUserCollection('lists'), listToAdd);
  return docRef.id;
};

export const updateList = async (listId: string, updates: Partial<List>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const listRef = doc(db, 'users', user.uid, 'lists', listId);
  return updateDoc(listRef, updates);
};

export const deleteList = async (listId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const listRef = doc(db, 'users', user.uid, 'lists', listId);
  return deleteDoc(listRef);
};

export const getUserLists = async (): Promise<FirestoreDoc<List>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('lists'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

// Tags
export const addTag = async (tagData: Omit<Tag, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const docRef = await addDoc(getUserCollection('tags'), {
    ...tagData,
    createdAt: new Date(),
    userId: user.uid
  });
  return docRef.id;
};

export const updateTag = async (tagId: string, updates: Partial<Tag>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const tagRef = doc(db, 'users', user.uid, 'tags', tagId);
  return updateDoc(tagRef, updates);
};

export const deleteTag = async (tagId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const tagRef = doc(db, 'users', user.uid, 'tags', tagId);
  return deleteDoc(tagRef);
};

export const getUserTags = async (): Promise<FirestoreDoc<Tag>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('tags'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};



// List Folders
export const addListFolder = async (folderData: Omit<ListFolder, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const docRef = await addDoc(getUserCollection('listFolders'), {
    ...folderData,
    userId: user.uid
  });
  return docRef.id;
};

export const updateListFolder = async (folderId: string, updates: Partial<ListFolder>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const folderRef = doc(db, 'users', user.uid, 'listFolders', folderId);
  return updateDoc(folderRef, updates);
};

export const deleteListFolder = async (folderId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const folderRef = doc(db, 'users', user.uid, 'listFolders', folderId);
  return deleteDoc(folderRef);
};

export const getUserListFolders = async (): Promise<FirestoreDoc<ListFolder>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const snapshot = await getDocs(getUserCollection('listFolders'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Tag Folders
export const addTagFolder = async (folderData: Omit<TagFolder, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const docRef = await addDoc(getUserCollection('tagFolders'), {
    ...folderData,
    userId: user.uid
  });
  return docRef.id;
};

export const updateTagFolder = async (folderId: string, updates: Partial<TagFolder>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const folderRef = doc(db, 'users', user.uid, 'tagFolders', folderId);
  return updateDoc(folderRef, updates);
};

export const deleteTagFolder = async (folderId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const folderRef = doc(db, 'users', user.uid, 'tagFolders', folderId);
  return deleteDoc(folderRef);
};







export const getUserTagFolders = async (): Promise<FirestoreDoc<TagFolder>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const snapshot = await getDocs(getUserCollection('tagFolders'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ============= DAINANDINI MODULE =============

// Logs
export const addLog = async (logData: Omit<Log, 'id' | 'createdAt'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const docRef = await addDoc(getUserCollection('logs'), {
    ...logData,
    createdAt: new Date(),
    userId: user.uid
  });
  return docRef.id;
};

export const updateLog = async (logId: string, updates: Partial<Log>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const logRef = doc(db, 'users', user.uid, 'logs', logId);
  return updateDoc(logRef, updates);
};

export const deleteLog = async (logId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const logRef = doc(db, 'users', user.uid, 'logs', logId);
  return deleteDoc(logRef);
};

export const getUserLogs = async (): Promise<FirestoreDoc<Log>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('logs'), orderBy('logDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

// Log Templates
export const addLogTemplate = async (templateData: Omit<LogTemplate, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const templateToAdd = {
    ...templateData,
    userId: user.uid,
    checklist: templateData.checklist || null,
    rating: templateData.rating || null,
  };

  const docRef = await addDoc(getUserCollection('logTemplates'), templateToAdd);
  return docRef.id;
};

export const updateLogTemplate = async (templateId: string, updates: Partial<LogTemplate>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const templateRef = doc(db, 'users', user.uid, 'logTemplates', templateId);
  return updateDoc(templateRef, updates);
};

export const deleteLogTemplate = async (templateId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const templateRef = doc(db, 'users', user.uid, 'logTemplates', templateId);
  return deleteDoc(templateRef);
};

export const getUserLogTemplates = async (): Promise<FirestoreDoc<LogTemplate>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const snapshot = await getDocs(getUserCollection('logTemplates'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Focus Areas
export const addFocus = async (focusData: Omit<Focus, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const docRef = await addDoc(getUserCollection('foci'), {
    ...focusData,
    userId: user.uid
  });
  return docRef.id;
};

export const updateFocus = async (focusId: string, updates: Partial<Focus>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const focusRef = doc(db, 'users', user.uid, 'foci', focusId);
  return updateDoc(focusRef, updates);
};

export const deleteFocus = async (focusId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const focusRef = doc(db, 'users', user.uid, 'foci', focusId);
  return deleteDoc(focusRef);
};

export const getUserFoci = async (): Promise<FirestoreDoc<Focus>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const snapshot = await getDocs(getUserCollection('foci'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToUserFoci = (callback: (foci: FirestoreDoc<Focus>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('foci'));
  return onSnapshot(q, (snapshot) => {
    const foci = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(foci);
  });
};

// ============= ABHYASA MODULE =============

// Goals
export const addGoal = async (goalData: Omit<Goal, 'id' | 'startDate'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const goalToAdd = {
    ...goalData,
    startDate: new Date(),
    userId: user.uid,
    targetEndDate: goalData.targetEndDate || null,
  };

  const docRef = await addDoc(getUserCollection('goals'), goalToAdd);
  return docRef.id;
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
  return updateDoc(goalRef, updates);
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
  return deleteDoc(goalRef);
};

export const getUserGoals = async (): Promise<FirestoreDoc<Goal>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('goals'), orderBy('startDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

// Milestones
export const addMilestone = async (milestoneData: Omit<Milestone, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const milestoneToAdd = {
    ...milestoneData,
    userId: user.uid,
    description: milestoneData.description || '',
    targetEndDate: milestoneData.targetEndDate || null,
    focusAreaId: milestoneData.focusAreaId || null,
  };

  const docRef = await addDoc(getUserCollection('milestones'), milestoneToAdd);
  return docRef.id;
};

export const updateMilestone = async (milestoneId: string, updates: Partial<Milestone>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const milestoneRef = doc(db, 'users', user.uid, 'milestones', milestoneId);
  return updateDoc(milestoneRef, updates);
};

export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const milestoneRef = doc(db, 'users', user.uid, 'milestones', milestoneId);
  return deleteDoc(milestoneRef);
};

export const getUserMilestones = async (): Promise<FirestoreDoc<Milestone>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('milestones'), orderBy('startDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

// Quick Wins
export const addQuickWin = async (quickWinData: Omit<QuickWin, 'id' | 'createdAt'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const docRef = await addDoc(getUserCollection('quickWins'), {
    ...quickWinData,
    createdAt: new Date(),
    userId: user.uid
  });
  return docRef.id;
};

export const updateQuickWin = async (quickWinId: string, updates: Partial<QuickWin>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const quickWinRef = doc(db, 'users', user.uid, 'quickWins', quickWinId);
  return updateDoc(quickWinRef, updates);
};

export const deleteQuickWin = async (quickWinId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const quickWinRef = doc(db, 'users', user.uid, 'quickWins', quickWinId);
  return deleteDoc(quickWinRef);
};

export const getUserQuickWins = async (): Promise<FirestoreDoc<QuickWin>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('quickWins'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

// Habits
export const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const habitToAdd = {
    ...habitData,
    createdAt: new Date(),
    userId: user.uid,
    target: habitData.target || null,
    targetComparison: habitData.targetComparison || null,
    targetType: habitData.targetType || null,
    checklist: habitData.checklist || [],
    milestoneId: habitData.milestoneId || null,
    goalId: habitData.goalId || null,
    focusAreaId: habitData.focusAreaId || null,
    endDate: habitData.endDate || null,
    reminders: habitData.reminders || [],
  };

  const docRef = await addDoc(getUserCollection('habits'), habitToAdd);
  return docRef.id;
};

export const updateHabit = async (habitId: string, updates: Partial<Habit>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const habitRef = doc(db, 'users', user.uid, 'habits', habitId);

  const cleanedUpdates: Partial<Habit> = {};
  for (const key in updates) {
    if (updates[key as keyof Partial<Habit>] !== undefined) {
      cleanedUpdates[key as keyof Partial<Habit>] = updates[key as keyof Partial<Habit>];
    }
  }

  return updateDoc(habitRef, cleanedUpdates);
};

export const deleteHabit = async (habitId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const habitRef = doc(db, 'users', user.uid, 'habits', habitId);
  return deleteDoc(habitRef);
};

export const getUserHabits = async (): Promise<FirestoreDoc<Habit>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('habits'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

// Habit Logs
export const addHabitLog = async (habitLogData: Omit<HabitLog, 'id'>): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const habitLogToAdd = {
    ...habitLogData,
    userId: user.uid,
    value: habitLogData.value || null,
    completedChecklistItems: habitLogData.completedChecklistItems || [],
  };

  const docRef = await addDoc(getUserCollection('habitLogs'), habitLogToAdd);
  return docRef.id;
};

export const updateHabitLog = async (habitLogId: string, updates: Partial<HabitLog>): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const habitLogRef = doc(db, 'users', user.uid, 'habitLogs', habitLogId);
  return updateDoc(habitLogRef, updates);
};

export const deleteHabitLog = async (habitLogId: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const habitLogRef = doc(db, 'users', user.uid, 'habitLogs', habitLogId);
  return deleteDoc(habitLogRef);
};

export const getUserHabitLogs = async (): Promise<FirestoreDoc<HabitLog>[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  const q = query(getUserCollection('habitLogs'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
};

export const subscribeToUserHabitLogs = (callback: (habitLogs: FirestoreDoc<HabitLog>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('habitLogs'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const habitLogs = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(habitLogs);
  });
};

// ============= REAL-TIME LISTENERS =============

export const subscribeToUserTasks = (callback: (tasks: FirestoreDoc<Task>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(tasks);
  });
};

export const subscribeToUserLogs = (callback: (logs: FirestoreDoc<Log>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('logs'), orderBy('logDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(logs);
  });
};

export const subscribeToUserHabits = (callback: (habits: FirestoreDoc<Habit>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('habits'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(habits);
  });
};

export const subscribeToUserGoals = (callback: (goals: FirestoreDoc<Goal>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('goals'), orderBy('startDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const goals = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(goals);
  });
};

export const subscribeToUserMilestones = (callback: (milestones: FirestoreDoc<Milestone>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('milestones'), orderBy('startDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const milestones = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(milestones);
  });
};

export const subscribeToUserQuickWins = (callback: (quickWins: FirestoreDoc<QuickWin>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('quickWins'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const quickWins = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(quickWins);
  });
};

export const subscribeToUserLogTemplates = (callback: (templates: FirestoreDoc<LogTemplate>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('logTemplates'));
  return onSnapshot(q, (snapshot) => {
    const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(templates);
  });
};

export const subscribeToUserLists = (callback: (lists: FirestoreDoc<List>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('lists'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const lists = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(lists);
  });
};

export const subscribeToUserTags = (callback: (tags: FirestoreDoc<Tag>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('tags'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tags = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    callback(tags);
  });
};

export const subscribeToUserListFolders = (callback: (listFolders: FirestoreDoc<ListFolder>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('listFolders'));
  return onSnapshot(q, (snapshot) => {
    const listFolders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(listFolders);
  });
};

export const subscribeToUserTagFolders = (callback: (tagFolders: FirestoreDoc<TagFolder>[]) => void) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const q = query(getUserCollection('tagFolders'));
  return onSnapshot(q, (snapshot) => {
    const tagFolders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tagFolders);
  });
};

// ============= BULK OPERATIONS =============

export const initializeUserData = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Initialize default foci for new users
  const { initialFoci } = await import('../modules/dainandini/data');
  
  const batch = writeBatch(db);
  
  // Add default focus areas
  initialFoci.forEach(focus => {
    const { id, ...dataWithoutId } = focus; // Destructure to remove id
    const docRef = doc(getUserCollection('foci')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  // Add default habits
  habits.forEach(habit => {
    const { id, ...dataWithoutId } = habit; // Destructure to remove id
    const docRef = doc(getUserCollection('habits')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  // Add default goals
  initialGoals.forEach(goal => {
    const { id, ...dataWithoutId } = goal; // Destructure to remove id
    const docRef = doc(getUserCollection('goals')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  // Add default milestones
  initialMilestones.forEach(milestone => {
    const { id, ...dataWithoutId } = milestone; // Destructure to remove id
    const docRef = doc(getUserCollection('milestones')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  // Add default quick wins
  initialQuickWins.forEach(quickWin => {
    const { id, ...dataWithoutId } = quickWin; // Destructure to remove id
    const docRef = doc(getUserCollection('quickWins')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  // Add default custom lists
  customLists.forEach(list => {
    const { id, ...dataWithoutId } = list; // Destructure to remove id
    const docRef = doc(getUserCollection('lists')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  // Add default list folders
  listFolders.forEach(folder => {
    const { id, ...dataWithoutId } = folder; // Destructure to remove id
    const docRef = doc(getUserCollection('listFolders')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  // Add default tags
  tags.forEach(tag => {
    const { id, ...dataWithoutId } = tag; // Destructure to remove id
    const docRef = doc(getUserCollection('tags')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  // Add default tag folders
  tagFolders.forEach(folder => {
    const { id, ...dataWithoutId } = folder; // Destructure to remove id
    const docRef = doc(getUserCollection('tagFolders')); // Let Firestore generate ID
    batch.set(docRef, { ...dataWithoutId, userId: user.uid });
  });

  await batch.commit();
};

// ============= UTILITY FUNCTIONS =============

export const getAllUserData = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const [tasks, logs, habits, goals, milestones, quickWins, logTemplates, lists, tags, foci, listFolders, tagFolders] = await Promise.all([
    getUserTasks(),
    getUserLogs(),
    getUserHabits(),
    getUserGoals(),
    getUserMilestones(),
    getUserQuickWins(),
    getUserLogTemplates(),
    getUserLists(),
    getUserTags(),
    getUserFoci(),
    getUserListFolders(),
    getUserTagFolders()
  ]);

  return {
    tasks,
    logs,
    habits,
    goals,
    milestones,
    quickWins,
    logTemplates,
    lists,
    tags,
    foci,
    listFolders,
    tagFolders
  };
};