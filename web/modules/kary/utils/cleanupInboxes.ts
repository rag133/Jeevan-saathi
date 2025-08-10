import { listService } from '@jeevan-saathi/shared/services/dataService';

export const cleanupDuplicateInboxes = async () => {
  try {
    // Get all lists from the database
    const allLists = await listService.getAll();
    
    // Find all Inbox lists
    const inboxLists = allLists.filter(list => list.name === 'Inbox');
    
    if (inboxLists.length > 1) {
      console.log(`Found ${inboxLists.length} duplicate Inbox lists. Cleaning up...`);
      
      // Keep the first Inbox (usually the oldest one) and delete the rest
      const [firstInbox, ...duplicateInboxes] = inboxLists;
      
      // Delete duplicate Inboxes
      await Promise.all(duplicateInboxes.map(inbox => listService.delete(inbox.id)));
      
      console.log(`Deleted ${duplicateInboxes.length} duplicate Inbox lists. Kept: ${firstInbox.id}`);
      return { success: true, deletedCount: duplicateInboxes.length, keptInboxId: firstInbox.id };
    } else {
      console.log('No duplicate Inbox lists found.');
      return { success: true, deletedCount: 0 };
    }
  } catch (error) {
    console.error('Error cleaning up duplicate Inboxes:', error);
    return { success: false, error: error.message };
  }
};
