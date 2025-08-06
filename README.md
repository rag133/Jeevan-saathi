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


## Future Road Map:
📝 Kary (Tasks)
Smart Task Prioritization: An AI could analyze your past habits and task completion history to suggest which tasks are most important or at risk of being missed, factoring in things like task difficulty and your typical energy levels.

Automatic Task Breakdown: For large or complex tasks, an AI could suggest a step-by-step breakdown. For example, if you enter "Plan a birthday party," the AI could suggest sub-tasks like "create guest list," "send invitations," "order cake," and "buy decorations."

🎯 Abhyasa (Habits)
Personalized Habit Coaching: An AI could act as a personal coach, providing motivational messages and insights based on your progress. For instance, if you consistently miss a habit on Wednesdays, the AI could suggest a different time or location for that day.

Habit Prediction and Intervention: The AI could predict when you're likely to fall off a habit streak and proactively send a supportive message or a reminder before you miss it.

📔 Dainandini (Journal)
Sentiment Analysis and Mood Tracking: The AI could analyze the text of your journal entries to track your mood and emotional state over time.  It could then provide visualizations and insights, showing correlations between your mood and other activities, like tasks completed or habits followed.

Automatic Summarization and Key Insight Extraction: For long journal entries, an AI could provide a quick summary or extract key themes and recurring thoughts. This helps you quickly review your reflections and identify patterns.

Journal Analysis for Goal and Habit Suggestions: The AI could analyze your journal entries to identify recurring themes, desires, or frustrations. For example, if you frequently write about feeling stressed at work, the AI could suggest a goal like "Improve Work-Life Balance" and propose related habits such as "Practice 10 minutes of mindfulness daily" or "Take a 15-minute walk during lunch." It could also help you break down a big aspiration, like "Start a side hustle," into milestones like "Research business ideas," "Create a simple business plan," and "Launch a basic website."

📚 Vidya (Knowledge)
Personalized Learning Recommendations: Based on your goals and interests, the AI could recommend articles, courses, or videos. If you set a goal to "learn to code," the AI could suggest beginner-friendly resources and help you track your progress.

Knowledge Synthesis and Q&A: The AI could act as a smart knowledge base. You could input notes or articles you've read, and the AI could help you synthesize the information, connect ideas, and even answer questions based on the content you've saved.

🏠 Home Dashboard
Dynamic Daily Plan Generation: Instead of just showing a list of tasks and habits, the AI could create a personalized daily schedule, suggesting optimal times to complete tasks and practice habits based on your past data and known peak productivity times.

Proactive Life Insights: The dashboard could feature an AI-powered insights widget. This widget could highlight interesting patterns, such as "You're 20% more likely to finish all your tasks on days you journal," or "Your energy levels tend to drop after 3 PM on Fridays." This helps you understand yourself better and make more informed decisions.







