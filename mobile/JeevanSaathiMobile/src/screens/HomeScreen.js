import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Sample data for the list view (middle panel)
  const listItems = [
    {
      id: '1',
      title: 'Collect amazon parle way',
      time: '1:00pm',
      type: 'task',
      hasSubItems: false,
    },
    {
      id: '2',
      title: 'A new way to bring your ideas to life-Emerg...',
      time: '2:30pm',
      type: 'document',
      hasSubItems: false,
    },
    {
      id: '3',
      title: 'I Tried AI as a Life Coach for 365 Days - Here\'s...',
      time: '3:15pm',
      type: 'link',
      hasSubItems: false,
      isHighlighted: true,
    },
    {
      id: '4',
      title: '7 Years of Building a Learning System',
      date: 'Aug 6',
      type: 'document',
      hasSubItems: true,
    },
    {
      id: '5',
      title: 'Source: Windows Central Ollama\'s new app m...',
      time: '4:00pm',
      type: 'document',
      hasSubItems: false,
    },
    {
      id: '6',
      title: 'Have you watched Path of Kriya on Sadhguru...',
      time: '5:30pm',
      type: 'question',
      hasSubItems: false,
    },
    {
      id: '7',
      title: 'Cancel subscriptions',
      time: '6:00pm',
      type: 'task',
      hasSubItems: false,
    },
    {
      id: '8',
      title: 'Give me add',
      time: '7:00pm',
      type: 'task',
      hasSubItems: false,
      isIndented: true,
    },
    {
      id: '9',
      title: 'Adfsf',
      time: '7:15pm',
      type: 'task',
      hasSubItems: false,
      isIndented: true,
    },
    {
      id: '10',
      title: 'rmaien',
      time: '7:30pm',
      type: 'task',
      hasSubItems: false,
      isIndented: true,
    },
    {
      id: '11',
      title: 'adfsdf',
      time: '7:45pm',
      type: 'task',
      hasSubItems: false,
      isIndented: true,
    },
    {
      id: '12',
      title: 'Contact dr for harrison test',
      time: '8:00pm',
      type: 'task',
      hasSubItems: false,
    },
  ];

  const getItemIcon = (type) => {
    switch (type) {
      case 'task':
        return 'checkbox-outline';
      case 'document':
        return 'document-outline';
      case 'link':
        return 'link-outline';
      case 'question':
        return 'help-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getItemColor = (type) => {
    switch (type) {
      case 'task':
        return '#007AFF';
      case 'document':
        return '#34C759';
      case 'link':
        return '#FF9500';
      case 'question':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const renderListItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        item.isHighlighted && styles.highlightedItem,
        item.isIndented && styles.indentedItem,
      ]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemLeft}>
        <TouchableOpacity style={styles.checkbox}>
          <Ionicons name="square-outline" size={20} color="#8E8E93" />
        </TouchableOpacity>
        <Text
          style={[
            styles.itemTitle,
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
        <Ionicons
          name={getItemIcon(item.type)}
          size={20}
          color={getItemColor(item.type)}
        />
        {item.hasSubItems && (
          <Ionicons name="chevron-down" size={16} color="#8E8E93" />
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
          <Text style={styles.detailTitle}>Inbox</Text>
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
          <View style={styles.detailItem}>
            <TouchableOpacity style={styles.checkbox}>
              <Ionicons name="square-outline" size={20} color="#8E8E93" />
            </TouchableOpacity>
            <View style={styles.detailItemContent}>
              {selectedItem?.date && (
                <Text style={styles.detailDate}>
                  Last {selectedItem.date}, {selectedItem.time || '1:54pm'}
                </Text>
              )}
              <Text style={styles.detailItemTitle}>{selectedItem?.title}</Text>
              {selectedItem?.type === 'link' && (
                <Text style={styles.detailLink}>
                  https://youtube.com/watch?v=6GTt10GDWII&si=xLd9R815rzSBuJvB
                </Text>
              )}
            </View>
          </View>
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
      {/* Header with Hamburger Menu */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inbox</Text>
        <TouchableOpacity style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* List View (Middle Panel) */}
      <FlatList
        data={listItems}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Detail View Modal (Right Panel) */}
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
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
  // Detail Modal Styles
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
  detailLink: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
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

export default HomeScreen;

