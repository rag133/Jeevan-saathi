import React from 'react';
import { Task, List, Tag } from '~/types';
import TaskItem from './TaskItem';
import { HamburgerMenuIcon, SortIcon, MoreHorizontalIcon } from './Icons';
import { ExtractedTaskData } from '~/services/geminiService';
import InteractiveTaskInput from './InteractiveTaskInput';

interface TaskListProps {
  viewDetails: (List | (Tag & { name: string })) | undefined;
  tasks: Task[];
  allLists: List[];
  allTags: Tag[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onAddTask: (taskData: ExtractedTaskData, list?: List | null) => void;
  apiKey: string | null;
}

const TaskList: React.FC<TaskListProps> = ({
  viewDetails,
  tasks,
  allLists,
  allTags,
  selectedTaskId,
  onSelectTask,
  onToggleComplete,
  onAddTask,
  apiKey,
}) => {
  if (!viewDetails) {
    return (
      <div className="w-full h-full bg-white/80 p-4 flex items-center justify-center text-gray-500">
        Select a list or tag from the sidebar.
      </div>
    );
  }

  return (
    <div className="w-full h-full border-l border-gray-200 flex flex-col bg-white/80">
      <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <button className="p-1 text-gray-500 hover:text-gray-800 lg:hidden">
            <HamburgerMenuIcon className="w-5 h-5" />
          </button>
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
          apiKey={apiKey}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                allTags={allTags}
                isSelected={task.id === selectedTaskId}
                onSelect={onSelectTask}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No tasks here. Great job!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
