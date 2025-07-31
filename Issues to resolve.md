## Issues to Resolve

### 1. "No document to update" error when moving tasks between lists

**Description:** When attempting to move an existing task from one list to another, the application throws a `FirebaseError: No document to update`. The error message indicates that the `taskId` being used in the update operation (e.g., `tasks/2e4ff3c2-4ac8-4f9b-ad5c-5683820e764f`) is a client-generated UUID, not the Firestore-generated ID. This suggests a potential mismatch or timing issue where the local state is not fully synchronized with Firestore's assigned IDs for existing tasks, or tasks created before the ID synchronization fixes were fully implemented.

**Stack Trace Snippet:**
```
App.tsx:793 
 Error updating task: FirebaseError: No document to update: projects/jeevan-saathi-39bf5/databases/(default)/documents/users/JuiUObzKNKgVaQmjVLMyt2bat7u1/tasks/2e4ff3c2-4ac8-4f9b-ad5c-5683820e764f
onUpdateTask@App.tsx:793
await in onUpdateTask
handleUpdateTask@KaryView.tsx:209
handleUpdate@KaryTaskDetail.tsx:183
onClick@KaryTaskDetail.tsx:275
```

**Current Understanding/Context:**
- Optimistic UI updates for new tasks have been removed.
- `App.tsx`'s `onAddTask` now returns the Firestore-generated ID.
- `KaryView.tsx`'s `handleAddTask` uses the returned Firestore ID to set `selectedTaskId`.
- `KaryView.tsx`'s `useEffect` hook attempts to ensure `selectedTaskId` is valid and corresponds to a task with a Firestore-generated ID.
- `KaryTaskDetail.tsx` now receives `selectedTaskId` and the full `tasks` array, deriving the `task` object internally.

**Possible Causes:**
- Residual tasks in Firestore or local state with client-generated IDs from before the fixes.
- A subtle race condition where an update is triggered before the real-time listener fully propagates the Firestore ID to the `tasks` array.

**Next Steps for Investigation:**
- Verify that `getUserTasks()` in `dataService.ts` is consistently returning Firestore-generated IDs for *all* tasks.
- Consider a migration script or manual cleanup of Firestore data to ensure all existing task IDs are Firestore-generated.
- Further debugging of the `task` object's `id` property at each stage of the update process (from `KaryTaskDetail` up to `dataService`) to pinpoint where the client-generated ID is being used instead of the Firestore ID.
