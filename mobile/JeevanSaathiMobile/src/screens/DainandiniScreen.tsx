import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LogEntry, Tab } from '../types';

const DainandiniScreen = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      title: 'Morning Reflection',
      content: 'Started the day with gratitude and set intentions for productivity.',
      tags: ['reflection', 'morning'],
      createdAt: new Date(),
      updatedAt: new Date(),
      mood: 'great',
      energy: 'high',
    },
    {
      id: '2',
      title: 'Work Progress',
      content: 'Completed the project proposal and sent it for review.',
      tags: ['work', 'progress'],
      createdAt: new Date(),
      updatedAt: new Date(),
      mood: 'good',
      energy: 'medium',
    },
  ]);

  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', name: 'Personal', color: '#007AFF', icon: 'person', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Work', color: '#34C759', icon: 'briefcase', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Health', color: '#FF9500', icon: 'heart', createdAt: new Date(), updatedAt: new Date() },
  ]);

  const [selectedTab, setSelectedTab] = useState<string>('1');
  const [showQuickInput, setShowQuickInput] = useState(false);
  const [quickInput, setQuickInput] = useState('');

  const filteredLogs = logs.filter(log => 
    log.tags.some(tag => 
      tabs.find(tab => tab.id === selectedTab)?.name.toLowerCase().includes(tag)
    )
  );

  const addQuickLog = () => {
    if (quickInput.trim()) {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        title: 'Quick Log',
        content: quickInput,
        tags: [tabs.find(tab => tab.id === selectedTab)?.name.toLowerCase() || 'general'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLogs(prev => [newLog, ...prev]);
      setQuickInput('');
      setShowQuickInput(false);
    }
  };

  const renderLog = ({ item }: { item: LogEntry }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <Text style={styles.logTitle}>{item.title}</Text>
        <View style={styles.logMeta}>
          {item.mood && (
            <View style={styles.moodIndicator}>
              <Ionicons 
                name={item.mood === 'great' ? 'happy' : item.mood === 'good' ? 'happy-outline' : 'sad-outline'} 
                size={16} 
                color={item.mood === 'great' ? '#34C759' : item.mood === 'good' ? '#FF9500' : '#FF3B30'} 
              />
            </View>
          )}
          <Text style={styles.logTime}>
            {item.createdAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.logContent}>{item.content}</Text>
      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderTab = (tab: Tab) => (
    <TouchableOpacity
      key={tab.id}
      style={[
        styles.tabButton,
        selectedTab === tab.id && styles.activeTabButton,
        { borderColor: tab.color }
      ]}
      onPress={() => setSelectedTab(tab.id)}
    >
      <Ionicons name={tab.icon as any} size={20} color={tab.color} />
      <Text style={[styles.tabText, selectedTab === tab.id && styles.activeTabText]}>
        {tab.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Logs</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowQuickInput(!showQuickInput)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Quick Input */}
      {showQuickInput && (
        <View style={styles.quickInputContainer}>
          <TextInput
            style={styles.quickInput}
            placeholder="What's on your mind?"
            value={quickInput}
            onChangeText={setQuickInput}
            multiline
          />
          <TouchableOpacity style={styles.quickInputButton} onPress={addQuickLog}>
            <Text style={styles.quickInputButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
      >
        {tabs.map(renderTab)}
      </ScrollView>

      {/* Logs List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLog}
        keyExtractor={item => item.id}
        style={styles.logsList}
        showsVerticalScrollIndicator={false}
      />
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
  quickInputContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  quickInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  quickInputButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  quickInputButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  tabScrollView: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    backgroundColor: 'white',
  },
  activeTabButton: {
    backgroundColor: '#f0f8ff',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  logsList: {
    flex: 1,
    padding: 20,
  },
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIndicator: {
    marginRight: 8,
  },
  logTime: {
    fontSize: 12,
    color: '#999',
  },
  logContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
});

export default DainandiniScreen;

