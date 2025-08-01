# Jeevan Saathi

Jeevan Saathi (जीवन साथी - Life Companion) is a comprehensive personal management application designed to help users organize their lives across various dimensions: tasks, journaling, goal setting, and learning. Built with a modular architecture, it aims to provide a holistic platform for personal growth and productivity. The application is designed with future AI integration in mind, ensuring a robust and well-defined data structure.

## Modules

Jeevan Saathi is structured into distinct modules, each addressing a specific aspect of personal management:

### 1. Kary (कार्य - Work/Tasks)

This module is dedicated to task management, allowing users to organize their responsibilities, track progress, and prioritize their workload.

**Core Elements:**

- **Task**
  - **Description:** Individual actionable items. Tasks can have subtasks, forming a hierarchical structure.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `listId`: ID of the list the task belongs to (string)
    - `title`: Name of the task (string)
    - `completed`: Boolean indicating if the task is completed (boolean)
    - `createdAt`: Date and time of task creation (Date)
    - `completionDate`: Date and time of task completion (Date, optional)
    - `parentId`: ID of the parent task if it's a subtask (string, optional)
    - `dueDate`: Target completion date (Date, optional)
    - `reminder`: Boolean indicating if a reminder is set (boolean, optional)
    - `tags`: Array of Tag IDs associated with the task (string[], optional)
    - `description`: Detailed description of the task (string, optional)
    - `priority`: Priority level (1, 2, 3, or 4, optional)
    - `source`: Original source of the task, e.g., a link or text snippet (object with `text: string` and `url: string`, optional)
  - **Container/Organization:** Tasks are organized within **Lists** via `listId`. Subtasks are linked to their `parentId`.

- **List**
  - **Description:** Containers for organizing tasks. There are "Smart Lists" (e.g., Inbox, Today, Upcoming) and "Custom Lists" created by the user.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `name`: Name of the list (string)
    - `description`: Optional description for the list (string, optional)
    - `icon`: Icon associated with the list (string, key of `Icons` component)
    - `count`: Number of tasks in the list (number, dynamically calculated for Smart Lists, optional)
    - `color`: Color associated with the list (string, optional)
    - `folderId`: ID of the folder the list belongs to (string, optional)
  - **Container/Organization:** Lists can be grouped into **List Folders** via `folderId`.

- **Tag**
  - **Description:** Keywords or labels used to categorize tasks across different lists.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `name`: Name of the tag (string)
    - `color`: Color associated with the tag (string, e.g., 'red-500')
    - `icon`: Icon associated with the tag (string, key of `Icons` component, optional)
    - `folderId`: ID of the folder the tag belongs to (string, optional)
  - **Container/Organization:** Tags can be grouped into **Tag Folders** via `folderId`.

- **ListFolder**
  - **Description:** A container for organizing multiple Lists.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `name`: Name of the list folder (string)
  - **Container/Organization:** Contains Lists.

- **TagFolder**
  - **Description:** A container for organizing multiple Tags.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `name`: Name of the tag folder (string)
  - **Container/Organization:** Contains Tags.

### 2. Dainandini (दैनंदिनी - Journal/Daily Log)

This module serves as a personal journaling and logging system, allowing users to record thoughts, events, and track various aspects of their day.

**Core Elements:**

- **Log**
  - **Description:** Individual journal entries or daily records. Logs can be of different types (text, checklist, rating).
  - **Properties:**
    - `id`: Unique identifier (string)
    - `focusId`: ID of the focus area the log belongs to (string)
    - `logType`: Type of the log (`LogType` enum: `TEXT`, `CHECKLIST`, `RATING`)
    - `title`: Title of the log entry (string)
    - `description`: Main content for text logs (string, optional)
    - `checklist`: Array of checklist items for checklist logs (array of objects with `id: string`, `text: string`, `completed: boolean`, optional)
    - `rating`: Rating value (1-5) for rating logs (number, optional)
    - `logDate`: The date the log entry pertains to (Date)
    - `createdAt`: Date and time the log was created (Date)
    - `taskId`: ID of a linked task (string, optional)
    - `completed`: Boolean indicating if the log (e.g., a checklist log) is completed (boolean, optional)
    - `taskCompletionDate`: Date and time of task completion if linked (Date, optional)
  - **Container/Organization:** Logs are organized by **Focus Areas** via `focusId` and by `logDate`.

- **Focus Area (Foci)**
  - **Description:** Categories or themes for organizing log entries (e.g., General, Gratitude, Mood, Kary).
  - **Properties:**
    - `id`: Unique identifier (string)
    - `name`: Name of the focus area (string)
    - `description`: Description of the focus area (string, optional)
    - `icon`: Icon associated with the focus area (string, key of `Icons` component)
    - `color`: Color associated with the focus area (string)
    - `allowedLogTypes`: Array of `LogType` that are permitted within this focus area.
    - `defaultTemplateId`: ID of a default log template for this focus area (string, optional)
  - **Container/Organization:** Logs are directly associated with a `focusId`.

- **Log Template**
  - **Description:** Predefined structures for creating new log entries, useful for recurring logs like daily standups or mood check-ins.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `name`: Name of the template (string)
    - `icon`: Icon associated with the template (string, key of `Icons` component)
    - `focusId`: ID of the focus area this template is primarily for (string)
    - `logType`: Type of log this template creates (`LogType` enum: `TEXT`, `CHECKLIST`, `RATING`)
    - `title`: Default title for the log entry (string, can include placeholders like `{{date}}`)
    - `description`: Default description for text logs (string, optional)
    - `checklist`: Predefined checklist items for checklist logs (array of objects with `text: string` and `completed: boolean`, optional)
    - `rating`: Default rating value for rating logs (number, optional)
  - **Container/Organization:** Templates are associated with a `focusId` and can be used to quickly create new logs.

### 3. Abhyasa (अभ्यास - Practice/Habit & Goal Tracking)

This module is designed for habit formation, goal setting, and tracking progress towards long-term objectives.

**Core Elements:**

- **Habit**
  - **Description:** Recurring actions or behaviors users want to establish or maintain. Habits can be of various types (binary, count, duration, checklist).
  - **Properties:**
    - `id`: Unique identifier (string)
    - `createdAt`: Date and time of habit creation (Date)
    - `title`: Name of the habit (string)
    - `description`: Detailed description of the habit (string, optional)
    - `icon`: Icon associated with the habit (string, key of `Icons` component)
    - `color`: Color associated with the habit (string, e.g., 'blue-500')
    - `frequency`: Object defining how often the habit should be performed (`HabitFrequency` type: `{ type: HabitFrequencyType.DAILY }`, `{ type: HabitFrequencyType.WEEKLY; times: number }`, `{ type: HabitFrequencyType.MONTHLY; times: number }`, or `{ type: HabitFrequencyType.SPECIFIC_DAYS; days: number[] }`)
    - `type`: Type of habit (`HabitType` enum: `BINARY`, `COUNT`, `DURATION`, `CHECKLIST`)
    - `target`: Target value for `COUNT` or `DURATION` habits (number, optional)
    - `checklist`: List of items for `CHECKLIST` habits (array of objects with `id: string` and `text: string`, optional)
    - `milestoneId`: ID of a linked milestone (string, optional)
    - `goalId`: ID of a linked goal (string, optional)
    - `startDate`: Date when the habit tracking started (Date)
    - `endDate`: Date when the habit tracking ended (Date, optional)
    - `reminders`: Array of reminder times (string[], optional)
    - `focusAreaId`: ID of the focus area this habit belongs to (string, optional)
  - **Container/Organization:** Habits can be linked to **Goals** via `goalId` or **Milestones** via `milestoneId`.

- **Habit Log**
  - **Description:** Records of daily habit completion or progress.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `habitId`: ID of the habit this log belongs to (string)
    - `date`: Date of the log entry (ISO string YYYY-MM-DD)
    - `status`: Completion status (`HabitLogStatus` enum: `COMPLETED`, `PARTIALLY_COMPLETED`, `SKIPPED`, `MISSED`, `NOT_COMPLETED`)
    - `description`: Optional description for the habit log (string, optional)
    - `value`: Recorded value for `COUNT` or `DURATION` habits (number, optional)
    - `completedChecklistItems`: IDs of completed checklist items for `CHECKLIST` habits (string[], optional)
  - **Container/Organization:** Habit Logs are associated with a specific `habitId` and `date`.

- **Goal**
  - **Description:** Long-term objectives or aspirations.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `title`: Name of the goal (string)
    - `description`: Detailed description of the goal (string, optional)
    - `startDate`: Date when the goal was started (Date)
    - `targetEndDate`: Target date for goal completion (Date, optional)
    - `status`: Current status (`GoalStatus` enum: `Not Started`, `In Progress`, `Completed`, `Abandoned`)
    - `icon`: Icon associated with the goal (string, key of `Icons` component)
    - `focusAreaId`: ID of the focus area this goal belongs to (string, optional)
  - **Container/Organization:** Goals can have associated **Milestones** and **Habits**.

- **Milestone**
  - **Description:** Significant interim achievements that contribute to the progress of a larger goal.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `title`: Name of the milestone (string)
    - `description`: Detailed description of the milestone (string, optional)
    - `parentGoalId`: ID of the parent goal (string, optional)
    - `startDate`: Date when the milestone was started (Date)
    - `targetEndDate`: Target date for milestone completion (Date, optional)
    - `status`: Current status (`MilestoneStatus` enum: `Not Started`, `In Progress`, `Completed`, `Abandoned`)
    - `focusAreaId`: ID of the focus area this milestone belongs to (string, optional)
  - **Container/Organization:** Milestones are directly linked to a `parentGoalId`.

- **Quick Win**
  - **Description:** Small, easily achievable tasks that provide a sense of accomplishment and build momentum.
  - **Properties:**
    - `id`: Unique identifier (string)
    - `title`: Name of the quick win (string)
    - `description`: Detailed description (string, optional)
    - `dueDate`: Optional due date (Date, optional)
    - `status`: Current status (`QuickWinStatus` enum: `Pending`, `Completed`)
    - `createdAt`: Date and time of quick win creation (Date)
    - `focusAreaId`: ID of the focus area this quick win belongs to (string, optional)
  - **Container/Organization:** Quick Wins are standalone items, not directly linked to goals or habits.

### 4. Vidya (विद्या - Knowledge/Learning)

This module is planned to be a knowledge management and learning hub. It is currently under development.

**Current Status:** "Vidyā coming soon!" placeholder.

## Technical Stack

- **React:** For building the user interface.
- **Vite:** As the build tool and development server.
- **Firebase:** For authentication and backend services (Firestore, etc.)
- **Zustand:** For global state management.

## Architecture

Jeevan Saathi uses a modern, modular architecture designed for scalability and maintainability.

### State Management

The application uses **Zustand** for global state management. This provides a simple, unopinionated, and scalable way to manage state across the application.

- **Root Store:** A root store combines the state and actions from all the individual module stores.
- **Module Stores:** Each module (`kary`, `dainandini`, `abhyasa`) has its own store that manages the state for that module. This keeps the state management organized and easy to maintain.

### Data Flow

The data flow in the application is unidirectional and follows these steps:

1.  **Component Interaction:** A user interacts with a component, which triggers an action (e.g., clicking a button to add a task).
2.  **Store Action:** The component calls an action from the relevant Zustand store.
3.  **Data Service:** The store action calls a function from the `dataService.ts` file to interact with the backend (Firebase).
4.  **State Update:** The `dataService` function returns data to the store, which then updates its state.
5.  **Component Re-render:** The component re-renders with the new state from the store.

This architecture ensures a clear separation of concerns and makes the application easier to debug and test.

## Layout\*\*

The application features a 4-panel layout designed for intuitive navigation and efficient workflow:

- Left Sidebar (Modules): This panel provides access to the main modules of the application:
  - Kary: A powerful task manager.
  - Abhyasa: A habit tracker to help you build and maintain good habits.
  - Dainandini: A personal journal for your thoughts and reflections.
  - Vidya: A knowledge base for learning and growth.

Kary Module Layout

- Left Panel (Lists & Organization):
  - Inbox: A default list for new tasks.
  - Today: A smart list that automatically shows tasks due today.
  - Upcoming: A smart list that shows tasks due in the future.
  - Lists: A section where you can create, edit, and delete your own custom task lists.
- Middle Panel (Task View):
  - Displays the tasks for the currently selected list (e.g., "Inbox," "Today," or a custom list).
  - Provides an option to add new tasks.
  - Includes a menu button for editing the current list's properties.
- Right Panel (Task Details):
  - Shows the complete details of a selected task.
  - Allows you to edit the task's title, due date, priority, and add subtasks.
  - Provides a space for notes and comments related to the task.

Abhyasa Module Layout

- Left Panel (Habit Overview):
  - Displays a list of all the habits you are currently tracking.
  - Allows you to add new habits to track.
  - Provides a quick overview of your progress for each habit.
- Middle Panel (Habit Calendar/Timeline):
  - Shows a calendar view with your habit tracking data.
  - Allows you to mark habits as completed for each day.
  - Provides a timeline view to see your habit progression over time.
- Right Panel (Habit Details & Statistics):
  - Displays detailed information about a selected habit.
  - Shows statistics and charts on your habit completion rate.
  - Allows you to edit the habit's name, schedule, and other properties.

Dainandini Module Layout

- Left Panel (Journal Entries):
  - Lists all your journal entries, organized by date.
  - Allows you to create new journal entries.
  - Provides a search function to find specific entries.
- Middle Panel (Entry Content):
  - Displays the content of the selected journal entry.
  - Provides a clean and focused reading experience.
- Right Panel (Entry Details & Editing):
  - Shows metadata for the selected entry, such as the creation date and any tags.
  - Allows you to edit the content of the journal entry.
  - Provides options for formatting text, adding images, and other rich text editing features.

Vidya Module Layout

- Left Panel (Knowledge Base):
  - Not yet implemented.
- Middle Panel (Content Viewer):
  - Not yet implemented.
- Right Panel (Details & Notes):
  - Not yet implemented.

## Future AI Integration

A key aspect of Jeevan Saathi's future roadmap is the integration of AI capabilities. The detailed data structures and modular design are intentionally laid out to facilitate this. Potential AI-powered features include:

- **Intelligent Task Prioritization:** AI could analyze task properties, deadlines, and user habits to suggest optimal task sequences.
- **Day Planner** Talk with AI to plan tasks for the day
- **Automated Journaling Insights:** Sentiment analysis, topic extraction, and pattern recognition from Dainandini logs to provide insights into mood, productivity, and recurring themes.
- **Personalized Habit Coaching:** AI could adapt habit recommendations and reminders based on user progress, challenges, and historical data.
- **Personalized Habit Suggestions** AI could suggest habits based on the insights from Journaling
- **Goal Path Optimization:** Suggesting milestones and habits to achieve goals more effectively.
- **Knowledge Synthesis (Vidya):** AI-powered summarization, content organization, and retrieval within the Vidya module.
- **Natural Language Interaction:** Allowing users to interact with the application using natural language commands.

This detailed structure will serve as a robust foundation for developing and integrating these advanced AI features, transforming Jeevan Saathi into an even more powerful "Life Companion."
