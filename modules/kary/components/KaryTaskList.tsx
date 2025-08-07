import React, { useMemo } from 'react';
import { Task, List, Tag } from '~/modules/kary/types';
import KaryTaskItem from './KaryTaskItem';
import {
  MenuIcon,
  SortIcon,
  MoreHorizontalIcon,
  ChevronRightIcon,
  FilterIcon,
  SearchIcon,
} from '~/components/Icons';
import InteractiveTaskInput from './InteractiveTaskInput';

interface KaryTaskListProps {
  viewDetails: (List | (Tag & { name: string })) | undefined;
  tasks: Task[];
  allLists: List[];
  allTags: Tag[];
  selectedTaskId: string | null;
  expandedTasks: Record<string, boolean>;
  onSelectTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAddTask: (taskData: any, list?: List | null) => Promise<void>;
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
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MenuIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a List or Tag</h3>
          <p className="text-gray-500">Choose from the sidebar to view your tasks</p>
        </div>
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
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <MenuIcon className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{viewDetails.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <SearchIcon className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <FilterIcon className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <SortIcon className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <MoreHorizontalIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Input */}
      <div className="p-6 border-b border-gray-200">
        <InteractiveTaskInput
          lists={allLists.filter((l) => l.id !== 'today' && l.id !== 'upcoming')}
          tags={allTags}
          onAddTask={onAddTask}
        />
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {taskTree.length > 0 ? (
            <div className="space-y-2">
              {taskTree.map((task) => renderTaskAndChildren(task, 0))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MenuIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first task above</p>
              <div className="text-xs text-gray-400">
                <p>• Use the input above to add tasks</p>
                <p>• Organize with lists and tags</p>
                <p>• Track your progress</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KaryTaskList;
