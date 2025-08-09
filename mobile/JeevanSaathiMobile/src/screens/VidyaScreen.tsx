import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VidyaScreen = () => {
  const learningModules = [
    {
      id: '1',
      title: 'React Native Basics',
      description: 'Learn the fundamentals of mobile app development',
      progress: 75,
      color: '#007AFF',
      icon: 'phone-portrait',
      lessons: 12,
      completed: 9,
    },
    {
      id: '2',
      title: 'Advanced TypeScript',
      description: 'Master TypeScript for better code quality',
      progress: 45,
      color: '#FF9500',
      icon: 'code',
      lessons: 8,
      completed: 4,
    },
    {
      id: '3',
      title: 'UI/UX Design Principles',
      description: 'Create beautiful and intuitive user interfaces',
      progress: 20,
      color: '#34C759',
      icon: 'color-palette',
      lessons: 10,
      completed: 2,
    },
  ];

  const recentActivities = [
    { title: 'Completed lesson on Navigation', time: '2 hours ago', type: 'lesson' },
    { title: 'Started new course: UI/UX Design', time: '1 day ago', type: 'course' },
    { title: 'Earned badge: TypeScript Expert', time: '3 days ago', type: 'achievement' },
  ];

  const renderLearningModule = (module: typeof learningModules[0]) => (
    <TouchableOpacity key={module.id} style={styles.moduleCard}>
      <View style={styles.moduleHeader}>
        <View style={[styles.moduleIcon, { backgroundColor: module.color }]}>
          <Ionicons name={module.icon as any} size={24} color="white" />
        </View>
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleTitle}>{module.title}</Text>
          <Text style={styles.moduleDescription}>{module.description}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${module.progress}%`,
                    backgroundColor: module.color 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{module.progress}%</Text>
          </View>
          <Text style={styles.lessonCount}>
            {module.completed}/{module.lessons} lessons completed
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivity = (activity: typeof recentActivities[0], index: number) => (
    <View key={index} style={styles.activityCard}>
      <View style={styles.activityIcon}>
        <Ionicons 
          name={
            activity.type === 'lesson' ? 'book' : 
            activity.type === 'course' ? 'school' : 'trophy'
          } 
          size={20} 
          color="#007AFF" 
        />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{activity.title}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Learning Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          {learningModules.map(renderLearningModule)}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle" size={32} color="#007AFF" />
              </View>
              <Text style={styles.quickActionText}>Find Course</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="trophy" size={32} color="#FF9500" />
              </View>
              <Text style={styles.quickActionText}>Achievements</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="stats-chart" size={32} color="#34C759" />
              </View>
              <Text style={styles.quickActionText}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="bookmark" size={32} color="#FF3B30" />
              </View>
              <Text style={styles.quickActionText}>Bookmarks</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {recentActivities.map(renderActivity)}
        </View>
      </ScrollView>
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
  searchButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  moduleCard: {
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
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  lessonCount: {
    fontSize: 12,
    color: '#999',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
});

export default VidyaScreen;

