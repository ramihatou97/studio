'use server';

/**
 * @fileOverview Analyzes a schedule for potential conflicts, such as staffing shortages or rule violations.
 *
 * - analyzeScheduleConflicts - A function that analyzes the schedule and returns a conflict report.
 * - AnalyzeScheduleConflictsInput - The input type for the analyzeScheduleConflicts function.
 * - AnalyzeScheduleConflictsOutput - The return type for the analyzeScheduleConflicts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeScheduleConflictsInputSchema = z.object({
  scheduleData: z.any().describe('The schedule data to analyze.'),
  rules: z.string().describe('A description of the scheduling rules to check against.'),
});
export type AnalyzeScheduleConflictsInput = z.infer<typeof AnalyzeScheduleConflictsInputSchema>;

const AnalyzeScheduleConflictsOutputSchema = z.object({
  conflictReport: z.string().describe('A report of any conflicts found in the schedule.'),
});
export type AnalyzeScheduleConflictsOutput = z.infer<typeof AnalyzeScheduleConflictsOutputSchema>;

export async function analyzeScheduleConflicts(input: AnalyzeScheduleConflictsInput): Promise<AnalyzeScheduleConflictsOutput> {
  return analyzeScheduleConflictsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeScheduleConflictsPrompt',
  input: {schema: AnalyzeScheduleConflictsInputSchema},
  output: {schema: AnalyzeScheduleConflictsOutputSchema},
  prompt: `You are an expert in analyzing schedules for conflicts.

  Analyze the following schedule data against the provided rules and generate a conflict report.

  Schedule Data: {{{scheduleData}}}

  Rules: {{{rules}}}

  Conflict Report:`, // Keep this in markdown format.
});

const analyzeScheduleConflictsFlow = ai.defineFlow(
  {
    name: 'analyzeScheduleConflictsFlow',
    inputSchema: AnalyzeScheduleConflictsInputSchema,
    outputSchema: AnalyzeScheduleConflictsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
