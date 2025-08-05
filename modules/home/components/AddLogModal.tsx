import React, { useState } from 'react';
import Modal from '~/components/common/Modal';
import { useDainandiniStore } from '~/modules/dainandini/dainandiniStore';
import { useHomeStore } from '../homeStore';
import * as Icons from '~/components/Icons';
import DateTimePicker from '~/components/DateTimePicker';
import { LogType, type LogTemplate, type ChecklistItem } from '~/modules/dainandini/types';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  taskContext?: {
    taskId: string;
    taskTitle: string;
  };
  habitContext?: {
    habitId: string;
    habitTitle: string;
  };
}

const AddLogModal: React.FC<AddLogModalProps> = ({ isOpen, onClose, selectedDate, taskContext, habitContext }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFocusId, setSelectedFocusId] = useState('kary'); // Default to Kary
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logDate, setLogDate] = useState<Date>(selectedDate || new Date());
  const [selectedLogType, setSelectedLogType] = useState<LogType>(LogType.TEXT);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [rating, setRating] = useState(0);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const { foci, logTemplates, addLog } = useDainandiniStore();
  const { refreshData } = useHomeStore();

  // Get selected focus and available templates
  const selectedFocus = foci.find(f => f.id === selectedFocusId);
  const availableTemplates = logTemplates.filter(t => t.focusId === selectedFocusId);

  // Helper function to process placeholders in templates
  const processPlaceholders = (text: string, date: Date): string => {
    return text.replace(
      /{{date}}/gi,
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  };

  // Handle template selection
  const handleTemplateSelect = (template: LogTemplate) => {
    setSelectedLogType(template.logType);
    setTitle(processPlaceholders(template.title, logDate));
    setDescription(template.description || '');
    if (template.checklist) {
      setChecklistItems(template.checklist.map((item, index) => ({
        id: `temp-${index}`,
        text: item.text,
        completed: item.completed || false,
      })));
    }
    if (template.rating) {
      setRating(template.rating);
    }
    setShowTemplatePicker(false);
  };

  // Handle checklist item addition
  const handleAddChecklistItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newChecklistItem.trim()) {
      e.preventDefault();
      setChecklistItems([
        ...checklistItems,
        {
          id: `temp-${Date.now()}`,
          text: newChecklistItem.trim(),
          completed: false,
        },
      ]);
      setNewChecklistItem('');
    }
  };

  // Handle checklist item removal
  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  // Set default title if task or habit context is provided
  React.useEffect(() => {
    if (taskContext && isOpen) {
      setTitle(`Task: ${taskContext.taskTitle}`);
      setDescription(`Journal entry for task: ${taskContext.taskTitle}`);
    } else if (habitContext && isOpen) {
      setTitle(`Habit: ${habitContext.habitTitle}`);
      setDescription(`Journal entry for habit: ${habitContext.habitTitle}`);
    } else if (isOpen) {
      setTitle('');
      setDescription('');
    }
    // Reset log date when modal opens
    if (isOpen) {
      setLogDate(selectedDate || new Date());
      setRating(0);
      setChecklistItems([]);
      setNewChecklistItem('');
    }
  }, [isOpen, taskContext, habitContext, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFocusId) return;

    setIsSubmitting(true);
    try {
      const logData: any = {
        title: title.trim(),
        focusId: selectedFocusId,
        logType: selectedLogType,
        logDate: logDate,
        ...(taskContext?.taskId && { taskId: taskContext.taskId }),
        ...(habitContext?.habitId && { habitId: habitContext.habitId }),
      };

      // Add type-specific data
      switch (selectedLogType) {
        case LogType.TEXT:
          logData.description = description.trim() || undefined;
          break;
        case LogType.CHECKLIST:
          logData.checklist = checklistItems;
          break;
        case LogType.RATING:
          logData.rating = rating;
          break;
      }

      await addLog(logData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFocusId('kary');
      setLogDate(new Date());
      setSelectedLogType(LogType.TEXT);
      setRating(0);
      setChecklistItems([]);
      setNewChecklistItem('');
      
      // Don't refresh immediately to prevent flickering
      setTimeout(() => refreshData(), 300);
      onClose();
    } catch (error) {
      console.error('Failed to add log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render content based on log type
  const renderLogTypeContent = () => {
    switch (selectedLogType) {
      case LogType.RATING:
        return (
          <div className="flex items-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 rounded-full text-yellow-400 hover:text-yellow-500 transition-colors"
                aria-label={`Set rating to ${star}`}
              >
                <Icons.StarIcon
                  className={`w-6 h-6 transition-colors ${rating >= star ? 'fill-yellow-400' : 'fill-gray-300 hover:fill-yellow-200'}`}
                />
              </button>
            ))}
          </div>
        );
      case LogType.CHECKLIST:
        return (
          <div className="space-y-2 pt-2">
            <ul className="space-y-1 max-h-40 overflow-y-auto">
              {checklistItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-700 pr-2">
                  <Icons.CheckSquareIcon className="w-4 h-4 text-gray-400" />
                  <span className="flex-1">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(index)}
                    className="text-red-400 hover:text-red-600 font-bold"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyDown={handleAddChecklistItem}
              placeholder="Add item and press Enter..."
              className="w-full bg-gray-50 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        );
      case LogType.TEXT:
      default:
        return (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description... (optional)"
            className="w-full bg-transparent text-gray-700 placeholder-gray-400 text-sm outline-none resize-none border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        );
    }
  };

  if (!isOpen || !selectedFocus) return null;

  return (
    <Modal title="Add New Log" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Log Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Log Type
          </label>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {selectedFocus.allowedLogTypes.map((type) => {
              const isSelected = selectedLogType === type;
              const iconName = type === LogType.TEXT ? 'Edit3Icon' : 
                              type === LogType.CHECKLIST ? 'CheckSquareIcon' : 'StarIcon';
              const IconComponent = Icons[iconName as keyof typeof Icons] || Icons.CircleIcon;
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedLogType(type)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isSelected
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="capitalize">{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus Area and Templates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Focus Area *
            </label>
            {availableTemplates.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Use Template
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
              {selectedFocus && (
                <>
                  {React.createElement(Icons[selectedFocus.icon as keyof typeof Icons] || Icons.CircleIcon, {
                    className: `w-4 h-4 text-${selectedFocus.color}`,
                  })}
                  <span className="text-sm font-medium text-gray-700">{selectedFocus.name}</span>
                </>
              )}
            </div>
            
            <select
              value={selectedFocusId}
              onChange={(e) => {
                setSelectedFocusId(e.target.value);
                setSelectedLogType(LogType.TEXT); // Reset to default log type
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {foci.map((focus) => (
                <option key={focus.id} value={focus.id}>
                  {focus.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template Picker */}
          {showTemplatePicker && availableTemplates.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Templates:</h4>
              <div className="space-y-1">
                {availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-white rounded-md transition-colors"
                  >
                    {React.createElement(Icons[template.icon as keyof typeof Icons] || Icons.CircleIcon, {
                      className: "w-4 h-4 text-gray-500",
                    })}
                    <span>{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date and Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time
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

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Entry Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter entry title..."
            required
          />
        </div>

        {/* Content based on log type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {selectedLogType === LogType.RATING ? 'Rating' : 
             selectedLogType === LogType.CHECKLIST ? 'Checklist Items' : 'Content'}
          </label>
          {renderLogTypeContent()}
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
            disabled={!title.trim() || !selectedFocusId || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Log Entry'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddLogModal; 