import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const KaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');

  // Sample data for the task list (same structure as Home module)
  const allTaskItems = [
    {
      id: '1',
      title: 'Complete project proposal',
      time: '1:00pm',
      type: 'task',
      list: 'Work',
      hasSubtasks: true,
      completed: false,
      priority: 'high',
      dueDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'Review quarterly reports',
      time: '2:30pm',
      type: 'task',
      list: 'Work',
      hasSubtasks: false,
      completed: false,
      priority: 'medium',
      dueDate: '2024-01-20',
    },
    {
      id: '3',
      title: 'Plan team meeting agenda',
      time: '3:15pm',
      type: 'task',
      list: 'Work',
      hasSubtasks: true,
      completed: false,
      priority: 'low',
      dueDate: '2024-01-18',
    },
    {
      id: '4',
      title: 'Update documentation',
      date: 'Aug 6',
      type: 'task',
      list: 'Personal',
      hasSubtasks: false,
      completed: false,
      priority: 'medium',
      dueDate: '2024-01-22',
    },
    {
      id: '5',
      title: 'Schedule dentist appointment',
      time: '5:30pm',
      type: 'task',
      list: 'Personal',
      hasSubtasks: false,
      completed: false,
      priority: 'low',
      dueDate: '2024-01-25',
    },
    {
      id: '6',
      title: 'Research new technologies',
      time: '6:00pm',
      type: 'task',
      list: 'Learning',
      hasSubtasks: true,
      completed: false,
      priority: 'medium',
      dueDate: '2024-01-30',
    },
    {
      id: '7',
      title: 'Prepare presentation slides',
      time: '7:00pm',
      type: 'task',
      list: 'Work',
      hasSubtasks: false,
      completed: false,
      priority: 'high',
      dueDate: '2024-01-17',
    },
    {
      id: '8',
      title: 'Organize workspace',
      time: '7:15pm',
      type: 'task',
      list: 'Personal',
      hasSubtasks: false,
      completed: false,
      priority: 'low',
      dueDate: '2024-01-16',
    },
    {
      id: '9',
      title: 'Submit expense report',
      time: '8:00pm',
      type: 'task',
      list: 'Work',
      hasSubtasks: false,
      completed: true,
      priority: 'medium',
      dueDate: '2024-01-14',
    },
    {
      id: '10',
      title: 'Call insurance company',
      time: '9:00pm',
      type: 'task',
      list: 'Personal',
      hasSubtasks: false,
      completed: false,
      priority: 'high',
      dueDate: '2024-01-13',
    },
  ];

  // Filter tasks based on current filter
  const getFilteredTasks = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (currentFilter) {
      case 'today':
        return allTaskItems.filter(task => {
          if (task.completed) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === today.toDateString();
        });
      case 'due':
        return allTaskItems.filter(task => {
          if (task.completed) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate <= tomorrow;
        });
      case 'upcoming':
        return allTaskItems.filter(task => {
          if (task.completed) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate > tomorrow;
        });
      case 'overdue':
        return allTaskItems.filter(task => {
          if (task.completed) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate < today;
        });
      case 'completed':
        return allTaskItems.filter(task => task.completed);
      default:
        return allTaskItems.filter(task => !task.completed);
    }
  };

  const taskItems = getFilteredTasks();

  // Update filter when route params change
  useEffect(() => {
    if (route.params?.filter) {
      setCurrentFilter(route.params.filter);
    }
  }, [route.params?.filter]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return 'flag';
      case 'medium':
        return 'flag-outline';
      case 'low':
        return 'remove';
      default:
        return 'ellipse-outline';
    }
  };

  const getListColor = (list) => {
    const listColors = {
      'Work': '#007AFF',
      'Personal': '#34C759',
      'Learning': '#FF9500',
      'Health': '#FF3B30',
      'Family': '#FF6B6B',
    };
    return listColors[list] || '#8E8E93';
  };

  const getItemIcon = (type) => {
    const iconMap = {
      task: 'checkbox-outline',
      document: 'document-outline',
      link: 'link-outline',
      question: 'help-circle-outline',
    };
    return iconMap[type] || 'ellipse-outline';
  };

  const getItemColor = (type) => {
    const colorMap = {
      task: '#007AFF',
      document: '#FF9500',
      link: '#34C759',
      question: '#FF3B30',
    };
    return colorMap[type] || '#8E8E93';
  };

  const getFilterTitle = () => {
    switch (currentFilter) {
      case 'today':
        return 'Today';
      case 'due':
        return 'Due';
      case 'upcoming':
        return 'Upcoming';
      case 'overdue':
        return 'Overdue';
      case 'completed':
        return 'Completed';
      default:
        return 'Kary';
    }
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const toggleTaskCompletion = (taskId) => {
    // TODO: Implement task completion toggle
    console.log('Toggle completion for task:', taskId);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkbox-outline" size={64} color="#8E8E93" />
      <Text style={styles.emptyStateTitle}>No tasks found</Text>
      <Text style={styles.emptyStateSubtitle}>
        {currentFilter === 'completed' 
          ? 'No completed tasks yet' 
          : currentFilter === 'overdue' 
          ? 'No overdue tasks' 
          : 'Create your first task to get started'}
      </Text>
    </View>
  );

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        item.completed && styles.completedTask,
        item.isHighlighted && styles.highlightedItem,
        item.isIndented && styles.indentedItem,
      ]}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.itemLeft}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleTaskCompletion(item.id)}
        >
          <Ionicons 
            name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
            size={20} 
            color={item.completed ? "#34C759" : "#8E8E93"} 
          />
        </TouchableOpacity>
        <View style={[styles.itemIcon, { backgroundColor: getItemColor(item.type) }]}>
          <Ionicons name={getItemIcon(item.type)} size={16} color="white" />
        </View>
        <Text
          style={[
            styles.itemTitle,
            item.completed && styles.completedTaskTitle,
            item.isHighlighted && styles.highlightedText,
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </View>
      <View style={styles.itemRight}>
        {item.time && (
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color="#8E8E93" />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        )}
        {item.date && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        )}
        <View style={[styles.listIndicator, { backgroundColor: getListColor(item.list) }]}>
          <Text style={styles.listText}>{item.list}</Text>
        </View>
        {item.hasSubtasks && (
          <Ionicons name="list" size={16} color="#8E8E93" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDetailView = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDetailModal(false)}
    >
      <SafeAreaView style={styles.detailContainer}>
        {/* Detail Header */}
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDetailModal(false)}
          >
            <Ionicons name="chevron-down" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>Task Details</Text>
          <View style={styles.detailHeaderRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="bookmark-outline" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Detail Content */}
        <ScrollView style={styles.detailContent}>
          {selectedTask && (
            <View style={styles.detailItem}>
              <View style={styles.detailItemContent}>
                {selectedTask.time && (
                  <Text style={styles.detailDate}>{selectedTask.time}</Text>
                )}
                {selectedTask.date && (
                  <Text style={styles.detailDate}>{selectedTask.date}</Text>
                )}
                <Text style={styles.detailItemTitle}>{selectedTask.title}</Text>
                <View style={styles.detailTaskMeta}>
                  <View style={[styles.detailListIndicator, { backgroundColor: getListColor(selectedTask.list) }]}>
                    <Text style={styles.detailListText}>{selectedTask.list}</Text>
                  </View>
                  <View style={[styles.detailPriorityBadge, { backgroundColor: getPriorityColor(selectedTask.priority) }]}>
                    <Ionicons 
                      name={getPriorityIcon(selectedTask.priority)} 
                      size={14} 
                      color="white" 
                    />
                    <Text style={styles.detailPriorityText}>{selectedTask.priority}</Text>
                  </View>
                </View>
                
                {selectedTask.hasSubtasks && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Subtasks</Text>
                    <Text style={styles.detailSubtasksText}>No subtasks yet</Text>
                    <TouchableOpacity style={styles.addSubtaskButton}>
                      <Ionicons name="add" size={20} color="#007AFF" />
                      <Text style={styles.addSubtaskText}>Add Subtask</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Description</Text>
                  <Text style={styles.detailDescriptionText}>No description added yet</Text>
                  <TouchableOpacity style={styles.addDescriptionButton}>
                    <Ionicons name="add" size={20} color="#007AFF" />
                    <Text style={styles.addDescriptionText}>Add Description</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Detail Bottom Actions */}
        <View style={styles.detailBottomActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="pricetag-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="list-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="image-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Hamburger Menu - IDENTICAL to Home module */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getFilterTitle()}</Text>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Task List - Main content area using FlatList like Home module */}
      <FlatList
        data={taskItems}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button - Same as Home module */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Task Details Modal - Opens on tap like TickTick */}
      {renderDetailView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsButton: {
    padding: 8,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  highlightedItem: {
    backgroundColor: '#f0f8ff',
  },
  indentedItem: {
    marginLeft: 32,
    backgroundColor: '#fafafa',
  },
  completedTask: {
    backgroundColor: '#f8f8f8',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 12,
  },
  itemIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  highlightedText: {
    color: '#007AFF',
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  dateContainer: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  listIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  listText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  // Detail Modal Styles - Same structure as Home module
  detailContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  detailHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  detailContent: {
    flex: 1,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailDate: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 8,
  },
  detailItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  detailListIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  detailListText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  detailPriorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailPriorityText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailSection: {
    gap: 12,
    marginTop: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailSubtasksText: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  addSubtaskText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  detailDescriptionText: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  addDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  addDescriptionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  detailBottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    padding: 12,
  },
});

export default KaryScreen;

