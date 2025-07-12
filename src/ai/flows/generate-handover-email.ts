'use server';

/**
 * @fileOverview A Genkit flow to generate a handover email for on-call staff.
 *
 * - generateHandoverEmail - A function that generates the handover email content.
 * - GenerateHandoverEmailInput - The input type for the generateHandoverEmail function.
 * - GenerateHandoverEmailOutput - The return type for the generateHandoverEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHandoverEmailInputSchema = z.object({
  schedule: z.string().describe('The schedule data to generate the handover email from.'),
  residents: z.string().describe('The residents data to generate the handover email from.'),
  staff: z.string().describe('The staff data to generate the handover email from.'),
  notes: z.string().optional().describe('Any important notes to include in the handover email.'),
});
export type GenerateHandoverEmailInput = z.infer<typeof GenerateHandoverEmailInputSchema>;

const GenerateHandoverEmailOutputSchema = z.object({
  emailContent: z.string().describe('The generated handover email content.'),
});
export type GenerateHandoverEmailOutput = z.infer<typeof GenerateHandoverEmailOutputSchema>;

export async function generateHandoverEmail(input: GenerateHandoverEmailInput): Promise<GenerateHandoverEmailOutput> {
  return generateHandoverEmailFlow(input);
}

const generateHandoverEmailPrompt = ai.definePrompt({
  name: 'generateHandoverEmailPrompt',
  input: {schema: GenerateHandoverEmailInputSchema},
  output: {schema: GenerateHandoverEmailOutputSchema},
  prompt: `You are an AI assistant tasked with generating a handover email for on-call staff.

  Use the provided schedule data, resident information, staff details, and any additional notes to create a concise and informative email.

  Schedule Data: {{{schedule}}}
  Resident Information: {{{residents}}}
  Staff Details: {{{staff}}}
  Additional Notes: {{{notes}}}

  Compose a professional and easy-to-read email that summarizes key information for the on-call staff, including scheduled events, assigned residents, and any important notes.
  Ensure a smooth transition of responsibilities.

  Output the complete email content.
  `,
});

const generateHandoverEmailFlow = ai.defineFlow(
  {
    name: 'generateHandoverEmailFlow',
    inputSchema: GenerateHandoverEmailInputSchema,
    outputSchema: GenerateHandoverEmailOutputSchema,
  },
  async input => {
    const {output} = await generateHandoverEmailPrompt(input);
    return output!;
  }
);
