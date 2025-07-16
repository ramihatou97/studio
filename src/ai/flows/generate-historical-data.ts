'use server';

/**
 * @fileOverview An AI agent that generates simulated historical case and schedule data for a resident.
 * This is used to provide data for the long-term performance analysis feature, as the app
 * doesn't have a database to store past schedules.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {POSSIBLE_ACTIVITIES} from '@/lib/types';

const GenerateHistoricalDataInputSchema = z.object({
  residentName: z.string().describe('The name of the resident.'),
  pgyLevel: z.number().describe('The PGY level of the resident.'),
  startDate: z.string().describe('The start date for the historical data simulation (YYYY-MM-DD).'),
  endDate: z.string().describe('The end date for the historical data simulation (YYYY-MM-DD).'),
});
export type GenerateHistoricalDataInput = z.infer<typeof GenerateHistoricalDataInputSchema>;

const GenerateHistoricalDataOutputSchema = z.object({
  historicalData: z.object({
      residentName: z.string(),
      pgyLevel: z.number(),
      cases: z.array(z.object({
          date: z.string().describe("The date of the case (YYYY-MM-DD)."),
          procedure: z.string().describe("The surgical procedure performed."),
          diagnosis: z.string().describe("The diagnosis for the case."),
          surgeon: z.string().describe("The name of the attending surgeon."),
          caseType: z.enum(['cranial', 'spine', 'other']).describe("The type of case."),
      })),
      clinicDays: z.number().describe("The total number of clinic days."),
      callDays: z.number().describe("The total number of on-call days (day, night, or weekend)."),
  }),
});
export type GenerateHistoricalDataOutput = z.infer<typeof GenerateHistoricalDataOutputSchema>;

export async function generateHistoricalData(
  input: GenerateHistoricalDataInput
): Promise<GenerateHistoricalDataOutput> {
  return generateHistoricalDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHistoricalDataPrompt',
  input: {schema: GenerateHistoricalDataInputSchema},
  output: {schema: GenerateHistoricalDataOutputSchema},
  prompt: `You are an AI assistant that simulates realistic historical surgical case logs and schedules for a neurosurgery resident.
  
  Generate a plausible set of historical data for a resident with the following details:
  - Name: {{{residentName}}}
  - PGY Level: {{{pgyLevel}}}
  - Period: from {{{startDate}}} to {{{endDate}}}

  The simulation should be realistic for the specified PGY level. For example:
  - PGY-1s and PGY-2s will have more general cases, clinic days, and call days.
  - Senior residents (PGY-4 to PGY-6) will have more complex cases, fewer clinic days, and more specialized procedures.
  - The Chief resident (PGY-6) will have a high volume of complex OR cases.

  Make up plausible surgeon names, diagnoses, and procedures appropriate for neurosurgery.
  The number of cases should be reasonable for the time period. A resident might do 5-15 cases per month.
  Simulate a reasonable number of clinic and on-call days per month (e.g., 4-8 clinic days, 4-8 call days).

  Provide the output in the specified JSON format.
  `,
  config: {
      temperature: 0.8
  }
});

const generateHistoricalDataFlow = ai.defineFlow(
  {
    name: 'generateHistoricalDataFlow',
    inputSchema: GenerateHistoricalDataInputSchema,
    outputSchema: GenerateHistoricalDataOutputSchema,
  },
  async input => {
    const {output} = await prompt({
        ...input,
        // Provide context of possible activities to guide the simulation.
        possibleActivities: POSSIBLE_ACTIVITIES.join(', ')
    });
    return output!;
  }
);
