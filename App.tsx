
import React, { useState, useEffect, useCallback } from 'react';
import * as Icons from './components/Icons';
import ApiKeyModal from './components/ApiKeyModal';
import DainandiniView from './modules/dainandini/views/DainandiniView';
import KaryView from './modules/kary/views/KaryView';
import VidyaView from './modules/vidya/views/VidyaView';
import AbhyasaView from './modules/abhyasa/views/AbhyasaView';
import { tasks as initialTasks } from './modules/kary/data';
import { initialLogs, initialLogTemplates, initialFoci } from './modules/dainandini/data';
import { 
    habits as initialHabits, 
    habitLogs as initialHabitLogs,
    initialGoals,
    initialMilestones,
    initialQuickWins
} from './modules/abhyasa/data';
import { Task } from './modules/kary/types';
import { Log, LogType, LogTemplate, Focus } from './modules/dainandini/types';
import { Habit, HabitLog, Goal, Milestone, QuickWin, QuickWinStatus, HabitStatus } from './modules/abhyasa/types';


const navItems = [
    { viewId: 'kary', icon: 'CheckSquareIcon', label: 'Kary' },
    { viewId: 'vidya', icon: 'BookOpenIcon', label: 'Vidyā' },
    { viewId: 'abhyasa', icon: 'TargetIcon', label: 'Abhyasa' },
    { viewId: 'dainandini', icon: 'Edit3Icon', label: 'Dainandini' },
] as const;

type View = typeof navItems[number]['viewId'];

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
            className={`relative flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200'
            }`}
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
}> = ({ activeView, onSetView, onProfileClick }) => {
    return (
        <aside className="w-20 bg-gray-50/80 flex-shrink-0 flex flex-col items-center border-r border-gray-200">
            <div className="py-4 mt-2">
                <button onClick={onProfileClick} className="relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full" aria-label="User Profile and Settings">
                    <img src="https://i.pravatar.cc/40?u=a042581f4e29026704d" alt="User" className="w-10 h-10 rounded-full"/>
                    <span className="absolute -top-1 -left-1 text-lg" role="img" aria-label="premium">👑</span>
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
        </aside>
    );
};
// --- End IconSidebar Component ---

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('kary');

  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  // Kary State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [sentReminders, setSentReminders] = useState(new Set<string>());
  
  // Dainandini State
  const [logs, setLogs] = useState<Log[]>(initialLogs);
  const [logTemplates, setLogTemplates] = useState<LogTemplate[]>(initialLogTemplates);

  // Abhyasa State
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [quickWins, setQuickWins] = useState<QuickWin[]>(initialQuickWins);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(initialHabitLogs);


  // --- Reminder Logic ---
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

        const now = new Date().getTime();
        const newlyNotifiedTaskIds = new Set<string>();

        tasks.forEach(task => {
            if (task.reminder && task.dueDate && !task.completed && !sentReminders.has(task.id)) {
                const dueTime = new Date(task.dueDate).getTime();
                if (now >= dueTime && now - dueTime < 60000) {
                    new Notification('Task Due!', { body: task.title });
                    newlyNotifiedTaskIds.add(task.id);
                }
            }
        });

        if (newlyNotifiedTaskIds.size > 0) {
            setSentReminders(prev => new Set([...prev, ...newlyNotifiedTaskIds]));
        }
    }, 60000);

    return () => clearInterval(interval);
  }, [tasks, sentReminders]);

  // --- Data Manipulation Handlers ---
  
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

  const handleToggleKaryTask = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed, completionDate: !task.completed ? new Date() : undefined }
          : task
      )
    );
    // Also update any linked logs
    setLogs(prevLogs =>
        prevLogs.map(log =>
            log.taskId === taskId
            ? { ...log, completed: !log.completed, taskCompletionDate: !log.completed ? new Date() : undefined }
            : log
        )
    );
  }, []);

  const handleAddLog = useCallback((logData: Partial<Omit<Log, 'id' | 'createdAt'>>) => {
    if (!logData.title?.trim() || !logData.focusId || !logData.logType) return;
    
    const newLog: Log = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        logDate: logData.logDate || new Date(),
        ...logData,
        title: logData.title.trim(),
        focusId: logData.focusId,
        logType: logData.logType,
    } as Log;

    if (newLog.logType === LogType.CHECKLIST && !newLog.checklist) newLog.checklist = [];
    if (newLog.logType === LogType.RATING && !newLog.rating) newLog.rating = 3;

    setLogs(prevLogs => [newLog, ...prevLogs]);
  }, []);

  const handleDeleteLog = useCallback((logId: string) => setLogs(logs.filter(log => log.id !== logId)), [logs]);
  const handleUpdateLog = useCallback((logId: string, updates: Partial<Log>) => setLogs(logs.map(log => log.id === logId ? { ...log, ...updates } : log)), [logs]);
  const handleAddLogTemplate = useCallback((templateData: Omit<LogTemplate, 'id'>) => {
    const newTemplate = { ...templateData, id: crypto.randomUUID() };
    setLogTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);
  const handleUpdateLogTemplate = useCallback((templateId: string, updates: Partial<LogTemplate>) => setLogTemplates(prev => prev.map(t => t.id === templateId ? { ...t, ...updates } : t)), []);
  const handleDeleteLogTemplate = useCallback((templateId: string) => setLogTemplates(prev => prev.filter(t => t.id !== templateId)), []);

  const handleAddGoal = useCallback((goalData: Omit<Goal, 'id' | 'startDate'>) => {
    const newGoal: Goal = {
        id: crypto.randomUUID(),
        startDate: new Date(),
        ...goalData
    };
    setGoals(prev => [newGoal, ...prev]);
  }, []);

  const handleUpdateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => (g.id === goalId ? { ...g, ...updates } : g)));
  }, []);

  const handleDeleteGoal = useCallback((goalId: string) => {
    const milestonesToDelete = milestones.filter(m => m.parentGoalId === goalId).map(m => m.id);
    const milestoneIdsToDelete = new Set(milestonesToDelete);

    setGoals(prev => prev.filter(g => g.id !== goalId));
    setMilestones(prev => prev.filter(m => m.parentGoalId !== goalId));
    setHabits(prev => prev.map(h => {
        if (h.goalId === goalId) {
            return { ...h, goalId: undefined, milestoneId: undefined };
        }
        if (h.milestoneId && milestoneIdsToDelete.has(h.milestoneId)) {
            return { ...h, goalId: undefined, milestoneId: undefined };
        }
        return h;
    }));
  }, [milestones]);

  const handleAddMilestone = useCallback((milestoneData: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = { id: crypto.randomUUID(), ...milestoneData };
    setMilestones(prev => [newMilestone, ...prev]);
  }, []);

  const handleUpdateMilestone = useCallback((milestoneId: string, updates: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => (m.id === milestoneId ? { ...m, ...updates } : m)));
  }, []);

  const handleDeleteMilestone = useCallback((milestoneId: string) => {
    setMilestones(prev => prev.filter(m => m.id !== milestoneId));
    // Unlink habits that were specifically linked to this milestone.
    // They will become general habits, no longer linked to a goal or milestone unless they were also linked to the parent goal.
    setHabits(prev => prev.map(h => {
        if (h.milestoneId === milestoneId) {
            return { ...h, milestoneId: undefined, goalId: undefined };
        }
        return h;
    }));
  }, []);
  
  const handleAddQuickWin = useCallback((quickWinData: Omit<QuickWin, 'id'|'createdAt'>) => {
    const newQuickWin: QuickWin = { id: crypto.randomUUID(), createdAt: new Date(), ...quickWinData };
    setQuickWins(prev => [newQuickWin, ...prev]);
  }, []);

  const handleUpdateQuickWinStatus = useCallback((id: string, status: QuickWinStatus) => {
      setQuickWins(prev => prev.map(qw => qw.id === id ? {...qw, status} : qw));
  }, []);

  const handleAddHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = { id: crypto.randomUUID(), createdAt: new Date(), status: HabitStatus.YET_TO_START, ...habitData };
    setHabits(prev => [newHabit, ...prev]);
  }, []);

  const handleUpdateHabit = useCallback((habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => (h.id === habitId ? { ...h, ...updates } : h)));
  }, []);
  const handleDeleteHabit = useCallback((habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
    setHabitLogs(prev => prev.filter(l => l.habitId !== habitId));
  }, []);
  const handleAddHabitLog = useCallback((logData: Omit<HabitLog, 'id'>) => {
    const newLog: HabitLog = { id: crypto.randomUUID(), ...logData };
    setHabitLogs(prev => [...prev.filter(l => !(l.habitId === newLog.habitId && l.date === newLog.date)), newLog]);
  }, []);

  const handleDeleteHabitLog = useCallback((habitId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setHabitLogs(prev => prev.filter(l => !(l.habitId === habitId && l.date === dateStr)));
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
        case 'dainandini':
            return <DainandiniView 
                        allLogs={logs}
                        logTemplates={logTemplates}
                        onAddLog={handleAddLog}
                        onDeleteLog={handleDeleteLog}
                        onUpdateLog={handleUpdateLog}
                        onAddLogTemplate={handleAddLogTemplate}
                        onUpdateLogTemplate={handleUpdateLogTemplate}
                        onDeleteLogTemplate={handleDeleteLogTemplate}
                        onToggleKaryTask={handleToggleKaryTask} 
                    />;
        case 'kary':
            return <KaryView 
                        tasks={tasks} 
                        setTasks={setTasks} 
                        allLogs={logs}
                        onAddLog={handleAddLog}
                        sentReminders={sentReminders}
                        setSentReminders={setSentReminders} 
                        onToggleKaryTask={handleToggleKaryTask}
                        apiKey={apiKey}
                    />;
        case 'abhyasa':
             return <AbhyasaView
                        goals={goals}
                        milestones={milestones}
                        quickWins={quickWins}
                        habits={habits}
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
                    />;
        case 'vidya':
            return <VidyaView />;
        default:
            return <DainandiniView 
                        allLogs={logs}
                        logTemplates={logTemplates}
                        onAddLog={handleAddLog}
                        onDeleteLog={handleDeleteLog}
                        onUpdateLog={handleUpdateLog}
                        onAddLogTemplate={handleAddLogTemplate}
                        onUpdateLogTemplate={handleUpdateLogTemplate}
                        onDeleteLogTemplate={handleDeleteLogTemplate}
                        onToggleKaryTask={handleToggleKaryTask} 
                    />;
    }
  };

  return (
    <div className="flex h-screen font-sans text-gray-800 bg-transparent">
      <IconSidebar activeView={activeView} onSetView={setActiveView} onProfileClick={() => setIsApiKeyModalOpen(true)} />
      {renderActiveView()}
      {isApiKeyModalOpen && (
        <ApiKeyModal
          currentApiKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setIsApiKeyModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
