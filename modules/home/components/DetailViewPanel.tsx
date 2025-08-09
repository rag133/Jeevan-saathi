import React, { useEffect } from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';

import { KaryTaskDetail } from '~/modules/kary/components/KaryTaskDetail';
import HomeHabitDetail from './HomeHabitDetail';
import HomeLogDetail from './HomeLogDetail';
import { useKaryStore } from '~/modules/kary/karyStore';
import { useDainandiniStore } from '~/modules/dainandini/dainandiniStore';
import { useHomeStore } from '../homeStore';
import type { Task } from '~/modules/kary/types';

// Wrapper component to adapt Home module data to Kary component
const HomeTaskDetailWrapper: React.FC<{ selectedItem: CalendarItem; onClose: () => void }> = ({ selectedItem, onClose }) => {
  const karyStore = useKaryStore();
  const dainandiniStore = useDainandiniStore();
  const homeStore = useHomeStore();
  
  const task = selectedItem.originalData as Task;
  const allTags = karyStore.tags;
  const allLists = karyStore.lists;
  const allLogs = dainandiniStore.logs;
  const childrenTasks = karyStore.tasks.filter(t => t.parentId === task.id);
  
  // Helper function to update calendar items when task changes
  const updateCalendarItem = (taskId: string, updates: Partial<Task>) => {
    const updatedCalendarItems = homeStore.calendarItems.map(item => {
      if (item.id === `task-${taskId}`) {
        return {
          ...item,
          title: updates.title !== undefined ? updates.title : item.title,
          completed: updates.completed !== undefined ? updates.completed : item.completed,
          originalData: { ...item.originalData, ...updates }
        };
      }
      return item;
    });
    homeStore.setCalendarItems(updatedCalendarItems);
  };
  
  // Temporarily disable real-time sync to prevent refresh issues
  useEffect(() => {
    // Disable real-time sync while task detail is open
    homeStore.setRealTimeSyncDisabled(true);
    
    // Re-enable real-time sync when component unmounts
    return () => {
      homeStore.setRealTimeSyncDisabled(false);
      // Manually refresh data when task detail closes to ensure calendar is updated
      setTimeout(() => homeStore.refreshData(), 200);
    };
  }, []); // Remove homeStore dependency to prevent infinite loop
  
  return (
    <KaryTaskDetail
      selectedTaskId={task.id}
      tasks={karyStore.tasks}
      allTags={allTags}
      allLists={allLists}
      allLogs={allLogs}
      childrenTasks={childrenTasks}
      onToggleComplete={(id: string) => {
        const taskToUpdate = karyStore.tasks.find(t => t.id === id);
        if (taskToUpdate) {
          const newCompleted = !taskToUpdate.completed;
          karyStore.updateTask(id, { completed: newCompleted });
          // Immediately update calendar item
          updateCalendarItem(id, { completed: newCompleted });
        }
      }}
      onUpdateTask={(taskId: string, updates: Partial<Task>) => {
        karyStore.updateTask(taskId, updates);
        // Immediately update calendar item
        updateCalendarItem(taskId, updates);
      }}
      onDeleteTask={karyStore.deleteTask}
      onDuplicateTask={(taskId: string) => {
        // TODO: Implement duplicate functionality
        console.log('Duplicate task:', taskId);
      }}
      onSelectTask={(taskId: string) => {
        // TODO: Handle task selection
        console.log('Select task:', taskId);
      }}
      onAddTask={(taskData: any, list: any, parentId?: string) => {
        const newTask = {
          title: taskData.title,
          description: '',
          completed: false,
          priority: taskData.priority,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          reminder: false,
          listId: list?.id || 'today',
          tags: [],
          parentId: parentId,
          createdAt: new Date(),
        };
        karyStore.addTask(newTask);
      }}
      onOpenLogModal={(task: Task) => {
        // Trigger the log modal event
        const event = new CustomEvent('openLogModal', { 
          detail: { 
            taskId: task.id, 
            taskTitle: task.title,
            selectedDate: new Date() 
          } 
        });
        window.dispatchEvent(event);
      }}
      onBack={onClose}
    />
  );
};

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
        return <HomeTaskDetailWrapper selectedItem={selectedItem} onClose={onClose} />;

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