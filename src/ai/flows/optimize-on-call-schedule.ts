'use server';

/**
 * @fileOverview An AI agent that suggests optimal swaps among on-call residents to resolve scheduling conflicts or on-call shortages, ensuring adequate coverage while respecting resident preferences.
 *
 * - optimizeOnCallSchedule - A function that handles the schedule optimization process.
 * - OptimizeOnCallScheduleInput - The input type for the optimizeOnCallSchedule function.
 * - OptimizeOnCallScheduleOutput - The return type for the optimizeOnCallSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeOnCallScheduleInputSchema = z.object({
  currentSchedule: z.string().describe('The current on-call schedule as a string.'),
  residentPreferences: z.string().describe('Resident preferences and constraints as a string.'),
  conflictDetails: z.string().describe('Details about the scheduling conflicts or on-call shortages as a string.'),
});
export type OptimizeOnCallScheduleInput = z.infer<typeof OptimizeOnCallScheduleInputSchema>;

const OptimizeOnCallScheduleOutputSchema = z.object({
  suggestedSwaps: z.string().describe('A list of suggested swaps among residents to resolve conflicts and optimize the schedule.'),
  rationale: z.string().describe('The rationale behind the suggested swaps.'),
});
export type OptimizeOnCallScheduleOutput = z.infer<typeof OptimizeOnCallScheduleOutputSchema>;

export async function optimizeOnCallSchedule(input: OptimizeOnCallScheduleInput): Promise<OptimizeOnCallScheduleOutput> {
  return optimizeOnCallScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeOnCallSchedulePrompt',
  input: {schema: OptimizeOnCallScheduleInputSchema},
  output: {schema: OptimizeOnCallScheduleOutputSchema},
  prompt: `You are an AI assistant that specializes in optimizing on-call schedules for medical residents.

You will analyze the current on-call schedule, resident preferences, and conflict details, and suggest optimal swaps among residents to resolve scheduling conflicts or on-call shortages.
Your goal is to ensure adequate coverage while respecting resident preferences and constraints. Explain the rationale behind each suggested swap.

Current Schedule: {{{currentSchedule}}}

Resident Preferences: {{{residentPreferences}}}

Conflict Details: {{{conflictDetails}}}

Suggest optimal swaps:
`,
});

const optimizeOnCallScheduleFlow = ai.defineFlow(
  {
    name: 'optimizeOnCallScheduleFlow',
    inputSchema: OptimizeOnCallScheduleInputSchema,
    outputSchema: OptimizeOnCallScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
