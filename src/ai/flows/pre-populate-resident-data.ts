'use server';
/**
 * @fileOverview An AI agent that prepopulates resident data from text or an image.
 *
 * - prepopulateResidentData - A function that handles the resident data prepopulation process.
 * - PrepopulateResidentDataInput - The input type for the prepopulateResidentData function.
 * - PrepopulateResidentDataOutput - The return type for the prepopulateResidentData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrepopulateResidentDataInputSchema = z.object({
  sourceType: z.enum(['text', 'image']).describe('The source type of the schedule data.'),
  sourceData: z.string().describe('The schedule data, either text or a data URI of an image.'),
});
export type PrepopulateResidentDataInput = z.infer<
  typeof PrepopulateResidentDataInputSchema
>;

const PrepopulateResidentDataOutputSchema = z.object({
  residents: z.array(
    z.object({
      name: z.string().describe('The resident name.'),
      level: z.number().describe('The PGY level of the resident.'),
      onService: z.boolean().describe('Whether the resident is on service.'),
      vacationDays: z.array(z.number()).describe('The vacation days of the resident.'),
    })
  ),
});
export type PrepopulateResidentDataOutput = z.infer<
  typeof PrepopulateResidentDataOutputSchema
>;

export async function prepopulateResidentData(
  input: PrepopulateResidentDataInput
): Promise<PrepopulateResidentDataOutput> {
  return prepopulateResidentDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prepopulateResidentDataPrompt',
  input: {schema: PrepopulateResidentDataInputSchema},
  output: {schema: PrepopulateResidentDataOutputSchema},
  prompt: `You are an AI assistant that extracts resident data from a schedule.

  The schedule data is provided below. Extract the resident names, PGY level, on service status and vacation days.

  Source Type: {{{sourceType}}}
  Source Data: {{#ifEquals sourceType "image"}}{{media url=sourceData}}{{else}}{{{sourceData}}}{{/ifEquals}}
  `,
  config: {
    temperature: 0.3,
    topP: 0.5,
    maxOutputTokens: 1024,
  },
});

const prepopulateResidentDataFlow = ai.defineFlow(
  {
    name: 'prepopulateResidentDataFlow',
    inputSchema: PrepopulateResidentDataInputSchema,
    outputSchema: PrepopulateResidentDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

