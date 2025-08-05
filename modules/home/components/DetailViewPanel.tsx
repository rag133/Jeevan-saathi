import React from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';

import HomeTaskDetail from './HomeTaskDetail';
import HomeHabitDetail from './HomeHabitDetail';
import HomeLogDetail from './HomeLogDetail';

interface DetailViewPanelProps {
  selectedItem: CalendarItem | null;
  onClose: () => void;
}

const DetailViewPanel: React.FC<DetailViewPanelProps> = ({ selectedItem, onClose }) => {


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
        return <HomeLogDetail selectedItem={selectedItem} onClose={onClose} />;

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