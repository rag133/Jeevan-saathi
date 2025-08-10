import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { List, Tag } from '../types';

interface KarySidebarProps {
  lists: List[];
  tags: Tag[];
  smartLists: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    count: number;
  }>;
  selectedView: { type: string; id: string } | null;
  onSelectView: (view: { type: string; id: string } | null) => void;
  onAddList: (listData: any) => void;
  onEditList: (list: List) => void;
  onDeleteList: (listId: string) => void;
  onAddTag: (tagData: any) => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const KarySidebar: React.FC<KarySidebarProps> = ({
  lists,
  tags,
  smartLists,
  selectedView,
  onSelectView,
  onAddList,
  onEditList,
  onDeleteList,
  onAddTag,
  onEditTag,
  onDeleteTag,
  onClose,
}) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [editingList, setEditingList] = useState<List | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editListName, setEditListName] = useState('');
  const [editTagName, setEditTagName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Animate sidebar in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleClose = () => {
    // Animate sidebar out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleAddList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'List name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddList({
        name: newListName.trim(),
        color: '#007AFF',
        icon: 'list',
      });
      setNewListName('');
      setIsAddingList(false);
      
      // Show success feedback
      Alert.alert('Success', 'List created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create list. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditList = async () => {
    if (!editingList || !editListName.trim()) {
      Alert.alert('Error', 'List name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await onEditList({
        ...editingList,
        name: editListName.trim(),
      });
      setEditingList(null);
      setEditListName('');
      
      // Show success feedback
      Alert.alert('Success', 'List updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update list. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteList = (list: List) => {
    Alert.alert(
      'Delete List',
      `Are you sure you want to delete "${list.name}"? This will also delete all tasks in this list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteList(list.id);
              if (selectedView?.id === list.id) {
                onSelectView(null);
              }
              Alert.alert('Success', 'List deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete list. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert('Error', 'Tag name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTag({
        name: newTagName.trim(),
        color: '#FF9500',
      });
      setNewTagName('');
      setIsAddingTag(false);
      
      // Show success feedback
      Alert.alert('Success', 'Tag created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create tag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTag = async () => {
    if (!editingTag || !editTagName.trim()) {
      Alert.alert('Error', 'Tag name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await onEditTag({
        ...editingTag,
        name: editTagName.trim(),
      });
      setEditingTag(null);
      setEditTagName('');
      
      // Show success feedback
      Alert.alert('Success', 'Tag updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update tag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = (tag: Tag) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tag.name}"? This will remove the tag from all tasks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteTag(tag.id);
              if (selectedView?.id === tag.id) {
                onSelectView(null);
              }
              Alert.alert('Success', 'Tag deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete tag. Please try again.');
            }
          },
        },
      ]
    );
  };

  const startEditList = (list: List) => {
    setEditingList(list);
    setEditListName(list.name);
  };

  const startEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
  };

  const cancelEditList = () => {
    setEditingList(null);
    setEditListName('');
  };

  const cancelEditTag = () => {
    setEditingTag(null);
    setEditTagName('');
  };

  const isViewSelected = (view: List | Tag | { type: string; id: string }): boolean => {
    if ('type' in view) {
      return selectedView?.type === view.type && selectedView?.id === view.id;
    }
    return selectedView?.type === 'list' && selectedView?.id === view.id;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim }
            ],
            opacity: fadeAnim
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kary</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* All Tasks View */}
          <TouchableOpacity
            style={[
              styles.viewItem,
              !selectedView && styles.viewItemSelected
            ]}
            onPress={() => onSelectView(null)}
            activeOpacity={0.7}
          >
            <View style={styles.viewIcon}>
              <Ionicons name="grid" size={20} color={!selectedView ? '#007AFF' : '#666'} />
            </View>
            <Text style={[
              styles.viewText,
              !selectedView && styles.viewTextSelected
            ]}>
              All Tasks
            </Text>
          </TouchableOpacity>

          {/* Smart Lists Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Smart Lists</Text>
            </View>
            
            {smartLists.map(smartList => (
              <TouchableOpacity
                key={smartList.id}
                style={[
                  styles.viewItem,
                  isViewSelected({ type: 'smart-list', id: smartList.id }) && styles.viewItemSelected
                ]}
                onPress={() => onSelectView({ type: 'smart-list', id: smartList.id })}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.viewIcon,
                  { backgroundColor: smartList.color }
                ]}>
                  <Ionicons name={smartList.icon as any} size={16} color="white" />
                </View>
                <Text style={[
                  styles.viewText,
                  isViewSelected({ type: 'smart-list', id: smartList.id }) && styles.viewTextSelected
                ]}>
                  {smartList.name}
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{smartList.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lists Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lists</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAddingList(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Add List Form */}
            {isAddingList && (
              <View style={styles.addForm}>
                <TextInput
                  style={styles.input}
                  value={newListName}
                  onChangeText={setNewListName}
                  placeholder="List name"
                  placeholderTextColor="#999"
                  autoFocus
                  maxLength={50}
                />
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      (!newListName.trim() || isSubmitting) && styles.saveButtonDisabled
                    ]}
                    onPress={handleAddList}
                    disabled={!newListName.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Text style={styles.saveButtonText}>...</Text>
                    ) : (
                      <Text style={styles.saveButtonText}>Add</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingList(false);
                      setNewListName('');
                    }}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Lists */}
            {(lists || []).map(list => (
              <View key={list.id} style={styles.viewItemContainer}>
                {editingList?.id === list.id ? (
                  <View style={styles.editForm}>
                    <TextInput
                      style={styles.input}
                      value={editListName}
                      onChangeText={setEditListName}
                      placeholder="List name"
                      placeholderTextColor="#999"
                      autoFocus
                      maxLength={50}
                    />
                    <View style={styles.formActions}>
                      <TouchableOpacity
                        style={[
                          styles.saveButton,
                          (!editListName.trim() || isSubmitting) && styles.saveButtonDisabled
                        ]}
                        onPress={handleEditList}
                        disabled={!editListName.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <Text style={styles.saveButtonText}>...</Text>
                        ) : (
                          <Text style={styles.saveButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEditList}
                        disabled={isSubmitting}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.viewItem,
                        isViewSelected(list) && styles.viewItemSelected
                      ]}
                      onPress={() => onSelectView({ type: 'list', id: list.id })}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.viewIcon,
                        { backgroundColor: list.color || '#007AFF' }
                      ]}>
                        <Ionicons name="list" size={16} color="white" />
                      </View>
                      <Text style={[
                        styles.viewText,
                        isViewSelected(list) && styles.viewTextSelected
                      ]}>
                        {list.name}
                      </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => startEditList(list)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="create-outline" size={16} color="#666" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteList(list)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAddingTag(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            {/* Add Tag Form */}
            {isAddingTag && (
              <View style={styles.addForm}>
                <TextInput
                  style={styles.input}
                  value={newTagName}
                  onChangeText={setNewTagName}
                  placeholder="Tag name"
                  placeholderTextColor="#999"
                  autoFocus
                  maxLength={30}
                />
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      (!newTagName.trim() || isSubmitting) && styles.saveButtonDisabled
                    ]}
                    onPress={handleAddTag}
                    disabled={!newTagName.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Text style={styles.saveButtonText}>...</Text>
                    ) : (
                      <Text style={styles.saveButtonText}>Add</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAddingTag(false);
                      setNewTagName('');
                    }}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Tags */}
            {(tags || []).map(tag => (
              <View key={tag.id} style={styles.viewItemContainer}>
                {editingTag?.id === tag.id ? (
                  <View style={styles.editForm}>
                    <TextInput
                      style={styles.input}
                      value={editTagName}
                      onChangeText={setEditTagName}
                      placeholder="Tag name"
                      placeholderTextColor="#999"
                      autoFocus
                      maxLength={30}
                    />
                    <View style={styles.formActions}>
                      <TouchableOpacity
                        style={[
                          styles.saveButton,
                          (!editTagName.trim() || isSubmitting) && styles.saveButtonDisabled
                        ]}
                        onPress={handleEditTag}
                        disabled={!editTagName.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <Text style={styles.saveButtonText}>...</Text>
                        ) : (
                          <Text style={styles.saveButtonText}>Save</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEditTag}
                        disabled={isSubmitting}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.viewItem,
                        isViewSelected(tag) && styles.viewItemSelected
                      ]}
                      onPress={() => onSelectView({ type: 'tag', id: tag.id })}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.viewIcon,
                        { backgroundColor: tag.color || '#FF9500' }
                      ]}>
                        <Ionicons name="pricetag" size={16} color="white" />
                      </View>
                      <Text style={[
                        styles.viewText,
                        isViewSelected(tag) && styles.viewTextSelected
                      ]}>
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                    
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => startEditTag(tag)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="create-outline" size={16} color="#666" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteTag(tag)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: screenWidth * 0.85,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  viewItemContainer: {
    marginBottom: 8,
  },
  viewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  viewItemSelected: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  viewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  viewText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  viewTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addForm: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editForm: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
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
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});

export default KarySidebar;
