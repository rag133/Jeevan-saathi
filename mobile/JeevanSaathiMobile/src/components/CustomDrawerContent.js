import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomDrawerContent = (props) => {
  const navigation = props.navigation;

  const menuItems = [
    { title: 'Today', icon: 'calendar', count: 24, color: '#FF9500' },
    { title: 'Inbox', icon: 'mail', count: 92, color: '#FF9500', isActive: true },
    { title: 'Kary', icon: 'checkbox', count: 45, color: '#007AFF', hasArrow: true },
    { title: 'Tags', icon: 'pricetag', color: '#007AFF', hasArrow: true },
    { title: 'MA&UD', icon: 'business', count: 13, color: '#8E8E93' },
    { title: 'Communication', icon: 'megaphone', count: 0, color: '#FF3B30' },
    { title: 'Family', icon: 'people', count: 24, color: '#FF6B6B', hasArrow: true },
    { title: 'Explore Ideas', icon: 'bulb', count: 7, color: '#FFD93D' },
    { title: 'Learn2Grow', icon: 'school', count: 26, color: '#4ECDC4' },
    { title: 'Sadhguru', icon: 'leaf', count: 23, color: '#45B7D1' },
    { title: 'Rajarshi Nandy', icon: 'temple', count: 14, color: '#96CEB4' },
    { title: 'Personal Projects', icon: 'laptop', count: 6, color: '#FFEAA7' },
    { title: 'Knowledge Bank', icon: 'library', count: 18, color: '#DDA0DD' },
    { title: 'Grabh-Child', icon: 'person', count: 1, color: '#98D8C8' },
    { title: "Won't Do", icon: 'close-circle', count: 0, color: '#007AFF' },
  ];

  // Kary-specific smart lists (to be shown when Kary is selected)
  const karySmartLists = [
    { title: 'Today', icon: 'calendar', count: 8, color: '#FF9500' },
    { title: 'Due', icon: 'time', count: 12, color: '#FF3B30' },
    { title: 'Upcoming', icon: 'calendar-outline', count: 15, color: '#34C759' },
    { title: 'Overdue', icon: 'warning', count: 3, color: '#FF3B30' },
    { title: 'Completed', icon: 'checkmark-circle', count: 7, color: '#8E8E93' },
  ];

  const getIconName = (icon) => {
    const iconMap = {
      calendar: 'calendar-outline',
      mail: 'mail-outline',
      checkbox: 'checkbox-outline',
      pricetag: 'pricetag-outline',
      business: 'business-outline',
      megaphone: 'megaphone-outline',
      people: 'people-outline',
      bulb: 'bulb-outline',
      school: 'school-outline',
      leaf: 'leaf-outline',
      temple: 'home-outline',
      laptop: 'laptop-outline',
      library: 'library-outline',
      person: 'person-outline',
      'close-circle': 'close-circle-outline',
      time: 'time-outline',
      'calendar-outline': 'calendar-outline',
      warning: 'warning-outline',
      'checkmark-circle': 'checkmark-circle-outline',
    };
    return iconMap[icon] || 'ellipse-outline';
  };

  const handleMenuItemPress = (item) => {
    if (item.title === 'Inbox') {
      navigation.navigate('App', { screen: 'Home' });
    } else if (item.title === 'Today') {
      navigation.navigate('App', { screen: 'Home' });
    } else if (item.title === 'Kary') {
      navigation.navigate('App', { screen: 'Kary' });
    } else if (item.title === 'Abhyasa') {
      navigation.navigate('App', { screen: 'Abhyasa' });
    } else if (item.title === 'Dainandini') {
      navigation.navigate('App', { screen: 'Dainandini' });
    } else if (item.title === 'Vidya') {
      navigation.navigate('App', { screen: 'Vidya' });
    } else {
      // For other menu items, navigate to Home for now
      navigation.navigate('App', { screen: 'Home' });
    }
    navigation.closeDrawer();
  };

  const handleKarySmartListPress = (item) => {
    // Navigate to Kary with specific filter
    navigation.navigate('App', { screen: 'Kary', params: { filter: item.title.toLowerCase() } });
    navigation.closeDrawer();
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
    navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <TouchableOpacity style={styles.profileHeader} onPress={handleProfilePress}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Ionicons name="person" size={40} color="#8E8E93" />
          </View>
          <View style={styles.crownBadge}>
            <Text style={styles.crownText}>6D</Text>
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Raghavender...</Text>
        </View>
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.profileActionButton}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileActionButton}>
            <Ionicons name="notifications" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileActionButton}>
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              item.isActive && styles.activeMenuItem,
            ]}
            onPress={() => handleMenuItemPress(item)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Ionicons name={getIconName(item.icon)} size={20} color="white" />
              </View>
              <Text style={[
                styles.menuTitle,
                item.isActive && styles.activeMenuTitle,
              ]}>
                {item.title}
              </Text>
            </View>
            <View style={styles.menuItemRight}>
              {item.count > 0 && (
                <Text style={styles.menuCount}>{item.count}</Text>
              )}
              {item.hasArrow && (
                <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Kary Smart Lists Section - Only show when Kary is selected */}
        <View style={styles.karySection}>
          <Text style={styles.sectionTitle}>Kary Smart Lists</Text>
          {karySmartLists.map((item, index) => (
            <TouchableOpacity
              key={`kary-${index}`}
              style={styles.karyMenuItem}
              onPress={() => handleKarySmartListPress(item)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={getIconName(item.icon)} size={18} color="white" />
                </View>
                <Text style={styles.karyMenuTitle}>{item.title}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.count > 0 && (
                  <Text style={styles.menuCount}>{item.count}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={20} color="#007AFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  profileHeader: {
    backgroundColor: '#007AFF',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  profileInfo: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  profileActions: {
    flexDirection: 'row',
    gap: 12,
  },
  profileActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeMenuItem: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  activeMenuTitle: {
    color: '#007AFF',
    fontWeight: '600',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  // Kary Section Styles
  karySection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    paddingHorizontal: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  karyMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  karyMenuTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: '400',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  filterButton: {
    padding: 8,
  },
});

export default CustomDrawerContent;
