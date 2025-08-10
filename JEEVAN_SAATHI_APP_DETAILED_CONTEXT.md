# Jeevan Saathi - Comprehensive App Context for Android Development

## App Overview

**Jeevan Saathi** (Life Companion) is a comprehensive life management application that helps users organize their daily tasks, track habits, set goals, and maintain personal logs. The app is designed around five core modules that work together to provide a holistic approach to personal productivity and life management.

**App Name**: Jeevan Saathi (जीवन साथी)
**Tagline**: Life Companion
**Target Audience**: Individuals seeking comprehensive life management and productivity tools

## Core Philosophy

The app follows a holistic approach to life management, integrating task management, habit tracking, goal setting, and personal reflection into a unified experience. It's designed to help users build sustainable habits, achieve long-term goals, and maintain awareness of their daily activities.

## App Architecture

### Technology Stack
- **Frontend**: React (Web) / React Native (Mobile)
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Real-time Sync**: Firebase real-time listeners
- **UI Framework**: Custom components with responsive design

### Data Flow
1. **Shared Business Logic**: Core logic implemented in `shared/` directory
2. **Platform-Specific UI**: Web and mobile use same data models but different UI components
3. **Real-time Sync**: All data changes sync across platforms via Firebase
4. **Offline Support**: Data cached locally with sync when connection restored

## Module Breakdown

### 1. Home Module (`home/`)
**Purpose**: Central dashboard and unified calendar view

**Key Features**:
- **Unified Calendar**: Shows tasks, habits, and logs in a single calendar view
- **Quick Actions**: Rapid task creation, habit logging, and log entry
- **Smart Notifications**: Context-aware reminders and suggestions
- **Search & Filter**: Global search across all modules
- **Detail View Panel**: In-depth view of selected calendar items

**Data Models**:
- Calendar items (aggregated from other modules)
- Quick action templates
- Search results

**UI Components**:
- `UnifiedCalendar`: Main calendar interface
- `QuickActionsPanel`: Rapid action buttons
- `DetailViewPanel`: Item details
- `SearchBar`: Global search
- `SmartNotifications`: Smart reminders

### 2. Kary Module (`kary/`)
**Purpose**: Task and project management

**Key Features**:
- **Task Management**: Create, edit, delete, and organize tasks
- **List Organization**: Group tasks into lists and folders
- **Tag System**: Categorize tasks with color-coded tags
- **Priority Levels**: 4-level priority system (1-4)
- **Due Dates & Reminders**: Set deadlines and get notifications
- **Subtask Support**: Break down complex tasks
- **AI Planning**: Integration with Gemini AI for task suggestions

**Data Models**:
```typescript
interface Task {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completionDate?: Date;
  parentId?: string;
  dueDate?: Date;
  reminder?: boolean;
  tags?: string[];
  description?: string;
  priority?: 1 | 2 | 3 | 4;
  source?: { text: string; url: string };
}

interface List {
  id: string;
  name: string;
  icon: string;
  count?: number;
  color?: string;
  folderId?: string;
  isDefault?: boolean;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
  folderId?: string;
}
```

**UI Components**:
- `KarySidebar`: Navigation and list management
- `KaryTaskList`: Task display and management
- `KaryTaskDetail`: Detailed task view
- `InteractiveTaskInput`: Smart task creation
- `SearchFilterSortControls`: Advanced filtering

**Key Workflows**:
1. **Task Creation**: Quick input with AI suggestions
2. **List Management**: Organize tasks into logical groups
3. **Task Execution**: Mark completion, add notes, log time
4. **Organization**: Drag & drop, bulk operations, smart sorting

### 3. Abhyasa Module (`abhyasa/`)
**Purpose**: Habit tracking, goal setting, and personal development

**Key Features**:
- **Habit Tracking**: Multiple habit types (binary, count, duration, checklist)
- **Goal Management**: Set and track long-term goals
- **Milestone Tracking**: Break goals into achievable milestones
- **Quick Wins**: Daily achievements and small victories
- **Progress Visualization**: Calendar heatmaps and progress charts
- **Habit Linking**: Connect habits to goals and milestones

**Data Models**:
```typescript
interface Habit {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  type: HabitType;
  status: HabitStatus;
  dailyTarget?: number;
  totalTarget?: number;
  checklist?: HabitChecklistItem[];
  milestoneId?: string;
  goalId?: string;
  startDate: Date;
  endDate?: Date;
  reminders?: string[];
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  targetEndDate?: Date;
  status: GoalStatus;
  icon: string;
  focusAreaId?: string;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  parentGoalId: string;
  startDate: Date;
  targetEndDate?: Date;
  status: MilestoneStatus;
  focusAreaId?: string;
}
```

**Habit Types**:
- **Binary**: Yes/No completion (e.g., "Did you meditate today?")
- **Count**: Numeric tracking (e.g., "How many pages did you read?")
- **Duration**: Time-based tracking (e.g., "How long did you exercise?")
- **Checklist**: Multiple items to complete (e.g., "Morning routine")

**UI Components**:
- `HabitDashboard`: Overview of all habits
- `HabitCalendar`: Calendar view with habit logs
- `GoalDetail`: Goal progress and milestones
- `MilestoneJourney`: Visual progress tracking
- `CalendarHeatmap`: Streak visualization

### 4. Dainandini Module (`dainandini/`)
**Purpose**: Personal journaling and daily reflection

**Key Features**:
- **Daily Logging**: Record thoughts, experiences, and reflections
- **Focus Areas**: Organize logs by life areas (work, health, relationships)
- **Log Templates**: Pre-defined templates for consistent logging
- **Calendar View**: Historical log browsing
- **Rating System**: Rate daily experiences (1-5 scale)
- **Checklist Logs**: Track completion of daily activities

**Data Models**:
```typescript
interface Log {
  id: string;
  focusId: string;
  logType: LogType;
  title: string;
  description?: string;
  checklist?: ChecklistItem[];
  rating?: number;
  logDate: Date;
  createdAt: Date;
  habitId?: string;
  milestoneId?: string;
  goalId?: string;
  taskId?: string;
  completed?: boolean;
  taskCompletionDate?: Date;
}

interface Focus {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  allowedLogTypes: LogType[];
  defaultTemplateId?: string;
}

enum LogType {
  TEXT = 'text',
  CHECKLIST = 'checklist',
  RATING = 'rating'
}
```

**UI Components**:
- `DainandiniSidebar`: Focus area navigation
- `LogList`: Daily log entries
- `CalendarView`: Historical log browsing
- `LogEntryModal`: Create and edit logs
- `TemplateSelectionModal`: Choose logging templates

### 5. Vidya Module (`vidya/`)
**Purpose**: Learning and knowledge management (Currently in development)

**Key Features**:
- **Coming Soon**: Module under development
- **Learning Tracking**: Expected to include course management, study notes
- **Knowledge Base**: Personal knowledge repository
- **Progress Tracking**: Learning milestones and achievements

## Data Architecture

### Firebase Collections
1. **users**: User profiles and preferences
2. **tasks**: All task data
3. **lists**: Task organization lists
4. **tags**: Task categorization tags
5. **habits**: Habit definitions and configurations
6. **habitLogs**: Daily habit completion records
7. **goals**: Long-term goal definitions
8. **milestones**: Goal milestone tracking
9. **logs**: Daily journal entries
10. **foci**: Life focus areas
11. **logTemplates**: Journaling templates

### Data Relationships
- **Tasks** → Lists, Tags
- **Habits** → Goals, Milestones
- **Logs** → Foci, Habits, Tasks, Goals
- **Milestones** → Goals
- **All** → Users (ownership)

### Real-time Sync
- Firebase listeners for live updates
- Optimistic updates for better UX
- Conflict resolution for concurrent edits
- Offline support with sync queue

## User Experience Features

### Authentication & Profile
- **Firebase Auth**: Email/password and social login
- **User Profiles**: Customizable avatars and preferences
- **Premium Features**: Crown indicator for premium users

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Adaptive Layouts**: Responsive panels and navigation
- **Touch-Friendly**: Large touch targets and gestures

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: Accessible color schemes
- **Focus Management**: Clear focus indicators

### Performance
- **Code Splitting**: Lazy-loaded modules
- **Virtual Scrolling**: Efficient list rendering
- **Optimistic Updates**: Immediate UI feedback
- **Caching**: Local data storage and sync

## Development Guidelines

### Code Organization
- **Shared Logic**: Business logic in `shared/` directory
- **Platform UI**: Web and mobile use same data but different components
- **Type Safety**: Full TypeScript implementation
- **State Management**: Zustand stores for each module

### Testing Strategy
- **Unit Tests**: Component and store testing
- **Integration Tests**: Module interaction testing
- **E2E Tests**: User workflow testing

### Deployment
- **Web**: Vite build with Firebase hosting
- **Mobile**: React Native with Expo
- **Shared**: NPM package for code reuse

## Key User Workflows

### Daily Routine
1. **Morning**: Check Home dashboard, log habits, review tasks
2. **Throughout Day**: Add tasks, log activities, track progress
3. **Evening**: Reflect in Dainandini, plan tomorrow

### Goal Achievement
1. **Set Goal**: Define long-term objective in Abhyasa
2. **Create Milestones**: Break goal into achievable steps
3. **Build Habits**: Establish daily routines to support goals
4. **Track Progress**: Monitor milestones and habit streaks
5. **Celebrate**: Record quick wins and achievements

### Task Management
1. **Capture**: Quick task input with AI suggestions
2. **Organize**: Group into lists, add tags, set priorities
3. **Execute**: Work through tasks, add notes, log time
4. **Review**: Analyze completion patterns and optimize

## Technical Requirements for Android

### React Native Implementation
- **Navigation**: React Navigation with drawer and tab navigation
- **State Management**: Same Zustand stores from shared code
- **UI Components**: React Native equivalents of web components
- **Firebase**: Same Firebase configuration and services

### Platform-Specific Features
- **Push Notifications**: Native Android notification system
- **Offline Storage**: AsyncStorage for local data caching
- **Biometric Auth**: Fingerprint/face unlock integration
- **Widgets**: Home screen widgets for quick access
- **Deep Linking**: Direct navigation to specific views

### Performance Considerations
- **FlatList**: Efficient list rendering for large datasets
- **Image Optimization**: Compressed images and lazy loading
- **Memory Management**: Proper cleanup of listeners and subscriptions
- **Background Sync**: Periodic data synchronization

## Success Metrics

### User Engagement
- Daily active users
- Session duration
- Feature adoption rates
- Habit streak lengths

### Productivity Impact
- Task completion rates
- Goal achievement rates
- Habit formation success
- User satisfaction scores

### Technical Performance
- App launch time
- Data sync speed
- Offline functionality
- Crash rates

## Future Roadmap

### Phase 1: Core Mobile App
- Basic functionality of all modules
- Offline support and sync
- Push notifications

### Phase 2: Enhanced Features
- Advanced analytics and insights
- Social features and sharing
- Integration with external services

### Phase 3: AI Integration
- Smart habit suggestions
- Predictive task scheduling
- Personalized insights

This comprehensive context should provide the AI agent with all the necessary information to build a fully functional Android version of Jeevan Saathi that maintains feature parity with the web application while leveraging mobile-specific capabilities.
