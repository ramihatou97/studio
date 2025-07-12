'use server';

/**
 * @fileOverview An AI agent that prepopulates staff on-call data from text.
 *
 * - prepopulateStaffCall - A function that handles the staff call data prepopulation process.
 * - PrepopulateStaffCallInput - The input type for the prepopulateStaffCall function.
 * - PrepopulateStaffCallOutput - The return type for the prepopulateStaffCall function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrepopulateStaffCallInputSchema = z.object({
  scheduleText: z.string().describe('The staff on-call schedule text, including day numbers and staff names for cranial and spine call.'),
  staffList: z.array(z.string()).describe('A list of valid staff names to match against.'),
});
export type PrepopulateStaffCallInput = z.infer<typeof PrepopulateStaffCallInputSchema>;

const PrepopulateStaffCallOutputSchema = z.object({
  staffCall: z.array(
    z.object({
      day: z.number().describe('The day of the month.'),
      callType: z.enum(['cranial', 'spine']).describe('The type of call.'),
      staffName: z.string().describe('The name of the staff member on call.'),
    })
  ).describe('The extracted staff on-call schedule.'),
});
export type PrepopulateStaffCallOutput = z.infer<typeof PrepopulateStaffCallOutputSchema>;

export async function prepopulateStaffCall(input: PrepopulateStaffCallInput): Promise<PrepopulateStaffCallOutput> {
  return prepopulateStaffCallFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prepopulateStaffCallPrompt',
  input: {schema: PrepopulateStaffCallInputSchema},
  output: {schema: PrepopulateStaffCallOutputSchema},
  prompt: `You are an AI assistant that extracts a staff on-call schedule from a block of text.
  The user will provide text representing a monthly schedule and a list of valid staff names.
  Parse the text to identify which staff member is assigned to "cranial" and "spine" call for each day number mentioned.
  Match the names from the text to the provided staff list. The output must only contain names from the provided staff list.

  Schedule Text:
  {{{scheduleText}}}

  Valid Staff Names:
  {{#each staffList}}
  - {{{this}}}
  {{/each}}
  `,
  config: {
    temperature: 0.1,
  },
});

const prepopulateStaffCallFlow = ai.defineFlow(
  {
    name: 'prepopulateStaffCallFlow',
    inputSchema: PrepopulateStaffCallInputSchema,
    outputSchema: PrepopulateStaffCallOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
