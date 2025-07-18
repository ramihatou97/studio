'use server';

/**
 * @fileOverview An AI agent that provides a detailed surgical briefing for a given case,
 * intended to help a resident prepare for the operating room.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSurgicalBriefingInputSchema = z.object({
  diagnosis: z.string().describe('The primary diagnosis for the patient.'),
  procedure: z.string().describe('The planned surgical procedure.'),
  patientDetails: z.string().describe('A summary of patient details, including age, sex, and relevant comorbidities.'),
});
export type GenerateSurgicalBriefingInput = z.infer<typeof GenerateSurgicalBriefingInputSchema>;

const GenerateSurgicalBriefingOutputSchema = z.object({
  briefing: z.string().describe('A detailed, markdown-formatted surgical briefing.'),
});
export type GenerateSurgicalBriefingOutput = z.infer<typeof GenerateSurgicalBriefingOutputSchema>;

export async function generateSurgicalBriefing(
  input: GenerateSurgicalBriefingInput
): Promise<GenerateSurgicalBriefingOutput> {
  return generateSurgicalBriefingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSurgicalBriefingPrompt',
  input: {schema: GenerateSurgicalBriefingInputSchema},
  output: {schema: GenerateSurgicalBriefingOutputSchema},
  prompt: `You are a senior attending neurosurgeon providing a pre-operative briefing to a resident. Your task is to generate a comprehensive surgical plan and educational summary for an upcoming case. Use deep research from neurosurgical references and textbooks to provide a detailed, accurate, and helpful guide.

The output must be in markdown format and include the following sections:

- **Case Summary:** Briefly summarize the patient's presentation and the indication for surgery.
- **Key Anatomical Considerations:** Describe the critical anatomical structures that will be encountered and must be preserved. Mention common variations.
- **Surgical Steps (Detailed):** Provide a step-by-step walkthrough of the entire procedure, from positioning and incision to closure. Be specific about instruments, techniques, and potential pitfalls.
  - Positioning
  - Incision and Exposure
  - Key Dissection/Resection Steps
  - Hemostasis
  - Closure
- **Potential Complications:** List the most common and most dangerous potential complications and briefly describe how to avoid or manage them.
- **Key References:** Cite 2-3 key articles or textbook chapters (e.g., from Youmans and Winn Neurological Surgery, Schmidek and Sweet Operative Neurosurgical Techniques) that are relevant to this procedure.

**Case Information:**
- **Diagnosis:** {{{diagnosis}}}
- **Procedure:** {{{procedure}}}
- **Patient Details:** {{{patientDetails}}}

Generate the briefing based on this information. Be thorough, clear, and educational.
`,
    config: {
        temperature: 0.3,
    }
});

const generateSurgicalBriefingFlow = ai.defineFlow(
  {
    name: 'generateSurgicalBriefingFlow',
    inputSchema: GenerateSurgicalBriefingInputSchema,
    outputSchema: GenerateSurgicalBriefingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
