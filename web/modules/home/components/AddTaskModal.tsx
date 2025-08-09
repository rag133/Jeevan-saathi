import React, { useState } from 'react';
import Modal from '~/components/common/Modal';
import { useKaryStore } from '~/modules/kary/karyStore';
import { useHomeStore } from '../homeStore';
import * as Icons from '~/components/Icons';
import DateTimePicker from '~/components/DateTimePicker';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(2);
  const [dueDate, setDueDate] = useState<Date | undefined>(selectedDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask, lists } = useKaryStore();
  const { refreshData } = useHomeStore();

  // Set default list to Inbox when modal opens
  React.useEffect(() => {
    if (isOpen && lists.length > 0) {
      const inboxList = lists.find(l => l.name === 'Inbox');
      setSelectedListId(inboxList?.id || lists[0]?.id || '');
      setDueDate(selectedDate);
    }
  }, [isOpen, lists, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedListId) return;

    setIsSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        listId: selectedListId,
        completed: false,
        dueDate: dueDate,
        priority: priority,
        createdAt: new Date(),
      });
      
      setTitle('');
      setDescription('');
      setSelectedListId('');
      setPriority(2);
      setDueDate(undefined);
      await refreshData();
      onClose();
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityLabel = (p: number) => {
    switch (p) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Urgent';
      default: return 'Medium';
    }
  };

  const getPriorityColor = (p: number) => {
    switch (p) {
      case 1: return 'text-gray-500';
      case 2: return 'text-blue-500';
      case 3: return 'text-orange-500';
      case 4: return 'text-red-500';
      default: return 'text-blue-500';
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

        {/* List Selection */}
        <div>
          <label htmlFor="list" className="block text-sm font-medium text-gray-700 mb-1">
            List *
          </label>
          <select
            id="list"
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {lists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[1, 2, 3, 4].map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p as 1 | 2 | 3 | 4)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isSelected
                      ? 'bg-white shadow-sm'
                      : 'hover:bg-gray-50'
                  } ${getPriorityColor(p)}`}
                >
                  {getPriorityLabel(p)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date & Time
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Icons.CalendarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {dueDate 
                  ? `${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}`
                  : 'Set due date & time'
                }
              </span>
            </button>
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate(undefined)}
                className="text-red-500 hover:text-red-700"
              >
                <Icons.XIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          {showDatePicker && (
            <div className="mt-2">
              <DateTimePicker
                currentDate={dueDate || new Date()}
                onSelect={(date) => {
                  setDueDate(date);
                  setShowDatePicker(false);
                }}
                onClear={() => setDueDate(undefined)}
                onClose={() => setShowDatePicker(false)}
              />
            </div>
          )}
        </div>

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
            disabled={!title.trim() || !selectedListId || isSubmitting}
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