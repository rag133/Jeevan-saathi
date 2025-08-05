# Jeevan Saathi - Your Life Companion
 <!-- Replace with a real screenshot -->

Jeevan Saathi (जीवन साथी - Life Companion) is a comprehensive personal management application designed to help users organize their lives across various dimensions: tasks, journaling, goal setting, and learning. Built with a modular architecture, it aims to provide a holistic platform for personal growth and productivity.


## ✨ Features

Jeevan Saathi is divided into four main modules:

*   **📝 Kary (कार्य - Work/Tasks):** A powerful task manager that helps you organize your to-do lists, set due dates, and track your progress. You can create custom lists, add tags, and break down large tasks into smaller subtasks.
*   **🎯 Abhyasa (अभ्यास - Practice/Habits):** A habit tracker that helps you build and maintain good habits. You can set goals, track your progress with a calendar view, and get detailed statistics on your habit completion rate.
*   **📔 Dainandini (दैनंदिनी - Journal):** A personal journal for your thoughts, reflections, and daily logs. You can create different types of entries (text, checklists, ratings) and organize them by focus areas.
*   **📚 Vidya (विद्या - Knowledge):** A knowledge base for learning and growth. (This module is currently under development).
*   **🏠 Home:** A centralized dashboard that provides a unified view of your tasks, habits, and journal entries for the day. It's designed to help you plan and prioritize your day effectively.

## 🚀 Tech Stack

Jeevan Saathi is built with a modern and robust tech stack:

*   **Frontend:** [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Backend:** [Firebase](https://firebase.google.com/) (Authentication, Firestore)
*   **Testing:** [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)
*   **Linting & Formatting:** [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or higher)
*   [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/your-username/jeevan-saathi.git
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Set up Firebase**
    *   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    *   Create a `.env.local` file in the root of the project and add your Firebase configuration:
        ```
        VITE_FIREBASE_API_KEY=your-api-key
        VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
        VITE_FIREBASE_PROJECT_ID=your-project-id
        VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
        VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
        VITE_FIREBASE_APP_ID=your-app-id
        ```
4.  **Run the development server**
    ```sh
    npm run dev
    ```

## 📂 Project Structure

The project follows a modular architecture, with each main feature separated into its own directory under `src/modules`.

```
.
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── modules/
│   │   ├── abhyasa/
│   │   ├── dainandini/
│   │   ├── home/
│   │   ├── kary/
│   │   └── vidya/
│   ├── services/
│   ├── styles/
│   ├── types/
│   └── App.tsx
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Zustand State Management

Jeevan Saathi uses [Zustand](https://github.com/pmndrs/zustand) for global state management. This provides a simple and scalable way to manage state across the application.

*   **Root Store:** A root store combines the state and actions from all the individual module stores.
*   **Module Stores:** Each module (`kary`, `dainandini`, `abhyasa`) has its own store that manages the state for that module. This keeps the state management organized and easy to maintain.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request



Project Link: [https://github.com/your-username/jeevan-saathi](https://github.com/your-username/jeevan-saathi)