import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyAtc3vYe6tV14w37NEJkaDfTR096fb7q1Y",
  authDomain: "jeevan-saathi-39bf5.firebaseapp.com",
  projectId: "jeevan-saathi-39bf5",
  storageBucket: "jeevan-saathi-39bf5.firebasestorage.app",
  messagingSenderId: "65030332753",
  appId: "1:65030332753:web:e4eb572e4a4c3ca772b370",
  measurementId: "G-274K2278C1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
