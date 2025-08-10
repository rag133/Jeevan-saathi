// Re-export all types from all modules
export * from './kary';
export * from './dainandini';
export * from './abhyasa';

// Export unique types that are not in other modules
export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

// Flexible type for Firestore documents that might have missing fields
export type FirestoreDoc<T> = T & { id: string };

// Partial type for Firestore data that might be incomplete
export type PartialFirestoreDoc<T> = Partial<T> & { id: string };
