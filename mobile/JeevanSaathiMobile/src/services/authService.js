import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './firebase';
// import { User } from '../types';

export class AuthService {
  static async signIn(email, password) {
    try {
      console.log('Attempting sign in for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      console.log('Sign in successful for user:', firebaseUser.uid);
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined
      };
    } catch (error) {
      console.error('Sign in error details:', error);
      
      // Check if it's a Firebase error with a code
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Firebase error code:', error.code);
        console.error('Firebase error message:', error.message);
        
        // Provide more specific error messages
        switch (error.code) {
          case 'auth/invalid-credential':
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          case 'auth/user-not-found':
            throw new Error('No account found with this email address. Please check your email or create a new account.');
          case 'auth/user-disabled':
            throw new Error('This account has been disabled. Please contact support.');
          case 'auth/too-many-requests':
            throw new Error('Too many failed login attempts. Please try again later.');
          case 'auth/network-request-failed':
            throw new Error('Network error. Please check your internet connection and try again.');
          default:
            throw new Error(`Sign in failed: ${error.message || 'Unknown error'}`);
        }
      }
      
      throw new Error(`Sign in failed: ${error?.message || 'Unknown error'}`);
    }
  }

  static async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(firebaseUser, {
          displayName: displayName
        });
      }
      
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined
      };
    } catch (error) {
      throw new Error(`Sign up failed: ${error}`);
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(`Sign out failed: ${error}`);
    }
  }

  static onAuthStateChange(callback) {
          return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  static getCurrentUser() {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined
      };
    }
    return null;
  }
}

