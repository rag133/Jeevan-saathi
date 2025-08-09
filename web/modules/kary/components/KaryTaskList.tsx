import React, { useMemo, useState } from 'react';
import { Task, List, Tag } from '~/modules/kary/types';
import KaryTaskItem from './KaryTaskItem';
import {
  MenuIcon,
  SortIcon,
  MoreHorizontalIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
} from '~/components/Icons';
import * as Icons from '~/components/Icons';
import InteractiveTaskInput from './InteractiveTaskInput';
import SearchFilterSortControls from './SearchFilterSortControls';
import ListOptionsMenu from './ListOptionsMenu';
import { useKaryStore } from '../karyStore';

interface KaryTaskListProps {
  viewDetails: (List | (Tag & { name: string })) | undefined;
  tasks: Task[];
  allLists: List[];
  allTags: Tag[];
  selectedTaskId: string | null;
  expandedTasks: Record<string, boolean>;
  onSelectTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAddTask: (taskData: Record<string, unknown>, list?: List | null) => Promise<void>;
  onToggleExpand: (taskId: string) => void;
  onEditList?: (list: List) => void;
  onDeleteList?: (listId: string) => void;
  onSetDefaultList?: (listId: string) => void;
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
  onEditList,
  onDeleteList,
  onSetDefaultList,
}) => {
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);
  
  const {
    searchQuery,
    filterOption,
    sortOption,
    sortDirection,
    setSearchQuery,
    setFilterOption,
    setSortOption,
    setSortDirection,
    getFilteredAndSortedTasks,
  } = useKaryStore();

  // Apply search, filter, and sort to the tasks
  const filteredAndSortedTasks = useMemo(() => {
    return getFilteredAndSortedTasks(tasks);
  }, [tasks, getFilteredAndSortedTasks, searchQuery, filterOption, sortOption, sortDirection]);

  const { taskTree, childrenByParentId, completedTasks, completedChildrenByParentId } = useMemo(() => {
    const childrenByParentId = new Map<string, Task[]>();
    const taskTree: Task[] = [];
    const completedChildrenByParentId = new Map<string, Task[]>();
    const completedTaskTree: Task[] = [];

    // Separate completed and uncompleted tasks
    const uncompletedTasks = filteredAndSortedTasks.filter(task => !task.completed);
    const completedTasksFiltered = filteredAndSortedTasks.filter(task => task.completed);

    // Build the task tree for uncompleted tasks
    uncompletedTasks.forEach((task) => {
      if (task.parentId) {
        if (!childrenByParentId.has(task.parentId)) {
          childrenByParentId.set(task.parentId, []);
        }
        childrenByParentId.get(task.parentId)!.push(task);
      } else {
        taskTree.push(task);
      }
    });

    // Build the task tree for completed tasks
    completedTasksFiltered.forEach((task) => {
      if (task.parentId) {
        if (!completedChildrenByParentId.has(task.parentId)) {
          completedChildrenByParentId.set(task.parentId, []);
        }
        completedChildrenByParentId.get(task.parentId)!.push(task);
      } else {
        completedTaskTree.push(task);
      }
    });

    // Get top-level uncompleted tasks
    const taskExists = (id: string) => uncompletedTasks.some((t) => t.id === id);
    const topLevelTasks = uncompletedTasks.filter((t) => !t.parentId || !taskExists(t.parentId));

    // Get top-level completed tasks
    const completedTaskExists = (id: string) => completedTasksFiltered.some((t) => t.id === id);
    const topLevelCompletedTasks = completedTaskTree.filter((t) => !t.parentId || !completedTaskExists(t.parentId));

    // Sort completed tasks by completion date (newest first)
    topLevelCompletedTasks.sort((a, b) => {
      const dateA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
      const dateB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
      return dateB - dateA;
    });

    return { 
      taskTree: topLevelTasks, 
      childrenByParentId, 
      completedTasks: topLevelCompletedTasks,
      completedChildrenByParentId
    };
  }, [filteredAndSortedTasks]);

  // Check if current view is a smart list
  const isSmartList = viewDetails && 'id' in viewDetails && ['today', 'due', 'upcoming'].includes(viewDetails.id);

  if (!viewDetails) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.ListIcon className="w-8 h-8 text-gray-400" />
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

  const renderCompletedTaskAndChildren = (task: Task, level: number) => {
    const children = completedChildrenByParentId.get(task.id) || [];
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
        {isExpanded && children.map((child) => renderCompletedTaskAndChildren(child, level + 1))}
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
                {viewDetails && 'icon' in viewDetails ? (
                  (() => {
                    const IconComponent = Icons[viewDetails.icon as keyof typeof Icons] || Icons.ListIcon;
                    return <IconComponent className="w-5 h-5 text-indigo-600" />;
                  })()
                ) : (
                  <MenuIcon className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{viewDetails.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Search, Filter, Sort Controls */}
              <SearchFilterSortControls
                searchQuery={searchQuery}
                filterOption={filterOption}
                sortOption={sortOption}
                sortDirection={sortDirection}
                onSearchChange={setSearchQuery}
                onFilterChange={setFilterOption}
                onSortChange={setSortOption}
                onSortDirectionChange={setSortDirection}
              />
              
              {/* Ellipsis Menu - only for regular lists */}
              {viewDetails && 'id' in viewDetails && onEditList && onDeleteList && (
                <ListOptionsMenu
                  list={viewDetails as List}
                  onEditList={onEditList}
                  onDeleteList={onDeleteList}
                  onSetDefaultList={onSetDefaultList}
                  isSmartList={isSmartList}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Uncompleted Tasks */}
          {taskTree.length > 0 ? (
            <div className="space-y-3 mb-6">
              {taskTree.map((task) => renderTaskAndChildren(task, 0))}
            </div>
          ) : completedTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {viewDetails && 'icon' in viewDetails ? (
                  (() => {
                    const IconComponent = Icons[viewDetails.icon as keyof typeof Icons] || Icons.ListIcon;
                    return <IconComponent className="w-8 h-8 text-gray-400" />;
                  })()
                ) : (
                  <Icons.ListIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterOption !== 'all' ? 'No matching tasks' : 'No tasks yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterOption !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by adding your first task below'
                }
              </p>
              {!searchQuery && filterOption === 'all' && (
                <div className="text-xs text-gray-400">
                  <p>• Use the input below to add tasks</p>
                  <p>• Organize with lists and tags</p>
                  <p>• Track your progress</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors duration-200 mb-3"
              >
                {isCompletedExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
                Completed {completedTasks.length}
              </button>
              
              {isCompletedExpanded && (
                <div className="space-y-2">
                  {completedTasks.map((task) => renderCompletedTaskAndChildren(task, 0))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Panel - Add Task Input */}
      <div className="border-t border-gray-200 p-3">
        <InteractiveTaskInput
          lists={allLists.filter((l) => l.id !== 'today' && l.id !== 'upcoming')}
          tags={allTags}
          onAddTask={onAddTask}
        />
      </div>
    </div>
  );
};

export default KaryTaskList;
