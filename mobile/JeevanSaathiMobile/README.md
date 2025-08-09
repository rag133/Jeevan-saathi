# Jeevan Saathi Mobile App

A comprehensive life management mobile application built with React Native and Expo, featuring task management, habit tracking, goal setting, daily logging, and learning modules.

## Features

### 🏠 Home
- Quick actions for common tasks
- Daily overview and statistics
- Recent activity feed
- Personalized greetings

### 📋 Kary (Tasks)
- Task creation and management
- Priority levels (High, Medium, Low)
- Task completion tracking
- Tag-based organization
- Filter by status (All, Pending, Completed)

### 🏃‍♂️ Abhyasa (Habits & Goals)
- Habit tracking with frequency settings
- Goal progress monitoring
- Visual progress indicators
- Achievement tracking

### 📝 Dainandini (Daily Logs)
- Quick journal entries
- Mood and energy tracking
- Tag-based organization
- Tab-based categorization

### 📚 Vidya (Learning)
- Learning module progress tracking
- Course management
- Achievement badges
- Learning statistics

### 👤 Profile
- User account management
- App preferences and settings
- Data export and privacy controls
- Support and help resources

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Expo Vector Icons (Ionicons)
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (planned)
- **Storage**: Firebase Storage (planned)

## Project Structure

```
src/
├── navigation/
│   └── AppNavigator.tsx          # Main navigation structure
├── screens/
│   ├── HomeScreen.tsx            # Home dashboard
│   ├── KaryScreen.tsx            # Task management
│   ├── AbhyasaScreen.tsx         # Habits and goals
│   ├── DainandiniScreen.tsx      # Daily logs
│   ├── VidyaScreen.tsx           # Learning modules
│   ├── LoginScreen.tsx           # Authentication
│   └── ProfileScreen.tsx         # User profile
├── services/
│   ├── firebase.ts               # Firebase configuration
│   └── authService.ts            # Authentication service
└── types/
    └── index.ts                  # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile/JeevanSaathiMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app on physical device

### Environment Setup

1. **Firebase Configuration**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/services/firebase.ts` with your config

2. **Android Setup**
   - Install Android Studio
   - Set up Android SDK
   - Configure ANDROID_HOME environment variable

3. **iOS Setup (macOS only)**
   - Install Xcode
   - Install iOS Simulator
   - Accept Xcode license agreements

## Development

### Code Style

- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

### Adding New Features

1. Create new screen component in `src/screens/`
2. Add navigation route in `src/navigation/AppNavigator.tsx`
3. Update types in `src/types/index.ts` if needed
4. Add any new services in `src/services/`

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Building for Production

### Android APK

```bash
# Build APK
expo build:android -t apk

# Build AAB (Google Play Store)
expo build:android -t app-bundle
```

### iOS IPA

```bash
# Build IPA
expo build:ios -t archive
```

## Deployment

### Google Play Store

1. Build AAB file
2. Upload to Google Play Console
3. Configure store listing
4. Submit for review

### Apple App Store

1. Build IPA file
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

### Phase 1 (Current)
- ✅ Basic app structure
- ✅ Navigation setup
- ✅ Screen components
- ✅ Authentication service

### Phase 2 (Next)
- 🔄 Firebase integration
- 🔄 Data persistence
- 🔄 Offline support
- 🔄 Push notifications

### Phase 3 (Future)
- 📱 Advanced features
- 🔄 Performance optimization
- 🔄 Accessibility improvements
- 🔄 Internationalization

## Acknowledgments

- React Native community
- Expo team
- Firebase team
- Contributors and testers

