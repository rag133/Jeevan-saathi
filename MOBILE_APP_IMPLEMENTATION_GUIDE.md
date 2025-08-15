# 📱 Jeevan Saathi Mobile App - Implementation Guide

## 🚀 **Quick Start Implementation**

### **Step 1: Project Setup & Dependencies**

```bash
# Navigate to mobile directory
cd mobile

# Backup existing project
mv JeevanSaathiMobile JeevanSaathiMobile_backup

# Create new project with latest Expo SDK
npx create-expo-app@latest JeevanSaathiMobile --template blank-typescript

# Navigate to new project
cd JeevanSaathiMobile

# Install essential dependencies
npm install react-native-paper@^5.12.0
npm install react-native-elements@^3.4.3
npm install @rneui/themed@^4.0.0-rc.7
npm install react-native-vector-icons@^10.0.3
npm install @react-navigation/material-bottom-tabs@^6.2.19
npm install @react-navigation/material-top-tabs@^6.6.5
npm install @react-native-async-storage/async-storage@^2.1.2
npm install @react-native-community/netinfo@^11.1.0
npm install react-native-reanimated@^3.17.4
npm install react-native-gesture-handler@^2.24.0
npm install react-native-screens@^4.11.1

# Install dev dependencies
npm install --save-dev @testing-library/react-native@^12.4.2
npm install --save-dev jest@^29.7.0
npm install --save-dev @types/jest@^29.5.0
npm install --save-dev react-native-testing-library@^12.4.2
```

### **Step 2: Configure Material Design 3 Theme**

```typescript
// src/shared/theme/materialTheme.ts
import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Material Design 3 color palette
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary colors
    primary: '#6750A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    onPrimaryContainer: '#21005D',
    
    // Secondary colors
    secondary: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
    
    // Tertiary colors
    tertiary: '#7D5260',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFD8E4',
    onTertiaryContainer: '#31111D',
    
    // Surface colors
    surface: '#FFFBFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    
    // Background colors
    background: '#FFFBFE',
    onBackground: '#1C1B1F',
    
    // Error colors
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    
    // Outline colors
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    
    // Shadow colors
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#D0BCFF',
    
    // Elevation overlay
    elevation: {
      level0: 'transparent',
      level1: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
      level2: '0px 1px 5px 2px rgba(0, 0, 0, 0.15), 0px 2px 4px 0px rgba(0, 0, 0, 0.30)',
      level3: '0px 1px 8px 3px rgba(0, 0, 0, 0.15), 0px 3px 6px 0px rgba(0, 0, 0, 0.30)',
      level4: '0px 2px 10px 4px rgba(0, 0, 0, 0.15), 0px 4px 8px 0px rgba(0, 0, 0, 0.30)',
      level5: '0px 3px 14px 6px rgba(0, 0, 0, 0.15), 0px 6px 12px 0px rgba(0, 0, 0, 0.30)',
    },
  },
  roundness: 16,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors
    primary: '#D0BCFF',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    
    // Secondary colors
    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    
    // Tertiary colors
    tertiary: '#EFB8C8',
    onTertiary: '#492532',
    tertiaryContainer: '#633B48',
    onTertiaryContainer: '#FFD8E4',
    
    // Surface colors
    surface: '#141218',
    onSurface: '#E6E1E5',
    surfaceVariant: '#49454F',
    onSurfaceVariant: '#CAC4D0',
    
    // Background colors
    background: '#141218',
    onBackground: '#E6E1E5',
    
    // Error colors
    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    
    // Outline colors
    outline: '#938F99',
    outlineVariant: '#49454F',
    
    // Shadow colors
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#313033',
    inversePrimary: '#6750A4',
    
    // Elevation overlay
    elevation: {
      level0: 'transparent',
      level1: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)',
      level2: '0px 1px 5px 2px rgba(0, 0, 0, 0.15), 0px 2px 4px 0px rgba(0, 0, 0, 0.30)',
      level3: '0px 1px 8px 3px rgba(0, 0, 0, 0.15), 0px 3px 6px 0px rgba(0, 0, 0, 0.30)',
      level4: '0px 2px 10px 4px rgba(0, 0, 0, 0.15), 0px 4px 8px 0px rgba(0, 0, 0, 0.30)',
      level5: '0px 3px 14px 6px rgba(0, 0, 0, 0.15), 0px 6px 12px 0px rgba(0, 0, 0, 0.30)',
    },
  },
  roundness: 16,
};

// Adapt navigation themes to work with Material Design 3
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export const navigationLightTheme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.onBackground,
    border: lightTheme.colors.outline,
  },
};

export const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkTheme.colors.primary,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.onBackground,
    border: darkTheme.colors.outline,
  },
};
```

### **Step 3: Create Base Component Library**

```typescript
// src/shared/components/Button.tsx
import React from 'react';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface ButtonProps {
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  mode = 'contained',
  variant = 'primary',
  size = 'medium',
  children,
  onPress,
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}) => {
  const theme = useTheme();
  
  const getVariantColor = () => {
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'tertiary': return theme.colors.tertiary;
      case 'error': return theme.colors.error;
      case 'success': return theme.colors.tertiary;
      default: return theme.colors.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { minHeight: 40, paddingHorizontal: 16 };
      case 'medium': return { minHeight: 48, paddingHorizontal: 24 };
      case 'large': return { minHeight: 56, paddingHorizontal: 32 };
      default: return { minHeight: 48, paddingHorizontal: 24 };
    }
  };

  return (
    <PaperButton
      mode={mode}
      buttonColor={mode === 'contained' ? getVariantColor() : 'transparent'}
      textColor={mode === 'contained' ? theme.colors.onPrimary : getVariantColor()}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      style={[
        styles.button,
        getSizeStyles(),
        { 
          borderRadius: theme.roundness,
          width: fullWidth ? '100%' : 'auto',
        },
        mode === 'outlined' && {
          borderColor: getVariantColor(),
          borderWidth: 1,
        },
      ]}
      contentStyle={styles.content}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    paddingVertical: 8,
  },
});
```

```typescript
// src/shared/components/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard, useTheme } from 'react-native-paper';

interface CardProps {
  children: React.ReactNode;
  elevation?: number;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 2,
  style,
  onPress,
  disabled = false,
}) => {
  const theme = useTheme();

  if (onPress) {
    return (
      <PaperCard
        style={[
          styles.card,
          { 
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness,
            elevation,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
      >
        <PaperCard.Content style={styles.content}>
          {children}
        </PaperCard.Content>
      </PaperCard>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { 
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness,
          elevation,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    padding: 16,
  },
});
```

```typescript
// src/shared/components/Input.tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { TextInput, useTheme, HelperText } from 'react-native-paper';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const theme = useTheme();

  return (
    <>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        disabled={disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
        right={rightIcon ? (
          <TextInput.Icon 
            icon={rightIcon} 
            onPress={onRightIconPress}
          />
        ) : undefined}
        style={[
          styles.input,
          { 
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness,
          },
          style,
        ]}
        contentStyle={styles.content}
        mode="outlined"
        outlineColor={error ? theme.colors.error : theme.colors.outline}
        activeOutlineColor={theme.colors.primary}
        textColor={theme.colors.onSurface}
        labelTextColor={theme.colors.onSurfaceVariant}
      />
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
  },
  content: {
    paddingVertical: 8,
  },
});
```

### **Step 4: Setup Testing Framework**

```json
// jest.config.js
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-paper|react-native-vector-icons)/)',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@jeevan-saathi/shared/(.*)$': '<rootDir>/../shared/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
};
```

```typescript
// src/setupTests.ts
import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const RealModule = jest.requireActual('react-native-paper');
  const MockedModule = {
    ...RealModule,
    useTheme: () => ({
      colors: {
        primary: '#6750A4',
        secondary: '#625B71',
        surface: '#FFFBFE',
        background: '#FFFBFE',
        onPrimary: '#FFFFFF',
        onSurface: '#1C1B1F',
        onBackground: '#1C1B1F',
        outline: '#79747E',
        error: '#B3261E',
      },
      roundness: 16,
    }),
  };
  return MockedModule;
});

// Global test setup
global.window = global;
global.__DEV__ = true;
```

```typescript
// src/shared/components/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(
      <Button onPress={() => {}}>
        Test Button
      </Button>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button onPress={mockOnPress}>
        Test Button
      </Button>
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    const { getByText } = render(
      <Button variant="secondary" onPress={() => {}}>
        Secondary Button
      </Button>
    );

    const button = getByText('Secondary Button');
    expect(button).toBeTruthy();
  });

  it('applies size styles correctly', () => {
    const { getByText } = render(
      <Button size="large" onPress={() => {}}>
        Large Button
      </Button>
    );

    const button = getByText('Large Button');
    expect(button).toBeTruthy();
  });

  it('disables button when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={mockOnPress}>
        Disabled Button
      </Button>
    );

    const button = getByText('Disabled Button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
```

### **Step 5: Create Feature Module Structure**

```typescript
// src/features/kary/screens/KaryScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme, Text, FAB, Searchbar } from 'react-native-paper';
import { useKaryStore } from '@jeevan-saathi/shared/stores/karyStore';
import { TaskItem } from '../components/TaskItem';
import { TaskDetail } from '../components/TaskDetail';
import { KarySidebar } from '../components/KarySidebar';
import { AddTaskModal } from '../components/AddTaskModal';
import { Task, TaskPriority, TaskStatus } from '@jeevan-saathi/shared/types/kary';

export const KaryScreen: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    tasks,
    lists,
    tags,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useKaryStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      await addTask({
        ...taskData,
        status: 'pending' as TaskStatus,
        priority: 2 as TaskPriority,
        userId: 'current-user-id', // Get from auth context
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      } as Task);
      setIsAddModalVisible(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={() => handleTaskPress(item)}
      onToggleComplete={() => updateTask(item.id, { completed: !item.completed })}
      onDelete={() => deleteTask(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
        contentContainerStyle={styles.taskListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}

      {/* Add Task FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setIsAddModalVisible(true)}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        visible={isAddModalVisible}
        onDismiss={() => setIsAddModalVisible(false)}
        onAdd={handleAddTask}
        lists={lists}
        tags={tags}
      />

      {/* Sidebar */}
      <KarySidebar
        visible={isSidebarOpen}
        onDismiss={() => setIsSidebarOpen(false)}
        lists={lists}
        tags={tags}
        onListSelect={(listId) => {
          // Filter tasks by list
          setIsSidebarOpen(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
  },
  taskList: {
    flex: 1,
  },
  taskListContent: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
```

### **Step 6: Setup Navigation with Material Design**

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { Ionicons } from 'react-native-vector-icons';

import { KaryScreen } from '../features/kary/screens/KaryScreen';
import { AbhyasaScreen } from '../features/abhyasa/screens/AbhyasaScreen';
import { DainandiniScreen } from '../features/dainandini/screens/DainandiniScreen';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';

const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.onSurfaceVariant}
      barStyle={{
        backgroundColor: theme.colors.surface,
        elevation: 8,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName: string;

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
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Kary" 
        component={KaryScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen 
        name="Abhyasa" 
        component={AbhyasaScreen}
        options={{ title: 'Habits' }}
      />
      <Tab.Screen 
        name="Dainandini" 
        component={DainandiniScreen}
        options={{ title: 'Journal' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### **Step 7: Configure App Entry Point**

```typescript
// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { lightTheme, darkTheme } from './src/shared/theme/materialTheme';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useColorScheme } from 'react-native';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppNavigator />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

## 🧪 **Testing Commands**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Button Component"

# Debug tests
npm test -- --verbose --no-coverage
```

## 📱 **Build & Run Commands**

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production
npm run build:android
npm run build:ios

# Eject from Expo (if needed)
npx expo eject
```

## 🔧 **Troubleshooting Common Issues**

### **1. Metro Bundler Issues**
```bash
# Clear metro cache
npx react-native start --reset-cache

# Clear watchman cache
watchman watch-del-all

# Clear npm cache
npm cache clean --force
```

### **2. Android Build Issues**
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Android emulator
adb emu kill
```

### **3. iOS Build Issues**
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reset iOS simulator
xcrun simctl erase all
```

This implementation guide provides a solid foundation for building a high-quality, maintainable mobile app that follows Material Design 3 principles and maintains feature parity with your web app.
