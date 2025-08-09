import React, { useState } from 'react';
import Modal from '~/components/common/Modal';
import { useAbhyasaStore } from '~/modules/abhyasa/abhyasaStore';
import { useHomeStore } from '../homeStore';
import * as Icons from '~/components/Icons';
import DateTimePicker from '~/components/DateTimePicker';

interface AddHabitLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

const AddHabitLogModal: React.FC<AddHabitLogModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [logDate, setLogDate] = useState<Date>(selectedDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { habits, addHabitLog } = useAbhyasaStore();
  const { refreshData } = useHomeStore();

  // Set default habit when modal opens
  React.useEffect(() => {
    if (isOpen && habits.length > 0) {
      setSelectedHabitId(habits[0]?.id || '');
      setLogDate(selectedDate || new Date());
    }
  }, [isOpen, habits, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHabitId) return;

    setIsSubmitting(true);
    try {
      await addHabitLog({
        habitId: selectedHabitId,
        date: logDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        value: 1, // Default value for habit completion
      });
      
      setSelectedHabitId('');
      setLogDate(new Date());
      await refreshData();
      onClose();
    } catch (error) {
      console.error('Failed to add habit log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Log Habit" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Selection */}
        <div>
          <label htmlFor="habit" className="block text-sm font-medium text-gray-700 mb-1">
            Select Habit *
          </label>
          <select
            id="habit"
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a habit...</option>
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Log Date & Time
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Icons.CalendarIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {logDate.toLocaleDateString()} at {logDate.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </button>
          </div>
          {showDatePicker && (
            <div className="mt-2">
              <DateTimePicker
                currentDate={logDate}
                onSelect={(date) => {
                  setLogDate(date);
                  setShowDatePicker(false);
                }}
                onClear={() => {}}
                onClose={() => setShowDatePicker(false)}
              />
            </div>
          )}
        </div>



        {/* Completion Status */}
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center">
            <Icons.CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Marking habit as completed
            </span>
          </div>
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
            disabled={!selectedHabitId || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Logging...' : 'Log Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddHabitLogModal; 