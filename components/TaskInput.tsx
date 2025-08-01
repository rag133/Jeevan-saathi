import React, { useState } from 'react';
import { MagicWandIcon } from './Icons';
import LoadingSpinner from './LoadingSpinner';

interface TaskInputProps {
  onAddTask: (title: string) => void;
  isLoading: boolean;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, isLoading }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isLoading) {
      onAddTask(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="relative">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Plan a trip to Japan"
          className="w-full pl-4 pr-32 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center px-4 m-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
          disabled={isLoading || !title.trim()}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <MagicWandIcon className="w-5 h-5 mr-2" />
              <span>Break Down</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskInput;
