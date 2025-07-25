
'use server';

/**
 * @fileOverview An AI agent that suggests a CPT code for a given surgical procedure description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestProcedureCodeInputSchema = z.object({
  procedureDescription: z.string().describe('A description of the surgical procedure.'),
});
export type SuggestProcedureCodeInput = z.infer<typeof SuggestProcedureCodeInputSchema>;

const SuggestProcedureCodeOutputSchema = z.object({
  suggestedCode: z.string().describe("The suggested CPT code for the procedure (e.g., '61510')."),
  confidence: z.enum(['high', 'medium', 'low']).describe('The confidence level of the suggestion.'),
  rationale: z.string().describe('A brief explanation for the suggested code.'),
});
export type SuggestProcedureCodeOutput = z.infer<typeof SuggestProcedureCodeOutputSchema>;


export async function suggestProcedureCode(
  input: SuggestProcedureCodeInput
): Promise<SuggestProcedureCodeOutput> {
  return suggestProcedureCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestProcedureCodePrompt',
  input: {schema: SuggestProcedureCodeInputSchema},
  output: {schema: SuggestProcedureCodeOutputSchema},
  prompt: `You are an expert medical coder specializing in neurosurgery. Your task is to suggest the most appropriate CPT code for a given surgical procedure.

Analyze the following surgical procedure:
**Procedure:** "{{{procedureDescription}}}"

Based on the description, determine the most likely CPT code.
- If you are very confident, set the confidence to 'high'.
- If the description is ambiguous or could map to multiple codes, provide the most common one and set the confidence to 'medium'.
- If the description is too vague, provide a best guess and set the confidence to 'low'.

Provide the suggested CPT code and a brief rationale. For example, for "Craniotomy for tumor", the code would be "61510". For "ACDF", a common code is "22551".
`,
});

const suggestProcedureCodeFlow = ai.defineFlow(
  {
    name: 'suggestProcedureCodeFlow',
    inputSchema: SuggestProcedureCodeInputSchema,
    outputSchema: SuggestProcedureCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
