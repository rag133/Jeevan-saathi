
import { GoogleGenAI, Type } from "@google/genai";
import { List, Task } from '../types';

// Schema for breaking down a task into subtasks
const subtaskSchema = {
  type: Type.OBJECT,
  properties: {
    subtasks: {
      type: Type.ARRAY,
      description: "A list of short, actionable subtask strings. Each string should be a clear, concise action. Aim for 3 to 7 subtasks.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['subtasks'],
};

interface SubtaskGeminiResponse {
    subtasks: string[];
}

export const breakDownTask = async (taskTitle: string, apiKey: string): Promise<string[]> => {
    if (!apiKey) {
        throw new Error("A Gemini API key is required for this feature.");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const prompt = `You are an expert project manager. Your goal is to help users break down large tasks into small, manageable steps.
        
        Break down the following high-level task into a simple checklist of actionable subtasks. Ensure the subtasks are clear and concise.
        
        Task: "${taskTitle}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: subtaskSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse: SubtaskGeminiResponse = JSON.parse(jsonText);
        
        if (parsedResponse && Array.isArray(parsedResponse.subtasks)) {
            return parsedResponse.subtasks;
        } else {
            console.error("Invalid response format from Gemini:", parsedResponse);
            return [];
        }

    } catch (e) {
        console.error("Error calling Gemini API:", e);
        throw new Error("Failed to generate subtasks. The AI model might be busy or your API key may be invalid. Please try again.");
    }
};


// --- New AI Service for Smart Task Creation ---

export interface ExtractedTaskData {
    title: string;
    list?: List | null;
    listName?: string | null; // Kept for text-based parsing
    tagNames: string[];
    priority: 1 | 2 | 3 | 4 | null;
    dueDate: string | null; // ISO 8601 format
}

const taskExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The main title of the task, extracted from the input. Exclude all other metadata like lists, tags, dates, and priority.",
    },
    listName: {
      type: Type.STRING,
      description: "The name of the list, specified with a '~' prefix (e.g., '~shopping' -> 'shopping'). If not present, this must be null.",
    },
    tagNames: {
      type: Type.ARRAY,
      description: "A list of tag names, specified with an '#' prefix (e.g., '#work #urgent' -> ['work', 'urgent']). If not present, this must be an empty array.",
      items: { type: Type.STRING },
    },
    priority: {
        type: Type.INTEGER,
        description: "A priority level from 1 (most important) to 4 (least important), specified with a '!' or 'p' prefix (e.g., '!1' or 'p1' -> 1). If not present, this must be null.",
    },
    dueDate: {
      type: Type.STRING,
      description: "The due date, parsed from natural language. Return in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). If no date or time is specified, this must be null.",
    },
  },
};

export const extractTaskDetails = async (taskInput: string, apiKey: string | null): Promise<ExtractedTaskData> => {
     if (!apiKey) {
        // Fallback for when no API key is present: treat the whole input as the title
        return {
            title: taskInput,
            listName: null,
            tagNames: [],
            priority: null,
            dueDate: null,
        };
    }
    const ai = new GoogleGenAI({ apiKey });

     try {
        const prompt = `You are an intelligent task parsing assistant. Your job is to extract structured information from a user's single-line text input for creating a task.

The user can provide a title, a list, tags, priority, and a due date in any order.

- The task title is the main text that remains after extracting all other metadata.
- List is specified with a '~' prefix (e.g., ~work).
- Tags are specified with a '#' prefix (e.g., #urgent #review).
- Priority is specified with '!' or 'p' followed by a number from 1 to 4 (e.g., !1, p2). 1 is highest priority.
- Due date can be any natural language phrase (e.g., tomorrow, next Friday, in 2 weeks at 5pm, 25th July).

Your output MUST be a JSON object matching the provided schema.
- Extract the core task title.
- For listName and tagNames, return the name without the prefix.
- If a value is not found, return null for single fields (listName, priority, dueDate) and an empty array for multi-value fields (tagNames).
- For the due date, parse it and return it in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Assume the current date is ${new Date().toISOString()} for relative calculations.

Input: "${taskInput}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: taskExtractionSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (e) {
        console.error("Error calling Gemini for task extraction:", e);
        // Fallback for when AI fails: treat the whole input as the title
        return {
            title: taskInput,
            listName: null,
            tagNames: [],
            priority: null,
            dueDate: null,
        };
    }
}

// --- New AI Service for Daily Planning ---

export interface ScheduledTask {
    startTime: string; // e.g., "09:00 AM"
    endTime: string;   // e.g., "10:30 AM"
    taskTitle: string;
    taskId: string;
    notes?: string; // e.g., "Take a short break after this"
}

export interface DailyPlan {
    plan: ScheduledTask[];
}

const dailyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        plan: {
            type: Type.ARRAY,
            description: "A structured schedule of tasks for the day. The schedule should be realistic, with breaks if necessary.",
            items: {
                type: Type.OBJECT,
                properties: {
                    startTime: { type: Type.STRING, description: "The suggested start time for the task (e.g., '09:00 AM')." },
                    endTime: { type: Type.STRING, description: "The suggested end time for the task (e.g., '10:30 AM')." },
                    taskTitle: { type: Type.STRING, description: "The original title of the task." },
                    taskId: { type: Type.STRING, description: "The original ID of the task." },
                    notes: { type: Type.STRING, description: "Optional brief notes or suggestions, like taking a break." }
                },
                 required: ['startTime', 'endTime', 'taskTitle', 'taskId'],
            }
        }
    },
    required: ['plan'],
};

export const generateDailyPlan = async (tasks: Task[], apiKey: string): Promise<DailyPlan> => {
    if (!apiKey) {
        throw new Error("A Gemini API key is required for this feature.");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const taskDescriptions = tasks.map(t => `- Task: "${t.title}" (ID: ${t.id}, Priority: ${t.priority || 'not set'})`).join('\n');

        const prompt = `You are a world-class productivity coach. Your task is to create a realistic and effective daily schedule based on a list of tasks. Consider the task priorities and create a logical flow for the day. Include short breaks.

Today's date is ${new Date().toLocaleDateString()}.

Here are the tasks for today:
${taskDescriptions}

Create a schedule in JSON format. The schedule should be an array of task objects. Each object must include a start time, end time, the original task title, and the original task ID. You can also add brief notes, for example, suggesting a break after a demanding task. Ensure the final output strictly adheres to the provided JSON schema.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: dailyPlanSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse: DailyPlan = JSON.parse(jsonText);
        
        if (parsedResponse && Array.isArray(parsedResponse.plan)) {
            return parsedResponse;
        } else {
            console.error("Invalid response format from Gemini for daily plan:", parsedResponse);
            throw new Error("The AI returned an unexpected format for the daily plan.");
        }

    } catch (e) {
        console.error("Error calling Gemini API for daily plan:", e);
        throw new Error("Failed to generate the daily plan. The AI model might be busy or your API key may be invalid. Please try again.");
    }
};
