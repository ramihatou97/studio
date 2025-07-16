'use server';

/**
 * @fileOverview A Genkit flow that allows a user to ask questions about the schedule.
 * It uses tools to look up information from the application state.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getScheduleInformationTool} from '@/ai/tools/get-schedule-information';
import type {AppState} from '@/lib/types';

const ChatWithScheduleInputSchema = z.object({
  appState: z.any().describe('The entire application state, including residents, staff, and general settings.'),
  history: z.array(z.any()).describe('The chat history between the user and the AI.'),
  question: z.string().describe("The user's question about the schedule."),
});
export type ChatWithScheduleInput = z.infer<typeof ChatWithScheduleInputSchema>;

const ChatWithScheduleOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the user's question."),
});
export type ChatWithScheduleOutput = z.infer<typeof ChatWithScheduleOutputSchema>;

export async function chatWithSchedule(
  input: ChatWithScheduleInput
): Promise<ChatWithScheduleOutput> {
  return chatWithScheduleFlow(input);
}

const chatWithSchedulePrompt = ai.definePrompt(
  {
    name: 'chatWithSchedulePrompt',
    input: {schema: ChatWithScheduleInputSchema},
    output: {schema: ChatWithScheduleOutputSchema},
    tools: [getScheduleInformationTool],
    prompt: `You are an expert AI assistant for managing neurosurgery resident schedules.
Your role is to answer questions from the user about the current schedule provided in the application state.
Use the available tools to find the information needed to answer the user's question.
Be concise and helpful in your responses. The user is a medical professional, so you can use medical terminology.
The first day of the schedule is Day 1.

The current date is {{currentDate}}.

Here is the chat history, for context:
{{#each history}}
- {{role}}: {{#each parts}}{{text}}{{/each}}
{{/each}}

User's Question:
"{{question}}"
`,
  },
  {
    // Augment the input with the current date before sending to the prompt
    augmentor: async (input: ChatWithScheduleInput) => {
        return {...input, currentDate: new Date().toLocaleDateString()};
    }
  }
);

const chatWithScheduleFlow = ai.defineFlow(
  {
    name: 'chatWithScheduleFlow',
    inputSchema: ChatWithScheduleInputSchema,
    outputSchema: ChatWithScheduleOutputSchema,
  },
  async ({appState, history, question}) => {
    // Provide the application state to the tool when it's called.
    const augmentedTool = getScheduleInformationTool.provideContext(appState as AppState);

    const llmResponse = await chatWithSchedulePrompt(
      {appState, history, question},
      {
        tools: [augmentedTool], // Use the context-provided tool
        history,
      }
    );

    return {answer: llmResponse.output!.answer};
  }
);
