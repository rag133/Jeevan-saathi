import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, List, Tag } from '../types';

interface KaryTaskDetailProps {
  task: Task | null;
  allLists: List[];
  allTags: Tag[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddSubtask: (taskId: string, subtaskData: any) => void;
  onToggleComplete: (taskId: string) => void;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const KaryTaskDetail: React.FC<KaryTaskDetailProps> = ({
  task,
  allLists,
  allTags,
  onUpdateTask,
  onDeleteTask,
  onAddSubtask,
  onToggleComplete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (task) {
      // Animate in when task is selected
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when no task is selected
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.95);
    }
  }, [task]);

  if (!task) {
    return (
      <Animated.View 
        style={[
          styles.emptyContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.emptyIconContainer}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
        </View>
        <Text style={styles.emptyText}>No task selected</Text>
        <Text style={styles.emptySubtext}>
          Select a task from the list to view its details
        </Text>
      </Animated.View>
    );
  }

  const handleEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      Alert.alert('Error', 'Task title cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
      
      // Show success feedback
      Alert.alert('Success', 'Task updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddSubtask(task.id, {
        title: newSubtask.trim(),
        completed: false,
        parentId: task.id,
        listId: task.listId,
      });
      setNewSubtask('');
      
      // Show success feedback
      Alert.alert('Success', 'Subtask added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add subtask. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await onDeleteTask(task.id);
              Alert.alert('Success', 'Task deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          }
        },
      ]
    );
  };

  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'low': return '#34C759';
      case 'medium': return '#FF9500';
      case 'high': return '#FF3B30';
      default: return '#FF9500';
    }
  };

  const getPriorityLabel = (priority?: string): string => {
    switch (priority) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      default: return 'Medium';
    }
  };

  const formatDueDate = (dueDate: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const due = new Date(dueDate);
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    
    if (dueDateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dueDateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Tomorrow';
    } else if (dueDateOnly < todayOnly) {
      return 'Overdue';
    } else {
      return due.toLocaleDateString();
    }
  };

  const getDueDateColor = (dueDate: Date): string => {
    const today = new Date();
    const due = new Date(dueDate);
    const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (dueDateOnly < todayOnly) {
      return '#FF3B30';
    } else if (dueDateOnly.getTime() === todayOnly.getTime()) {
      return '#FF9500';
    } else {
      return '#007AFF';
    }
  };

  const taskList = (allLists || []).find(list => list.id === task.listId);
  const taskTags = (allTags || []).filter(tag => task.tags?.includes(tag.id));

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isEditing && styles.actionButtonActive
              ]}
              onPress={handleEdit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={isEditing}
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "create-outline"} 
                size={20} 
                color={isEditing ? "#34C759" : "#007AFF"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Task Status */}
          <View style={styles.statusSection}>
            <TouchableOpacity
              style={[
                styles.statusButton,
                task.completed && styles.statusButtonCompleted
              ]}
              onPress={() => onToggleComplete(task.id)}
              activeOpacity={0.8}
            >
              {task.completed ? (
                <View style={styles.completedStatus}>
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              ) : (
                <View style={styles.incompleteStatus} />
              )}
              <Text style={[
                styles.statusText,
                task.completed && styles.completedStatusText
              ]}>
                {task.completed ? 'Completed' : 'Mark as complete'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Task Title */}
          <View style={styles.titleSection}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.titleInput}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholder="Task title"
                  placeholderTextColor="#999"
                  multiline
                  autoFocus
                  maxLength={200}
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      isSubmitting && styles.saveButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Text style={styles.saveButtonText}>Saving...</Text>
                    ) : (
                      <Text style={styles.saveButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.title}>{task.title}</Text>
            )}
          </View>

          {/* Task Description */}
          <View style={styles.descriptionSection}>
            {isEditing ? (
              <TextInput
                style={styles.descriptionInput}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Add description..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            ) : (
              <>
                <Text style={styles.sectionTitle}>Description</Text>
                {task.description ? (
                  <Text style={styles.description}>{task.description}</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.addDescriptionButton}
                    onPress={handleEdit}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                    <Text style={styles.addDescriptionText}>Add description</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Task Metadata */}
          <View style={styles.metadataSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            {/* List */}
            {taskList && (
              <View style={styles.metadataItem}>
                <View style={styles.metadataIcon}>
                  <Ionicons name="list" size={16} color="#666" />
                </View>
                <View style={styles.metadataContent}>
                  <Text style={styles.metadataLabel}>List</Text>
                  <View style={styles.metadataValue}>
                    <View style={[
                      styles.listColor,
                      { backgroundColor: taskList.color || '#007AFF' }
                    ]} />
                    <Text style={styles.metadataValueText}>{taskList.name}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Priority */}
            {task.priority && (
              <View style={styles.metadataItem}>
                <View style={styles.metadataIcon}>
                  <Ionicons name="flag" size={16} color="#666" />
                </View>
                <View style={styles.metadataContent}>
                  <Text style={styles.metadataLabel}>Priority</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(task.priority) }
                  ]}>
                    <Text style={styles.priorityBadgeText}>
                      {getPriorityLabel(task.priority)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <View style={styles.metadataItem}>
                <View style={styles.metadataIcon}>
                  <Ionicons name="time" size={16} color="#666" />
                </View>
                <View style={styles.metadataContent}>
                  <Text style={styles.metadataLabel}>Due Date</Text>
                  <View style={[
                    styles.dueDateBadge,
                    { backgroundColor: getDueDateColor(task.dueDate) }
                  ]}>
                    <Text style={styles.dueDateBadgeText}>
                      {formatDueDate(task.dueDate)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Tags */}
            {taskTags.length > 0 && (
              <View style={styles.metadataItem}>
                <View style={styles.metadataIcon}>
                  <Ionicons name="pricetag" size={16} color="#666" />
                </View>
                <View style={styles.metadataContent}>
                  <Text style={styles.metadataLabel}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {taskTags.map(tag => (
                      <View key={tag.id} style={[
                        styles.tag,
                        { backgroundColor: tag.color || '#007AFF' }
                      ]}>
                        <Text style={styles.tagText}>{tag.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Subtasks */}
          <View style={styles.subtasksSection}>
            <Text style={styles.sectionTitle}>Subtasks</Text>
            
            <View style={styles.addSubtaskContainer}>
              <TextInput
                style={styles.subtaskInput}
                value={newSubtask}
                onChangeText={setNewSubtask}
                placeholder="Add a subtask..."
                placeholderTextColor="#999"
                onSubmitEditing={handleAddSubtask}
                returnKeyType="done"
                maxLength={100}
              />
              <TouchableOpacity
                style={[
                  styles.addSubtaskButton,
                  (!newSubtask.trim() || isSubmitting) && styles.addSubtaskButtonDisabled
                ]}
                onPress={handleAddSubtask}
                disabled={!newSubtask.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Text style={styles.addSubtaskButtonText}>...</Text>
                ) : (
                  <Ionicons name="add" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  actionButtonActive: {
    backgroundColor: '#e8f5e8',
  },
  contentContainer: {
    padding: 20,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusButtonCompleted: {
    backgroundColor: '#f0f9f0',
    borderColor: '#34C759',
    borderWidth: 1,
  },
  completedStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  incompleteStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: 'white',
    marginRight: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completedStatusText: {
    color: '#34C759',
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 36,
  },
  editContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 36,
    marginBottom: 16,
    padding: 0,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addDescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    gap: 8,
  },
  addDescriptionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  descriptionInput: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  metadataSection: {
    marginBottom: 24,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metadataIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataContent: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 6,
    fontWeight: '500',
  },
  metadataValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  metadataValueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dueDateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dueDateBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  subtasksSection: {
    marginBottom: 24,
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  subtaskInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addSubtaskButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addSubtaskButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  addSubtaskButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default KaryTaskDetail;
