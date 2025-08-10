import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import KaryTaskItem from './KaryTaskItem';

// Skeleton component for loading states
const TaskSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonCheckbox} />
    <View style={styles.skeletonContent}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonSubtitle} />
    </View>
    <View style={styles.skeletonActions} />
  </View>
);

// Enhanced empty state component
const EmptyState = ({ viewDetails, onAddTask }: { viewDetails: any; onAddTask: () => void }) => {
  const getEmptyStateConfig = () => {
    if (!viewDetails) return { icon: 'list-outline', title: 'No tasks yet', subtitle: 'Create your first task to get started' };
    
    switch (viewDetails.type) {
      case 'smart-list':
        switch (viewDetails.id) {
          case 'today':
            return { icon: 'today-outline', title: 'No tasks for today', subtitle: 'Great job! You\'re all caught up' };
          case 'due':
            return { icon: 'time-outline', title: 'No due tasks', subtitle: 'All your tasks are up to date' };
          case 'upcoming':
            return { icon: 'calendar-outline', title: 'No upcoming tasks', subtitle: 'Plan ahead by adding future tasks' };
          case 'overdue':
            return { icon: 'warning-outline', title: 'No overdue tasks', subtitle: 'Excellent! You\'re staying on track' };
          case 'completed':
            return { icon: 'checkmark-circle-outline', title: 'No completed tasks', subtitle: 'Start completing tasks to see your progress' };
          default:
            return { icon: 'list-outline', title: 'No tasks found', subtitle: 'Try creating a new task' };
        }
      case 'list':
        return { icon: 'folder-outline', title: 'List is empty', subtitle: 'Add tasks to this list to get started' };
      case 'tag':
        return { icon: 'pricetag-outline', title: 'No tagged tasks', subtitle: 'Add this tag to tasks to see them here' };
      default:
        return { icon: 'list-outline', title: 'No tasks found', subtitle: 'Create your first task to get started' };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name={config.icon as any} size={64} color="#ccc" />
      </View>
      <Text style={styles.emptyStateTitle}>{config.title}</Text>
      <Text style={styles.emptyStateSubtitle}>{config.subtitle}</Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => onAddTask()}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.emptyStateButtonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
};

// Error state component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <View style={styles.errorStateContainer}>
    <View style={styles.errorStateIcon}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
    </View>
    <Text style={styles.errorStateTitle}>Something went wrong</Text>
    <Text style={styles.errorStateMessage}>{error}</Text>
    <TouchableOpacity
      style={styles.errorStateButton}
      onPress={onRetry}
      activeOpacity={0.8}
    >
      <Ionicons name="refresh" size={20} color="white" />
      <Text style={styles.errorStateButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
 );

const KaryTaskList = ({
  viewDetails,
  tasks,
  allLists,
  allTags,
  selectedTaskId,
  expandedTasks,
  onSelectTask,
  onToggleComplete,
  onAddTask,
  onToggleExpand,
  onEditList,
  onDeleteList,
  onSetDefaultList,
  loading,
  error,
  onRefresh,
  refreshing,
}: {
  viewDetails: any;
  tasks: any[];
  allLists: any[];
  allTags: any[];
  selectedTaskId: string | null;
  expandedTasks: Record<string, boolean>;
  onSelectTask: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onAddTask: (taskData?: any, list?: any, parentId?: string) => void;
  onToggleExpand: (taskId: string) => void;
  onEditList: (list: any) => void;
  onDeleteList: (listId: string) => void;
  onSetDefaultList: (listId: string) => void;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  refreshing?: boolean;
}) => {
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, createdAt, title
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Enhanced task filtering and sorting
  useEffect(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply priority filter
    if (selectedPriority !== null) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Apply status filter
    if (selectedStatus !== null) {
      filtered = filtered.filter(task => {
        if (selectedStatus === 'completed') return task.completed;
        if (selectedStatus === 'pending') return !task.completed;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'priority':
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1, none: 0 };
          aValue = priorityOrder[a.priority || 'none'] ?? 0;
          bValue = priorityOrder[b.priority || 'none'] ?? 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, sortBy, sortOrder, selectedPriority, selectedStatus]);

  // Enhanced task selection with haptic feedback
  const handleSelectTask = (taskId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectTask(taskId);
  };

  // Enhanced task completion with haptic feedback
  const handleToggleComplete = async (taskId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await onToggleComplete(taskId);
  };

  // Enhanced task expansion with haptic feedback
  const handleToggleExpand = (taskId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggleExpand(taskId);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPriority(null);
    setSelectedStatus(null);
    setSortBy('dueDate');
    setSortOrder('asc');
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'None';
    }
  };

  // Render task item with enhanced styling
  const renderTaskItem = ({ item }: { item: any }) => (
    <KaryTaskItem
      task={item}
      allTags={allTags}
      isSelected={selectedTaskId === item.id}
      level={0}
      isParent={false}
      isExpanded={expandedTasks[item.id]}
      onSelect={(id: string) => handleSelectTask(id)}
      onToggleComplete={(id: string) => handleToggleComplete(id)}
      onToggleExpand={(id: string) => handleToggleExpand(id)}
    />
  );

  // Render filter chips
  const renderFilterChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        item.active && styles.filterChipActive
      ]}
      onPress={item.onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.filterChipText,
        item.active && styles.filterChipTextActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  // Loading state with skeleton screens
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasks</Text>
          <View style={styles.headerActions}>
            <View style={styles.skeletonButton} />
            <View style={styles.skeletonButton} />
          </View>
        </View>
        
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <ErrorState error={error} onRetry={onRefresh || (() => {})} />
      </View>
    );
  }

  // Empty state
  if (filteredTasks.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <EmptyState viewDetails={viewDetails} onAddTask={onAddTask} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with search and filters */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            {viewDetails?.name || 'Tasks'} ({filteredTasks.length})
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilters(!showFilters)}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={showFilters ? 'filter' : 'filter-outline'} 
                size={20} 
                color={showFilters ? '#007AFF' : '#666'} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => onAddTask()}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Priority filters */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Priority</Text>
              <View style={styles.filterChips}>
                {[
                  { key: null, label: 'All', active: selectedPriority === null },
                  { key: 'high', label: 'High', active: selectedPriority === 'high' },
                  { key: 'medium', label: 'Medium', active: selectedPriority === 'medium' },
                  { key: 'low', label: 'Low', active: selectedPriority === 'low' },
                ].map((priority) => (
                  <TouchableOpacity
                    key={priority.key}
                    style={[
                      styles.filterChip,
                      priority.active && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedPriority(priority.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.filterChipText,
                      priority.active && styles.filterChipTextActive
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status filters */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterChips}>
                {[
                  { key: null, label: 'All', active: selectedStatus === null },
                  { key: 'pending', label: 'Pending', active: selectedStatus === 'pending' },
                  { key: 'completed', label: 'Completed', active: selectedStatus === 'completed' },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.key}
                    style={[
                      styles.filterChip,
                      status.active && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedStatus(status.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.filterChipText,
                      status.active && styles.filterChipTextActive
                    ]}>
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort by</Text>
              <View style={styles.sortContainer}>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setSortBy('dueDate')}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === 'dueDate' && styles.sortButtonTextActive
                  ]}>
                    Due Date
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setSortBy('priority')}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === 'priority' && styles.sortButtonTextActive
                  ]}>
                    Priority
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sortButton}
                  onPress={() => setSortBy('title')}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.sortButtonText,
                    sortBy === 'title' && styles.sortButtonTextActive
                  ]}>
                    Title
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={styles.sortOrderButton}
                onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                  size={16} 
                  color="#007AFF" 
                />
              </TouchableOpacity>
            </View>

            {/* Clear filters button */}
            {(selectedPriority !== null || selectedStatus !== null || searchQuery.length > 0) && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={16} color="#007AFF" />
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Task list */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh || (() => {})}
            colors={['#007AFF']}
            tintColor="#007AFF"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          <View style={styles.listFooter}>
            <Text style={styles.listFooterText}>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 4,
  },
  clearSearchButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
    borderColor: '#007AFF',
  },
  sortOrderButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  clearFiltersButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    paddingBottom: 20,
  },
  listFooter: {
    padding: 16,
    alignItems: 'center',
  },
  listFooterText: {
    fontSize: 14,
    color: '#666',
  },
  // Skeleton styles
  skeletonButton: {
    width: 32,
    height: 32,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginLeft: 8,
  },
  skeletonList: {
    padding: 16,
  },
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 12,
  },
  skeletonCheckbox: {
    width: 24,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
  },
  skeletonTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: '60%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonActions: {
    width: 60,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Error state styles
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorStateIcon: {
    marginBottom: 20,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  errorStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default KaryTaskList;
