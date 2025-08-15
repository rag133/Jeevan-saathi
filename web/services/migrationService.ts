import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './authService';
import type { Task } from '~/modules/kary/types';

/**
 * Migration service to convert existing parentId-based subtasks
 * to the new subtasks array structure for cross-platform compatibility
 */
export const migrationService = {
  /**
   * Migrate existing tasks from parentId structure to subtasks array structure
   * This ensures compatibility between web and mobile apps
   */
  migrateSubtasks: async (): Promise<{ migrated: number; errors: number }> => {
    const user = getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const snapshot = await getDocs(tasksRef);
    
    let migrated = 0;
    let errors = 0;
    const batch = writeBatch(db);

    try {
      // Group tasks by parentId
      const parentTasks = new Map<string, Task[]>();
      const childTasks = new Map<string, Task>();

      snapshot.docs.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() } as Task;
        
        if (task.parentId) {
          // This is a subtask
          childTasks.set(task.id, task);
          
          // Group by parent
          if (!parentTasks.has(task.parentId)) {
            parentTasks.set(task.parentId, []);
          }
          parentTasks.get(task.parentId)!.push(task);
        }
      });

      // Process each parent task
      for (const [parentId, subtasks] of parentTasks) {
        try {
          const parentRef = doc(db, 'users', user.uid, 'tasks', parentId);
          
          // Convert subtasks to new format
          const newSubtasks = subtasks.map(subtask => ({
            id: subtask.id,
            title: subtask.title,
            completed: subtask.completed,
          }));

          // Update parent task with subtasks array
          batch.update(parentRef, {
            subtasks: newSubtasks,
            updatedAt: new Date(),
          });

          // Delete child tasks (they're now embedded in parent)
          subtasks.forEach(subtask => {
            const childRef = doc(db, 'users', user.uid, 'tasks', subtask.id);
            batch.delete(childRef);
          });

          migrated++;
        } catch (error) {
          console.error(`Error migrating parent task ${parentId}:`, error);
          errors++;
        }
      }

      // Commit all changes
      if (migrated > 0) {
        await batch.commit();
        console.log(`Migration completed: ${migrated} parent tasks migrated, ${errors} errors`);
      }

      return { migrated, errors };
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  /**
   * Check if migration is needed
   */
  needsMigration: async (): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) return false;

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const snapshot = await getDocs(tasksRef);
    
    // Check if any tasks still use parentId
    return snapshot.docs.some(doc => {
      const task = doc.data();
      return task.parentId !== undefined && task.parentId !== null;
    });
  },

  /**
   * Get migration status
   */
  getMigrationStatus: async (): Promise<{
    needsMigration: boolean;
    totalTasks: number;
    parentTasks: number;
    childTasks: number;
  }> => {
    const user = getCurrentUser();
    if (!user) {
      return { needsMigration: false, totalTasks: 0, parentTasks: 0, childTasks: 0 };
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const snapshot = await getDocs(tasksRef);
    
    let parentTasks = 0;
    let childTasks = 0;

    snapshot.docs.forEach((doc) => {
      const task = doc.data();
      if (task.parentId) {
        childTasks++;
      } else {
        parentTasks++;
      }
    });

    return {
      needsMigration: childTasks > 0,
      totalTasks: snapshot.size,
      parentTasks,
      childTasks,
    };
  },
};


