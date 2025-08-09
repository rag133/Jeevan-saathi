import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { initializeUserData } from './dataService';

export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  try {
    // Create user document
    await setDoc(
      doc(db, 'users', userCredential.user.uid),
      {
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date(),
      },
      { merge: true }
    );

    // Initialize user data (lists, tags, folders, etc.)
    await initializeUserData();
  } catch (error) {
    console.error('Error initializing user data:', error);
    // Don't throw here as the user account was created successfully
    // The data can be initialized later if needed
  }
  
  return userCredential;
};

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signOutUser = () => signOut(auth);

export const onAuthStateChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const getCurrentUser = () => auth.currentUser;

export const updateUserProfile = async (
  user: User,
  updates: { displayName?: string; photoURL?: string }
) => {
  await updateProfile(user, updates);
  await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
};
