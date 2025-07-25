
'use server';

/**
 * @fileOverview An AI agent that suggests the most relevant EPA for a given clinical activity.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {ALL_EPAS} from '@/lib/epa-data';

const SuggestEpaForActivityInputSchema = z.object({
  activityDescription: z.string().describe('A description of the clinical activity, such as the name of a surgical procedure or clinic type.'),
});
export type SuggestEpaForActivityInput = z.infer<typeof SuggestEpaForActivityInputSchema>;

const SuggestEpaForActivityOutputSchema = z.object({
  suggestedEpaId: z.string().describe("The ID of the most relevant EPA (e.g., 'Core EPA #9')."),
  rationale: z.string().describe('A brief explanation of why this EPA was chosen.'),
});
export type SuggestEpaForActivityOutput = z.infer<typeof SuggestEpaForActivityOutputSchema>;


export async function suggestEpaForActivity(
  input: SuggestEpaForActivityInput
): Promise<SuggestEpaForActivityOutput> {
  return suggestEpaForActivityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEpaForActivityPrompt',
  input: {schema: SuggestEpaForActivityInputSchema},
  output: {schema: SuggestEpaForActivityOutputSchema},
  prompt: `You are an expert in medical education and Entrustable Professional Activities (EPAs) for neurosurgery.
Your task is to identify the single most appropriate EPA for a given clinical activity.

Here is the list of all available EPAs with their IDs and titles:
{{{JSON anystr=epaList}}}

Analyze the following clinical activity:
**Activity:** "{{{activityDescription}}}"

Based on the list, determine which EPA is the best match for this activity. Your response must be the EPA's ID.
For example, if the activity is "Burr hole for chronic subdural", the correct EPA ID is "Foundations EPA #9".
If the activity is "Carpal Tunnel Release", the correct EPA ID is "Core EPA #19".

Provide the suggested EPA ID and a very brief rationale.
`,
});

const suggestEpaForActivityFlow = ai.defineFlow(
  {
    name: 'suggestEpaForActivityFlow',
    inputSchema: SuggestEpaForActivityInputSchema,
    outputSchema: SuggestEpaForActivityOutputSchema,
  },
  async input => {
    // Provide the full list of EPAs to the prompt as context.
    const epaList = ALL_EPAS.map(epa => ({ id: epa.id, title: epa.title, keyFeatures: epa.keyFeatures }));
    
    const {output} = await prompt({
        ...input,
        epaList: JSON.stringify(epaList),
    });
    return output!;
  }
);
