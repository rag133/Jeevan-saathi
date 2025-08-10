import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Task {
  id: string;
  title: string;
  description?: string;
  listId?: string;
  parentId?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  completed?: boolean;
  dueDate?: Date;
  completedDate?: Date;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
  count?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface KaryTaskItemProps {
  task: Task;
  allTags: Tag[];
  isSelected: boolean;
  level: number;
  isParent: boolean;
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

const formatDate = (date?: Date) => {
  if (!date) return '';

  const d = new Date(date);

  // Check if the date is valid
  if (isNaN(d.getTime())) {
    return '';
  }

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;

  today.setHours(0, 0, 0, 0);
  const dateToFormat = new Date(d);
  dateToFormat.setHours(0, 0, 0, 0);

  let dateString = '';
  if (dateToFormat.getTime() === today.getTime()) {
    dateString = 'Today';
  } else if (dateToFormat.getTime() === tomorrow.getTime()) {
    dateString = 'Tomorrow';
  } else {
    dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (hasTime) {
    const timeString = d
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      .toLowerCase();
    return `${dateString} ${timeString}`;
  }

  return dateString;
};

const getDueDateColor = (dueDate?: Date) => {
  if (!dueDate) return '#9CA3AF';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) {
    return '#EF4444'; // Overdue - red
  }
  if (due.getTime() === today.getTime()) {
    return '#2563EB'; // Today - blue
  }
  return '#6B7280'; // Upcoming - gray
};

const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'high':
      return '#DC2626'; // Red
    case 'medium':
      return '#F97316'; // Orange
    case 'low':
      return '#3B82F6'; // Blue
    default:
      return 'transparent';
  }
};

const KaryTaskItem: React.FC<KaryTaskItemProps> = ({
  task,
  allTags,
  isSelected,
  level,
  isParent,
  isExpanded,
  onSelect,
  onToggleComplete,
  onToggleExpand,
}) => {
  const taskTags = (task.tags ?? [])
    .map((tagId) => (allTags || []).find((t) => t.id === tagId))
    .filter(Boolean) as Tag[];

  const handleItemPress = () => {
    if (!isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(task.id);
    }
  };

  const handleExpandPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleExpand(task.id);
  };

  const handleToggleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleComplete(task.id);
  };

  const isContextParent = isParent && task.dueDate === undefined;

  return (
    <TouchableOpacity
      onPress={handleItemPress}
      style={[
        styles.container,
        {
          marginLeft: level * 20,
          backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
          borderColor: isSelected ? '#C7D2FE' : '#E5E7EB',
        },
      ]}
      activeOpacity={0.8}
    >
      {/* Expand/Collapse Button */}
      <View style={styles.expandButton}>
        {isParent ? (
          <TouchableOpacity
            onPress={handleExpandPress}
            style={styles.expandTouchable}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-forward'}
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.expandPlaceholder} />
        )}
      </View>

      {/* Checkbox */}
      <TouchableOpacity
        onPress={handleToggleComplete}
        style={[
          styles.checkbox,
          {
            backgroundColor: task.completed ? '#3B82F6' : '#FFFFFF',
            borderColor: task.completed ? '#3B82F6' : '#D1D5DB',
          },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.completed && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Task Content */}
      <View style={styles.content}>
        <View style={styles.contentRow}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: task.completed ? '#9CA3AF' : '#111827',
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                },
                isContextParent && styles.contextParentTitle,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </View>

          {/* Task Metadata */}
          <View style={styles.metadata}>
            {/* Tags */}
            {taskTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {taskTags.slice(0, 2).map((tag) => (
                  <View
                    key={tag.id}
                    style={[
                      styles.tag,
                      {
                        backgroundColor: `${tag.color || '#6B7280'}20`,
                        borderColor: `${tag.color || '#6B7280'}40`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: tag.color || '#6B7280' },
                      ]}
                    >
                      {tag.name}
                    </Text>
                  </View>
                ))}
                {taskTags.length > 2 && (
                  <Text style={styles.moreTags}>+{taskTags.length - 2}</Text>
                )}
              </View>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <View
                style={[
                  styles.dueDate,
                  {
                    backgroundColor: getDueDateColor(task.dueDate) === '#EF4444'
                      ? '#FEF2F2'
                      : getDueDateColor(task.dueDate) === '#2563EB'
                      ? '#EFF6FF'
                      : '#F9FAFB',
                    borderColor: getDueDateColor(task.dueDate) === '#EF4444'
                      ? '#FECACA'
                      : getDueDateColor(task.dueDate) === '#2563EB'
                      ? '#BFDBFE'
                      : '#E5E7EB',
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={getDueDateColor(task.dueDate)}
                />
                <Text
                  style={[
                    styles.dueDateText,
                    { color: getDueDateColor(task.dueDate) },
                  ]}
                >
                  {formatDate(task.dueDate)}
                </Text>
              </View>
            )}

            {/* Priority Flag */}
            {task.priority && (
              <View style={styles.priorityContainer}>
                <Ionicons
                  name="flag"
                  size={16}
                  color={getPriorityColor(task.priority)}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expandButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  expandTouchable: {
    padding: 2,
    borderRadius: 4,
  },
  expandPlaceholder: {
    width: 16,
    height: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  contextParentTitle: {
    color: '#6B7280',
  },
  metadata: {
    alignItems: 'flex-end',
    gap: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  dueDateText: {
    fontSize: 10,
    fontWeight: '500',
  },
  priorityContainer: {
    padding: 2,
  },
});

export default KaryTaskItem;
