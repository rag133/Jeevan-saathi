import React, { useEffect, useState } from 'react';
import { useHomeStore } from '../homeStore';
import HomeLayout from '../components/HomeLayout';
import UnifiedCalendar from '../components/UnifiedCalendar';
import QuickActionsPanel from '../components/QuickActionsPanel';
import DetailViewPanel from '../components/DetailViewPanel';
import SearchBar from '../components/SearchBar';
import SmartNotifications from '../components/SmartNotifications';
import Logo from '~/components/Logo';
import AddTaskModal from '../components/AddTaskModal';
import AddLogModal from '../components/AddLogModal';

const HomeView: React.FC<{ isAppSidebarOpen: boolean }> = ({ isAppSidebarOpen }) => {
  const {
    calendarItems,
    selectedItem,
    selectedDate,
    loading,
    error,
    fetchHomeData,
    selectItem,
    selectDate,
    setupRealTimeSync,
  } = useHomeStore();

  // Update selected item when calendar items change to ensure the detail view shows latest data
  useEffect(() => {
    if (selectedItem && calendarItems.length > 0) {
      const updatedItem = calendarItems.find(item => item.id === selectedItem.id);
      if (updatedItem && JSON.stringify(updatedItem) !== JSON.stringify(selectedItem)) {
        selectItem(updatedItem);
      }
    }
  }, [calendarItems, selectedItem, selectItem]);

  // State for quick action modals
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [logModalTaskContext, setLogModalTaskContext] = useState<{ taskId: string; taskTitle: string } | undefined>();

  useEffect(() => {
    fetchHomeData();
    
    // Set up real-time sync
    const cleanup = setupRealTimeSync();
    
    // Cleanup subscriptions when component unmounts
    return cleanup;
  }, [fetchHomeData, setupRealTimeSync]);

  // Listen for log modal events from task details
  useEffect(() => {
    const handleOpenLogModal = (event: CustomEvent) => {
      setLogModalTaskContext(event.detail);
      setShowAddLogModal(true);
    };

    window.addEventListener('openLogModal', handleOpenLogModal as EventListener);
    
    return () => {
      window.removeEventListener('openLogModal', handleOpenLogModal as EventListener);
    };
  }, []);

  const handleItemSelect = (item: any) => {
    selectItem(item);
  };

  const handleDateSelect = (date: Date) => {
    selectDate(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your home screen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHomeData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col w-full">
      {/* Top Header with Branding, Search, and Notifications */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Logo size="md" />
        
        <div className="flex items-center space-x-4">
          <SearchBar onItemSelect={handleItemSelect} />
          <SmartNotifications 
            calendarItems={calendarItems}
            onItemSelect={handleItemSelect}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <HomeLayout isMobile={false}>
          {/* Left Panel - Quick Actions */}
          <QuickActionsPanel
            onAddTask={() => setShowAddTaskModal(true)}
            onAddHabitLog={() => {
              // Habit logging is now handled directly in the habit detail view
              console.log('Habit logging moved to detail view');
            }}
            onAddJournalEntry={() => {
              setLogModalTaskContext(undefined);
              setShowAddLogModal(true);
            }}
          />

          {/* Middle Panel - Calendar */}
          <UnifiedCalendar
            items={calendarItems}
            selectedDate={selectedDate}
            selectedItem={selectedItem}
            onItemSelect={handleItemSelect}
            onDateSelect={handleDateSelect}
          />

          {/* Right Panel - Details */}
          <DetailViewPanel
            selectedItem={selectedItem}
            onClose={() => selectItem(null)}
          />
        </HomeLayout>
      </div>

      {/* Quick Action Modals */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        selectedDate={selectedDate}
      />
      

      
      <AddLogModal
        isOpen={showAddLogModal}
        onClose={() => {
          setShowAddLogModal(false);
          setLogModalTaskContext(undefined);
        }}
        selectedDate={selectedDate}
        taskContext={logModalTaskContext}
      />
    </div>
  );
};

export default HomeView; 