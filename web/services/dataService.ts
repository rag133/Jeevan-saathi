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
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './authService';

// Import types
import type { Task, List, Tag, ListFolder, TagFolder } from '~/modules/kary/types';
import type { Log, LogTemplate, Focus } from '~/modules/dainandini/types';
import type { Habit, HabitLog, Goal, Milestone, QuickWin } from '~/modules/abhyasa/types';

import { initialGoals, initialMilestones, initialQuickWins } from '~/modules/abhyasa/data';
import { customLists, listFolders, tags, tagFolders } from '~/modules/kary/data';
import { initialFoci } from '~/modules/dainandini/data';

// Type for Firestore documents (includes id)
type FirestoreDoc<T> = T & { id: string };

// Helper function to get user collection reference
const getUserCollection = (collectionName: string) => {
  const user = getCurrentUser();
  if (!user) {
    console.warn('getUserCollection called without authenticated user');
    throw new Error('User not authenticated');
  }
  if (!user.uid) {
    console.warn('getUserCollection called with user but no UID');
    throw new Error('User UID not available');
  }
  return collection(db, 'users', user.uid, collectionName);
};

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (data: any): any => {
  if (!data) return data;

  const converted = { ...data };
  Object.keys(converted).forEach((key) => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (
      converted[key] &&
      typeof converted[key] === 'object' &&
      !Array.isArray(converted[key])
    ) {
      converted[key] = convertTimestamps(converted[key]);
    } else if (Array.isArray(converted[key])) {
      converted[key] = converted[key].map((item: any) =>
        typeof item === 'object' ? convertTimestamps(item) : item
      );
    }
  });

  return converted;
};

export const taskService = {
  add: async (taskData: Omit<Task, 'id'>): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const taskToAdd = {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.uid,
      completionDate: taskData.completionDate || null,
      dueDate: taskData.dueDate || null,
      reminder: taskData.reminder || false,
      tags: taskData.tags || [],
      description: taskData.description || '',
      priority: taskData.priority || '',
      subtasks: taskData.subtasks || [], // Initialize subtasks array
      source: taskData.source || null,
    };

    const docRef = await addDoc(getUserCollection('tasks'), taskToAdd);
    return docRef.id;
  },

  update: async (taskId: string, updates: Partial<Task>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    return updateDoc(taskRef, updates);
  },

  delete: async (taskId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    return deleteDoc(taskRef);
  },

  getAll: async (): Promise<FirestoreDoc<Task>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('tasks'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (tasks: FirestoreDoc<Task>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('tasks'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(tasks);
    });
  },
};

export const listService = {
  add: async (listData: Omit<List, 'id'>): Promise<string> => {
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
  },

  update: async (listId: string, updates: Partial<List>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const listRef = doc(db, 'users', user.uid, 'lists', listId);
    return updateDoc(listRef, updates);
  },

  delete: async (listId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const listRef = doc(db, 'users', user.uid, 'lists', listId);
    return deleteDoc(listRef);
  },

  getAll: async (): Promise<FirestoreDoc<List>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('lists'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (lists: FirestoreDoc<List>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('lists'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(lists);
    });
  },
};

export const tagService = {
  add: async (tagData: Omit<Tag, 'id'>): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(getUserCollection('tags'), {
      ...tagData,
      createdAt: new Date(),
      userId: user.uid,
    });
    return docRef.id;
  },

  update: async (tagId: string, updates: Partial<Tag>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const tagRef = doc(db, 'users', user.uid, 'tags', tagId);
    return updateDoc(tagRef, updates);
  },

  delete: async (tagId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const tagRef = doc(db, 'users', user.uid, 'tags', tagId);
    return deleteDoc(tagRef);
  },

  getAll: async (): Promise<FirestoreDoc<Tag>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('tags'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (tags: FirestoreDoc<Tag>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('tags'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tags = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(tags);
    });
  },
};

export const listFolderService = {
  add: async (folderData: Omit<ListFolder, 'id'>): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(getUserCollection('listFolders'), {
      ...folderData,
      userId: user.uid,
    });
    return docRef.id;
  },

  update: async (folderId: string, updates: Partial<ListFolder>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const folderRef = doc(db, 'users', user.uid, 'listFolders', folderId);
    return updateDoc(folderRef, updates);
  },

  delete: async (folderId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const folderRef = doc(db, 'users', user.uid, 'listFolders', folderId);
    return deleteDoc(folderRef);
  },

  getAll: async (): Promise<FirestoreDoc<ListFolder>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const snapshot = await getDocs(getUserCollection('listFolders'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (folders: FirestoreDoc<ListFolder>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('listFolders'));
    return onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(folders);
    });
  },
};

export const tagFolderService = {
  add: async (folderData: Omit<TagFolder, 'id'>): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(getUserCollection('tagFolders'), {
      ...folderData,
      userId: user.uid,
    });
    return docRef.id;
  },

  update: async (folderId: string, updates: Partial<TagFolder>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const folderRef = doc(db, 'users', user.uid, 'tagFolders', folderId);
    return updateDoc(folderRef, updates);
  },

  delete: async (folderId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const folderRef = doc(db, 'users', user.uid, 'tagFolders', folderId);
    return deleteDoc(folderRef);
  },

  getAll: async (): Promise<FirestoreDoc<TagFolder>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const snapshot = await getDocs(getUserCollection('tagFolders'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (folders: FirestoreDoc<TagFolder>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('tagFolders'));
    return onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(folders);
    });
  },
};

export const logService = {
  add: async (logData: Omit<Log, 'id' | 'createdAt'>): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(getUserCollection('logs'), {
      ...logData,
      createdAt: new Date(),
      userId: user.uid,
    });
    return docRef.id;
  },

  update: async (logId: string, updates: Partial<Log>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const logRef = doc(db, 'users', user.uid, 'logs', logId);
    return updateDoc(logRef, updates);
  },

  delete: async (logId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const logRef = doc(db, 'users', user.uid, 'logs', logId);
    return deleteDoc(logRef);
  },

  getAll: async (): Promise<FirestoreDoc<Log>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('logs'), orderBy('logDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (logs: FirestoreDoc<Log>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('logs'), orderBy('logDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(logs);
    });
  },
};

export const logTemplateService = {
  add: async (templateData: Omit<LogTemplate, 'id'>): Promise<string> => {
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
  },

  update: async (templateId: string, updates: Partial<LogTemplate>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const templateRef = doc(db, 'users', user.uid, 'logTemplates', templateId);
    return updateDoc(templateRef, updates);
  },

  delete: async (templateId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const templateRef = doc(db, 'users', user.uid, 'logTemplates', templateId);
    return deleteDoc(templateRef);
  },

  getAll: async (): Promise<FirestoreDoc<LogTemplate>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const snapshot = await getDocs(getUserCollection('logTemplates'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (templates: FirestoreDoc<LogTemplate>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('logTemplates'));
    return onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(templates);
    });
  },
};

export const focusService = {
  add: async (focusData: Omit<Focus, 'id'>): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(getUserCollection('foci'), {
      ...focusData,
      userId: user.uid,
    });
    return docRef.id;
  },

  update: async (focusId: string, updates: Partial<Focus>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const focusRef = doc(db, 'users', user.uid, 'foci', focusId);
    return updateDoc(focusRef, updates);
  },

  delete: async (focusId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const focusRef = doc(db, 'users', user.uid, 'foci', focusId);
    return deleteDoc(focusRef);
  },

  getAll: async (): Promise<FirestoreDoc<Focus>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const snapshot = await getDocs(getUserCollection('foci'));
    const foci = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return foci;
  },

  subscribe: (callback: (foci: FirestoreDoc<Focus>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('foci'));
    return onSnapshot(q, (snapshot) => {
      const foci = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(foci);
    });
  },
};

// ============= ABHYASA MODULE =============

export const goalService = {
  add: async (goalData: Omit<Goal, 'id' | 'startDate'>): Promise<string> => {
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
  },

  update: async (goalId: string, updates: Partial<Goal>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    return updateDoc(goalRef, updates);
  },

  delete: async (goalId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    return deleteDoc(goalRef);
  },

  getAll: async (): Promise<FirestoreDoc<Goal>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('goals'), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (goals: FirestoreDoc<Goal>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('goals'), orderBy('startDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const goals = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(goals);
    });
  },
};

export const milestoneService = {
  add: async (milestoneData: Omit<Milestone, 'id'>): Promise<string> => {
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
  },

  update: async (milestoneId: string, updates: Partial<Milestone>): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const milestoneRef = doc(db, 'users', user.uid, 'milestones', milestoneId);
    return updateDoc(milestoneRef, updates);
  },

  delete: async (milestoneId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const milestoneRef = doc(db, 'users', user.uid, 'milestones', milestoneId);
    return deleteDoc(milestoneRef);
  },

  getAll: async (): Promise<FirestoreDoc<Milestone>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('milestones'), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (milestones: FirestoreDoc<Milestone>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('milestones'), orderBy('startDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const milestones = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(milestones);
    });
  },
};

export const quickWinService = {
  add: async (
    quickWinData: Omit<QuickWin, 'id' | 'createdAt'>
  ): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const docRef = await addDoc(getUserCollection('quickWins'), {
      ...quickWinData,
      createdAt: new Date(),
      userId: user.uid,
    });
    return docRef.id;
  },

  update: async (
    quickWinId: string,
    updates: Partial<QuickWin>
  ): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const quickWinRef = doc(db, 'users', user.uid, 'quickWins', quickWinId);
    return updateDoc(quickWinRef, updates);
  },

  delete: async (quickWinId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const quickWinRef = doc(db, 'users', user.uid, 'quickWins', quickWinId);
    return deleteDoc(quickWinRef);
  },

  getAll: async (): Promise<FirestoreDoc<QuickWin>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('quickWins'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (quickWins: FirestoreDoc<QuickWin>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('quickWins'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const quickWins = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(quickWins);
    });
  },
};

export const habitService = {
  add: async (habitData: Omit<Habit, 'id' | 'createdAt'>): Promise<string> => {
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
  },

  update: async (habitId: string, updates: Partial<Habit>): Promise<void> => {
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
  },

  delete: async (habitId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const habitRef = doc(db, 'users', user.uid, 'habits', habitId);
    return deleteDoc(habitRef);
  },

  getAll: async (): Promise<FirestoreDoc<Habit>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('habits'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (callback: (habits: FirestoreDoc<Habit>[]) => void) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('habits'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const habits = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(habits);
    });
  },
};

export const habitLogService = {
  add: async (habitLogData: Omit<HabitLog, 'id'>): Promise<string> => {
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
  },

  update: async (
    habitLogId: string,
    updates: Partial<HabitLog>
  ): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const habitLogRef = doc(db, 'users', user.uid, 'habitLogs', habitLogId);
    return updateDoc(habitLogRef, updates);
  },

  delete: async (habitLogId: string): Promise<void> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const habitLogRef = doc(db, 'users', user.uid, 'habitLogs', habitLogId);
    return deleteDoc(habitLogRef);
  },

  getAll: async (): Promise<FirestoreDoc<HabitLog>[]> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const q = query(getUserCollection('habitLogs'), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
  },

  subscribe: (
    callback: (habitLogs: FirestoreDoc<HabitLog>[]) => void
  ) => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const q = query(getUserCollection('habitLogs'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const habitLogs = snapshot.docs.map((doc) => convertTimestamps({ id: doc.id, ...doc.data() }));
      callback(habitLogs);
    });
  },
};



// ============= BULK OPERATIONS =============

export const initializeUserData = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  // Check if user data already exists to prevent duplicate initialization
  const existingHabits = await habitService.getAll();
  const existingGoals = await goalService.getAll();
  
  // If user already has data, skip initialization
  if (existingHabits.length > 0 || existingGoals.length > 0) {
    console.log('User data already exists, skipping initialization');
    return;
  }

  console.log('Initializing user data for new user:', user.uid);

  // Initialize default foci for new users
  const { initialFoci } = await import('../modules/dainandini/data');
  console.log('Adding default focus areas:', initialFoci.length);

  // Add default focus areas
  await Promise.all(initialFoci.map(async (focus) => {
    await focusService.add(focus);
  }));

  // Note: No default habits are created - users start with empty habit lists

  // Add default goals
  console.log('Adding default goals:', initialGoals.length);
  await Promise.all(initialGoals.map(async (goal) => {
    await goalService.add(goal);
  }));

  // Add default milestones
  console.log('Adding default milestones:', initialMilestones.length);
  await Promise.all(initialMilestones.map(async (milestone) => {
    await milestoneService.add(milestone);
  }));

  // Add default quick wins
  console.log('Adding default quick wins:', initialQuickWins.length);
  await Promise.all(initialQuickWins.map(async (quickWin) => {
    await quickWinService.add(quickWin);
  }));

  // Add default custom lists (including Inbox) - check for existing lists first
  console.log('Adding default custom lists:', customLists.length);
  const existingLists = await listService.getAll();
  const listsToAdd = customLists.filter(list => 
    !existingLists.some(existing => existing.name === list.name)
  );
  
  if (listsToAdd.length > 0) {
    console.log('Lists to add:', listsToAdd.map(l => l.name));
    await Promise.all(listsToAdd.map(async (list) => {
      await listService.add(list);
    }));
  } else {
    console.log('No new lists to add');
  }

  // Add default list folders - check for existing folders first
  const existingListFolders = await listFolderService.getAll();
  const listFoldersToAdd = listFolders.filter(folder => 
    !existingListFolders.some(existing => existing.name === folder.name)
  );
  
  if (listFoldersToAdd.length > 0) {
    console.log('Adding list folders:', listFoldersToAdd.map(f => f.name));
    await Promise.all(listFoldersToAdd.map(async (folder) => {
      await listFolderService.add(folder);
    }));
  } else {
    console.log('No new list folders to add');
  }

  // Add default tags - check for existing tags first
  const existingTags = await tagService.getAll();
  const tagsToAdd = tags.filter(tag => 
    !existingTags.some(existing => existing.name === tag.name)
  );
  
  if (tagsToAdd.length > 0) {
    console.log('Adding tags:', tagsToAdd.map(t => t.name));
    await Promise.all(tagsToAdd.map(async (tag) => {
      await tagService.add(tag);
    }));
  } else {
    console.log('No new tags to add');
  }

  // Add default tag folders - check for existing folders first
  const existingTagFolders = await tagFolderService.getAll();
  const tagFoldersToAdd = tagFolders.filter(folder => 
    !existingTagFolders.some(existing => existing.name === folder.name)
  );
  
  if (tagFoldersToAdd.length > 0) {
    console.log('Adding tag folders:', tagFoldersToAdd.map(f => f.name));
    await Promise.all(tagFoldersToAdd.map(async (folder) => {
      await tagFolderService.add(folder);
    }));
  } else {
    console.log('No new tag folders to add');
  }

  console.log('User data initialization completed successfully');
};

// ============= UTILITY FUNCTIONS =============

export const getAllUserData = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const [
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
    tagFolders,
  ] = await Promise.all([
    taskService.getAll(),
    logService.getAll(),
    habitService.getAll(),
    goalService.getAll(),
    milestoneService.getAll(),
    quickWinService.getAll(),
    logTemplateService.getAll(),
    listService.getAll(),
    tagService.getAll(),
    focusService.getAll(),
    listFolderService.getAll(),
    tagFolderService.getAll(),
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
    tagFolders,
  };
};