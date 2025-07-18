'use server';

/**
 * @fileOverview An AI agent that prepopulates OR case data from text.
 *
 * - prepopulateOrCases - A function that handles the OR case data prepopulation process.
 * - PrepopulateOrCasesInput - The input type for the prepopulateOrCases function.
 * - PrepopulateOrCasesOutput - The return type for the prepopulateOrCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrepopulateOrCasesInputSchema = z.object({
  orScheduleText: z.string().describe('The OR schedule text, including day numbers, surgeon names, and case details.'),
  staffList: z.array(z.string()).describe('A list of valid staff surgeon names to match against.'),
});
export type PrepopulateOrCasesInput = z.infer<typeof PrepopulateOrCasesInputSchema>;

const PrepopulateOrCasesOutputSchema = z.object({
  orCases: z.array(
    z.object({
      day: z.number().describe('The day of the month (1-indexed).'),
      surgeon: z.string().describe('The name of the surgeon performing the case.'),
      patientMrn: z.string().describe("The patient's Medical Record Number."),
      patientSex: z.enum(['male', 'female', 'other']).describe("The patient's sex."),
      diagnosis: z.string().describe('The diagnosis for the case.'),
      procedure: z.string().describe('The procedure for the case.'),
      procedureCode: z.string().describe('The procedure code for the case.'),
    })
  ).describe('The extracted OR case schedule.'),
});
export type PrepopulateOrCasesOutput = z.infer<typeof PrepopulateOrCasesOutputSchema>;

export async function prepopulateOrCases(input: PrepopulateOrCasesInput): Promise<PrepopulateOrCasesOutput> {
  return prepopulateOrCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prepopulateOrCasesPrompt',
  input: {schema: PrepopulateOrCasesInputSchema},
  output: {schema: PrepopulateOrCasesOutputSchema},
  prompt: `You are an AI assistant that extracts an OR case schedule from a block of text.
  The user will provide text representing a monthly OR schedule and a list of valid staff surgeon names.
  Parse the text to identify the day number, the surgeon, patient MRN, patient sex, the diagnosis, the procedure, and the procedure code for each case mentioned.
  If the MRN or sex is not provided, generate a plausible placeholder (e.g., "MRN-UNKNOWN").
  Match the surgeon names from the text to the provided staff list. The output must only contain names from the provided staff list.
  The day should be the day of the month (e.g., for "July 1st", the day is 1).

  Schedule Text:
  {{{orScheduleText}}}

  Valid Staff Names:
  {{#each staffList}}
  - {{{this}}}
  {{/each}}
  `,
  config: {
    temperature: 0.1,
  },
});

const prepopulateOrCasesFlow = ai.defineFlow(
  {
    name: 'prepopulateOrCasesFlow',
    inputSchema: PrepopulateOrCasesInputSchema,
    outputSchema: PrepopulateOrCasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
