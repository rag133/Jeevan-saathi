import React, { useState } from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import type { Log } from '~/modules/dainandini/types';
import { LogType } from '~/modules/dainandini/types';
import { useDainandiniStore } from '~/modules/dainandini/dainandiniStore';
import Checkbox from '~/components/common/Checkbox';
import { useHomeStore } from '../homeStore';

interface HomeLogDetailProps {
  selectedItem: CalendarItem;
  onClose: () => void;
}

// --- Display Components ---
const StarRatingDisplay: React.FC<{ rating?: number }> = ({ rating = 0 }) => (
  <div className="flex items-center">
    {[1, 2, 3, 4, 5].map((star) => (
      <Icons.StarIcon
        key={star}
        className={`w-5 h-5 text-yellow-400 ${rating >= star ? 'fill-current' : 'fill-transparent stroke-current'}`}
      />
    ))}
  </div>
);

const ChecklistDisplay: React.FC<{
  items?: Array<{ id: string; text: string; completed: boolean }>;
}> = ({ items = [] }) => {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3">
          <Checkbox checked={item.completed} onChange={() => {}} disabled />
          <span
            className={`flex-1 text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
};

const HomeLogDetail: React.FC<HomeLogDetailProps> = ({ selectedItem, onClose }) => {
  const dainandiniStore = useDainandiniStore();
  const log = selectedItem.originalData as Log;
  const focus = dainandiniStore.foci.find(f => f.id === log.focusId);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [titleInput, setTitleInput] = useState(log.title);
  const [descriptionInput, setDescriptionInput] = useState(log.description || '');

  // Update inputs when log changes
  React.useEffect(() => {
    setTitleInput(log.title);
    setDescriptionInput(log.description || '');
  }, [log.id, log.title, log.description]);

  const handleUpdateTitle = async () => {
    if (titleInput.trim() !== log.title) {
      // Optimistic update
      const homeStore = useHomeStore.getState();
      
      if (homeStore.selectedItem && homeStore.selectedItem.id === `log-${log.id}`) {
        homeStore.selectItem({
          ...homeStore.selectedItem,
          title: titleInput.trim(),
          originalData: { ...log, title: titleInput.trim() },
        });
      }
      
      const updatedCalendarItems = homeStore.calendarItems.map(item => 
        item.id === `log-${log.id}` 
          ? { ...item, title: titleInput.trim(), originalData: { ...log, title: titleInput.trim() } }
          : item
      );
      
      homeStore.setCalendarItems(updatedCalendarItems);
      
      await dainandiniStore.updateLog(log.id, { title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = async () => {
    if (descriptionInput !== log.description) {
      // Optimistic update
      const homeStore = useHomeStore.getState();
      
      if (homeStore.selectedItem && homeStore.selectedItem.id === `log-${log.id}`) {
        homeStore.selectItem({
          ...homeStore.selectedItem,
          description: descriptionInput,
          originalData: { ...log, description: descriptionInput },
        });
      }
      
      const updatedCalendarItems = homeStore.calendarItems.map(item => 
        item.id === `log-${log.id}` 
          ? { ...item, description: descriptionInput, originalData: { ...log, description: descriptionInput } }
          : item
      );
      
      homeStore.setCalendarItems(updatedCalendarItems);
      
      await dainandiniStore.updateLog(log.id, { description: descriptionInput || undefined });
    }
    setIsEditingDescription(false);
  };

  const getItemColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue-500': 'bg-blue-500',
      'green-500': 'bg-green-500',
      'purple-500': 'bg-purple-500',
      'red-500': 'bg-red-500',
      'yellow-500': 'bg-yellow-500',
      'indigo-500': 'bg-indigo-500',
      'pink-500': 'bg-pink-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getLogTypeLabel = (logType: LogType) => {
    switch (logType) {
      case LogType.TEXT:
        return 'Text Entry';
      case LogType.CHECKLIST:
        return 'Checklist';
      case LogType.RATING:
        return 'Rating';
      default:
        return 'Log';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${getItemColor(selectedItem.color)} mr-3`} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Journal Entry</h2>
            <p className="text-sm text-gray-500">{selectedItem.date.toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Icons.XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          {isEditingTitle ? (
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
              autoFocus
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="p-2 border border-transparent rounded-md hover:border-gray-300 cursor-pointer"
            >
              <h3 className="text-lg font-medium text-gray-900">{log.title}</h3>
            </div>
          )}
        </div>

        {/* Focus Area */}
        {focus && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Area</label>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <Icons.TargetIcon className={`w-4 h-4 ${
                focus.color === 'blue-500' ? 'text-blue-500' :
                focus.color === 'green-500' ? 'text-green-500' :
                focus.color === 'purple-500' ? 'text-purple-500' :
                focus.color === 'red-500' ? 'text-red-500' :
                focus.color === 'yellow-500' ? 'text-yellow-500' :
                focus.color === 'indigo-500' ? 'text-indigo-500' :
                focus.color === 'pink-500' ? 'text-pink-500' :
                'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                focus.color === 'blue-500' ? 'text-blue-500' :
                focus.color === 'green-500' ? 'text-green-500' :
                focus.color === 'purple-500' ? 'text-purple-500' :
                focus.color === 'red-500' ? 'text-red-500' :
                focus.color === 'yellow-500' ? 'text-yellow-500' :
                focus.color === 'indigo-500' ? 'text-indigo-500' :
                focus.color === 'pink-500' ? 'text-pink-500' :
                'text-gray-500'
              }`}>{focus.name}</span>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          {isEditingDescription ? (
            <textarea
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              onBlur={handleUpdateDescription}
              autoFocus
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add a description..."
            />
          ) : (
            <div
              onClick={() => setIsEditingDescription(true)}
              className="p-3 border border-transparent rounded-md hover:border-gray-300 cursor-pointer min-h-[120px]"
            >
              {log.description ? (
                <p className="text-gray-600 whitespace-pre-wrap">{log.description}</p>
              ) : (
                <p className="text-gray-400 italic">Click to add a description...</p>
              )}
            </div>
          )}
        </div>

        {/* Log Type Specific Content */}
        {log.logType === LogType.RATING && log.rating && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="p-2 bg-gray-50 rounded-md">
              <StarRatingDisplay rating={log.rating} />
              <span className="text-sm text-gray-600 ml-2">{log.rating}/5</span>
            </div>
          </div>
        )}

        {log.logType === LogType.CHECKLIST && log.checklist && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
            <div className="p-2 bg-gray-50 rounded-md">
              <ChecklistDisplay items={log.checklist} />
            </div>
          </div>
        )}

        {/* Entry Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Entry Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Type:</span>
              <span className="text-gray-900">{getLogTypeLabel(log.logType)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Date:</span>
              <span className="text-gray-900">{new Date(log.logDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Time:</span>
              <span className="text-gray-900">{new Date(log.logDate).toLocaleTimeString()}</span>
            </div>
            {log.taskId && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Related Task:</span>
                <span className="text-gray-900">{log.taskId}</span>
              </div>
            )}
            {log.habitId && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Related Habit:</span>
                <span className="text-gray-900">{log.habitId}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLogDetail; 