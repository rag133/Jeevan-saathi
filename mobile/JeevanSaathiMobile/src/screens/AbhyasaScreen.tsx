import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Habit, 
  Goal, 
  Milestone, 
  QuickWin, 
  HabitLog,
  HabitType,
  HabitFrequencyType,
  GoalStatus,
  MilestoneStatus,
  QuickWinStatus,
  HabitLogStatus
} from '../types';
import { abhyasaService } from '../services/abhyasaService';
import { useFocusEffect } from '@react-navigation/native';

const AbhyasaScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('habits');
  
  // Modal states
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showCreateMilestoneModal, setShowCreateMilestoneModal] = useState(false);
  const [showCreateQuickWinModal, setShowCreateQuickWinModal] = useState(false);
  const [showEditHabitModal, setShowEditHabitModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  
  // Editing states
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  
  // Form states
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    frequency: { type: HabitFrequencyType.DAILY } as any,
    type: HabitType.BINARY,
    status: 'Yet to Start' as any,
    color: '#34C759',
    icon: 'leaf' as any,
    startDate: new Date(),
    dailyTarget: 1,
  });
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    targetEndDate: new Date(),
    status: GoalStatus.NOT_STARTED,
    icon: 'book' as any,
    color: '#FF9500',
  });
  
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    parentGoalId: '',
    startDate: new Date(),
    targetEndDate: new Date(),
    status: MilestoneStatus.NOT_STARTED,
    icon: 'flag' as any,
    color: '#007AFF',
  });
  
  const [newQuickWin, setNewQuickWin] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    status: QuickWinStatus.PENDING,
  });

  // Load data from Firebase
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedHabits, fetchedGoals, fetchedMilestones, fetchedQuickWins, fetchedHabitLogs] = await Promise.all([
        abhyasaService.getHabits(),
        abhyasaService.getGoals(),
        abhyasaService.getMilestones(),
        abhyasaService.getQuickWins(),
        abhyasaService.getHabitLogs(),
      ]);
      setHabits(fetchedHabits || []);
      setGoals(fetchedGoals || []);
      setMilestones(fetchedMilestones || []);
      setQuickWins(fetchedQuickWins || []);
      setHabitLogs(fetchedHabitLogs || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribeHabits = abhyasaService.subscribeToHabits((updatedHabits) => {
      setHabits(updatedHabits);
    });

    const unsubscribeGoals = abhyasaService.subscribeToGoals((updatedGoals) => {
      setGoals(updatedGoals);
    });

    const unsubscribeHabitLogs = abhyasaService.subscribeToHabitLogs((updatedLogs) => {
      setHabitLogs(updatedLogs);
    });

    return () => {
      unsubscribeHabits();
      unsubscribeGoals();
      unsubscribeHabitLogs();
    };
  }, []);

  // Create new habit
  const createHabit = async () => {
    try {
      if (!newHabit.title.trim()) {
        Alert.alert('Error', 'Please enter a habit title');
        return;
      }

      const habitData = {
        name: newHabit.title,
        title: newHabit.title,
        description: newHabit.description,
        frequency: newHabit.frequency,
        type: newHabit.type,
        color: newHabit.color,
        icon: newHabit.icon,
        dailyTarget: newHabit.dailyTarget,
        targetCount: newHabit.dailyTarget || 1,
        status: 'active' as const,
        startDate: newHabit.startDate,
        userId: 'current-user', // This should come from auth
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await abhyasaService.createHabit(habitData);
      setShowCreateHabitModal(false);
      setNewHabit({
        title: '',
        description: '',
        frequency: { type: HabitFrequencyType.DAILY },
        type: HabitType.BINARY,
        status: 'Yet to Start' as any,
        color: '#34C759',
        icon: 'leaf' as any,
        startDate: new Date(),
        dailyTarget: 1,
      });
      Alert.alert('Success', 'Habit created successfully!');
    } catch (error) {
      console.error('Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    }
  };

  // Create new goal
  const createGoal = async () => {
    try {
      if (!newGoal.title.trim()) {
        Alert.alert('Error', 'Please enter a goal title');
        return;
      }

      const goalData = {
        title: newGoal.title,
        description: newGoal.description,
        startDate: newGoal.startDate,
        targetEndDate: newGoal.targetEndDate,
        status: 'active' as const,
        priority: 'medium' as const,
        color: newGoal.color,
        icon: newGoal.icon,
        userId: 'current-user', // This should come from auth
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await abhyasaService.createGoal(goalData);
      setShowCreateGoalModal(false);
      setNewGoal({
        title: '',
        description: '',
        startDate: new Date(),
        targetEndDate: new Date(),
        status: GoalStatus.NOT_STARTED,
        icon: 'book' as any,
        color: '#FF9500',
      });
      Alert.alert('Success', 'Goal created successfully!');
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    }
  };

  // Create new milestone
  const createMilestone = async () => {
    try {
      if (!newMilestone.title.trim()) {
        Alert.alert('Error', 'Please enter a milestone title');
        return;
      }
      if (!newMilestone.parentGoalId) {
        Alert.alert('Error', 'Please select a parent goal');
        return;
      }

      const milestoneData = {
        ...newMilestone,
        status: 'pending' as const,
        userId: 'current-user', // This should come from auth
        goalId: newMilestone.parentGoalId,
        createdAt: new Date(),
        startDate: new Date(),
        updatedAt: new Date(),
      };

      await abhyasaService.createMilestone(milestoneData);
      setShowCreateMilestoneModal(false);
      setNewMilestone({
        title: '',
        description: '',
        parentGoalId: '',
        startDate: new Date(),
        targetEndDate: new Date(),
        status: MilestoneStatus.NOT_STARTED,
        icon: 'flag' as any,
        color: '#007AFF',
      });
      Alert.alert('Success', 'Milestone created successfully!');
    } catch (error) {
      console.error('Error creating milestone:', error);
      Alert.alert('Error', 'Failed to create milestone. Please try again.');
    }
  };

  // Create new quick win
  const createQuickWin = async () => {
    try {
      if (!newQuickWin.title.trim()) {
        Alert.alert('Error', 'Please enter a quick win title');
        return;
      }

      const quickWinData = {
        ...newQuickWin,
        status: 'pending' as const,
        userId: 'current-user', // This should come from auth
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await abhyasaService.createQuickWin(quickWinData);
      setShowCreateQuickWinModal(false);
      setNewQuickWin({
        title: '',
        description: '',
        dueDate: new Date(),
        status: QuickWinStatus.PENDING,
      });
      Alert.alert('Success', 'Quick win created successfully!');
    } catch (error) {
      console.error('Error creating quick win:', error);
      Alert.alert('Error', 'Failed to create quick win. Please try again.');
    }
  };

  // Log habit completion
  const logHabit = async (habitId: string, value?: number, completedChecklistItems?: string[]) => {
    try {
      const today = new Date();
      const existingLog = habitLogs.find(log => 
        log.habitId === habitId && log.date.getTime() === today.getTime()
      );

      if (existingLog) {
        // Update existing log
        await abhyasaService.updateHabitLog(existingLog.id, {
          value,
          completedChecklistItems,
        });
      } else {
        // Create new log
        await abhyasaService.createHabitLog({
          habitId,
          date: today,
          value,
          completedChecklistItems,
          status: 'completed',
          count: 1,
          userId: 'current-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      Alert.alert('Success', 'Habit logged successfully!');
    } catch (error) {
      console.error('Error logging habit:', error);
      Alert.alert('Error', 'Failed to log habit. Please try again.');
    }
  };

  // Update habit
  const updateHabit = async () => {
    try {
      if (!editingHabit) return;

      await abhyasaService.updateHabit(editingHabit.id, editingHabit);
      setShowEditHabitModal(false);
      setEditingHabit(null);
      Alert.alert('Success', 'Habit updated successfully!');
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    }
  };

  // Update goal
  const updateGoal = async () => {
    try {
      if (!editingGoal) return;

      await abhyasaService.updateGoal(editingGoal.id, editingGoal);
      setShowEditGoalModal(false);
      setEditingGoal(null);
      Alert.alert('Success', 'Goal updated successfully!');
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    }
  };

  // Update milestone
  const updateMilestone = async () => {
    try {
      if (!editingMilestone) return;

      await abhyasaService.updateMilestone(editingMilestone.id, editingMilestone);
      setShowEditMilestoneModal(false);
      setEditingMilestone(null);
      Alert.alert('Success', 'Milestone updated successfully!');
    } catch (error) {
      console.error('Error updating milestone:', error);
      Alert.alert('Error', 'Failed to update milestone. Please try again.');
    }
  };

  // Delete habit
  const deleteHabit = async (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await abhyasaService.deleteHabit(habitId);
              Alert.alert('Success', 'Habit deleted successfully!');
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Delete goal
  const deleteGoal = async (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await abhyasaService.deleteGoal(goalId);
              Alert.alert('Success', 'Goal deleted successfully!');
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Delete milestone
  const deleteMilestone = async (milestoneId: string) => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await abhyasaService.deleteMilestone(milestoneId);
              Alert.alert('Success', 'Milestone deleted successfully!');
            } catch (error) {
              console.error('Error deleting milestone:', error);
              Alert.alert('Error', 'Failed to delete milestone. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Open edit modals
  const openEditHabitModal = (habit: Habit) => {
    setEditingHabit(habit);
    setShowEditHabitModal(true);
  };

  const openEditGoalModal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowEditGoalModal(true);
  };

  const openEditMilestoneModal = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setShowEditMilestoneModal(true);
  };

  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'COMPLETED':
        return { backgroundColor: '#34C759', color: 'white' };
      case 'In Progress':
      case 'IN_PROGRESS':
        return { backgroundColor: '#FF9500', color: 'white' };
      case 'Yet to Start':
      case 'NOT_STARTED':
        return { backgroundColor: '#8E8E93', color: 'white' };
      case 'Abandoned':
      case 'ABANDONED':
        return { backgroundColor: '#FF3B30', color: 'white' };
      default:
        return { backgroundColor: '#8E8E93', color: 'white' };
    }
  };

  // Render habit item
  const renderHabit = ({ item }: { item: Habit }) => {
    const today = new Date();
    const existingLog = habitLogs.find(log => 
      log.habitId === item.id && log.date.getTime() === today.getTime()
    );
    const isCompleted = existingLog && (
      item.type === HabitType.BINARY ? true :
      item.type === HabitType.COUNT ? (existingLog.value || 0) >= (item.dailyTarget || 1) :
      item.type === HabitType.DURATION ? (existingLog.value || 0) >= (item.dailyTarget || 1) :
      item.type === HabitType.CHECKLIST ? (existingLog.completedChecklistItems?.length || 0) >= (item.checklist?.length || 0) :
      false
    );

    return (
      <View style={[styles.habitCard, { borderLeftColor: item.color }]}>
        <View style={styles.habitHeader}>
          <View style={styles.habitInfo}>
            <Text style={styles.habitTitle}>{item.title}</Text>
            {item.description && (
              <Text style={styles.habitDescription}>{item.description}</Text>
            )}
          </View>
          <View style={styles.habitActions}>
            <TouchableOpacity
              style={[styles.logButton, isCompleted && styles.logButtonCompleted]}
              onPress={() => logHabit(item.id, 1)}
            >
              <Ionicons 
                name={isCompleted ? 'checkmark' : 'add'} 
                size={20} 
                color={isCompleted ? 'white' : item.color} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditHabitModal(item)}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.habitMeta}>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <Text style={styles.frequencyText}>
            {item.frequency.type === HabitFrequencyType.DAILY ? 'Daily' :
             item.frequency.type === HabitFrequencyType.WEEKLY ? `${item.frequency.times}x per week` :
             item.frequency.type === HabitFrequencyType.MONTHLY ? `${item.frequency.times}x per month` :
             'Custom'}
          </Text>
        </View>
      </View>
    );
  };

  // Render goal item
  const renderGoal = ({ item }: { item: Goal }) => (
    <View style={[styles.goalCard, { borderLeftColor: '#007AFF' }]}>
      <View style={styles.goalHeader}>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.goalDescription}>{item.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditGoalModal(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.goalMeta}>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.dateText}>
          {item.targetEndDate ? 
            `Due: ${new Date(item.targetEndDate).toLocaleDateString()}` :
            'No due date'
          }
        </Text>
      </View>
    </View>
  );

  // Render milestone item
  const renderMilestone = ({ item }: { item: Milestone }) => (
    <View style={[styles.milestoneCard, { borderLeftColor: '#007AFF' }]}>
      <View style={styles.milestoneHeader}>
        <View style={styles.milestoneInfo}>
          <Text style={styles.milestoneTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.milestoneDescription}>{item.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditMilestoneModal(item)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.milestoneMeta}>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.dateText}>
          {item.targetEndDate ? 
            `Due: ${new Date(item.targetEndDate).toLocaleDateString()}` :
            'No due date'
          }
        </Text>
      </View>
    </View>
  );

  // Render quick win item
  const renderQuickWin = ({ item }: { item: QuickWin }) => (
    <View style={[styles.quickWinCard, { borderLeftColor: item.status === QuickWinStatus.COMPLETED ? '#34C759' : '#FF9500' }]}>
      <View style={styles.quickWinHeader}>
        <View style={styles.quickWinInfo}>
          <Text style={styles.quickWinTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.quickWinDescription}>{item.description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.statusToggle, item.status === QuickWinStatus.COMPLETED && styles.statusToggleCompleted]}
          onPress={() => {
            // Toggle quick win status
            const newStatus = item.status === QuickWinStatus.COMPLETED ? 
              QuickWinStatus.PENDING : QuickWinStatus.COMPLETED;
            // Update quick win status
          }}
        >
          <Ionicons 
            name={item.status === QuickWinStatus.COMPLETED ? 'checkmark' : 'add'} 
            size={20} 
            color={item.status === QuickWinStatus.COMPLETED ? 'white' : '#FF9500'} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.quickWinMeta}>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.dateText}>
          {item.dueDate ? 
            `Due: ${new Date(item.dueDate).toLocaleDateString()}` :
            'No due date'
          }
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Abhyasa</Text>
        <Text style={styles.subtitle}>Practice & Growth</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'habits' && styles.activeTab]}
            onPress={() => setSelectedTab('habits')}
          >
            <Text style={[styles.tabText, selectedTab === 'habits' && styles.activeTabText]}>
              Habits ({habits.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'goals' && styles.activeTab]}
            onPress={() => setSelectedTab('goals')}
          >
            <Text style={[styles.tabText, selectedTab === 'goals' && styles.activeTabText]}>
              Goals ({goals.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'milestones' && styles.activeTab]}
            onPress={() => setSelectedTab('milestones')}
          >
            <Text style={[styles.tabText, selectedTab === 'milestones' && styles.activeTabText]}>
              Milestones ({milestones.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'quick-wins' && styles.activeTab]}
            onPress={() => setSelectedTab('quick-wins')}
          >
            <Text style={[styles.tabText, selectedTab === 'quick-wins' && styles.activeTabText]}>
              Quick Wins ({quickWins.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            switch (selectedTab) {
              case 'habits':
                setShowCreateHabitModal(true);
                break;
              case 'goals':
                setShowCreateGoalModal(true);
                break;
              case 'milestones':
                setShowCreateMilestoneModal(true);
                break;
              case 'quick-wins':
                setShowCreateQuickWinModal(true);
                break;
            }
          }}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>
            Add {selectedTab === 'habits' ? 'Habit' : 
                  selectedTab === 'goals' ? 'Goal' :
                  selectedTab === 'milestones' ? 'Milestone' : 'Quick Win'}
          </Text>
        </TouchableOpacity>

        {/* Tab Content */}
        {selectedTab === 'habits' && (
          <FlatList
            data={habits}
            renderItem={renderHabit}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No habits yet</Text>
                <Text style={styles.emptyStateSubtext}>Create your first habit to start building positive routines</Text>
              </View>
            }
          />
        )}

        {selectedTab === 'goals' && (
          <FlatList
            data={goals}
            renderItem={renderGoal}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="flag-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No goals yet</Text>
                <Text style={styles.emptyStateSubtext}>Set meaningful goals to guide your journey</Text>
              </View>
            }
          />
        )}

        {selectedTab === 'milestones' && (
          <FlatList
            data={milestones}
            renderItem={renderMilestone}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="flag-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No milestones yet</Text>
                <Text style={styles.emptyStateSubtext}>Break down your goals into achievable milestones</Text>
              </View>
            }
          />
        )}

        {selectedTab === 'quick-wins' && (
          <FlatList
            data={quickWins}
            renderItem={renderQuickWin}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="star-outline" size={48} color="#8E8E93" />
                <Text style={styles.emptyStateText}>No quick wins yet</Text>
                <Text style={styles.emptyStateSubtext}>Add small wins to celebrate your progress</Text>
              </View>
            }
          />
        )}
      </ScrollView>

      {/* Create Habit Modal */}
      <Modal
        visible={showCreateHabitModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateHabitModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Habit</Text>
            <TouchableOpacity onPress={createHabit}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Habit title"
              value={newHabit.title}
              onChangeText={(text) => setNewHabit({...newHabit, title: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newHabit.description}
              onChangeText={(text) => setNewHabit({...newHabit, description: text})}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Daily target (default: 1)"
              value={newHabit.dailyTarget?.toString()}
              onChangeText={(text) => setNewHabit({...newHabit, dailyTarget: parseInt(text) || 1})}
              keyboardType="numeric"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Create Goal Modal */}
      <Modal
        visible={showCreateGoalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateGoalModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Goal</Text>
            <TouchableOpacity onPress={createGoal}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Goal title"
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({...newGoal, title: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({...newGoal, description: text})}
              multiline
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Create Milestone Modal */}
      <Modal
        visible={showCreateMilestoneModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateMilestoneModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Milestone</Text>
            <TouchableOpacity onPress={createMilestone}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Milestone title"
              value={newMilestone.title}
              onChangeText={(text) => setNewMilestone({...newMilestone, title: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newMilestone.description}
              onChangeText={(text) => setNewMilestone({...newMilestone, description: text})}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Parent Goal ID"
              value={newMilestone.parentGoalId}
              onChangeText={(text) => setNewMilestone({...newMilestone, parentGoalId: text})}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Create Quick Win Modal */}
      <Modal
        visible={showCreateQuickWinModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateQuickWinModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Quick Win</Text>
            <TouchableOpacity onPress={createQuickWin}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Quick win title"
              value={newQuickWin.title}
              onChangeText={(text) => setNewQuickWin({...newQuickWin, title: text})}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newQuickWin.description}
              onChangeText={(text) => setNewQuickWin({...newQuickWin, description: text})}
              multiline
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Modals would go here - similar structure to create modals */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  habitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickWinCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quickWinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitInfo: {
    flex: 1,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
    marginRight: 12,
  },
  quickWinInfo: {
    flex: 1,
    marginRight: 12,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  quickWinTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  goalDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  quickWinDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  logButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  logButtonCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  statusToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  statusToggleCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  habitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickWinMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  frequencyText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  cancelButton: {
    fontSize: 16,
    color: '#8E8E93',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default AbhyasaScreen;

