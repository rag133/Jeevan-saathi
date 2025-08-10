import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import KaryScreen from '../screens/KaryScreen';
import AbhyasaScreen from '../screens/AbhyasaScreen';
import DainandiniScreen from '../screens/DainandiniScreen';
import VidyaScreen from '../screens/VidyaScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import components
import CustomDrawerContent from '../components/CustomDrawerContent';

// Import services
import { auth } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const AuthStack = createStackNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

// Main Tab Navigator (now with only 5 tabs, Profile moved to drawer)
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Home':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Kary':
            iconName = focused ? 'list' : 'list-outline';
            break;
          case 'Abhyasa':
            iconName = focused ? 'fitness' : 'fitness-outline';
            break;
          case 'Dainandini':
            iconName = focused ? 'journal' : 'journal-outline';
            break;
          case 'Vidya':
            iconName = focused ? 'school' : 'school-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Kary" component={KaryScreen} />
    <Tab.Screen name="Abhyasa" component={AbhyasaScreen} />
    <Tab.Screen name="Dainandini" component={DainandiniScreen} />
    <Tab.Screen name="Vidya" component={VidyaScreen} />
  </Tab.Navigator>
);

// Drawer Navigator
const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false,
      drawerActiveTintColor: '#007AFF',
      drawerInactiveTintColor: 'gray',
      drawerIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'App':
            iconName = 'home';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Drawer.Screen name="App" component={MainTabNavigator} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
  </Drawer.Navigator>
);

// Loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
      Loading...
    </Text>
  </View>
);

// Main App Navigator
const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

