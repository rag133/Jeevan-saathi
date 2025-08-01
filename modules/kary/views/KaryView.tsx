import React, { useState, useMemo, useEffect } from 'react';
import KarySidebar from '../components/KarySidebar';
import KaryTaskList from '../components/KaryTaskList';
import KaryTaskDetail from '../components/KaryTaskDetail';
import Modal from '../../../components/common/Modal';
import AddListForm from '../components/forms/AddListForm';
import AddTagForm from '../components/forms/AddTagForm';
import ResizablePanels from '../../../components/common/ResizablePanels';
import {
  smartLists as initialSmartLists,
  customLists as initialCustomLists,
  listFolders as initialListFolders,
  tags as initialTags,
  tagFolders as initialTagFolders,
} from '../data';
import { Task, List, ListFolder, Tag, TagFolder, Selection } from '../types';
import LogEntryModal from '../../dainandini/components/LogEntryModal';
import { initialFoci } from '../../dainandini/data';
import { Log, LogType } from '../../dainandini/types';

// This is a new interface to replace ExtractedTaskData
export interface NewTaskData {
  title: string;
  list?: List | null;
  tagNames: string[];
  priority: 1 | 2 | 3 | 4 | null;
  dueDate: string | null;
}

interface KaryViewProps {
  tasks: Task[];
  onAddTask: (taskData: Omit<Task, 'id'>) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  allLogs: Log[];
  onAddLog: (logData: Partial<Omit<Log, 'id' | 'createdAt'>>) => void;
  sentReminders: Set<string>;
  setSentReminders: React.Dispatch<React.SetStateAction<Set<string>>>;
  onToggleKaryTask: (taskId: string) => void;
  customLists: List[];
  tags: Tag[];
  listFolders: ListFolder[];
  tagFolders: TagFolder[];
  onAddList: (listData: Omit<List, 'id'>) => Promise<List>;
  onUpdateList: (listId: string, updates: Partial<List>) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onAddTag: (tagData: Omit<Tag, 'id'>) => Promise<Tag>;
  onUpdateTag: (tagId: string, updates: Partial<Tag>) => Promise<void>;
  onDeleteTag: (tagId: string) => Promise<void>;
  onAddListFolder: (folderData: Omit<ListFolder, 'id'>) => Promise<ListFolder>;
  onUpdateListFolder: (folderId: string, updates: Partial<ListFolder>) => Promise<void>;
  onDeleteListFolder: (folderId: string) => Promise<void>;
  onAddTagFolder: (folderData: Omit<TagFolder, 'id'>) => Promise<TagFolder>;
  onUpdateTagFolder: (folderId: string, updates: Partial<TagFolder>) => Promise<void>;
  onDeleteTagFolder: (folderId: string) => Promise<void>;
}

const KaryView: React.FC<KaryViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  allLogs,
  onAddLog,
  sentReminders,
  setSentReminders,
  onToggleKaryTask,
  customLists,
  tags,
  listFolders,
  tagFolders,
  onAddList,
  onUpdateList,
  onDeleteList,
  onAddTag,
  onUpdateTag,
  onDeleteTag,
  onAddListFolder,
  onUpdateListFolder,
  onDeleteListFolder,
  onAddTagFolder,
  onUpdateTagFolder,
  onDeleteTagFolder,
}) => {
  const [selectedItem, setSelectedItem] = useState<Selection>({ type: 'list', id: 'inbox' });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    tasks.filter((t) => !t.parentId).length > 0 ? tasks.filter((t) => !t.parentId)[0].id : null
  );
  const [modal, setModal] = useState<'add-list' | 'add-tag' | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [logModalTask, setLogModalTask] = useState<Task | null>(null);

  const allLists = useMemo(() => {
    const todayCount = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate).toDateString() === new Date().toDateString() &&
        !t.completed
    ).length;
    const upcomingCount = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) > new Date() && !t.completed
    ).length;
    const inboxCount = tasks.filter((t) => t.listId === 'inbox' && !t.completed).length;

    const updatedSmartLists: List[] = initialSmartLists.map((list) => {
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
        filteredTasks = tasks.filter(
          (t) => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()
        );
      } else if (selectedItem.id === 'upcoming') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filteredTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= today);
      } else {
        filteredTasks = tasks.filter((t) => t.listId === selectedItem.id);
      }
    } else {
      // type === 'tag'
      filteredTasks = tasks.filter((t) => t.tags?.includes(selectedItem.id));
    }

    const taskSet = new Set(filteredTasks.map((t) => t.id));
    const tasksWithParents = new Set(filteredTasks);

    filteredTasks.forEach((task) => {
      let current = task;
      while (current.parentId && !taskSet.has(current.parentId)) {
        const parent = tasks.find((t) => t.id === current.parentId);
        if (parent) {
          tasksWithParents.add(parent);
          taskSet.add(parent.id);
          current = parent;
        } else {
          break;
        }
      }
    });

    return Array.from(tasksWithParents).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [selectedItem, tasks]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [selectedTaskId, tasks]
  );
  const childrenOfSelectedTask = useMemo(() => {
    if (!selectedTaskId) return [];
    return tasks
      .filter((t) => t.parentId === selectedTaskId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    const topLevelTasks = displayedTasks.filter((t) => !t.parentId);
    // If selectedTaskId is null or doesn't exist in the current tasks, select the first top-level task
    if (!selectedTaskId || !tasks.some((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(topLevelTasks.length > 0 ? topLevelTasks[0].id : null);
    } else {
      // Ensure selectedTaskId refers to a task with a Firestore-generated ID
      const currentSelectedTask = tasks.find((t) => t.id === selectedTaskId);
      if (currentSelectedTask && currentSelectedTask.id !== selectedTaskId) {
        setSelectedTaskId(currentSelectedTask.id);
      }
    }
  }, [displayedTasks, selectedTaskId, tasks]);

  const handleAddTask = async (taskData: NewTaskData, list?: List | null, parentId?: string) => {
    const getListId = () => {
      if (parentId) return tasks.find((t) => t.id === parentId)?.listId || 'inbox';
      if (list) return list.id;
      if (taskData.list) return taskData.list.id;
      if (
        selectedItem.type === 'list' &&
        selectedItem.id !== 'today' &&
        selectedItem.id !== 'upcoming'
      )
        return selectedItem.id;
      return 'inbox';
    };

    const newTags: string[] = [];
    if (taskData.tagNames) {
      taskData.tagNames.forEach((tagName) => {
        let tag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
        if (!tag) {
          const colors = [
            'red-500',
            'blue-500',
            'green-500',
            'yellow-500',
            'purple-500',
            'teal-500',
          ];
          const newTag: Tag = {
            id: crypto.randomUUID(),
            name: tagName,
            color: colors[Math.floor(Math.random() * colors.length)],
          };
          setTags((prev) => [...prev, newTag]);
          tag = newTag;
        }
        newTags.push(tag.id);
      });
    }

    const newTask: Omit<Task, 'id'> = {
      title: taskData.title,
      listId: getListId(),
      completed: false,
      createdAt: new Date(),
      parentId: parentId,
      tags: newTags,
      priority: taskData.priority || undefined,
      dueDate:
        taskData.dueDate && taskData.dueDate.trim() !== '' ? new Date(taskData.dueDate) : undefined,
    };
    const firestoreTaskId = await onAddTask(newTask);
    if (!parentId) {
      setSelectedTaskId(firestoreTaskId);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
    await onUpdateTask(taskId, updates);
  };

  const handleDeleteTask = async (taskId: string) => {
    await onDeleteTask(taskId);

    if (selectedTaskId === taskId) {
      const topLevelTasks = displayedTasks.filter((t) => !t.parentId && t.id !== taskId);
      setSelectedTaskId(topLevelTasks.length > 0 ? topLevelTasks[0].id : null);
    }
  };

  const handleDuplicateTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      title: `${task.title} (Copy)`,
      createdAt: new Date(),
    };
    await onAddTask(newTask);
    setSelectedTaskId(newTask.id);
  };

  const handleAddList = async (listData: Omit<List, 'id' | 'count'>, newFolderName?: string) => {
    let folderId = listData.folderId;
    if (newFolderName) {
      const newFolder = await onAddListFolder({ name: newFolderName });
      folderId = newFolder.id;
    }
    const newList = await onAddList({ ...listData, folderId: folderId });
    setModal(null);
    setSelectedItem({ type: 'list', id: newList.id });
  };

  const handleAddTag = async (tagData: Omit<Tag, 'id'>, newFolderName?: string) => {
    let folderId = tagData.folderId;
    if (newFolderName) {
      const newFolder = await onAddTagFolder({ name: newFolderName });
      folderId = newFolder.id;
    }
    const newTag = await onAddTag({ ...tagData, folderId });
    setModal(null);
    setSelectedItem({ type: 'tag', id: newTag.id });
  };

  const currentViewDetails = useMemo(() => {
    if (selectedItem.type === 'list') {
      return allLists.find((l) => l.id === selectedItem.id);
    }
    return tags.find((t) => t.id === selectedItem.id);
  }, [selectedItem, allLists, tags]);

  return (
    <>
      <KarySidebar
        smartLists={allLists.filter((l) => ['inbox', 'today', 'upcoming'].includes(l.id))}
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
            onToggleExpand={(taskId) =>
              setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
            }
          />
          <KaryTaskDetail
            selectedTaskId={selectedTaskId}
            tasks={tasks}
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
            onOpenLogModal={setLogModalTask}
          />
        </ResizablePanels>
      </main>
      {modal && (
        <Modal
          title={modal === 'add-list' ? 'Create New List' : 'Create New Tag'}
          onClose={() => setModal(null)}
        >
          {modal === 'add-list' && (
            <AddListForm
              folders={listFolders}
              onAddList={onAddList}
              onAddListFolder={onAddListFolder}
            />
          )}
          {modal === 'add-tag' && (
            <AddTagForm folders={tagFolders} onAddTag={onAddTag} onAddTagFolder={onAddTagFolder} />
          )}
        </Modal>
      )}
      {logModalTask && (
        <LogEntryModal
          isOpen={true}
          onClose={() => setLogModalTask(null)}
          onAddLog={(logData) => onAddLog({ ...logData, taskId: logModalTask.id })}
          allFoci={initialFoci.filter((f) => f.id === 'kary' || f.id === 'general')}
          initialFocusId="kary"
          initialTitle={`Log for: ${logModalTask.title}`}
        />
      )}
    </>
  );
};

export default KaryView;
