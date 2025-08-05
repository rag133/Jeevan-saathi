import React, { useState } from 'react';
import Modal from '~/components/common/Modal';
import { useKaryStore } from '~/modules/kary/karyStore';
import { useHomeStore } from '../homeStore';
import * as Icons from '~/components/Icons';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask, lists } = useKaryStore();
  const { refreshData } = useHomeStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        listId: lists.find(l => l.name === 'Inbox')?.id || lists[0]?.id || '',
        completed: false,
        dueDate: selectedDate,
      });
      
      setTitle('');
      setDescription('');
      await refreshData();
      onClose();
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Add New Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task title..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter task description..."
            rows={3}
          />
        </div>

        {selectedDate && (
          <div className="text-sm text-gray-600">
            <Icons.CalendarIcon className="w-4 h-4 inline mr-1" />
            Due: {selectedDate.toLocaleDateString()}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal; 