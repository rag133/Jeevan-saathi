import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, Goal } from '../types';

const AbhyasaScreen = () => {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: '1',
      title: 'Morning Meditation',
      description: '15 minutes of mindfulness',
      frequency: 'daily',
      goal: 1,
      unit: 'session',
      createdAt: new Date(),
      updatedAt: new Date(),
      color: '#34C759',
      icon: 'leaf',
    },
    {
      id: '2',
      title: 'Exercise',
      description: '30 minutes of physical activity',
      frequency: 'daily',
      goal: 30,
      unit: 'minutes',
      createdAt: new Date(),
      updatedAt: new Date(),
      color: '#007AFF',
      icon: 'fitness',
    },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Read 12 books this year',
      description: 'Complete one book per month',
      targetDate: new Date(2024, 11, 31),
      createdAt: new Date(),
      updatedAt: new Date(),
      color: '#FF9500',
      icon: 'book',
      progress: 4,
      status: 'in_progress',
    },
  ]);

  const [selectedTab, setSelectedTab] = useState<'habits' | 'goals'>('habits');

  // Helper function to get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'not_started':
        return styles.statusnot_started;
      case 'in_progress':
        return styles.statusin_progress;
      case 'completed':
        return styles.statuscompleted;
      default:
        return styles.statusnot_started;
    }
  };

  const renderHabit = ({ item }: { item: Habit }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={24} color="white" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
          <Text style={styles.cardFrequency}>{item.frequency}</Text>
        </View>
        <TouchableOpacity style={styles.logButton}>
          <Text style={styles.logButtonText}>Log</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderGoal = ({ item }: { item: Goal }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={24} color="white" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(item.progress / 12) * 100}%`,
                    backgroundColor: item.color 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{item.progress}/12</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Abhyasa</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'habits' && styles.activeTab]}
          onPress={() => setSelectedTab('habits')}
        >
          <Text style={[styles.tabText, selectedTab === 'habits' && styles.activeTabText]}>
            Habits
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'goals' && styles.activeTab]}
          onPress={() => setSelectedTab('goals')}
        >
          <Text style={[styles.tabText, selectedTab === 'goals' && styles.activeTabText]}>
            Goals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'habits' ? (
        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={item => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={goals}
          renderItem={renderGoal}
          keyExtractor={item => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  list: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardFrequency: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  logButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  logButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusnot_started: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  statusin_progress: {
    backgroundColor: '#FF9500',
    color: 'white',
  },
  statuscompleted: {
    backgroundColor: '#34C759',
    color: 'white',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default AbhyasaScreen;

