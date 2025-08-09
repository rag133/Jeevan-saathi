import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

// Base data service class
export class DataService {
  protected getCurrentUserId(): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  protected getCollectionRef(collectionName: string) {
    return collection(db, collectionName);
  }

  protected getDocRef(collectionName: string, docId: string) {
    return doc(db, collectionName, docId);
  }

  // Generic CRUD operations
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = this.getDocRef(collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document: ${error}`);
      throw error;
    }
  }

  async getDocuments<T>(collectionName: string, userId?: string): Promise<T[]> {
    try {
      let q = this.getCollectionRef(collectionName);
      
      // Filter by user if userId is provided
      if (userId) {
        q = query(q, where('userId', '==', userId));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents: ${error}`);
      throw error;
    }
  }

  async addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.getCollectionRef(collectionName), {
        ...data,
        userId: this.getCurrentUserId(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document: ${error}`);
      throw error;
    }
  }

  async updateDocument<T>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = this.getDocRef(collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating document: ${error}`);
      throw error;
    }
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = this.getDocRef(collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document: ${error}`);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToCollection<T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    userId?: string
  ) {
    let q = this.getCollectionRef(collectionName);
    
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(data);
    });
  }

  subscribeToDocument<T>(
    collectionName: string, 
    docId: string, 
    callback: (data: T | null) => void
  ) {
    const docRef = this.getDocRef(collectionName, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;
        callback(data);
      } else {
        callback(null);
      }
    });
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;
