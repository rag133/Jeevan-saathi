import React, { useEffect, useState } from 'react';
import * as Icons from '~/components/Icons';
import type { CalendarItem } from '../types';
import { CalendarItemType } from '../types';

interface Notification {
  id: string;
  type: 'overdue' | 'reminder' | 'streak' | 'milestone';
  title: string;
  message: string;
  itemId?: string;
  timestamp: Date;
  read: boolean;
  action?: () => void;
}

interface SmartNotificationsProps {
  calendarItems: CalendarItem[];
  onItemSelect: (item: CalendarItem) => void;
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  calendarItems,
  onItemSelect,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check for overdue items
  const checkOverdueItems = () => {
    const now = new Date();
    const overdueItems = calendarItems.filter(item => {
      if (item.completed) return false;
      
      const itemDate = new Date(item.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      itemDate.setHours(0, 0, 0, 0);
      
      return itemDate < today;
    });

    const overdueNotifications: Notification[] = overdueItems.map(item => ({
      id: `overdue-${item.id}`,
      type: 'overdue',
      title: 'Overdue Item',
      message: `${item.title} was due ${getDaysAgo(item.date)}`,
      itemId: item.id,
      timestamp: new Date(),
      read: false,
      action: () => onItemSelect(item),
    }));

    return overdueNotifications;
  };

  // Check for upcoming reminders
  const checkUpcomingReminders = () => {
    const now = new Date();
    const reminderItems = calendarItems.filter(item => {
      if (item.completed) return false;
      
      const itemDate = new Date(item.date);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return itemDate >= today && itemDate <= tomorrow;
    });

    const reminderNotifications: Notification[] = reminderItems.map(item => ({
      id: `reminder-${item.id}`,
      type: 'reminder',
      title: 'Upcoming Item',
      message: `${item.title} is due ${getDueText(item.date)}`,
      itemId: item.id,
      timestamp: new Date(),
      read: false,
      action: () => onItemSelect(item),
    }));

    return reminderNotifications;
  };

  // Check for streak celebrations
  const checkStreakCelebrations = () => {
    const completedToday = calendarItems.filter(item => {
      if (!item.completed) return false;
      
      const itemDate = new Date(item.date);
      const today = new Date();
      return itemDate.toDateString() === today.toDateString();
    });

    const streakNotifications: Notification[] = [];
    
    if (completedToday.length >= 3) {
      streakNotifications.push({
        id: 'streak-3',
        type: 'streak',
        title: 'Great Progress! 🎉',
        message: `You've completed ${completedToday.length} items today!`,
        timestamp: new Date(),
        read: false,
      });
    }

    return streakNotifications;
  };

  // Check for progress milestones
  const checkProgressMilestones = () => {
    const completedItems = calendarItems.filter(item => item.completed);
    const totalItems = calendarItems.length;
    const completionRate = totalItems > 0 ? (completedItems.length / totalItems) * 100 : 0;

    const milestoneNotifications: Notification[] = [];
    
    if (completionRate >= 80) {
      milestoneNotifications.push({
        id: 'milestone-80',
        type: 'milestone',
        title: 'Excellent Progress! 🌟',
        message: `You've completed ${Math.round(completionRate)}% of your items!`,
        timestamp: new Date(),
        read: false,
      });
    }

    return milestoneNotifications;
  };

  const getDaysAgo = (date: Date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'yesterday';
    if (diffDays === 2) return '2 days ago';
    return `${diffDays} days ago`;
  };

  const getDueText = (date: Date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffTime = itemDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return `in ${diffDays} days`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Update notifications periodically
  useEffect(() => {
    const updateNotifications = () => {
      const overdue = checkOverdueItems();
      const reminders = checkUpcomingReminders();
      const streaks = checkStreakCelebrations();
      const milestones = checkProgressMilestones();

      const allNotifications = [...overdue, ...reminders, ...streaks, ...milestones];
      
      // Remove duplicates and keep only unread notifications
      const uniqueNotifications = allNotifications.filter((notification, index, self) => 
        index === self.findIndex(n => n.id === notification.id)
      );

      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifications = uniqueNotifications.filter(n => !existingIds.has(n.id));
        return [...prev, ...newNotifications];
      });
    };

    // Update immediately
    updateNotifications();

    // Update every 5 minutes
    const interval = setInterval(updateNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [calendarItems]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return <Icons.AlertCircleIcon className="w-5 h-5 text-red-500" />;
      case 'reminder':
        return <Icons.ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'streak':
        return <Icons.StarIcon className="w-5 h-5 text-yellow-500" />;
      case 'milestone':
        return <Icons.TrophyIcon className="w-5 h-5 text-green-500" />;
      default:
        return <Icons.BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'overdue':
        return 'border-red-200 bg-red-50';
      case 'reminder':
        return 'border-blue-200 bg-blue-50';
      case 'streak':
        return 'border-yellow-200 bg-yellow-50';
      case 'milestone':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Notifications"
      >
        <Icons.BellIcon className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icons.BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      getNotificationColor(notification.type)
                    } ${notification.read ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                              title="Mark as read"
                            >
                              <Icons.CheckIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => clearNotification(notification.id)}
                              className="text-xs text-gray-500 hover:text-red-500"
                              title="Dismiss"
                            >
                              <Icons.XIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          
                          {notification.action && (
                            <button
                              onClick={() => {
                                notification.action?.();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Item
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartNotifications; 