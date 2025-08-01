import React, { useMemo } from 'react';
import { Task, List, Tag } from '~/modules/kary/types';
import KaryTaskItem from './KaryTaskItem';
import {
  MenuIcon,
  SortIcon,
  MoreHorizontalIcon,
  ChevronRightIcon,
} from '~/components/Icons';
import InteractiveTaskInput from './InteractiveTaskInput';
import { NewTaskData } from '../views/KaryView';

interface KaryTaskListProps {
  viewDetails: (List | (Tag & { name: string })) | undefined;
  tasks: Task[];
  allLists: List[];
  allTags: Tag[];
  selectedTaskId: string | null;
  expandedTasks: Record<string, boolean>;
  onSelectTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAddTask: (taskData: NewTaskData, list?: List | null) => void;
  onToggleExpand: (taskId: string) => void;
}

const KaryTaskList: React.FC<KaryTaskListProps> = ({
  viewDetails,
  tasks,
  allLists,
  allTags,
  selectedTaskId,
  expandedTasks,
  onSelectTask,
  onToggleComplete,
  onAddTask,
  onToggleExpand,
}) => {
  const { taskTree, childrenByParentId } = useMemo(() => {
    const childrenByParentId = new Map<string, Task[]>();
    const taskTree: Task[] = [];

    tasks.forEach((task) => {
      if (task.parentId) {
        if (!childrenByParentId.has(task.parentId)) {
          childrenByParentId.set(task.parentId, []);
        }
        childrenByParentId.get(task.parentId)!.push(task);
      } else {
        taskTree.push(task);
      }
    });

    const taskExists = (id: string) => tasks.some((t) => t.id === id);
    const topLevelTasks = tasks.filter((t) => !t.parentId || !taskExists(t.parentId));

    return { taskTree: topLevelTasks, childrenByParentId };
  }, [tasks]);

  if (!viewDetails) {
    return (
      <div className="w-full h-full bg-white/80 p-4 flex items-center justify-center text-gray-500">
        Select a list or tag from the sidebar.
      </div>
    );
  }

  const renderTaskAndChildren = (task: Task, level: number) => {
    const children = childrenByParentId.get(task.id) || [];
    const isExpanded = !!expandedTasks[task.id];

    return (
      <React.Fragment key={task.id}>
        <KaryTaskItem
          task={task}
          allTags={allTags}
          isSelected={task.id === selectedTaskId}
          onSelect={onSelectTask}
          onToggleComplete={onToggleComplete}
          level={level}
          isParent={children.length > 0}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
        {isExpanded && children.map((child) => renderTaskAndChildren(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="w-full h-full border-l border-gray-200 flex flex-col bg-white/80">
      <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          
          <h1 className="text-xl font-semibold text-gray-800">{viewDetails.name}</h1>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <button className="p-1 hover:text-gray-800">
            <SortIcon className="w-5 h-5" />
          </button>
          <button className="p-1 hover:text-gray-800">
            <MoreHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="p-4 flex-shrink-0">
        <InteractiveTaskInput
          lists={allLists.filter((l) => l.id !== 'today' && l.id !== 'upcoming')} // Cannot add to smart lists
          tags={allTags}
          onAddTask={onAddTask}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {taskTree.length > 0 ? (
          <ul>{taskTree.map((task) => renderTaskAndChildren(task, 0))}</ul>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No tasks here. Great job!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KaryTaskList;
