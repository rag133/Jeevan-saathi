import React from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';
import type { Log } from '~/modules/dainandini/types';
import HomeTaskDetail from './HomeTaskDetail';
import HomeHabitDetail from './HomeHabitDetail';

interface DetailViewPanelProps {
  selectedItem: CalendarItem | null;
  onClose: () => void;
}

const DetailViewPanel: React.FC<DetailViewPanelProps> = ({ selectedItem, onClose }) => {
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

  if (!selectedItem) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <Icons.XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Icons.InfoIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Select an item to view details</p>
        </div>
      </div>
    );
  }

  const renderDetailContent = () => {
    switch (selectedItem.type) {
      case CalendarItemType.TASK:
        const task = selectedItem.originalData as any;
        return <HomeTaskDetail key={`${selectedItem.id}-${task?.completed}-${task?.priority}-${task?.title}`} selectedItem={selectedItem} onClose={onClose} />;

      case CalendarItemType.HABIT:
      case CalendarItemType.HABIT_LOG:
        return <HomeHabitDetail selectedItem={selectedItem} onClose={onClose} />;

      case CalendarItemType.LOG:
        const log = selectedItem.originalData as Log;
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
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{log.title}</h3>
                {log.description && (
                  <p className="text-gray-600 mb-4">{log.description}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Entry Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {log.logType}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(log.logDate).toLocaleDateString()}
                  </div>
                  {log.rating && (
                    <div>
                      <span className="font-medium">Rating:</span> {log.rating}/5
                    </div>
                  )}
                  {log.taskId && (
                    <div>
                      <span className="font-medium">Related Task:</span> {log.taskId}
                    </div>
                  )}
                  {log.habitId && (
                    <div>
                      <span className="font-medium">Related Habit:</span> {log.habitId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Details</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Icons.XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Item Details</h3>
              <p className="text-sm text-gray-600">Details for this item type are not yet implemented.</p>
            </div>
          </div>
        );
    }
  };

  return renderDetailContent();
};

export default DetailViewPanel; 