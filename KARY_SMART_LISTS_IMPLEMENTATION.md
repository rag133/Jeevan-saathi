# Kary Module Smart Lists Implementation

## Overview
This document describes the implementation of smart lists in the Kary module's left sidebar under the "Quick Access" section.

## Smart Lists Implemented

### 1. Inbox
- **Purpose**: Shows all tasks that belong to the inbox list
- **Filter**: `tasks.filter(t => t.listId === 'inbox' && !t.completed)`
- **Icon**: InboxIcon

### 2. Today
- **Purpose**: Shows tasks due today (same date as current date)
- **Filter**: `tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString())`
- **Icon**: TodayIcon

### 3. Due (NEW)
- **Purpose**: Shows tasks that are due yesterday or before (past due only), considering date only, not time
- **Filter**: `tasks.filter(t => t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0))`
- **Icon**: ClockIcon
- **Logic**: Compares dates at midnight to ignore time components, excludes today's tasks

### 4. Upcoming (MODIFIED)
- **Purpose**: Shows tasks scheduled from tomorrow onwards (not today)
- **Filter**: `tasks.filter(t => t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0))`
- **Icon**: TomorrowIcon
- **Logic**: Only shows tasks with due dates strictly after today

## Key Changes Made

### 1. Added "Due" Smart List
- Added new smart list with ID 'due'
- Uses ClockIcon for visual distinction
- Counts tasks that are due yesterday or before (past due only)

### 2. Modified "Upcoming" Smart List
- Changed logic to exclude today's tasks
- Now only shows tasks scheduled from tomorrow onwards
- Uses date comparison at midnight to ignore time components

### 3. Updated Task Filtering Logic
- Modified `displayedTasks` logic in `KaryView.tsx` to handle the new 'due' smart list
- Updated task addition logic to exclude smart lists from being used as target lists

### 4. Updated Sidebar Configuration
- Added 'due' to the list of smart lists passed to `KarySidebar`
- Updated smart list filtering to include the new 'due' list

### 5. Fixed Icon Display Issues
- Updated smart list icons to use more appropriate icons:
  - Today: TodayIcon (instead of CalendarIcon)
  - Due: ClockIcon
  - Upcoming: TomorrowIcon (instead of CalendarIcon)
- Fixed middle panel header to display correct icons from viewDetails
- Updated empty state icons to use appropriate list icons

### 6. Improved UI Layout and Visual Separation
- Removed "Quick Access" heading and + button from Smart Lists section
- Added visual dividers between Smart Lists, Lists, and Tags sections
- Improved spacing and visual hierarchy in the sidebar
- Cleaner, more intuitive interface design

## Technical Implementation Details

### Date Comparison Logic
The implementation uses `setHours(0, 0, 0, 0)` to normalize dates to midnight, ensuring that:
- Time components are ignored in comparisons
- Only the date portion is considered for due/upcoming logic
- Consistent behavior regardless of when tasks were created or updated

### Smart List Counts
Each smart list displays a count of relevant tasks:
- Counts are calculated in real-time based on current task data
- Only non-completed tasks are included in counts
- Counts update automatically when tasks are added, updated, or completed

### Integration with Existing Features
- Smart lists work seamlessly with existing task management features
- Tasks can be added, edited, and completed from any smart list view
- Smart lists are excluded from being used as target lists when adding new tasks

## Testing
The implementation includes comprehensive tests to verify:
- Correct identification of due tasks (past due only, not today)
- Correct identification of upcoming tasks (tomorrow onwards)
- Date comparison logic works correctly regardless of time components

## Usage
Users can now:
1. View all past due tasks (yesterday or before) in the "Due" smart list
2. View today's tasks in the "Today" smart list
3. View only future tasks (tomorrow onwards) in the "Upcoming" smart list
4. See accurate counts for each smart list
5. Navigate between different task views seamlessly
