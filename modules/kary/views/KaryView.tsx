

import React, { useState, useMemo, useEffect } from 'react';
import KarySidebar from '../components/KarySidebar';
import KaryTaskList from '../components/KaryTaskList';
import KaryTaskDetail from '../components/KaryTaskDetail';
import Modal from '../../../components/Modal';
import AddListForm from '../components/forms/AddListForm';
import AddTagForm from '../components/forms/AddTagForm';
import ResizablePanels from '../../../components/ResizablePanels';
import { 
    smartLists as initialSmartLists, 
    customLists as initialCustomLists, 
    listFolders as initialListFolders, 
    tags as initialTags, 
    tagFolders as initialTagFolders
} from '../data';
import { Task, List, ListFolder, Tag, TagFolder, Selection } from '../types';
import { ExtractedTaskData, breakDownTask, generateDailyPlan, DailyPlan } from '../services/geminiService';
import LogEntryModal from '../../dainandini/components/LogEntryModal';
import { initialFoci } from '../../dainandini/data';
import { Log, LogType } from '../../dainandini/types';
import AiPlannerModal from '../components/AiPlannerModal';

interface KaryViewProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    allLogs: Log[];
    onAddLog: (logData: Partial<Omit<Log, 'id' | 'createdAt'>>) => void;
    sentReminders: Set<string>;
    setSentReminders: React.Dispatch<React.SetStateAction<Set<string>>>;
    onToggleKaryTask: (taskId: string) => void;
    apiKey: string | null;
}

const KaryView: React.FC<KaryViewProps> = ({ 
    tasks, 
    setTasks, 
    allLogs, 
    onAddLog, 
    sentReminders, 
    setSentReminders,
    onToggleKaryTask,
    apiKey
}) => {
  const [customLists, setCustomLists] = useState<List[]>(initialCustomLists);
  const [listFolders, setListFolders] = useState<ListFolder[]>(initialListFolders);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [tagFolders, setTagFolders] = useState<TagFolder[]>(initialTagFolders);
  
  const [selectedItem, setSelectedItem] = useState<Selection>({ type: 'list', id: 'inbox' });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(tasks.filter(t => !t.parentId).length > 0 ? tasks.filter(t => !t.parentId)[0].id : null);
  const [modal, setModal] = useState<'add-list' | 'add-tag' | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [logModalTask, setLogModalTask] = useState<Task | null>(null);

  const [isPlannerModalOpen, setIsPlannerModalOpen] = useState(false);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);


  const allLists = useMemo(() => {
    const todayCount = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString() && !t.completed).length;
    const upcomingCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) > new Date() && !t.completed).length;
    const inboxCount = tasks.filter(t => t.listId === 'inbox' && !t.completed).length;

    const updatedSmartLists: List[] = initialSmartLists.map(list => {
      if (list.id === 'today') return { ...list, count: todayCount };
      if (list.id === 'upcoming') return { ...list, count: upcomingCount };
      if (list.id === 'inbox') return { ...list, count: inboxCount };
      return list as List;
    });

    return [...updatedSmartLists, ...customLists];
  }, [tasks, customLists]);

  const displayedTasks = useMemo(() => {
    let filteredTasks: Task[] = [];
    if (selectedItem.type === 'list') {
        if (selectedItem.id === 'today') {
            filteredTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
        } else if (selectedItem.id === 'upcoming') {
            const today = new Date();
            today.setHours(0,0,0,0);
            filteredTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) >= today);
        } else {
            filteredTasks = tasks.filter(t => t.listId === selectedItem.id);
        }
    } else { // type === 'tag'
        filteredTasks = tasks.filter(t => t.tags?.includes(selectedItem.id));
    }
    
    // Ensure parents of subtasks are included for context
    const taskSet = new Set(filteredTasks.map(t => t.id));
    const tasksWithParents = new Set(filteredTasks);

    filteredTasks.forEach(task => {
        let current = task;
        while (current.parentId && !taskSet.has(current.parentId)) {
            const parent = tasks.find(t => t.id === current.parentId);
            if (parent) {
                tasksWithParents.add(parent);
                taskSet.add(parent.id);
                current = parent;
            } else {
                break;
            }
        }
    });

    return Array.from(tasksWithParents).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [selectedItem, tasks]);
  
  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId) || null, [selectedTaskId, tasks]);
  const childrenOfSelectedTask = useMemo(() => {
    if (!selectedTaskId) return [];
    return tasks.filter(t => t.parentId === selectedTaskId).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [selectedTaskId, tasks]);

  useEffect(() => {
      const topLevelTasks = displayedTasks.filter(t => !t.parentId);
      if (!selectedTaskId && topLevelTasks.length > 0) {
          setSelectedTaskId(topLevelTasks[0].id);
      } else if (selectedTaskId && !displayedTasks.some(t => t.id === selectedTaskId)) {
          setSelectedTaskId(topLevelTasks.length > 0 ? topLevelTasks[0].id : null);
      }
  }, [displayedTasks, selectedTaskId]);
  
  const todayTasksForPlanner = useMemo(() => {
    return tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
  }, [tasks]);

  const handlePlanDay = async () => {
    if (!apiKey) {
        alert("Please set your Gemini API key to use the AI Day Planner.");
        return;
    }
    setIsPlannerModalOpen(true);
    setIsPlanning(true);
    setPlannerError(null);
    setDailyPlan(null);

    try {
        const plan = await generateDailyPlan(todayTasksForPlanner, apiKey);
        setDailyPlan(plan);
    } catch (error) {
        setPlannerError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
        setIsPlanning(false);
    }
  };

  const handleApplyPlan = (plan: DailyPlan) => {
    const checklistItems = plan.plan.map(item => ({
        id: crypto.randomUUID(),
        text: `[${item.startTime}-${item.endTime}] ${item.taskTitle}`,
        completed: false,
    }));

    onAddLog({
        title: `AI-Generated Plan for ${new Date().toLocaleDateString()}`,
        focusId: 'kary',
        logType: LogType.CHECKLIST,
        logDate: new Date(),
        checklist: checklistItems,
        description: "This is a schedule generated by AI to help organize the day's tasks."
    });
    setIsPlannerModalOpen(false);
  };

  const handleAddTask = (taskData: ExtractedTaskData, list?: List | null, parentId?: string) => {
    const getListId = () => {
      if (parentId) return tasks.find(t => t.id === parentId)?.listId || 'inbox';
      if (list) return list.id;
      if (taskData.list) return taskData.list.id;
      if (selectedItem.type === 'list' && selectedItem.id !== 'today' && selectedItem.id !== 'upcoming') return selectedItem.id;
      return 'inbox';
    };

    const newTags: string[] = [];
    taskData.tagNames.forEach(tagName => {
        let tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        if (!tag) {
            const colors = ['red-500', 'blue-500', 'green-500', 'yellow-500', 'purple-500', 'teal-500'];
            const newTag: Tag = {
                id: crypto.randomUUID(),
                name: tagName,
                color: colors[Math.floor(Math.random() * colors.length)],
            };
            setTags(prev => [...prev, newTag]);
            tag = newTag;
        }
        newTags.push(tag.id);
    });

    const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskData.title,
        listId: getListId(),
        completed: false,
        createdAt: new Date(),
        parentId: parentId,
        tags: newTags,
        priority: taskData.priority || undefined,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
    };
    setTasks(prev => [newTask, ...prev]);
    if (!parentId) {
        setSelectedTaskId(newTask.id);
    }
  };
  
   const handleGenerateSubtasks = async (parentId: string) => {
    if (!apiKey) {
        alert("Please set your Gemini API key in your profile to use AI features.");
        return;
    }
    const parentTask = tasks.find(t => t.id === parentId);
    if (!parentTask) return;

    try {
        const subtaskTitles = await breakDownTask(parentTask.title, apiKey);
        const newSubtasks: Task[] = subtaskTitles.map(title => ({
            id: crypto.randomUUID(),
            title,
            listId: parentTask.listId,
            parentId: parentId,
            completed: false,
            createdAt: new Date(),
            tags: parentTask.tags,
        }));
        setTasks(prev => [...prev, ...newSubtasks]);
        setExpandedTasks(prev => ({ ...prev, [parentId]: true }));
    } catch (error) {
        console.error("Subtask generation failed:", error);
        alert(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };
  
  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    
    const childrenIds = new Set<string>();
    const findChildren = (parentId: string) => {
        const children = tasks.filter(t => t.parentId === parentId);
        children.forEach(child => {
            childrenIds.add(child.id);
            findChildren(child.id);
        });
    };
    findChildren(taskId);

    setTasks(prev => prev.filter(t => t.id !== taskId && !childrenIds.has(t.id)));
    
    if (selectedTaskId === taskId) {
        const topLevelTasks = displayedTasks.filter(t => !t.parentId && t.id !== taskId);
        setSelectedTaskId(topLevelTasks.length > 0 ? topLevelTasks[0].id : null);
    }
  };

  const handleDuplicateTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newTask: Task = { ...task, id: crypto.randomUUID(), title: `${task.title} (Copy)`, createdAt: new Date() };
    setTasks(prev => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
  };

  const handleAddList = (listData: Omit<List, 'id' | 'count'>, newFolderName?: string) => {
      let folderId = listData.folderId;
      if (newFolderName) {
          const newFolder: ListFolder = { id: `folder-${crypto.randomUUID()}`, name: newFolderName };
          setListFolders(prev => [...prev, newFolder]);
          folderId = newFolder.id;
      }
      const newList: List = { ...listData, id: crypto.randomUUID(), folderId: folderId };
      setCustomLists(prev => [...prev, newList]);
      setModal(null);
      setSelectedItem({ type: 'list', id: newList.id });
  };
  
  const handleAddTag = (tagData: Omit<Tag, 'id'>, newFolderName?: string) => {
      let folderId = tagData.folderId;
      if (newFolderName) {
          const newFolder: TagFolder = { id: `tag-folder-${crypto.randomUUID()}`, name: newFolderName };
          setTagFolders(prev => [...prev, newFolder]);
          folderId = newFolder.id;
      }
      const newTag: Tag = { ...tagData, id: crypto.randomUUID(), folderId };
      setTags(prev => [...prev, newTag]);
      setModal(null);
      setSelectedItem({ type: 'tag', id: newTag.id });
  };

  const currentViewDetails = useMemo(() => {
    if (selectedItem.type === 'list') {
      return allLists.find(l => l.id === selectedItem.id);
    }
    return tags.find(t => t.id === selectedItem.id);
  }, [selectedItem, allLists, tags]);

  return (
    <>
      <KarySidebar
        smartLists={allLists.filter(l => ['inbox', 'today', 'upcoming'].includes(l.id))}
        customLists={customLists}
        listFolders={listFolders}
        tags={tags}
        tagFolders={tagFolders}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        onOpenModal={setModal}
      />
      <main className="flex-1 flex min-w-0">
         <ResizablePanels initialLeftWidth={45}>
            <KaryTaskList
                viewDetails={currentViewDetails}
                tasks={displayedTasks}
                allLists={allLists}
                allTags={tags}
                selectedTaskId={selectedTaskId}
                expandedTasks={expandedTasks}
                onSelectTask={setSelectedTaskId}
                onToggleComplete={onToggleKaryTask}
                onAddTask={handleAddTask}
                onToggleExpand={(taskId) => setExpandedTasks(prev => ({...prev, [taskId]: !prev[taskId]}))}
                apiKey={apiKey}
                onPlanDay={handlePlanDay}
            />
            <KaryTaskDetail
                task={selectedTask}
                allTags={tags}
                allLists={allLists}
                allLogs={allLogs}
                childrenTasks={childrenOfSelectedTask}
                onToggleComplete={onToggleKaryTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onDuplicateTask={handleDuplicateTask}
                onSelectTask={setSelectedTaskId}
                onAddTask={handleAddTask}
                onGenerateSubtasks={handleGenerateSubtasks}
                onOpenLogModal={setLogModalTask}
                apiKey={apiKey}
            />
         </ResizablePanels>
      </main>
      {modal && (
        <Modal title={modal === 'add-list' ? 'Create New List' : 'Create New Tag'} onClose={() => setModal(null)}>
            {modal === 'add-list' && <AddListForm folders={listFolders} onAddList={handleAddList} />}
            {modal === 'add-tag' && <AddTagForm folders={tagFolders} onAddTag={handleAddTag} />}
        </Modal>
      )}
      {logModalTask && (
        <LogEntryModal
            isOpen={true}
            onClose={() => setLogModalTask(null)}
            onAddLog={(logData) => onAddLog({ ...logData, taskId: logModalTask.id })}
            allFoci={initialFoci.filter(f => f.id === 'kary' || f.id === 'general')}
            initialFocusId='kary'
            initialTitle={`Log for: ${logModalTask.title}`}
        />
      )}
      {isPlannerModalOpen && (
        <AiPlannerModal
            isOpen={isPlannerModalOpen}
            onClose={() => setIsPlannerModalOpen(false)}
            plan={dailyPlan}
            isLoading={isPlanning}
            error={plannerError}
            onApplyPlan={handleApplyPlan}
        />
      )}
    </>
  );
};

export default KaryView;
