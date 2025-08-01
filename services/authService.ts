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

export const signUp = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(
    doc(db, 'users', userCredential.user.uid),
    {
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date(),
    },
    { merge: true }
  );
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
