import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthService } from '../services/authService';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', action: 'edit-profile' },
        { icon: 'lock-closed-outline', label: 'Change Password', action: 'change-password' },
        { icon: 'mail-outline', label: 'Email Preferences', action: 'email-preferences' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', action: 'notifications', toggle: true },
        { icon: 'moon-outline', label: 'Dark Mode', action: 'dark-mode', toggle: true },
        { icon: 'language-outline', label: 'Language', action: 'language' },
        { icon: 'time-outline', label: 'Time Zone', action: 'timezone' },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        { icon: 'cloud-download-outline', label: 'Export Data', action: 'export-data' },
        { icon: 'trash-outline', label: 'Delete Account', action: 'delete-account' },
        { icon: 'shield-outline', label: 'Privacy Policy', action: 'privacy-policy' },
        { icon: 'document-text-outline', label: 'Terms of Service', action: 'terms' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & FAQ', action: 'help' },
        { icon: 'chatbubble-outline', label: 'Contact Support', action: 'contact' },
        { icon: 'star-outline', label: 'Rate App', action: 'rate' },
        { icon: 'share-outline', label: 'Share App', action: 'share' },
      ],
    },
  ];

  const handleAction = (action) => {
    switch (action) {
      case 'edit-profile':
        // TODO: Navigate to edit profile
        break;
      case 'change-password':
        // TODO: Navigate to change password
        break;
      case 'notifications':
        setNotificationsEnabled(!notificationsEnabled);
        break;
      case 'dark-mode':
        setDarkModeEnabled(!darkModeEnabled);
        break;
      case 'export-data':
        // TODO: Implement data export
        break;
      case 'delete-account':
        // TODO: Show delete confirmation
        break;
      default:
        // TODO: Handle other actions
        break;
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      // Navigation will be handled by auth state listener
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const renderSection = (section) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => handleAction(item.action)}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name={item.icon} size={24} color="#666" />
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </View>
          {item.toggle ? (
            <Switch
              value={
                item.action === 'notifications' ? notificationsEnabled :
                item.action === 'dark-mode' ? darkModeEnabled : false
              }
              onValueChange={() => handleAction(item.action)}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor="white"
            />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="white" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Sections */}
        {profileSections.map(renderSection)}

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Jeevan Saathi v1.0.0</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  editProfileButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    paddingBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  signOutSection: {
    backgroundColor: 'white',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  signOutButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
    marginLeft: 8,
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ProfileScreen;

