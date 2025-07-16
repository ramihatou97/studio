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
  currentSchedule: z.string().describe('The current on-call schedule as a string, showing which residents are on call for which days.'),
  residentPreferences: z.string().describe('A string summarizing resident preferences, including vacation days and holiday assignments.'),
  conflictDetails: z.string().describe('A string detailing the specific scheduling conflicts or on-call shortages that need to be resolved.'),
});
export type OptimizeOnCallScheduleInput = z.infer<typeof OptimizeOnCallScheduleInputSchema>;

const OptimizeOnCallScheduleOutputSchema = z.object({
    suggestedSwaps: z.array(z.object({
        day: z.number().describe('The 1-indexed day of the month for the swap.'),
        resident1: z.string().describe('The name of the first resident to swap.'),
        resident2: z.string().describe('The name of the second resident to swap.'),
    })).describe('A list of suggested swaps among residents to resolve conflicts and optimize the schedule. This should be a clear, actionable list.'),
    rationale: z.string().describe('A step-by-step explanation for why the suggested swaps are optimal, considering the conflicts and resident preferences.'),
});
export type OptimizeOnCallScheduleOutput = z.infer<typeof OptimizeOnCallScheduleOutputSchema>;

export async function optimizeOnCallSchedule(input: OptimizeOnCallScheduleInput): Promise<OptimizeOnCallScheduleOutput> {
  return optimizeOnCallScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeOnCallSchedulePrompt',
  input: {schema: OptimizeOnCallScheduleInputSchema},
  output: {schema: OptimizeOnCallScheduleOutputSchema},
  prompt: `You are an expert AI assistant specializing in optimizing on-call schedules for medical residents.

Your task is to resolve the specified conflicts by suggesting optimal swaps between residents.

Analyze the following information:
1.  **Current On-Call Schedule:** A list of residents and the days they are currently scheduled for call.
2.  **Resident Preferences & Constraints:** Vacation days and holiday group assignments for each resident.
3.  **Conflict Details:** The specific problems in the schedule that need fixing.

Based on this information, generate a structured list of "suggestedSwaps" to resolve the issues. Each swap must include the day (1-indexed) and the names of the two residents to swap. Then, provide a "rationale" explaining why these swaps are the best solution, referencing the conflicts and resident constraints.

**Current Schedule:**
{{{currentSchedule}}}

**Resident Preferences:**
{{{residentPreferences}}}

**Conflict Details:**
{{{conflictDetails}}}
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
