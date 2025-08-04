# Home Screen PRD

## 1. Vision

To create a centralized, interactive, and personalized home screen that provides users with a unified view of their day and allows them to manage their tasks, habits, and journal entries from a single place.

## 2. Goals

*   **Centralize Information:** Aggregate key information from Abhyasa, Dainandini, and Kary modules into a single, unified calendar view.
*   **Improve User Experience:** Reduce the need for users to switch between modules to manage their day.
*   **Increase Engagement:** Provide a more engaging and personalized experience that encourages users to interact with the app more frequently.
*   **Modern UI/UX:** Implement a modern, clean, and intuitive design.
*   **Inline Editing:** Allow users to edit and manage their items directly from the home screen.

## 3. User Stories

*   As a user, I want to see all my tasks, habits, and journal entries for the day in a single calendar view so that I can plan my day effectively.
*   As a user, I want to be able to click on an item in the calendar and see its details on the same screen.
*   As a user, I want to be able to edit the details of a task, habit, or journal entry directly from the home screen.
*   As a user, I want to be able to add a new task, habit, or journal entry from the home screen.
*   As a user, I want to see a summary of my day, including completed tasks, logged habits, and journal entries.

## 4. Design & UX

The home screen will be designed as a two-panel layout.

*   **Left Panel: Unified Calendar**
    *   A full-screen calendar view that displays tasks, habits, and journal entries.
    *   Each item type will be color-coded for easy identification.
    *   The user can switch between daily, weekly, and monthly views.
*   **Right Panel: Detail View**
    *   When a user clicks on an item in the calendar, this panel will display the details of that item.
    *   The content of this panel will be the existing detail/edit components from the respective modules (`KaryTaskDetail`, `HabitDetailView`, `LogDetail`).
    *   This will allow users to edit descriptions, add logs, and manage the item without leaving the home screen.
*   **Theme:** A clean and modern aesthetic with a focus on readability and ease of use. It will respect the existing color scheme and typography of the app.

## 5. Technical Considerations

*   **New Module:** A new module named `home` will be created in the `modules` directory.
*   **Component-Based Architecture:** The home screen will be built using React and TypeScript.
*   **State Management:** Zustand will be used to manage the state of the home screen and to fetch data from the other modules' stores.
*   **Data Aggregation:** Data from `karyStore`, `abhyasaStore`, and `dainandiniStore` will be fetched and aggregated to be displayed on the unified calendar.
*   **Reusable Components:** The existing detail view components from the Kary, Abhyasa, and Dainandini modules will be reused in the right panel of the home screen.
*   **Calendar Component:** A robust calendar component (e.g., `react-big-calendar` or a custom-built one) will be used for the left panel.
*   **Routing:** A new route will be added to the main router for the home screen.
