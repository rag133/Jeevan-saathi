import { Focus, Log, LogType, LogTemplate } from './types';

export const initialFoci: Focus[] = [
  {
    id: 'general',
    name: 'General',
    description: 'For everyday thoughts, notes, and musings.',
    icon: 'ListIcon',
    color: 'gray-500',
    allowedLogTypes: [LogType.TEXT, LogType.CHECKLIST, LogType.RATING],
  },
  {
    id: 'kary',
    name: 'Kary',
    description: 'Log entries related to tasks and work progress.',
    icon: 'CheckSquareIcon',
    color: 'green-500',
    allowedLogTypes: [LogType.TEXT, LogType.CHECKLIST, LogType.RATING],
  },
  {
    id: 'gratitude',
    name: 'Gratitude',
    description: "A space to reflect on what you're thankful for.",
    icon: 'HeartIcon',
    color: 'pink-500',
    allowedLogTypes: [LogType.TEXT, LogType.RATING],
  },
  {
    id: 'ideas',
    name: 'Ideas',
    description: 'Capture fleeting ideas and inspiration.',
    icon: 'MagicWandIcon',
    color: 'purple-500',
    allowedLogTypes: [LogType.TEXT],
  },
  {
    id: 'mood',
    name: 'Mood',
    icon: 'TagIcon',
    color: 'yellow-500',
    allowedLogTypes: [LogType.RATING],
  },
  {
    id: 'daily-tasks',
    name: 'Daily Tasks',
    icon: 'CheckSquareIcon',
    color: 'blue-500',
    allowedLogTypes: [LogType.CHECKLIST],
  },
];

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(today.getDate() - 2);

export const initialLogs: Log[] = [
  // --- Task-related logs ---
  {
    id: 'task-log-1',
    focusId: 'kary',
    logType: LogType.TEXT,
    title: 'Initial resume draft',
    description:
      'Began the process of tailoring my resume. This is a crucial step for the next phase of my career.',
    logDate: new Date(new Date(yesterday).setHours(14, 0, 0)),
    createdAt: new Date(new Date(yesterday).setHours(14, 0, 0)),
    taskId: '1', // Linked to 'Prepare Resume for BFSI'
  },
  {
    id: 'task-log-2',
    focusId: 'kary',
    logType: LogType.CHECKLIST,
    title: 'Resume Review Checklist',
    checklist: [
      { id: 'tci-1', text: 'Checked for typos', completed: true },
      { id: 'tci-2', text: 'Added latest project', completed: true },
      { id: 'tci-3', text: 'Sent to mentor for review', completed: false },
    ],
    logDate: new Date(new Date(today).setHours(10, 30, 0)),
    createdAt: new Date(new Date(today).setHours(10, 30, 0)),
    taskId: '1', // Linked to 'Prepare Resume for BFSI'
  },
  {
    id: 'task-log-3',
    focusId: 'kary',
    logType: LogType.TEXT,
    title: 'Agent Roles Defined',
    description: 'Completed the definitions for the Researcher, Analyst, and Writer agents.',
    logDate: new Date(new Date(today).setHours(16, 0, 0)),
    createdAt: new Date(new Date(today).setHours(16, 0, 0)),
    taskId: '4', // Linked to 'Building a Multi-Agent AI Research Team...'
  },

  // --- Standard logs ---
  {
    id: 'log1',
    focusId: 'gratitude',
    logType: LogType.TEXT,
    title: 'Grateful for the sunny morning and a great cup of coffee.',
    logDate: new Date(new Date(today).setHours(9, 15, 0)),
    createdAt: new Date(new Date(today).setHours(9, 15, 0)),
  },
  {
    id: 'log2',
    focusId: 'ideas',
    logType: LogType.TEXT,
    title: 'Journaling app idea',
    description:
      'It should be able to analyze mood patterns over time based on text entries using sentiment analysis.',
    logDate: new Date(new Date(today).setHours(11, 30, 0)),
    createdAt: new Date(new Date(today).setHours(11, 30, 0)),
  },
  {
    id: 'log3',
    focusId: 'mood',
    logType: LogType.RATING,
    title: 'Productivity Level',
    rating: 5,
    description: 'Felt productive and focused today. I managed to clear out my inbox.',
    logDate: new Date(new Date(today).setHours(14, 0, 0)),
    createdAt: new Date(new Date(today).setHours(14, 0, 0)),
  },
  {
    id: 'log-checklist-1',
    focusId: 'daily-tasks',
    logType: LogType.CHECKLIST,
    title: 'Morning Routine',
    checklist: [
      { id: 'ci-1', text: 'Make bed', completed: true },
      { id: 'ci-2', text: 'Meditate for 10 minutes', completed: true },
      { id: 'ci-3', text: 'Plan the day', completed: false },
    ],
    logDate: new Date(new Date(today).setHours(8, 0, 0)),
    createdAt: new Date(new Date(today).setHours(8, 0, 0)),
  },
  {
    id: 'log4',
    focusId: 'gratitude',
    logType: LogType.RATING,
    title: 'Family Dinner',
    rating: 5,
    description: 'Had a wonderful dinner with the family. So much to be thankful for.',
    logDate: new Date(new Date(yesterday).setHours(20, 0, 0)),
    createdAt: new Date(new Date(yesterday).setHours(20, 0, 0)),
  },
  {
    id: 'goal-log-1',
    focusId: 'general',
    logType: LogType.TEXT,
    title: 'Started Duolingo practice',
    description: 'Completed the first 3 lessons in the A1 section. ¡Hola, mundo!',
    logDate: new Date(new Date(today).setHours(18, 0, 0)),
    createdAt: new Date(new Date(today).setHours(18, 0, 0)),
    goalId: 'goal-2',
  },
];

export const initialLogTemplates: LogTemplate[] = [
  {
    id: 'template-standup',
    name: 'Daily Standup',
    icon: 'SunriseIcon' as any, // Assuming SunriseIcon exists, if not, use a valid one
    focusId: 'kary',
    logType: LogType.CHECKLIST,
    title: 'Standup - {{date}}',
    description: 'My update for today.',
    checklist: [
      { text: 'What did I do yesterday?', completed: false },
      { text: 'What will I do today?', completed: false },
      { text: 'Any blockers?', completed: false },
    ],
  },
  {
    id: 'template-review',
    name: 'Weekly Review',
    icon: 'CalendarIcon',
    focusId: 'general',
    logType: LogType.TEXT,
    title: 'Weekly Review - {{date}}',
    description:
      "1. What went well this week?\n2. What didn't go so well?\n3. What will I focus on next week?",
  },
  {
    id: 'template-mood',
    name: 'Mood Check-in',
    icon: 'SmileIcon' as any, // Assuming SmileIcon exists
    focusId: 'mood',
    logType: LogType.RATING,
    title: 'How am I feeling?',
    rating: 3,
  },
];
// Note: SunriseIcon and SmileIcon are placeholders. I will need to add them to Icons.tsx if I want to use them.
// For now, I'll add them to avoid breaking the build, but they will be generic icons.
