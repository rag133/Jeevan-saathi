import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { getItemsForDate } from '../utils/dataAggregator';
import TimelineCalendarItem from './TimelineCalendarItem';
import { useHomeStore } from '../homeStore';
import CalendarFilter from './CalendarFilter';

interface UnifiedCalendarProps {
  items: CalendarItem[];
  selectedDate: Date;
  selectedItem: CalendarItem | null;
  onItemSelect: (item: CalendarItem) => void;
  onDateSelect: (date: Date) => void;
}

const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  items,
  selectedDate,
  selectedItem,
  onItemSelect,
  onDateSelect,
}) => {
  const [draggedItem, setDraggedItem] = useState<CalendarItem | null>(null);

  const {
    startDrag,
    endDrag,
    moveItemToDate,
    dragHistory,
    undoLastDrag,
    itemTypeFilters,
    toggleItemTypeFilter
  } = useHomeStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedItem = items.find(item => item.id === active.id);
    if (draggedItem) {
      setDraggedItem(draggedItem);
      startDrag();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const draggedItem = items.find(item => item.id === active.id);
      const targetDate = over.data.current?.date;
      
      if (draggedItem && targetDate) {
        await moveItemToDate(draggedItem.id, targetDate);
      }
    }
    
    setDraggedItem(null);
    endDrag();
  };

  // Get items for the selected date (today's view only)
  const timelineItems = useMemo(() => {
    let filteredItems = items;
    
    // Apply type filters
    if (itemTypeFilters.size > 0) {
      filteredItems = items.filter(item => itemTypeFilters.has(item.type));
    }
    
    // Only show items for the selected date (today's view)
    return getItemsForDate(filteredItems, selectedDate);
  }, [items, selectedDate, itemTypeFilters]);

  // All items for the timeline view
  const allItems = useMemo(() => {
    return timelineItems;
  }, [timelineItems]);

  const goToToday = () => {
    onDateSelect(new Date());
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    onDateSelect(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateSelect(nextDay);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();



  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Calendar</h2>
          <div className="flex items-center space-x-4">
            {/* Filter moved to top right */}
            <CalendarFilter
              activeFilters={itemTypeFilters}
              onFilterChange={toggleItemTypeFilter}
            />
            
            {dragHistory.length > 0 && (
              <button 
                onClick={undoLastDrag} 
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200" 
                title="Undo last move"
              >
                <Icons.UndoIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousDay}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Previous day"
            >
              <Icons.ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-medium text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            <button
              onClick={goToNextDay}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Next day"
            >
              <Icons.ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={goToToday}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isToday 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
        </div>

        {/* Calendar Content */}
        {timelineItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Icons.CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items for today
            </h3>
            <p className="text-gray-600">Add some tasks, habits, or journal entries to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's Items */}
            <div className="relative">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Today's Items</h4>
              <div className="space-y-3">
                {allItems.map((item: CalendarItem) => (
                  <TimelineCalendarItem
                    key={item.id}
                    item={item}
                    onClick={onItemSelect}
                    isSelected={selectedItem?.id === item.id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DragOverlay>
        {draggedItem ? (
          <TimelineCalendarItem 
            item={draggedItem} 
            onClick={() => {}} 
            isSelected={false} 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default UnifiedCalendar; 