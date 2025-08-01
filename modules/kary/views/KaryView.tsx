import React, { useState, useMemo, useEffect } from 'react';
import KarySidebar from '~/modules/kary/components/KarySidebar';
import KaryTaskList from '~/modules/kary/components/KaryTaskList';
import { KaryTaskDetail } from '~/modules/kary/components/KaryTaskDetail';
import Modal from '~/components/common/Modal';
import AddListForm from '~/modules/kary/components/forms/AddListForm';
import AddTagForm from '~/modules/kary/components/forms/AddTagForm';
import ResizablePanels from '~/components/common/ResizablePanels';
import { Task, List, ListFolder, Tag, TagFolder, Selection } from '~/modules/kary/types';
import LogEntryModal from '~/modules/dainandini/components/LogEntryModal';
import { initialFoci } from '~/modules/dainandini/data';
import { useKaryStore } from '../karyStore';
import useWindowSize from '~/hooks/useWindowSize';

const KaryView: React.FC<{ isAppSidebarOpen: boolean }> = ({ isAppSidebarOpen }) => {
  const {
    tasks,
    lists,
    tags,
    listFolders,
    tagFolders,
    addTask,
    updateTask,
    deleteTask,
    addList,
    updateList,
    deleteList,
    addTag,
    updateTag,
    deleteTag,
    addListFolder,
    updateListFolder,
    deleteListFolder,
    addTagFolder,
    updateTagFolder,
    deleteTagFolder,
  } = useKaryStore();

  const { width } = useWindowSize();
  const isMobile = width !== undefined && width < 768; // Define mobile breakpoint

  const [selectedItem, setSelectedItem] = useState<Selection>({ type: 'list', id: 'inbox' });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    tasks.filter((t) => !t.parentId).length > 0 ? tasks.filter((t) => !t.parentId)[0].id : null
  );
  const [modal, setModal] = useState<'add-list' | 'add-tag' | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [logModalTask, setLogModalTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false); // New state for mobile detail view

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

    const smartLists: List[] = [
      { id: 'inbox', name: 'Inbox', icon: 'InboxIcon', count: inboxCount },
      { id: 'today', name: 'Today', icon: 'CalendarIcon', count: todayCount },
      { id: 'upcoming', name: 'Upcoming', icon: 'CalendarIcon', count: upcomingCount },
    ];

    return [...smartLists, ...lists];
  }, [tasks, lists]);

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
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    const topLevelTasks = displayedTasks.filter((t) => !t.parentId);
    if (!selectedTaskId || !tasks.some((t) => t.id === selectedTaskId)) {
      setSelectedTaskId(topLevelTasks.length > 0 ? topLevelTasks[0].id : null);
    }
  }, [displayedTasks, selectedTaskId, tasks]);

  const handleAddTask = async (taskData: any, list?: List | null, parentId?: string) => {
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
      for (const tagName of taskData.tagNames) {
        let tag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
        if (!tag) {
          const newTag = await addTag({ name: tagName, color: 'red-500' });
        }
        newTags.push(tag.id);
      }
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
    await addTask(newTask);
  };

  const handleDuplicateTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newTask: Omit<Task, 'id'> = {
      ...task,
      title: `${task.title} (Copy)`,
      createdAt: new Date(),
    };
    await addTask(newTask);
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
        customLists={lists}
        listFolders={listFolders}
        tags={tags}
        tagFolders={tagFolders}
        selectedItem={selectedItem}
        onSelectItem={(selection) => {
          setSelectedItem(selection);
          if (isMobile) setShowDetail(false); // Hide detail on sidebar item click
        }}
        onOpenModal={setModal}
        isMobile={isMobile}
        isSidebarOpen={isAppSidebarOpen}
      />
      <main className="flex-1 flex min-w-0">
        {isMobile && showDetail && selectedTaskId ? (
          <KaryTaskDetail
            selectedTaskId={selectedTaskId}
            tasks={tasks}
            allTags={tags}
            allLists={allLists}
            allLogs={[]}
            childrenTasks={childrenOfSelectedTask}
            onToggleComplete={(taskId) => updateTask(taskId, { completed: !tasks.find(t => t.id === taskId)?.completed, completionDate: new Date() })}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onDuplicateTask={handleDuplicateTask}
            onSelectTask={(id) => {
              setSelectedTaskId(id);
              setShowDetail(true);
            }}
            onAddTask={handleAddTask}
            onOpenLogModal={setLogModalTask}
            onBack={() => setShowDetail(false)} // Back button for mobile
          />
        ) : isMobile && !showDetail ? (
          <KaryTaskList
            viewDetails={currentViewDetails}
            tasks={displayedTasks}
            allLists={allLists}
            allTags={tags}
            selectedTaskId={selectedTaskId}
            expandedTasks={expandedTasks}
            onSelectTask={(id) => {
              setSelectedTaskId(id);
              setShowDetail(true);
            }}
            onToggleComplete={(taskId) => updateTask(taskId, { completed: !tasks.find(t => t.id === taskId)?.completed, completionDate: new Date() })}
            onAddTask={handleAddTask}
            onToggleExpand={(taskId) =>
              setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
            }
          />
        ) : (
          <ResizablePanels initialLeftWidth={45}>
            <KaryTaskList
              viewDetails={currentViewDetails}
              tasks={displayedTasks}
              allLists={allLists}
              allTags={tags}
              selectedTaskId={selectedTaskId}
              expandedTasks={expandedTasks}
              onSelectTask={(id) => {
                setSelectedTaskId(id);
                setShowDetail(true);
              }}
              onToggleComplete={(taskId) => updateTask(taskId, { completed: !tasks.find(t => t.id === taskId)?.completed, completionDate: new Date() })}
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
              allLogs={[]}
              childrenTasks={childrenOfSelectedTask}
              onToggleComplete={(taskId) => updateTask(taskId, { completed: !tasks.find(t => t.id === taskId)?.completed, completionDate: new Date() })}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onDuplicateTask={handleDuplicateTask}
              onSelectTask={(id) => {
                setSelectedTaskId(id);
                setShowDetail(true);
              }}
              onAddTask={handleAddTask}
              onOpenLogModal={setLogModalTask}
            />
          </ResizablePanels>
        )}
      </main>
      {modal && (
        <Modal
          title={modal === 'add-list' ? 'Create New List' : 'Create New Tag'}
          onClose={() => setModal(null)}
        >
          {modal === 'add-list' && (
            <AddListForm
              folders={listFolders}
              onAddList={addList}
              onAddListFolder={addListFolder}
            />
          )}
          {modal === 'add-tag' && (
            <AddTagForm folders={tagFolders} onAddTag={addTag} onAddTagFolder={addTagFolder} />
          )}
        </Modal>
      )}
      {logModalTask && (
        <LogEntryModal
          isOpen={true}
          onClose={() => setLogModalTask(null)}
          onAddLog={(logData) => {}}
          allFoci={initialFoci.filter((f) => f.id === 'kary' || f.id === 'general')}
          initialFocusId="kary"
          initialTitle={`Log for: ${logModalTask.title}`}
        />
      )}
    </>
  );
};

export default KaryView;