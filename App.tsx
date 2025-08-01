import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from './components/Icons';
import ApiKeyModal from './components/ApiKeyModal';
import ProfileModal from './components/ProfileModal';
import DainandiniView from './modules/dainandini/views/DainandiniView';
import KaryView from './modules/kary/views/KaryView';
import VidyaView from './modules/vidya/views/VidyaView';
import AbhyasaView from './modules/abhyasa/views/AbhyasaView';
import { initialFoci } from './modules/dainandini/data';
import { Task } from './modules/kary/types';
import { Log, LogType, LogTemplate, Focus } from './modules/dainandini/types';
import {
  Habit,
  HabitLog,
  Goal,
  Milestone,
  QuickWin,
  QuickWinStatus,
  HabitStatus,
} from './modules/abhyasa/types';
import AuthModal from './components/AuthModal';
import {
  onAuthStateChange,
  getCurrentUser,
  signOutUser,
  updateUserProfile,
} from './services/authService';
import { uploadProfilePicture } from './services/storageService';
import {
  getAllUserData,
  initializeUserData,
  subscribeToUserTasks,
  subscribeToUserLogs,
  subscribeToUserHabits,
  subscribeToUserGoals,
  subscribeToUserMilestones,
  subscribeToUserQuickWins,
  subscribeToUserLogTemplates,
  subscribeToUserLists,
  subscribeToUserTags,
  subscribeToUserListFolders,
  subscribeToUserTagFolders,
  subscribeToUserFoci,
  subscribeToUserHabitLogs,
  addTask as addTaskToFirestore,
  updateTask as updateTaskInFirestore,
  deleteTask as deleteTaskFromFirestore,
  addLog as addLogToFirestore,
  updateLog as updateLogInFirestore,
  deleteLog as deleteLogFromFirestore,
  addLogTemplate as addLogTemplateToFirestore,
  updateLogTemplate as updateLogTemplateInFirestore,
  deleteLogTemplate as deleteLogTemplateFromFirestore,
  addGoal as addGoalToFirestore,
  updateGoal as updateGoalInFirestore,
  deleteGoal as deleteGoalFromFirestore,
  addMilestone as addMilestoneToFirestore,
  updateMilestone as updateMilestoneInFirestore,
  deleteMilestone as deleteMilestoneFromFirestore,
  addQuickWin as addQuickWinToFirestore,
  updateQuickWin as updateQuickWinInFirestore,
  addHabit as addHabitToFirestore,
  updateHabit as updateHabitInFirestore,
  deleteHabit as deleteHabitFromFirestore,
  addHabitLog as addHabitLogToFirestore,
  deleteHabitLog as deleteHabitLogFromFirestore,
  addList as addListToFirestore,
  updateList as updateListInFirestore,
  deleteList as deleteListFromFirestore,
  addTag as addTagToFirestore,
  updateTag as updateTagInFirestore,
  deleteTag as deleteTagFromFirestore,
  addListFolder as addListFolderToFirestore,
  updateListFolder as updateListFolderInFirestore,
  deleteListFolder as deleteListFolderFromFirestore,
  addTagFolder as addTagFolderToFirestore,
  updateTagFolder as updateTagFolderInFirestore,
  deleteTagFolder as deleteTagFolderFromFirestore,
  addFocus as addFocusToFirestore,
  updateFocus as updateFocusInFirestore,
  deleteFocus as deleteFocusFromFirestore,
} from './services/dataService';

const navItems = [
  { viewId: 'kary', icon: 'CheckSquareIcon', label: 'Kary' },
  { viewId: 'vidya', icon: 'BookOpenIcon', label: 'Vidyā' },
  { viewId: 'abhyasa', icon: 'TargetIcon', label: 'Abhyasa' },
  { viewId: 'dainandini', icon: 'Edit3Icon', label: 'Dainandini' },
] as const;

type View = (typeof navItems)[number]['viewId'];

// --- IconSidebar Component ---
const NavItem: React.FC<{
  icon: keyof typeof Icons;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  const IconComponent = Icons[icon];
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
      aria-label={label}
    >
      <IconComponent className="w-6 h-6" />
      <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {label}
      </span>
    </button>
  );
};

const IconSidebar: React.FC<{
  activeView: View;
  onSetView: (view: View) => void;
  onProfileClick: () => void;
  onSignOut: () => void;
  user: any;
}> = ({ activeView, onSetView, onProfileClick, onSignOut, user }) => {
  return (
    <aside className="w-20 bg-gray-50/80 flex-shrink-0 flex flex-col items-center border-r border-gray-200">
      <div className="py-4 mt-2">
        <button
          onClick={onProfileClick}
          className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
          aria-label="User Profile and Settings"
        >
          <img
            src={user?.photoURL || 'https://i.pravatar.cc/40?u=a042581f4e29026704d'}
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <span className="absolute -top-1 -left-1 text-lg" role="img" aria-label="premium">
            👑
          </span>
        </button>
      </div>

      <nav className="flex flex-col items-center space-y-4 px-2 py-4">
        {navItems.map(({ viewId, icon, label }) => (
          <NavItem
            key={viewId}
            icon={icon}
            label={label}
            isActive={activeView === viewId}
            onClick={() => onSetView(viewId)}
          />
        ))}
      </nav>

      <div className="mt-auto mb-4">
        <button
          onClick={onSignOut}
          className="flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 text-gray-500 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Sign Out"
        >
          <Icons.LogOutIcon className="w-6 h-6" />
        </button>
      </div>
    </aside>
  );
};
// --- End IconSidebar Component ---

const App: React.FC = () => {
  // All useState hooks must be at the top, before any conditional logic
  const [activeView, setActiveView] = useState<View>('kary');

  const [apiKey, setApiKey] = useState<string | null>(() => {
    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envApiKey) {
      return envApiKey;
    }
    return localStorage.getItem('gemini-api-key');
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // --- Auth State ---
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Data Loading State
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Kary State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customLists, setCustomLists] = useState<List[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [listFolders, setListFolders] = useState<ListFolder[]>([]);
  const [tagFolders, setTagFolders] = useState<TagFolder[]>([]);
  const [sentReminders, setSentReminders] = useState(new Set<string>());

  // Dainandini State
  const [logs, setLogs] = useState<Log[]>([]);
  const [logTemplates, setLogTemplates] = useState<LogTemplate[]>([]);
  const [foci, setFoci] = useState<Focus[]>([]);

  // Abhyasa State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  // ALL useEffect hooks must come before conditional returns
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (!user || authLoading) return;

    const loadUserData = async () => {
      try {
        setDataLoading(true);
        setDataError(null);

        // Check if user has any data, if not initialize with defaults
        const userData = await getAllUserData();

        // If no foci exist, initialize user data
        if (userData.foci.length === 0) {
          await initializeUserData();
          // Reload data after initialization
          const newUserData = await getAllUserData();
          setTasks(newUserData.tasks);
          setLogs(newUserData.logs);
          setLogTemplates(newUserData.logTemplates);
          setGoals(newUserData.goals);
          setMilestones(newUserData.milestones);
          setQuickWins(newUserData.quickWins);
          setHabits(newUserData.habits || []);
          setHabitLogs(newUserData.habitLogs || []);
          setHabitLogs(newUserData.habitLogs || []);
          setCustomLists(newUserData.lists);
          setTags(newUserData.tags);
          setListFolders(newUserData.listFolders);
          setTagFolders(newUserData.tagFolders);
        } else {
          // Set all the loaded data
          setTasks(userData.tasks);
          setLogs(userData.logs);
          setLogTemplates(userData.logTemplates);
          setGoals(userData.goals);
          setMilestones(userData.milestones);
          setQuickWins(userData.quickWins);
          setHabits(userData.habits);
          setHabitLogs(userData.habitLogs || []);
          setHabitLogs(userData.habitLogs || []);
          setCustomLists(userData.lists);
          setTags(userData.tags);
          setListFolders(userData.listFolders);
          setTagFolders(userData.tagFolders);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setDataError('Failed to load your data. Please try refreshing the page.');
      } finally {
        setDataLoading(false);
      }
    };

    loadUserData();
  }, [user, authLoading]);

  // Set up real-time listeners when user data is loaded
  useEffect(() => {
    if (!user || dataLoading || dataError) return;

    // Set up real-time listeners for all collections
    const unsubscribeTasks = subscribeToUserTasks(setTasks);
    const unsubscribeLogs = subscribeToUserLogs(setLogs);
    const unsubscribeHabits = subscribeToUserHabits((habitsData) => setHabits(habitsData || []));
    const unsubscribeHabitLogs = subscribeToUserHabitLogs((habitLogsData) =>
      setHabitLogs(habitLogsData || [])
    );
    const unsubscribeGoals = subscribeToUserGoals(setGoals);
    const unsubscribeMilestones = subscribeToUserMilestones(setMilestones);
    const unsubscribeQuickWins = subscribeToUserQuickWins(setQuickWins);
    const unsubscribeLogTemplates = subscribeToUserLogTemplates(setLogTemplates);
    const unsubscribeLists = subscribeToUserLists(setCustomLists);
    const unsubscribeTags = subscribeToUserTags(setTags);
    const unsubscribeListFolders = subscribeToUserListFolders(setListFolders);
    const unsubscribeTagFolders = subscribeToUserTagFolders(setTagFolders);
    const unsubscribeFoci = subscribeToUserFoci(setFoci);

    // Cleanup function to unsubscribe from all listeners
    return () => {
      unsubscribeTasks();
      unsubscribeLogs();
      unsubscribeHabits();
      unsubscribeHabitLogs();
      unsubscribeGoals();
      unsubscribeMilestones();
      unsubscribeQuickWins();
      unsubscribeLogTemplates();
      unsubscribeLists();
      unsubscribeListFolders();
      unsubscribeTags();
      unsubscribeTagFolders();
      unsubscribeFoci();
    };
  }, [user, dataLoading, dataError]);

  // --- Reminder Logic ---
  useEffect(() => {
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

      const now = new Date().getTime();
      const newlyNotifiedTaskIds = new Set<string>();

      tasks.forEach((task) => {
        if (task.reminder && task.dueDate && !task.completed && !sentReminders.has(task.id)) {
          const dueTime = new Date(task.dueDate).getTime();
          if (now >= dueTime && now - dueTime < 60000) {
            new Notification('Task Due!', { body: task.title });
            newlyNotifiedTaskIds.add(task.id);
          }
        }
      });

      if (newlyNotifiedTaskIds.size > 0) {
        setSentReminders((prev) => new Set([...prev, ...newlyNotifiedTaskIds]));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [tasks, sentReminders]);

  // --- ALL Data Manipulation Handlers (useCallback hooks) ---
  const handleSaveApiKey = (key: string) => {
    if (key.trim()) {
      localStorage.setItem('gemini-api-key', key.trim());
      setApiKey(key.trim());
    } else {
      localStorage.removeItem('gemini-api-key');
      setApiKey(null);
    }
    setIsApiKeyModalOpen(false);
  };

  const handleUpdateProfilePicture = async (file: File) => {
    if (user) {
      const photoURL = await uploadProfilePicture(user.uid, file);
      await updateUserProfile(user, { photoURL });
      setUser({ ...user, photoURL });
    }
  };

  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
      // Reset all state when signing out
      setTasks([]);
      setLogs([]);
      setLogTemplates([]);
      setGoals([]);
      setMilestones([]);
      setQuickWins([]);
      setHabits([]);
      setHabitLogs([]);
      setCustomLists([]);
      setTags([]);
      setListFolders([]);
      setTagFolders([]);
      setDataLoading(true);
      setDataError(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const handleToggleKaryTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updates = {
        completed: !task.completed,
        completionDate: !task.completed ? new Date() : undefined,
      };

      try {
        await updateTaskInFirestore(taskId, updates);

        // Update local state immediately for optimistic UI
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
        );

        // Also update any linked logs
        const linkedLogs = logs.filter((log) => log.taskId === taskId);
        for (const log of linkedLogs) {
          const logUpdates = {
            completed: !log.completed,
            taskCompletionDate: !log.completed ? new Date() : undefined,
          };
          await updateLogInFirestore(log.id, logUpdates);

          setLogs((prevLogs) =>
            prevLogs.map((l) => (l.id === log.id ? { ...l, ...logUpdates } : l))
          );
        }
      } catch (error) {
        console.error('Error toggling task:', error);
      }
    },
    [tasks, logs]
  );

  const handleAddLog = useCallback(async (logData: Partial<Omit<Log, 'id' | 'createdAt'>>) => {
    if (!logData.title?.trim() || !logData.focusId || !logData.logType) return;

    const newLogData = {
      logDate: logData.logDate || new Date(),
      ...logData,
      title: logData.title.trim(),
      focusId: logData.focusId,
      logType: logData.logType,
    } as Omit<Log, 'id' | 'createdAt'>;

    if (newLogData.logType === LogType.CHECKLIST && !newLogData.checklist) {
      newLogData.checklist = [];
    }
    if (newLogData.logType === LogType.RATING && !newLogData.rating) {
      newLogData.rating = 3;
    }

    try {
      await addLogToFirestore(newLogData);
    } catch (error) {
      console.error('Error adding log:', error);
    }
  }, []);

  const handleDeleteLog = useCallback(
    async (logId: string) => {
      try {
        await deleteLogFromFirestore(logId);
        setLogs(logs.filter((log) => log.id !== logId));
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    },
    [logs]
  );

  const handleUpdateLog = useCallback(
    async (logId: string, updates: Partial<Log>) => {
      try {
        await updateLogInFirestore(logId, updates);
        setLogs(logs.map((log) => (log.id === logId ? { ...log, ...updates } : log)));
      } catch (error) {
        console.error('Error updating log:', error);
      }
    },
    [logs]
  );
  const handleAddLogTemplate = useCallback(async (templateData: Omit<LogTemplate, 'id'>) => {
    try {
      await addLogTemplateToFirestore(templateData);
    } catch (error) {
      console.error('Error adding log template:', error);
      throw error;
    }
  }, []);
  const handleUpdateLogTemplate = useCallback(
    async (templateId: string, updates: Partial<LogTemplate>) => {
      try {
        await updateLogTemplateInFirestore(templateId, updates);
        setLogTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? { ...t, ...updates } : t))
        );
      } catch (error) {
        console.error('Error updating log template:', error);
      }
    },
    []
  );
  const handleDeleteLogTemplate = useCallback(async (templateId: string) => {
    try {
      await deleteLogTemplateFromFirestore(templateId);
      setLogTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting log template:', error);
    }
  }, []);

  const handleAddFocus = useCallback(async (focusData: Omit<Focus, 'id'>) => {
    try {
      await addFocusToFirestore(focusData);
    } catch (error) {
      console.error('Error adding focus:', error);
      throw error;
    }
  }, []);

  const handleUpdateFocus = useCallback(async (focusId: string, updates: Partial<Focus>) => {
    try {
      await updateFocusInFirestore(focusId, updates);
    } catch (error) {
      console.error('Error updating focus:', error);
    }
  }, []);

  const handleDeleteFocus = useCallback(async (focusId: string) => {
    try {
      await deleteFocusFromFirestore(focusId);
    } catch (error) {
      console.error('Error deleting focus:', error);
    }
  }, []);

  const handleAddList = useCallback(async (listData: Omit<List, 'id'>) => {
    try {
      await addListToFirestore(listData);
    } catch (error) {
      console.error('Error adding list:', error);
      throw error;
    }
  }, []);

  const handleUpdateList = useCallback(async (listId: string, updates: Partial<List>) => {
    try {
      await updateListInFirestore(listId, updates);
      setCustomLists((prev) => prev.map((l) => (l.id === listId ? { ...l, ...updates } : l)));
    } catch (error) {
      console.error('Error updating list:', error);
    }
  }, []);

  const handleDeleteList = useCallback(async (listId: string) => {
    try {
      await deleteListFromFirestore(listId);
      setCustomLists((prev) => prev.filter((l) => l.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  }, []);

  const handleAddTag = useCallback(async (tagData: Omit<Tag, 'id'>) => {
    try {
      await addTagToFirestore(tagData);
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  }, []);

  const handleUpdateTag = useCallback(async (tagId: string, updates: Partial<Tag>) => {
    try {
      await updateTagInFirestore(tagId, updates);
      setTags((prev) => prev.map((t) => (t.id === tagId ? { ...t, ...updates } : t)));
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  }, []);

  const handleDeleteTag = useCallback(async (tagId: string) => {
    try {
      await deleteTagFromFirestore(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  }, []);

  const handleAddListFolder = useCallback(async (folderData: Omit<ListFolder, 'id'>) => {
    try {
      await addListFolderToFirestore(folderData);
    } catch (error) {
      console.error('Error adding list folder:', error);
      throw error;
    }
  }, []);

  const handleUpdateListFolder = useCallback(
    async (folderId: string, updates: Partial<ListFolder>) => {
      try {
        await updateListFolderInFirestore(folderId, updates);
        setListFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, ...updates } : f)));
      } catch (error) {
        console.error('Error updating list folder:', error);
      }
    },
    []
  );

  const handleDeleteListFolder = useCallback(async (folderId: string) => {
    try {
      await deleteListFolderFromFirestore(folderId);
      setListFolders((prev) => prev.filter((f) => f.id !== folderId));
    } catch (error) {
      console.error('Error deleting list folder:', error);
    }
  }, []);

  const handleAddTagFolder = useCallback(async (folderData: Omit<TagFolder, 'id'>) => {
    try {
      await addTagFolderToFirestore(folderData);
    } catch (error) {
      console.error('Error adding tag folder:', error);
      throw error;
    }
  }, []);

  const handleUpdateTagFolder = useCallback(
    async (folderId: string, updates: Partial<TagFolder>) => {
      try {
        await updateTagFolderInFirestore(folderId, updates);
        setTagFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, ...updates } : f)));
      } catch (error) {
        console.error('Error updating tag folder:', error);
      }
    },
    []
  );

  const handleDeleteTagFolder = useCallback(async (folderId: string) => {
    try {
      await deleteTagFolderFromFirestore(folderId);
      setTagFolders((prev) => prev.filter((f) => f.id !== folderId));
    } catch (error) {
      console.error('Error deleting tag folder:', error);
    }
  }, []);

  const handleAddGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'startDate'>) => {
    try {
      await addGoalToFirestore(goalData);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  }, []);

  const handleUpdateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    try {
      await updateGoalInFirestore(goalId, updates);
      setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, ...updates } : g)));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  }, []);

  const handleDeleteGoal = useCallback(
    async (goalId: string) => {
      try {
        await deleteGoalFromFirestore(goalId);
        const milestonesToDelete = milestones
          .filter((m) => m.parentGoalId === goalId)
          .map((m) => m.id);
        const milestoneIdsToDelete = new Set(milestonesToDelete);

        setGoals((prev) => prev.filter((g) => g.id !== goalId));
        setMilestones((prev) => prev.filter((m) => m.parentGoalId !== goalId));
        setHabits((prev) =>
          prev.map((h) => {
            if (h.goalId === goalId) {
              return { ...h, goalId: undefined, milestoneId: undefined };
            }
            if (h.milestoneId && milestoneIdsToDelete.has(h.milestoneId)) {
              return { ...h, goalId: undefined, milestoneId: undefined };
            }
            return h;
          })
        );
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    },
    [milestones]
  );

  const handleAddMilestone = useCallback(async (milestoneData: Omit<Milestone, 'id'>) => {
    try {
      await addMilestoneToFirestore(milestoneData);
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  }, []);

  const handleUpdateMilestone = useCallback(
    async (milestoneId: string, updates: Partial<Milestone>) => {
      try {
        await updateMilestoneInFirestore(milestoneId, updates);
        setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m)));
      } catch (error) {
        console.error('Error updating milestone:', error);
      }
    },
    []
  );

  const handleDeleteMilestone = useCallback(async (milestoneId: string) => {
    try {
      await deleteMilestoneFromFirestore(milestoneId);
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
      // Unlink habits that were specifically linked to this milestone.
      // They will become general habits, no longer linked to a goal or milestone unless they were also linked to the parent goal.
      setHabits((prev) =>
        prev.map((h) => {
          if (h.milestoneId === milestoneId) {
            return { ...h, milestoneId: undefined, goalId: undefined };
          }
          return h;
        })
      );
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  }, []);

  const handleAddQuickWin = useCallback(
    async (quickWinData: Omit<QuickWin, 'id' | 'createdAt'>) => {
      try {
        await addQuickWinToFirestore(quickWinData);
      } catch (error) {
        console.error('Error adding quick win:', error);
      }
    },
    []
  );

  const handleUpdateQuickWinStatus = useCallback(async (id: string, status: QuickWinStatus) => {
    try {
      await updateQuickWinInFirestore(id, { status });
      setQuickWins((prev) => prev.map((qw) => (qw.id === id ? { ...qw, status } : qw)));
    } catch (error) {
      console.error('Error updating quick win status:', error);
    }
  }, []);

  const handleAddHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    try {
      await addHabitToFirestore(habitData);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }, []);

  const handleUpdateHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
    try {
      await updateHabitInFirestore(habitId, updates);
      setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h)));
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  }, []);
  const handleDeleteHabit = useCallback(async (habitId: string) => {
    try {
      await deleteHabitFromFirestore(habitId);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      setHabitLogs((prev) => prev.filter((l) => l.habitId !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }, []);
  const handleAddHabitLog = useCallback(async (logData: Omit<HabitLog, 'id'>) => {
    try {
      const newLogId = await addHabitLogToFirestore(logData);
      const newLog: HabitLog = { id: newLogId, ...logData };
      setHabitLogs((prev) => [
        ...prev.filter((l) => !(l.habitId === newLog.habitId && l.date === newLog.date)),
        newLog,
      ]);
    } catch (error) {
      console.error('Error adding habit log:', error);
    }
  }, []);

  const handleDeleteHabitLog = useCallback(
    async (habitId: string, date: Date) => {
      try {
        // Firestore doesn't have a direct way to delete by composite key (habitId, date)
        // So we need to query for the log first
        // This is a simplified approach, in a real app you might store habit logs with a unique ID that includes date
        // For now, we'll assume habit logs have unique IDs generated by Firestore on add
        // If habitLogId is not passed, we need to find it based on habitId and date
        // This part needs to be implemented if habitLogId is not readily available
        // For now, assuming habitLogId is passed or can be derived.
        // If you need to delete by habitId and date, you'd need a query here to get the ID.
        // For simplicity, I'm assuming the log to delete is already in the local state and has an ID.
        const logToDelete = habitLogs.find(
          (l) => l.habitId === habitId && l.date === date.toISOString().split('T')[0]
        );
        if (logToDelete) {
          await deleteHabitLogFromFirestore(logToDelete.id);
          setHabitLogs((prev) => prev.filter((l) => l.id !== logToDelete.id));
        }
      } catch (error) {
        console.error('Error deleting habit log:', error);
      }
    },
    [habitLogs]
  );

  // Conditional returns come AFTER all hooks
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Jeevan Saathi</h1>
          <p className="text-gray-600 mb-8">Your personal life management companion</p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg mb-2">Loading your data...</div>
          <div className="text-sm text-gray-600">Setting up your personal workspace</div>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{dataError}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dainandini':
        return (
          <DainandiniView
            allLogs={logs}
            logTemplates={logTemplates}
            allFoci={foci}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
            onUpdateLog={handleUpdateLog}
            onAddLogTemplate={handleAddLogTemplate}
            onUpdateLogTemplate={handleUpdateLogTemplate}
            onDeleteLogTemplate={handleDeleteLogTemplate}
            onAddFocus={handleAddFocus}
            onUpdateFocus={handleUpdateFocus}
            onDeleteFocus={handleDeleteFocus}
            onToggleKaryTask={handleToggleKaryTask}
            onReorderFoci={setFoci}
          />
        );
      case 'kary':
        return (
          <KaryView
            tasks={tasks}
            onAddTask={async (taskData) => {
              try {
                const taskId = await addTaskToFirestore(taskData);
                return taskId; // Return the Firestore-generated ID
              } catch (error) {
                console.error('Error adding task:', error);
                throw error; // Re-throw to propagate the error
              }
            }}
            onUpdateTask={async (taskId, updates) => {
              try {
                await updateTaskInFirestore(taskId, updates);
                setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
              } catch (error) {
                console.error('Error updating task:', error);
              }
            }}
            onDeleteTask={async (taskId) => {
              try {
                await deleteTaskFromFirestore(taskId);
                // Find all children tasks to delete them too
                const taskToDelete = tasks.find((t) => t.id === taskId);
                if (taskToDelete) {
                  const childrenIds = new Set(
                    tasks.filter((t) => t.parentId === taskId).map((t) => t.id)
                  );
                  for (const childId of childrenIds) {
                    await deleteTaskFromFirestore(childId);
                  }
                  setTasks((prev) => prev.filter((t) => t.id !== taskId && !childrenIds.has(t.id)));
                }
              } catch (error) {
                console.error('Error deleting task:', error);
              }
            }}
            allLogs={logs}
            onAddLog={handleAddLog}
            sentReminders={sentReminders}
            setSentReminders={setSentReminders}
            onToggleKaryTask={handleToggleKaryTask}
            customLists={customLists}
            tags={tags}
            listFolders={listFolders}
            tagFolders={tagFolders}
            onAddList={handleAddList}
            onUpdateList={handleUpdateList}
            onDeleteList={handleDeleteList}
            onAddTag={handleAddTag}
            onUpdateTag={handleUpdateTag}
            onDeleteTag={handleDeleteTag}
            onAddListFolder={handleAddListFolder}
            onUpdateListFolder={handleUpdateListFolder}
            onDeleteListFolder={handleDeleteListFolder}
            onAddTagFolder={handleAddTagFolder}
            onUpdateTagFolder={handleUpdateTagFolder}
            onDeleteTagFolder={handleDeleteTagFolder}
          />
        );
      case 'abhyasa':
        return (
          <AbhyasaView
            goals={goals}
            milestones={milestones}
            quickWins={quickWins}
            habits={habits ?? []}
            habitLogs={habitLogs}
            allFoci={initialFoci}
            allLogs={logs}
            onAddLog={handleAddLog}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddMilestone={handleAddMilestone}
            onUpdateMilestone={handleUpdateMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onAddQuickWin={handleAddQuickWin}
            onUpdateQuickWinStatus={handleUpdateQuickWinStatus}
            onAddHabit={handleAddHabit}
            onUpdateHabit={handleUpdateHabit}
            onDeleteHabit={handleDeleteHabit}
            onAddHabitLog={handleAddHabitLog}
            onDeleteHabitLog={handleDeleteHabitLog}
          />
        );
      case 'vidya':
        return <VidyaView />;
      default:
        return (
          <DainandiniView
            allLogs={logs}
            logTemplates={logTemplates}
            allFoci={foci}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
            onUpdateLog={handleUpdateLog}
            onAddLogTemplate={handleAddLogTemplate}
            onUpdateLogTemplate={handleUpdateLogTemplate}
            onDeleteLogTemplate={handleDeleteLogTemplate}
            onAddFocus={handleAddFocus}
            onUpdateFocus={handleUpdateFocus}
            onDeleteFocus={handleDeleteFocus}
            onToggleKaryTask={handleToggleKaryTask}
            onReorderFoci={setFoci}
          />
        );
    }
  };

  return (
    <div className="flex h-screen font-sans text-gray-800 bg-transparent">
      <IconSidebar
        activeView={activeView}
        onSetView={setActiveView}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onSignOut={handleSignOut}
        user={user}
      />
      {renderActiveView()}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          currentApiKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      )}
      {isProfileModalOpen && user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          onUpdateProfilePicture={handleUpdateProfilePicture}
        />
      )}
    </div>
  );
};

export default App;
