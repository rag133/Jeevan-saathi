
import { Habit, HabitLog, HabitType, HabitFrequencyType, HabitLogStatus, HabitStatus, Goal, Milestone, QuickWin, GoalStatus, MilestoneStatus, QuickWinStatus } from './types';

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(today.getDate() - 2);
const threeDaysAgo = new Date();
threeDaysAgo.setDate(today.getDate() - 3);


export const habits: Habit[] = [
    {
        id: 'habit-1',
        title: 'Meditate for 15 minutes',
        description: 'Mindfulness meditation to start the day with clarity.',
        icon: 'SunriseIcon',
        color: 'purple-500',
        type: HabitType.DURATION,
        target: 15, // minutes
        frequency: { type: HabitFrequencyType.DAILY },
        createdAt: new Date(),
        startDate: new Date(),
        reminders: ['07:00'],
        status: HabitStatus.IN_PROGRESS,
        focusAreaId: 'general',
    },
    {
        id: 'habit-2',
        title: 'Drink 8 glasses of water',
        description: 'Stay hydrated throughout the day.',
        icon: 'HeartIcon',
        color: 'blue-500',
        type: HabitType.COUNT,
        target: 8,
        frequency: { type: HabitFrequencyType.DAILY },
        createdAt: new Date(),
        startDate: new Date(),
        status: HabitStatus.IN_PROGRESS,
        focusAreaId: 'general',
    },
    {
        id: 'habit-3',
        title: 'Workout',
        description: 'Strength training sessions.',
        icon: 'TargetIcon',
        color: 'red-500',
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.SPECIFIC_DAYS, days: [1, 3, 5] }, // Mon, Wed, Fri
        createdAt: new Date(),
        startDate: new Date(),
        milestoneId: 'milestone-2',
        status: HabitStatus.IN_PROGRESS,
        focusAreaId: 'general',
    },
    {
        id: 'habit-4',
        title: 'Morning Routine',
        description: 'A series of small tasks to kickstart the morning.',
        icon: 'CheckSquareIcon',
        color: 'green-500',
        type: HabitType.CHECKLIST,
        checklist: [
            { id: 'c1', text: 'Make bed' },
            { id: 'c2', text: '5-min stretch' },
            { id: 'c3', text: 'Review daily plan' },
        ],
        frequency: { type: HabitFrequencyType.DAILY },
        createdAt: new Date(),
        startDate: new Date(),
        reminders: ['06:30', '07:00'],
        status: HabitStatus.IN_PROGRESS,
        focusAreaId: 'daily-tasks',
    },
     {
        id: 'habit-5',
        title: 'Read 20 pages',
        description: 'Read from a non-fiction book.',
        icon: 'BookOpenIcon',
        color: 'orange-500',
        type: HabitType.BINARY,
        frequency: { type: HabitFrequencyType.DAILY },
        createdAt: new Date(),
        startDate: new Date(),
        goalId: 'goal-2',
        status: HabitStatus.IN_PROGRESS,
        focusAreaId: 'general',
    },
];

const toISODate = (date: Date) => date.toISOString().split('T')[0];

export const habitLogs: HabitLog[] = [
    // Meditate logs
    { id: 'hl-1-1', habitId: 'habit-1', date: toISODate(yesterday), status: HabitLogStatus.COMPLETED, value: 15 },
    { id: 'hl-1-2', habitId: 'habit-1', date: toISODate(twoDaysAgo), status: HabitLogStatus.COMPLETED, value: 20 },
    { id: 'hl-1-3', habitId: 'habit-1', date: toISODate(threeDaysAgo), status: HabitLogStatus.PARTIALLY_COMPLETED, value: 10 },
    
    // Water logs
    { id: 'hl-2-1', habitId: 'habit-2', date: toISODate(yesterday), status: HabitLogStatus.COMPLETED, value: 8 },
    { id: 'hl-2-2', habitId: 'habit-2', date: toISODate(twoDaysAgo), status: HabitLogStatus.PARTIALLY_COMPLETED, value: 6 },

    // Morning Routine logs
    { id: 'hl-4-1', habitId: 'habit-4', date: toISODate(yesterday), status: HabitLogStatus.COMPLETED, completedChecklistItems: ['c1', 'c2', 'c3']},
    { id: 'hl-4-2', habitId: 'habit-4', date: toISODate(twoDaysAgo), status: HabitLogStatus.PARTIALLY_COMPLETED, completedChecklistItems: ['c1', 'c3']},
];

export const initialGoals: Goal[] = [
    {
        id: 'goal-1',
        title: 'Run a Marathon',
        description: 'Complete a full 42.195-kilometer marathon by the end of the year.',
        startDate: new Date('2024-01-15'),
        targetEndDate: new Date('2024-12-31'),
        status: GoalStatus.IN_PROGRESS,
        icon: 'TargetIcon',
        focusAreaId: 'kary',
    },
    {
        id: 'goal-2',
        title: 'Learn Spanish B2',
        description: 'Achieve a B2 proficiency level in Spanish, focusing on conversational skills.',
        startDate: new Date('2024-03-01'),
        status: GoalStatus.IN_PROGRESS,
        icon: 'BookOpenIcon',
        focusAreaId: 'general',
    }
];

export const initialMilestones: Milestone[] = [
    {
        id: 'milestone-1',
        parentGoalId: 'goal-1',
        title: 'Run a Half Marathon',
        status: MilestoneStatus.COMPLETED,
        startDate: new Date('2024-04-15'),
        targetEndDate: new Date('2024-07-20'),
        focusAreaId: 'kary',
    },
    {
        id: 'milestone-2',
        parentGoalId: 'goal-1',
        title: 'Consistent 30km Long Runs',
        status: MilestoneStatus.IN_PROGRESS,
        startDate: new Date('2024-07-22'),
        targetEndDate: new Date('2024-10-31'),
        focusAreaId: 'kary',
    },
    {
        id: 'milestone-3',
        parentGoalId: 'goal-2',
        title: 'Complete A1 Grammar',
        status: MilestoneStatus.COMPLETED,
        startDate: new Date('2024-03-01'),
        targetEndDate: new Date('2024-05-30'),
        focusAreaId: 'general',
    },
    {
        id: 'milestone-4',
        parentGoalId: 'goal-2',
        title: 'Hold a 15-minute conversation',
        status: MilestoneStatus.IN_PROGRESS,
        startDate: new Date('2024-06-01'),
        focusAreaId: 'general',
    }
];

export const initialQuickWins: QuickWin[] = [
    {
        id: 'qw-1',
        title: "Reply to Sarah's email",
        status: QuickWinStatus.PENDING,
        createdAt: new Date(),
    },
    {
        id: 'qw-2',
        title: "Water the plants",
        status: QuickWinStatus.PENDING,
        createdAt: new Date(),
    },
    {
        id: 'qw-3',
        title: "Organize desktop files",
        status: QuickWinStatus.COMPLETED,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
    }
];