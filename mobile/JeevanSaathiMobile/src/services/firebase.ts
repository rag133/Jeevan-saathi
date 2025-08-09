import { initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration - same as web app
const firebaseConfig = {
  apiKey: "AIzaSyAtc3vYe6tV14w37NEJkaDfTR096fb7q1Y",
  authDomain: "jeevan-saathi-39bf5.firebaseapp.com",
  projectId: "jeevan-saathi-39bf5",
  storageBucket: "jeevan-saathi-39bf5.firebasestorage.app",
  messagingSenderId: "65030332753",
  appId: "1:65030332753:web:e4eb572e4a4c3ca772b370",
  measurementId: "G-274K2278C1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with in-memory persistence for now
// We'll implement custom AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence
});

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Custom persistence implementation using AsyncStorage
export const customPersistence = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to save to AsyncStorage:', error);
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from AsyncStorage:', error);
      return null;
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from AsyncStorage:', error);
    }
  }
};

export default app;

