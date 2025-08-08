import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useKaryStore } from '~/modules/kary/karyStore';
import { useAbhyasaStore } from '~/modules/abhyasa/abhyasaStore';
import { useDainandiniStore } from '~/modules/dainandini/dainandiniStore';
import { taskService, habitService, habitLogService, logService } from '~/services/dataService';
import type { HomeStore, CalendarItem, TimeSlot } from './types';
import { CalendarItemType } from './types';
import { convertToCalendarItems } from './utils/dataAggregator';

export const useHomeStore = create<HomeStore>()(
  devtools(
    (set, get) => ({
      // State
      calendarItems: [],
      selectedItem: null,
      selectedDate: new Date(),
      loading: false,
      error: null,
      dragHistory: [], // Track drag operations for undo
      isDragging: false,
      // Time-based scheduling state
      timeSlots: [],
      showTimeSlots: false,
      // Filter state - start with all types enabled
      itemTypeFilters: new Set([CalendarItemType.TASK, CalendarItemType.HABIT, CalendarItemType.LOG]),
      // Real-time sync control
      realTimeSyncDisabled: false,

      // Actions
      fetchHomeData: async () => {
        set({ loading: true, error: null });
        try {
          // Ensure all stores have their data loaded
          const karyStore = useKaryStore.getState();
          const abhyasaStore = useAbhyasaStore.getState();
          const dainandiniStore = useDainandiniStore.getState();

          // Fetch data from all stores if not already loaded
          await Promise.all([
            karyStore.tasks.length === 0 ? karyStore.fetchKaryData() : Promise.resolve(),
            abhyasaStore.habits.length === 0 ? abhyasaStore.fetchAbhyasaData() : Promise.resolve(),
            dainandiniStore.logs.length === 0 ? dainandiniStore.fetchDainandiniData() : Promise.resolve(),
          ]);

          // Get fresh data from all stores
          const freshKaryStore = useKaryStore.getState();
          const freshAbhyasaStore = useAbhyasaStore.getState();
          const freshDainandiniStore = useDainandiniStore.getState();

          // Convert to calendar items using the utility function
          const calendarItems = convertToCalendarItems(
            freshKaryStore.tasks,
            freshAbhyasaStore.habits,
            freshAbhyasaStore.habitLogs,
            freshDainandiniStore.logs,
            freshKaryStore.lists,
            freshDainandiniStore.foci || []
          );

          set({ calendarItems, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
        }
      },

      selectItem: (item) => {
        set({ selectedItem: item });
      },

      selectDate: (date) => {
        set({ selectedDate: date });
      },

      setCalendarItems: (items) => {
        set({ calendarItems: items });
      },

      refreshData: async () => {
        // Only refresh if not already loading to prevent excessive updates
        const { loading, realTimeSyncDisabled } = get();
        if (!loading && !realTimeSyncDisabled) {
          await get().fetchHomeData();
        }
      },

      setRealTimeSyncDisabled: (disabled: boolean) => {
        set({ realTimeSyncDisabled: disabled });
      },

      // Set up real-time subscriptions to other stores
      setupRealTimeSync: () => {
        // Subscribe to task changes
        const unsubscribeTasks = taskService.subscribe(() => {
          // Debounce the refresh to prevent excessive updates
          setTimeout(() => get().refreshData(), 100);
        });

        // Subscribe to habit changes
        const unsubscribeHabits = habitService.subscribe(() => {
          // Debounce the refresh to prevent excessive updates
          setTimeout(() => get().refreshData(), 100);
        });

        // Subscribe to habit log changes
        const unsubscribeHabitLogs = habitLogService.subscribe(() => {
          // Debounce the refresh to prevent excessive updates
          setTimeout(() => get().refreshData(), 100);
        });

        // Subscribe to log changes (Dainandini)
        const unsubscribeLogs = logService.subscribe(() => {
          // Debounce the refresh to prevent excessive updates
          setTimeout(() => get().refreshData(), 100);
        });

        // Return cleanup function
        return () => {
          unsubscribeTasks();
          unsubscribeHabits();
          unsubscribeHabitLogs();
          unsubscribeLogs();
        };
      },

      // Drag and Drop Actions
      startDrag: () => {
        set({ isDragging: true });
      },

      endDrag: () => {
        set({ isDragging: false });
      },

      moveItemToDate: async (itemId: string, newDate: Date) => {
        const { calendarItems, dragHistory } = get();
        const item = calendarItems.find(i => i.id === itemId);
        
        if (!item) return;

        // Store the original date for undo
        const originalDate = item.date;
        const dragOperation = {
          itemId,
          originalDate,
          newDate,
          timestamp: Date.now(),
        };

        // Update the item's date
        const updatedItems = calendarItems.map(i => 
          i.id === itemId 
            ? { ...i, date: newDate }
            : i
        );

        // Update the original data in the respective store
        try {
          switch (item.type) {
            case CalendarItemType.TASK:
              const karyStore = useKaryStore.getState();
              const task = item.originalData as any;
              if (task && task.id) {
                await karyStore.updateTask(task.id, { dueDate: newDate });
              }
              break;

            case CalendarItemType.HABIT:
              // For habits, we don't move them to different dates
              // Instead, we might want to update the habit's schedule
              break;

            case CalendarItemType.LOG:
              const dainandiniStore = useDainandiniStore.getState();
              const log = item.originalData as any;
              if (log && log.id) {
                await dainandiniStore.updateLog(log.id, { logDate: newDate });
              }
              break;
          }

          // Update state
          set({ 
            calendarItems: updatedItems,
            dragHistory: [...dragHistory, dragOperation].slice(-10), // Keep last 10 operations
          });

          // Refresh data to ensure consistency
          // Don't refresh immediately to prevent flickering
          setTimeout(() => get().fetchHomeData(), 200);
        } catch (error) {
          console.error('Failed to update item date:', error);
          // Revert the change if update failed
          set({ calendarItems });
        }
      },

      undoLastDrag: async () => {
        const { dragHistory, calendarItems } = get();
        if (dragHistory.length === 0) return;

        const lastOperation = dragHistory[dragHistory.length - 1];
        const { itemId, originalDate } = lastOperation;

        // Revert the item's date
        const updatedItems = calendarItems.map(i => 
          i.id === itemId 
            ? { ...i, date: originalDate }
            : i
        );

        // Update the original data in the respective store
        try {
          const item = calendarItems.find(i => i.id === itemId);
          if (item) {
            switch (item.type) {
              case CalendarItemType.TASK:
                const karyStore = useKaryStore.getState();
                const task = item.originalData as any;
                if (task && task.id) {
                  await karyStore.updateTask(task.id, { dueDate: originalDate });
                }
                break;

              case CalendarItemType.HABIT:
                // For habits, we don't move them to different dates
                break;

              case CalendarItemType.LOG:
                const dainandiniStore = useDainandiniStore.getState();
                const log = item.originalData as any;
                if (log && log.id) {
                  await dainandiniStore.updateLog(log.id, { logDate: originalDate });
                }
                break;
            }
          }

          // Update state
          set({ 
            calendarItems: updatedItems,
            dragHistory: dragHistory.slice(0, -1), // Remove the last operation
          });

          // Refresh data to ensure consistency
          // Don't refresh immediately to prevent flickering
          setTimeout(() => get().fetchHomeData(), 200);
        } catch (error) {
          console.error('Failed to undo drag operation:', error);
        }
      },

      clearDragHistory: () => {
        set({ dragHistory: [] });
      },

      // Time-based scheduling actions
      updateItemTime: async (itemId: string, startTime: string, endTime: string) => {
        const { calendarItems } = get();
        
        // Update the item's time
        const updatedItems = calendarItems.map(i => 
          i.id === itemId 
            ? { 
                ...i, 
                startTime, 
                endTime,
                duration: get().calculateDuration(startTime, endTime),
                timeSlot: {
                  startTime,
                  endTime,
                  duration: get().calculateDuration(startTime, endTime),
                }
              }
            : i
        );

        set({ calendarItems: updatedItems });

        // Note: Store updates for time properties would need to be implemented
        // in the respective module stores (kary, abhyasa, dainandini)
        // For now, we'll just update the local state
        
        // Refresh data to ensure consistency
        // Don't refresh immediately to prevent flickering
        setTimeout(() => get().fetchHomeData(), 200);
      },

      toggleTimeSlots: () => {
        const { showTimeSlots } = get();
        set({ showTimeSlots: !showTimeSlots });
      },

      generateTimeSlots: (startHour: number, endHour: number, interval: number) => {
        const timeSlots: TimeSlot[] = [];
        
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += interval) {
            const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const endMinute = minute + interval;
            const endHour = hour + Math.floor(endMinute / 60);
            const finalMinute = endMinute % 60;
            const endTime = `${endHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;
            
            timeSlots.push({
              startTime,
              endTime,
              duration: interval,
            });
          }
        }

        set({ timeSlots });
      },

      checkTimeConflicts: (date: Date, startTime: string, endTime: string, excludeItemId?: string) => {
        const { calendarItems } = get();
        
        // Get items for the same date
        const sameDateItems = calendarItems.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate.toDateString() === date.toDateString() && 
                 item.id !== excludeItemId &&
                 item.startTime && 
                 item.endTime;
        });

        // Check for time conflicts
        const conflicts: CalendarItem[] = [];
        
        for (const item of sameDateItems) {
          if (item.startTime && item.endTime) {
            // Check if time ranges overlap
            const itemStart = item.startTime;
            const itemEnd = item.endTime;
            
            if (
              (startTime < itemEnd && endTime > itemStart) ||
              (itemStart < endTime && itemEnd > startTime)
            ) {
              conflicts.push(item);
            }
          }
        }

        return conflicts;
      },

      // Helper function to calculate duration
      calculateDuration: (startTime: string, endTime: string) => {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        return Math.max(0, endMinutes - startMinutes);
      },

      // Filter actions
      toggleItemTypeFilter: (type: CalendarItemType) => {
        const { itemTypeFilters } = get();
        const newFilters = new Set(itemTypeFilters);
        
        if (newFilters.has(type)) {
          newFilters.delete(type);
        } else {
          newFilters.add(type);
        }
        
        set({ itemTypeFilters: newFilters });
      },
    }),
    {
      name: 'home-store',
    }
  )
); 